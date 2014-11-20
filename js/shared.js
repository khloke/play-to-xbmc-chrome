var currentVersion = parseInt(chrome.runtime.getManifest().version.replace(/\./g, ''));

var storageKeys = {
    "showRepeat": "showRepeat",
    "profiles": "profiles",
    "enableMultiHost": "enableMultiHost",
    "selectedHost": "selectedHost",
    "enableDebugLogs": "enableDebugLogs",
    "magnetAddOn": "magnetAddOn"
};

var actions = {
    "PlayPause": "Player.PlayPause",
    "Stop": "Player.Stop",
    "SmallSkipBackward":"VideoPlayer.SmallSkipBackward",
    "SmallSkipForward":"VideoPlayer.SmallSkipForward",
    "GoPrevious": "Player.GoPrevious",
    "GoNext": "Player.GoNext"
};

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

function isDebugLogsEnabled() {
    var enableDebugLogs = localStorage[storageKeys.enableDebugLogs];

    return enableDebugLogs != null && enableDebugLogs == 'true';
}

function getAllProfiles() {
    return localStorage[storageKeys.profiles];
}

