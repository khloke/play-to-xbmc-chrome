function initContextMenu() {
    var targetPatterns = ['*://*.youtube.com/watch?*v=*','*://*.youtu.be/*','*://*/url?*url=*.youtube*watch*', 'magnet:*'];

    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: "Play now",
        contexts: ["link"],
        targetUrlPatterns: targetPatterns,
        onclick: function(info) {
            doAction(actions.Stop, function () {
                clearPlaylist(function() {
                    var url = info.linkUrl;
                    if (url.match(googleRedirectRegex)) {
                        url = parseGoogleRedirectUrl(url);
                    }
                    queueItem(url, function () {});
                })
            });
        }
    });

    chrome.contextMenus.create({
        title: "Queue",
        contexts: ["link"],
        targetUrlPatterns: targetPatterns,
        onclick: function(info) {
            var url = info.linkUrl;
            if (url.match(googleRedirectRegex)) {
                url = parseGoogleRedirectUrl(url);
            }
            queueItem(url, function () {});
        }
    });

    chrome.contextMenus.create({
        title: "Play this Next",
        contexts: ["link"],
        targetUrlPatterns: targetPatterns,
        onclick: function(info) {
            getCurrentUrl(function (tabUrl) {
                getPlaylistPosition(function (position) {
                    var url = info.linkUrl;
                    if (url.match(googleRedirectRegex)) {
                        url = parseGoogleRedirectUrl(url);
                    }
                    insertItem(url, position + 1, function () {});
                });
            });
        }
    });

    chrome.contextMenus.create({
        title: "Show Image",
        contexts: ["image"],
        onclick: function(info) {
            var url = info.srcUrl;
            addItemsToPlaylist([{"contentType": 'picture', "pluginPath": url}], function(){});
        }
    });
}

var googleRedirectRegex = '(https|http)://(www\.)?google.com.*/url?.*youtube.*';

function parseGoogleRedirectUrl(aUrl) {
    var split = aUrl.split('&');
    for (var i = 0; i < split.length; i++) {
        var param = split[i];
        if (param.indexOf('url') == 0) {
            var url = param.split('=')[1];
            return decodeURIComponent(url);
        }
    }
}

var lastTabId;
// Remove context menus for a given tab, if needed
function removeContextMenus(tabId) {
    if (lastTabId === tabId) chrome.contextMenus.removeAll();
    initContextMenu();
}
// chrome.contextMenus onclick handlers:
var clickHandlers = {
    'musicPlayNow': function(info, tab) {
        getXbmcJsonVersion(function (version) {
            if (version) {
                doAction(actions.Stop, function () {
                    clearPlaylist(function () {
                        var url = info.linkUrl;
                        addItemsToPlaylist([
                            {"contentType": 'audio', "pluginPath": url}
                        ], function () {
                        });
                    })
                })
            }
        });
    },
    'musicQueue': function(info, tab) {
        getXbmcJsonVersion(function (version) {
            if (version) {
                var url = info.linkUrl;
                if (url.match(googleRedirectRegex)) {
                    url = parseGoogleRedirectUrl(url);
                }
                addItemsToPlaylist([
                    {"contentType": 'audio', "pluginPath": url}
                ], function () {
                });
            }
        });
    },
    'musicPlayNext': function(info, tab) {
        getXbmcJsonVersion(function (version) {
            if (version) {
                getCurrentUrl(function (tabUrl) {
                    getPlaylistPosition(function (position) {
                        var url = info.linkUrl;
                        if (url.match(googleRedirectRegex)) {
                            url = parseGoogleRedirectUrl(url);
                        }
                        insertItemToPlaylist('audio', url, position + 1, function () {
                        });
                    });
                });
            }
        });
    }
};

chrome.extension.onConnect.addListener(function(port) {
    if (!port.sender.tab || port.name != 'contextMenus') {
        // Unexpected / unknown port, do not interfere with it
        return;
    }
    var tabId = port.sender.tab.id;
    port.onDisconnect.addListener(function() {
        removeContextMenus(tabId);
    });
    // Whenever a message is posted, expect that it's identical to type
    // createProperties of chrome.contextMenus.create, except for onclick.
    // "onclick" should be a string which maps to a predefined function
    port.onMessage.addListener(function(newEntries) {
        chrome.contextMenus.removeAll(function() {
            for (var i=0; i<newEntries.length; i++) {
                var createProperties = newEntries[i];
                createProperties.onclick = clickHandlers[createProperties.onclick];
                chrome.contextMenus.create(createProperties);
            }
        });
    });
});

initContextMenu();

// When a tab is removed, check if it added any context menu entries. If so, remove it
chrome.tabs.onRemoved.addListener(removeContextMenus);