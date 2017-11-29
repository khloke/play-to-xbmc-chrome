var debug = true;
var updated = false;

var currentVersion = parseInt(chrome.runtime.getManifest().version.replace(/(alpha|a|beta|b|pre|rc)\d*$/, '').replace(/\./g, ''));

async function getSettings(settingsToGet) {
    return browser.storage.sync.get(settingsToGet);
}

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

//
// Return currently selected profile
//
// Settings needed: ["selectedHost", "profiles"]
//
function getCurrentProfile(settings) {
    let profile;
    let selectedHost;
    let allProfiles;

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
    debugLog("getURL()");
    let url;
    let port;

    if (isMultiHost(settings)) {
        let profile = getCurrentProfile(settings);
        if (profile) {
            url = profile.url;
            port = profile.port;
        }
    } else {
        url = settings.url;
        port = settings.port;
    }

    let uri = 'http://'+url + ':' + port;

    return uri;
}

//
// Return credentials for current profile
//
// Settings needed: ["enableMultiHost", "selectedHost", "profiles", "url", "port", "username", "password"]
//
function getCredentials(settings) {
    debugLog("getCredentials()");
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
    debugLog("isMultiHost(): " + settings.enableMultiHost); 

    return settings.enableMultiHost;
}

//
// Returns 'true' if debug is enabled
// If settings are passed the debug value is retuned from settings. Else uses 'local' debug value.
//
function isDebug(settings) {
    let retVal = false;
    if (null != settings) {
        retVal = settings.enableDebugLogs;
    } else {
        retVal = debug;
    }
    return retVal;
}

//
// Used to set 'local' debug value. This value is used first if set, before the one in browser.storage.sync.
//
function setDebug(value) {
    debug = value;
}

function debugLog(message) {
    if (isDebug()) { 
        console.log(message);
    }
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
