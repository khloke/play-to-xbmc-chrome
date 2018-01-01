var currentTabId;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.tabId) currentTabId = request.tabId;
        switch (request.action) {
            case 'isAvailable':
                getXbmcJsonVersion(function (version) {
                    if (version == null) {
                        sendResponse({response: "NOT_DETECTED"});
                    } else {
                        sendResponse({response: "OK"});
                    }
                });
                break;

            case 'playThis':
                if (currentTabId) chrome.tabs.sendMessage(currentTabId, {action: 'onPlayback'});
                playThisUrl(request.url, function() {
                    sendResponse({response: "OK"});
                });
                break;

            case 'queueThis':
                queueThisUrl(request.url, function () {
                    sendResponse({response: "OK"});
                });
                break;


            case 'queueList':
                queueList(request.url, request.urlList, function () {
                    sendResponse({response: "OK"});
                });
                break;

            case 'removeThis':
                removeThisFromPlaylist(function () {
                    sendResponse({response: "OK"});
                });
                break;

            case 'playThisNext':
                playThisNext(request.url, function () {
                    sendResponse({response: "OK"});
                });
                break;

            case 'isDebug':
                sendResponse({response: isDebug()});
                break;

            case 'createContextMenu':
                createContextMenu(request, function() {
                    sendResponse({response: "OK"});
                });
                break;

			case 'resume':
				playThisUrl(request.url, function(){
				resume(request.currentTime, function () {
                    sendResponse({response: "OK"});
                })});
                break;
            case 'setDebug':
                setDebug(request.enable);
                break;
        }

        return true;
    }
);

/*
 * Called when the context menu item has been created, or when creation failed due to an error.
 * We'll just log success/failure here.
 */
function onContextMenuCreated(n) {
    if (isDebug()) {
        if (chrome.runtime.lastError) {
            console.log("Error creating context menu item:" + chrome.runtime.lastError);
        } else {
            console.log("Context menu item created successfully");
        }
    }
}

function doAction(item, callback) {
    getActivePlayerId(function (playerid) {
        if (playerid != null) {
            var action = '{"jsonrpc": "2.0", "method": "' + item + '", "params":{"playerid":' + playerid + '}, "id" : 1}';
            ajaxPost(action, function (result) {
                callback(result);
            });
        } else {
            callback(null);
        }
    });
}

function playThisUrl(url, callback) {
    doAction(actions.Stop, function () {
        clearPlaylist(function() {
            queueItem(url, function () {
                callback();
            });
        })
    });
}

function playThisNext(url, callback) {
    getPlaylistPosition(function (position) {
        insertItem(url, position + 1, function () {
            callback();
        });
    });
}

function queueThisUrl(url, callback) {
    queueItem(url, function () {
        callback();
    });
}

function queueList(tabUrl, urlList, callback) {
    if (urlList.length === 0) {
        callback();
        return;
    }
    queueItems(tabUrl, urlList, function (result) {
        callback();

    });
}

function removeThisFromPlaylist(callback) {
    getPlaylistPosition(function (position) {
        playerGoNext(function () {
            removeItemFromPlaylist(position, function () {
                callback();
            });
        });
    });
}

var contextMenuLinks = [];

function isContextMenuCreated(url) {
    for (var i = 0; i < contextMenuLinks.length; i++) {
        var link = contextMenuLinks[i];
        if (link == url) {
            return true;
        }
    }
    return false;
}

function createContextMenu(request, callback) {
    var link = request.link;
    for (var i = 0; i < allModules.length; i++) {
        var module = allModules[i];
        if (module.canHandleUrl(link) && !isContextMenuCreated(link)) {
            contextMenuLinks.push(link);
            chrome.contextMenus.create({
                title: "Play now",
                contexts: ["link"],
                targetUrlPatterns: [link],
                onclick: function(info) {
                    doAction(actions.Stop, function () {
                        clearPlaylist(function() {
                            queueItem(info.linkUrl, function() {
                                callback();
                            });
                        })
                    });
                }
            }, onContextMenuCreated);

            chrome.contextMenus.create({
                title: "Queue",
                contexts: ["link"],
                targetUrlPatterns: [link],
                onclick: function(info) {
                    queueItem(info.linkUrl, function() {
                        callback();
                    });
                }
            }, onContextMenuCreated);

            chrome.contextMenus.create({
                title: "Play this Next",
                contexts: ["link"],
                targetUrlPatterns: [link],
                onclick: function(info) {
                    getPlaylistPosition(function (position) {
                        insertItem(info.linkUrl, position + 1, function () {
                            callback();
                        });
                    });
                }
            }, onContextMenuCreated);

        }
    }
}

