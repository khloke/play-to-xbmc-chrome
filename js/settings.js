getSettings().then(
    settings => {
        if (null != settings.enableDebugLogs) {
            setDebug(settings.enableDebugLogs);
        }
        checkVersion(settings);
    });

function checkVersion(settings) {
    var storageVersion = settings ? settings.storageVersion : null;
    if (!storageVersion) {
        let versionLocalStorage = localStorage["storage-version"];
        if (versionLocalStorage) {
            storageVersion = parseInt(versionLocalStorage, 10);
        }
    }

    storageVersion = storageVersion && storageVersion > 1000 ? storageVersion/10 : storageVersion;

    debugLog("Storage version: " + storageVersion);

    if (storageVersion == null) {
        setDefaultSettings();
    } else if (storageVersion < currentVersion) {
        doUpgrade(storageVersion, currentVersion);
    }
}

async function setDefaultSettings() {
    let defaults = {
        storageVersion: currentVersion,
        showRepeat: "never",
        enableMultiHost: false,
        enableDebugLogs: false,
        selectedHost: 0,
        url: "",
        port: "",
        username: "",
        password: "",
        profiles: []
    };
    return browser.storage.sync.set(defaults);
}

function doUpgrade(from, to) {
    var opts = {};
   
    if (isDebug()) {
        console.log("Upgrading from version '" + from + "' to '" + to + "'");
        console.log("Old settings from localStorage: " + JSON.stringify(localStorage));
    }

    if (from < 131) {
        opts = {
            url: localStorage["url"],
            password: localStorage["password"]
        }
        opts.profiles = [];

        let profile;

        if (opts.url != null && opts.port != null && opts.url != '' && opts.port != '') {
            profile = {
                "id": 0,
                "name": 'Default',
                "url": opts.url,
                "port": opts.port,
                "username": opts.username,
                "password": opts.password
            };
        } else {
            profile = {
                "id": 0,
                "name": 'Default',
                "url": '',
                "port": '',
                "username": '',
                "password": ''
            };
        }

        opts.profiles.push(profile);

        opts.selectedHost = 0;
        localStorage.clear();
    } else if (from < 192) {
        opts = {
            url: localStorage.url,
            port: localStorage.port,
            username: localStorage.username,
            password: localStorage.password,
            showRepeat: localStorage.showRepeat,
            enableMultiHost: localStorage.enableMultiHost == 'true',
            selectedHost: parseInt(localStorage.selectedHost, 10),
            enableDebugLogs: localStorage.enableDebugLogs == 'true',
            magnetAddOn: localStorage.magnetAddOn,
            profiles: []
        }

        if (isDebug()) {
            console.log("Upgrade: showRepeat:" + localStorage.showRepeat);
            console.log("Upgrade: enableMultiHost: " + localStorage.enableMultiHost);
            console.log("Upgrade: magnetAddOn: " + localStorage.magnetAddOn);
        }

        opts.profiles = [];

        let oldProfilesObj = localStorage.profiles;
        let oldProfiles;

        if (oldProfilesObj != null) {
            oldProfiles = JSON.parse(oldProfilesObj);
                
            if (isDebug()) {
                console.log("Upgrade: oldProfilesObj: " + oldProfilesObj);
                console.log("Upgrade: oldProfiles: " + JSON.stringify(oldProfiles));
            }

            for (let i = 0; i < oldProfiles.length; i++) {
                let profileOld = oldProfiles[i];

                debugLog("Upgrade: profileOld: " + JSON.stringify(profileOld));

                profile = {
                    "id": profileOld.id,
                    "name": profileOld.name,
                    "url": profileOld.url,
                    "port": profileOld.port,
                    "username": profileOld.username,
                    "password": profileOld.password
                };
                opts.profiles.push(profile);
            }
        }

        localStorage.clear();
    }
    opts.storageVersion = currentVersion;

    debugLog("Upgrade: Settings to save, opts: " + JSON.stringify(opts));

    browser.storage.sync.set(opts).then(
        (results) => {
            updated = true;
            if (isDebug()) {
                getSettings().then(
                    (settings) => {
                        debugLog("Upgrade: Migrated options: " + JSON.stringify(settings));
                    });
            }
            // TODO Is this needed? background will do it before options even show up
            // populateProfiles();
            // restoreOptions(settings);
        });
}

function hasBeenUpdated() {
    return updated;
}

