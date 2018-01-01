/// MIGRATION TEST CODE //////////////////////////////////////////////////////////
//
// Remember to run browser.storage.sync.clear() before reloading the addon.
// This will allow the addon to run the upgrade process.
//
// Usefull commands:
//  - clear all settings:
//      browser.storage.sync.clear();
//  - print all settings in storage:
//      browser.storage.sync.get().then((opts) => { console.log(JSON.stringify(opts));});
//
//
//////////////////////////////////////////////////////////////////////////////////


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

    console.log("Create old storage entries");
    // Add test settings in old storage
    localStorage["storage-version"] = "180";
    localStorage.showRepeat = "always";
    localStorage.enableMultiHost = "true";
    localStorage.selectedHost = 0;
    localStorage.enableDebugLogs = "true";
    localStorage.magnetAddOn = "quasar";

    localStorage.url = "localhost1";
    localStorage.port = "1111";
    localStorage.username = "user1";
    localStorage.password = "pass1";

    let profiles = [];
    profiles.push({
        id: '0',
        name: 'Default',
        url: 'localhost',
        port: '8080',
        username: 'xbmc',
        password: 'xbmc'
    });
    profiles.push({
        id: '1',
        name: 'profile1',
        url: 'localhost1',
        port: '1111',
        username: 'user1',
        password: 'pass1'
    });
    profiles.push({
        id: '2',
        name: 'profile2',
        url: 'localhost2',
        port: '2222',
        username: 'user2',
        password: 'pass2'
    });

    localStorage.setItem("profiles", JSON.stringify(profiles));
}

createOldVersionSettings();

//////////////////////////////////////////////////////////////////////////////////

