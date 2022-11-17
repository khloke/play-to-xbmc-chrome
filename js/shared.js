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

function getCurrentProfile() {
    var profile;
    var selectedHost = localStorage[storageKeys.selectedHost];
    var allProfiles = JSON.parse(getAllProfiles());

    for (var i = 0; i < allProfiles.length; i++) {
        var profile = allProfiles[i];
        if (profile.id == selectedHost) {
            profile = profile;
            break;
        }
    }

    return profile;
}

function getURL() {
    var url;
    var port;

    if (isMultiHostEnabled()) {
        var profile = getCurrentProfile();
        url = profile.url;
        port = profile.port;
    } else {
        url = localStorage["url"];
        port = localStorage["port"];
    }

    // Handle https in the url
    if (url.includes('https://')) {
        // Remove https in url and append after
        // so user/pass is in the correct place
        url = url.replace('https://', '')
        return 'https://'+url + ':' + port;
    } else {
        return 'http://'+url + ':' + port;
    }
}

function getCredentials() {
    var username;
    var password;
    
    if (isMultiHostEnabled()) {
        var profile = getCurrentProfile();
        username = profile.username;
        password = profile.password;
    } else {
        username = localStorage["username"];
        password = localStorage["password"];
    }

    return [username ? username : "anonymous", password];
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

