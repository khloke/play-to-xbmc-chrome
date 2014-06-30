chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
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

            case 'playNow':
                playCurrentUrl(function () {
                    sendResponse({response: "OK"});
                });
                break;

            case 'queue':
                queueCurrentUrl(function () {
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

            case 'playNextCurrent':
                playNextCurrentUrl(function () {
                    sendResponse({response: "OK"});
                });
                break;

            case 'isDebugLogsEnabled':
                sendResponse({response: isDebugLogsEnabled()});
                break;

            case 'createContextMenu':
                createContextMenu(request.link, function() {
                    sendResponse({response: "OK"});
                });
                break;
        }

        return true;
    }
);

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

function playCurrentUrl(callback) {
    doAction(actions.Stop, function () {
        clearPlaylist(function() {
            queueCurrentUrl(callback);
        })
    });
}

function playNextCurrentUrl(callback) {
    chrome.tabs.getSelected(null, function (tab) {
        var tabUrl = tab.url;
        getPlaylistPosition(function (position) {
            insertItem(tabUrl, position + 1, function () {
                callback();
            });
        });
    });
}

function queueCurrentUrl(callback) {
    chrome.tabs.getSelected(null, function (tab) {
        var tabUrl = tab.url;
        queueItem(tabUrl, function () {
            callback();
        });
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

function createContextMenu(link, callback) {
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
            });

            chrome.contextMenus.create({
                title: "Queue",
                contexts: ["link"],
                targetUrlPatterns: [link],
                onclick: function(info) {
                    queueItem(info.linkUrl, function() {
                        callback();
                    });
                }
            });

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
            });

        }
    }
}

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    title: "Show Image",
    contexts: ["image"],
    onclick: function(info) {
        var url = info.srcUrl;
        wakeScreen(function() {
            addItemsToPlaylist([{"contentType": 'picture', "pluginPath": url}], function(){});
        });
    }
});