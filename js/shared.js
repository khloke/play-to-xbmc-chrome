console.log("shared.js");

/*// MIGRATION TEST CODE //////////////////////////////////////////////////////////
var storageKeys = {
    "showRepeat": "showRepeat",
    "profiles": "profiles",
    "enableMultiHost": "enableMultiHost",
    "selectedHost": "selectedHost",
    "enableDebugLogs": "enableDebugLogs",
    "magnetAddOn": "magnetAddOn"
};

function createOldVersionSettings() {
    console.log("Clear old storage");
    // Clear old storage
    localStorage.clear();
    console.log("Clear new storage");
    // Clear new storage
    browser.storage.sync.clear();

    console.log("Create old storage entries");
    // Add test settings in old storage
    localStorage["storage-version"] = "180";
    localStorage.showRepeat = "always";
    localStorage.enableMultiHost = "true";
    localStorage.selectedHost = 1;
    localStorage.enableDebugLogs = "true";
    localStorage.magnetAddOn = "quasar";

    localStorage.url = "localhost1";
    localStorage.port = "1111";
    localStorage.username = "user1";
    localStorage.password = "pass1";

    let profiles = [];
    profiles.push({
        id: '0',
        name: 'profile1',
        url: 'localhost1',
        port: '1111',
        username: 'user1',
        password: 'pass1'
    });
    profiles.push({
        id: '1',
        name: 'profile2',
        url: 'localhost2',
        port: '2222',
        username: 'user2',
        password: 'pass2'
    });

    localStorage.setItem("profiles", JSON.stringify(profiles));
}

createOldVersionSettings();
/*/////////////////////////////////////////////////////////////////////////////////


var debugEnabled = false;
var storedSettings;
var currentVersion = parseInt(chrome.runtime.getManifest().version.replace(/\./g, ''));

function getSettings() {
    if (!storedSettings) {
        let stored = browser.storage.sync.get();
        Promise.all([stored]);
        stored.then(
            (stored) => {
                checkStoredSettings(stored);
                console.log("getSettings: fetched: " + JSON.stringify(storedSettings));
            });
    } else {
        console.log("getSettings: cached: " + JSON.stringify(storedSettings));
    }
    return storedSettings;
}

/*
 * On startup, check whether we have stored settings.
 * If we don't, then store the default settings.
 */
function checkStoredSettings(settings) {
    storedSettings = settings;
    if (!storedSettings.storageVersion) {
        console.log("No settings in storage. First run?");
    } else {
        debugEnabled = storedSettings.enableDebugLogs;
        if (debugEnabled) {
            console.log("Settings read from storage: " + JSON.stringify(storedSettings));
        }
    }
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


function onError(e) {
  console.error(e);
}

function getCurrentProfile() {
//    console.log("getCurrentProfile()");
    var profile;
    var selectedHost = getSettings().selectedHost;
    var allProfiles = getSettings().profiles;

//    console.log("getCurrentProfile(): selectedHost: " + selectedHost); 
//    console.log("getCurrentProfile(): allProfiles: " + JSON.stringify(allProfiles));

    for (var i = 0; i < allProfiles.length; i++) {
        let p = allProfiles[i];
//        console.log("getCurrentProfile(): profile: " + JSON.stringify(p));
        if (p.id == selectedHost) {
            profile = p;
            break;
        }
    }

    return profile;
}

function getURL() {
    var url;
    var port;

    if (isMultiHostEnabled()) {
        let profile = getCurrentProfile();
        if (profile) {
            url = profile.url;
            port = profile.port;
        }
    } else {
        url = getSettings().url;
        port = getSettings().port;
    }

    return 'http://'+url + ':' + port;
}

function getCredentials() {
    var username;
    var password;
    
    if (isMultiHostEnabled()) {
        let profile = getCurrentProfile();
        if (profile) {
            username = profile.username;
            password = profile.password;
        }
    } else {
        username = getSettings().username;
        password = getSettings().password;
    }

    if (isDebugEnabled()) {
        console.log("getCredentials(): username: " + username); 
    }

    return [username ? username : "anonymous", password];
}

function isMultiHostEnabled() {
    var enableMultiHost = getSettings().enableMultiHost;

    if (isDebugEnabled()) {
        console.log("isMultiHostEnabled(): enableMultiHost: " + enableMultiHost); 
    }

    return enableMultiHost != null && enableMultiHost;
}

function isDebugEnabled() {
    return debugEnabled;
}

function setDebug(debug) {
    debugEnabled = debug;
}

function getAllProfiles() {
    return getSettings().profiles;
}

