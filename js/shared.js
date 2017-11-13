browser.storage.sync.get().then(
    (opts) => {
        console.log("shared.js: " + JSON.stringify(opts));
    });
//console.log("shared.js");

var debugEnabled = true;
var updated = false;

var currentVersion = parseInt(chrome.runtime.getManifest().version.replace(/\./g, ''));

async function getSettings(settingsToGet) {
    return browser.storage.sync.get(settingsToGet);
}

/*
 * On startup, check whether we have stored settings.
 * If we don't, then store the default settings.
function checkStoredSettings(settings) {
    storedSettings = settings;
    if (!storedSettings.storageVersion) {
        console.log("No settings in storage. First run?");
    } else {
        //debugEnabled = storedSettings.enableDebugLogs;
        if (debugEnabled) {
            console.log("Settings read from storage: " + JSON.stringify(storedSettings));
        }
    }
}
 */

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


function onError(e) {
  console.error(e);
}

//
// Return currently selected profile
//
// Settings needed: ["selectedHost", "profiles"]
//
function getCurrentProfile(settings) {
    var profile;
    var selectedHost;
    var allProfiles;

    selectedHost = settings.selectedHost;
    allProfiles = settings.profiles;

    for (var i = 0; i < allProfiles.length; i++) {
        let p = allProfiles[i];
        if (p.id == selectedHost) {
            profile = p;
            break;
        }
    }

    return profile;
}

//
// Return current URL
//
// Settings needed: ["enableMultiHost", "selectedHost", "profiles", "url", "port", "username", "password"]
//
function getURL(settings) {
    var url;
    var port;

    if (isMultiHost(settings)) {
        let profile = getCurrentProfile(settings);
        if (isDebug()) {
            console.log("getURL(): profile: " + JSON.stringify(profile));
        }
        if (profile) {
            url = profile.url;
            port = profile.port;
        }
    } else {
        url = settings.url;
        port = settings.port;
    }

    let uri = 'http://'+url + ':' + port;
    if (isDebug()) {
        console.log("getURL(): uri: " + uri);
    }

    return uri;
}

//
// Return credentials for current profile
//
// Settings needed: ["enableMultiHost", "selectedHost", "profiles", "url", "port", "username", "password"]
//
function getCredentials(settings) {
    if (isDebug()) {
        console.log("getCredentials()");
    }
    let username;
    let password;
    
    if (isMultiHost(settings)) {
        let profile = getCurrentProfile(settings);
        if (profile) {
            username = profile.username;
            password = profile.password;
        }
    } else {
        username = settings.username;
        password = settings.password;
    }

    return [username ? username : "anonymous", password];
}

// 
//
// Settings needed: ["enableMultiHost"]
//
function isMultiHost(settings) {
    console.log("isMultiHost()");

    let multiHost = settings.enableMultiHost != null && settings.enableMultiHost;
    if (isDebug()) {
        console.log("isMultiHost(): settings.enableMultiHost: " + settings.enableMultiHost); 
    }

    return multiHost;
}

function isDebug(settings) {
    let debug = false;
    if (settings) {
        debug = settings.enableDebugLogs;
    } else {
        debug = debugEnabled;
    }
    return debug;
}

function setDebug(debug) {
    debugEnabled = debug;
}

//
// Settings needed: ["profiles"]
//
function getAllProfiles(settings) {
    return settings.profiles;
}

function updateVersion() {
    browser.storage.sync.set({"installedVersion": currentVersion});
}

