function initContextMenu() {
    var targetPatterns = ['*://*.youtube.com/watch?*v=*','*://*.youtu.be/*','*://*/url?*url=*.youtube*watch*'];

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

initContextMenu();