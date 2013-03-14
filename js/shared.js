var storageKeys = {
    "showRepeat": "showRepeat",
    "profiles": "profiles",
    "enableMultiHost": "enableMultiHost",
    "selectedHost": "selectedHost"
};

function isMultiHostEnabled() {
    var enableMultiHost = localStorage[storageKeys.enableMultiHost];

    return enableMultiHost != null && enableMultiHost == 'true';
}

function getAllProfiles() {
    return localStorage[storageKeys.profiles];
}