function createHtml5VideoContextMenus() {
    chrome.contextMenus.create({
        title: "Play now",
        contexts: ["video"],
        onclick: function (info) {
            doAction(actions.Stop, function () {
                clearPlaylist(function () {
                    addItemsToPlaylist([
                        {"contentType": 'video', "pluginPath": info.srcUrl}
                    ], function (result) {
                    });
                })
            });
        }
    }, onContextMenuCreated);

    chrome.contextMenus.create({
        title: "Queue",
        contexts: ["video"],
        onclick: function (info) {
            addItemsToPlaylist([
                {"contentType": 'video', "pluginPath": info.srcUrl}
            ], function (result) {
            });
        }
    }, onContextMenuCreated);

    chrome.contextMenus.create({
        title: "Play this Next",
        contexts: ["video"],
        onclick: function (info) {
            getPlaylistPosition(function (position) {
                insertItemToPlaylist('video', info.srcUrl, position + 1, function (result) {
                });
            });
        }
    }, onContextMenuCreated);
    
    chrome.contextMenus.create({
        title: "Play now",
        contexts: ["audio"],
        onclick: function (info) {
            doAction(actions.Stop, function () {
                clearPlaylist(function () {
                    addItemsToPlaylist([
                        {"contentType": 'audio', "pluginPath": info.srcUrl}
                    ], function (result) {
                    });
                })
            });
        }
    }, onContextMenuCreated);

    chrome.contextMenus.create({
        title: "Queue",
        contexts: ["audio"],
        onclick: function (info) {
            addItemsToPlaylist([
                {"contentType": 'audio', "pluginPath": info.srcUrl}
            ], function (result) {
            });
        }
    }, onContextMenuCreated);

    chrome.contextMenus.create({
        title: "Play this Next",
        contexts: ["audio"],
        onclick: function (info) {
            getPlaylistPosition(function (position) {
                insertItemToPlaylist('audio', info.srcUrl, position + 1, function (result) {
                });
            });
        }
    }, onContextMenuCreated);
}

function createMagnetAndP2PAndImageContextMenus() {
    chrome.contextMenus.create({
        title: "Show Image",
        contexts: ["image"],
        onclick: function (info) {
            var url = info.srcUrl;
            wakeScreen(function () {
                addItemsToPlaylist([
                    {"contentType": 'picture', "pluginPath": url}
                ], function () {
                });
            });
        }
    }, onContextMenuCreated);

    if (!(navigator.userAgent.indexOf("Mozilla") > -1)) {
        chrome.contextMenus.create({
            title: "Play now",
            contexts: ["link"],
            targetUrlPatterns: ['magnet:*', 'acestream:*', 'sop:*'],
            onclick: function (info) {
                doAction(actions.Stop, function () {
                    clearPlaylist(function () {
                        queueItem(info.linkUrl, function () {
                        });
                    })
                });
            }
        }, onContextMenuCreated);

        chrome.contextMenus.create({
            title: "Queue",
            contexts: ["link"],
            targetUrlPatterns: ['magnet:*', 'acestream:*', 'sop:*'],
            onclick: function (info) {
                queueItem(info.linkUrl, function () {
                });
            }
        }, onContextMenuCreated);

        chrome.contextMenus.create({
            title: "Play this Next",
            contexts: ["link"],
            targetUrlPatterns: ['magnet:*', 'acestream:*', 'sop:*'],
            onclick: function (info) {
                getPlaylistPosition(function (position) {
                    insertItem(info.linkUrl, position + 1, function () {
                    });
                });
            }
        }, onContextMenuCreated);
    }
}

getSettings(["enableDebugLogs"]).then(
    settings => {
        if (null != settings.enableDebugLogs) {
            setDebug(settings.enableDebugLogs);
        }

        chrome.contextMenus.removeAll();
        createMagnetAndP2PAndImageContextMenus();
        createHtml5VideoContextMenus();
    });

