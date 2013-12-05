var currentVersion = 1500;

var storageKeys = {
    "showRepeat": "showRepeat",
    "profiles": "profiles",
    "enableMultiHost": "enableMultiHost",
    "selectedHost": "selectedHost"
};

var actions = {
    "PlayPause": "Player.PlayPause",
    "Stop": "Player.Stop",
    "SmallSkipBackward":"VideoPlayer.SmallSkipBackward",
    "SmallSkipForward":"VideoPlayer.SmallSkipForward",
    "GoPrevious": "Player.GoPrevious",
    "GoNext": "Player.GoNext"
};

var validUrlPatterns = [
    ".*youtube.com/watch.*",
    "^.*vimeo.com.*/\\d+.*$",
    ".*collegehumor.com/[video|embed]+/\\d+/\\w+",
    ".*dailymotion.com/video/.*",
    ".*ebaumsworld.com/video/.*",
    ".*soundcloud.com.*",
    ".*mycloudplayers.com.*",
    ".*mixcloud.com.*",
    ".*liveleak.com/view.*",
    "^(https|http)://(www\.)?twitch.tv/([^_&/#\?]+).*$",
    ".*hulu.com/watch.*"
];

var validPlaylistPatterns = [
    ".*youtube.com/playlist.*list=.*",
    "(https|http)://(www\.)?youtube.com/watch?.*list=.+",
    "(https|http)://(www\.)?soundcloud.com/[^_&/#\?]+/sets/[^_&/#\?]+"
];

function getURL() {
    var url;
    var port;
    var username;
    var password;

    if (isMultiHostEnabled()) {
        var selectedHost = localStorage[storageKeys.selectedHost];
        var allProfiles = JSON.parse(getAllProfiles());

        for (var i = 0; i < allProfiles.length; i++) {
            var profile = allProfiles[i];
            if (profile.id == selectedHost) {
                url = profile.url;
                port = profile.port;
                username = profile.username;
                password = profile.password;
                break;
            }
        }

    } else {
        url = localStorage["url"];
        port = localStorage["port"];
        username = localStorage["username"];
        password = localStorage["password"];
    }

    var loginPortion = '';
    if (username && password) {
        loginPortion = username + ':' + password + '@';
    }

    return 'http://'+ loginPortion + url + ':' + port;
}

function isMultiHostEnabled() {
    var enableMultiHost = localStorage[storageKeys.enableMultiHost];

    return enableMultiHost != null && enableMultiHost == 'true';
}

function getAllProfiles() {
    return localStorage[storageKeys.profiles];
}

function getCurrentUrl(callback) {
    chrome.tabs.getSelected(null, function (tab) {
        var tabUrl = tab.url;
        callback(tabUrl);
    });
}

function getURLParameter(tabUrl, sParam) {
    var sPageURL = tabUrl.substring(tabUrl.indexOf('?') + 1 );
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return null;
}
