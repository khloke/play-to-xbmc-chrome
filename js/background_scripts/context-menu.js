function initContextMenu() {
    var targetPatterns = ['*://*.youtube.com/watch?*v=*','*://*.youtu.be/*'];

    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        title: "Play now",
        contexts: ["link"],
        targetUrlPatterns: targetPatterns,
        onclick: function(info) {
            doAction(actions.Stop, function () {
                clearPlaylist(function() {
                    queueItem(info.linkUrl, function () {});
                })
            });
        }
    });

    chrome.contextMenus.create({
        title: "Queue",
        contexts: ["link"],
        targetUrlPatterns: targetPatterns,
        onclick: function(info) {
            queueItem(info.linkUrl, function () {});
        }
    });

    chrome.contextMenus.create({
        title: "Play this Next",
        contexts: ["link"],
        targetUrlPatterns: targetPatterns,
        onclick: function(info) {
            getCurrentUrl(function (tabUrl) {
                getPlaylistPosition(function (position) {
                    insertItem(info.linkUrl, position + 1, function () {});
                });
            });
        }
    });
}

initContextMenu();