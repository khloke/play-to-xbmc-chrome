console.log("options.js");

$(document).ready(function(){
    checkVersion();
    populateProfiles();
    restoreOptions();
    document.querySelector('#saveBtn').addEventListener('click', saveOptions);
    $('#newProfileBtn').click(function(){createNewProfile()});
    $('#deleteProfileBtn').click(function(){deleteThisProfile()});
    $('#enableMultiHost').change(function(){
        getSettings().enableMultiHost = $(this).prop('checked');
        populateProfiles();
    });
    $('#enableDebugLogs').change(function() {
        chrome.runtime.sendMessage({action: 'setLogging', enable: $(this).prop('checked')}, function (response) {});
    });
    $('#paypalDonate').click(function() {
        goToPaypal();
    });
});

function showAlertMessage(status, message) {
    status.html(message);
    status.show();
    setTimeout(function() {
        status.fadeOut("fast");
    }, 3000);
}

// Saves options to storage.
function saveOptions() {
    var status = $("#status");
    var profiles = $('#profiles');
    var urlControlGroup = $('#urlControlGroup');
    var portControlGroup = $('#portControlGroup');
    var selectedProfile = profiles.val();

    var url = document.getElementById("url").value;
    var port = document.getElementById("port").value;
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
        
    if (url && port && url != '' && port != '') {
        if (isMultiHostEnabled()) {
            saveProfile();
        } else {
            var opts = {
                url: url,
                port: port,
                username: username,
                password: password
            };
            browser.storage.sync.set(opts).then(
                (results) => {
                    if (isDebugEnabled()) {
                        console.log("Options saved: Profile saved");
                    }
                }, onError);
        }

        // Update status to let user know options were saved
        showAlertMessage(status, "Options Saved");
        urlControlGroup.removeClass('error');
        portControlGroup.removeClass('error');
        urlControlGroup.find('.controls').find('.help-inline').remove();
        portControlGroup.find('.controls').find('.help-inline').remove();

        var opts = {
            showRepeat: $('#showRepeat').val(),
            magnetAddOn: $('#magnetAddOn').val(),
            enableMultiHost: $('#enableMultiHost').prop('checked'),
            enableDebugLogs: $('#enableDebugLogs').prop('checked')
        };
        var saved = browser.storage.sync.set(opts);
        saved.then((results) => {
            if (isDebugEnabled()) {
                console.log("Options saved");
            }
            // Update status to let user know options were saved
            showAlertMessage(status, "Options Saved");

            //Show the previously selected profile
            populateProfiles(function() {
                profiles.val(selectedProfile);
                changeProfile();
            });
        }, onError);
    } else {
        urlControlGroup.addClass('error');
        portControlGroup.addClass('error');
        urlControlGroup.find('.controls').append('<span class="help-inline">Required</span>');
        portControlGroup.find('.controls').append('<span class="help-inline">Required</span>');
    }
}

// Restores select box state to saved value from storage.
function restoreOptions() {
    console.log("restoreOptions()");
    if (isDebugEnabled()) {
        console.log("restoreOptions(): enableMultiHost " + getSettings().enableMultiHost);
        console.log("restoreOptions(): enableDebugLogs: " + getSettings().enableDebugLogs);
        console.log("restoreOptions(): showRepeat: " + getSettings().showRepeat);
        console.log("restoreOptions(): magnetAddon: " + getSettings().magnetAddOn);
    }
    if (isMultiHostEnabled()) {
        changeProfile();
    } else {
        restoreUrl();
    }

    if (isMultiHostEnabled()) {
        $('#enableMultiHost').prop("checked", true);
    } else {
        $('#enableMultiHost').prop("checked", false);
    }

    if (isDebugLogsEnabled()) {
        $('#enableDebugLogs').prop("checked", true);
    } else {
        $('#enableDebugLogs').prop("checked", false);
    }

    var showRepeat = getSettings().showRepeat;
    $('#showRepeat').val(showRepeat);
    var magnetAddOn = getSettings().magnetAddOn;
    $('#magnetAddOn').val(magnetAddOn);
}

function restoreUrl() {
    console.log("restoreUrl()");
    if (isMultiHostEnabled()) {
        changeProfile();
    } else {
        var url = getSettings().url;
        var port = getSettings().port;
        var username = getSettings().username;
        var password = getSettings().password;
        var showRepeat = getSettings().showRepeat;
        var magnetAddOn = getSettings().magnetAddOn;

        if (!url || !port) {
            return;
        }
        document.getElementById("url").value = url;
        document.getElementById("port").value = port;
        if (username && password) {
            document.getElementById("username").value = username;
            document.getElementById("password").value = password;
        }
    }

    $('#showRepeat').val(showRepeat);
    $('#magnetAddOn').val(magnetAddOn);
}

function checkVersion() {
    var storageVersion = getSettings().storageVersion;
    if (!storageVersion) {
        storageVersion = parseInt(localStorage["storage-version"], 10);
    }

    storageVersion = storageVersion > 1000 ? storageVersion/10 : storageVersion;

    if (isDebugEnabled()) {
        console.log("Storage version: " + storageVersion);
    }

    if (storageVersion == null) {
        browser.storage.sync.set({storageVersion: 0});
        storageVersion = 0;
    } else if (storageVersion < currentVersion) {
        doUpgrade(storageVersion, currentVersion);
    }
}

function doUpgrade(from, to) {
    var opts;
    
    if (isDebugEnabled()) {
        console.log("Upgrading from version '" + from + "' to '" + to + "'");
    }
    
    console.log("Old settings from localStorage: " + JSON.stringify(localStorage));

    if (from < 131) {
        opts = {
            url: localStorage["url"],
            port: localStorage["port"],
            username: localStorage["username"],
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
    } else if (from < 191) {
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

        if (isDebugEnabled()) {
            console.log("Upgrade: showRepeat:" + localStorage.showRepeat);
            console.log("Upgrade: enableMultiHost: " + localStorage.enableMultiHost);
            console.log("Upgrade: magnetAddOn: " + localStorage.magnetAddOn);
        }

        opts.profiles = [];

        let oldProfilesObj = localStorage.profiles;
        let oldProfiles;

        if (oldProfilesObj != null) {
            oldProfiles = JSON.parse(oldProfilesObj);
                
            if (isDebugEnabled()) {
                console.log("Upgrade: oldProfilesObj: " + oldProfilesObj);
                console.log("Upgrade: oldProfiles: " + JSON.stringify(oldProfiles));
            }

            for (let i = 0; i < oldProfiles.length; i++) {
                let profileOld = oldProfiles[i];
                if (isDebugEnabled()) {
                    console.log("Upgrade: profileOld: " + profileOld);
                }
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

    console.log("Upgrade: Settings to save, opts: " + JSON.stringify(opts));

    browser.storage.sync.set(opts).then(
        (results) => {
            if (isDebugEnabled()) {
                console.log("Upgrade: Migrated options saved");
            }
            browser.storage.sync.get().then(
                (storage) => {
                    getSettings() = storage;
                    if (isDebugEnabled()) {
                        console.log("Upgrade: Migrated options: " + JSON.stringify(getSettings()));
                    }
                    populateProfiles();
                    restoreOptions();
                });
        }, onError);
}

function saveProfile() {
    let profileId = $('#profiles').val();
    let allProfiles = getAllProfiles();

    if (allProfiles != null) {
        for (var i = 0; i < allProfiles.length; i++) {
            let profile = allProfiles[i];
            if (profile.id == profileId) {
                profile.name = document.getElementById("name").value;
                profile.url = document.getElementById("url").value;
                profile.port = document.getElementById("port").value;
                profile.username = document.getElementById("username").value;
                profile.password = document.getElementById("password").value;

                break;
            }
        }
    } else {
        allProfiles = {
            id:0,
            name: document.getElementById("name").value,
            url: document.getElementById("url").value,
            port: document.getElementById("port").value,
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        };
    }

    browser.storage.sync.set({profiles: allProfiles}).then(
        (results) => {
            if (isDebugEnabled()) {
                console.log("Profile saved");
            }
        }, onError);
}

function changeProfile() {
    if (isMultiHostEnabled()) {
        var profileId = $('#profiles').val();
        var allProfiles = getAllProfiles();

        for (var i = 0; i < allProfiles.length; i++) {
            var profile = allProfiles[i];
            if (profile.id == profileId) {
                document.getElementById("name").value = profile.name;
                document.getElementById("url").value = profile.url;
                document.getElementById("port").value = profile.port;
                document.getElementById("username").value = profile.username;
                document.getElementById("password").value = profile.password;
                break;
            }
        }
    }
}

function populateProfiles(callback) {
    console.log("populateProfiles()");
    console.log("populateProfiles(): getSettings(): " + JSON.stringify(getSettings()));
    var profiles = $('#profiles');
    var allProfiles = getAllProfiles();

    profiles.change(function(){
        changeProfile();
    });


    if (allProfiles != null) {
        profiles.children().each(function() {$(this).remove()});

        for (var i=0; i<allProfiles.length; i++) {
            var profile = allProfiles[i];
            profiles.append('<option value="' + profile.id + '">' + profile.name + '</option>');
        }
    } else {
        if (isMultiHostEnabled()) {
            profiles.append('<option>Default</option>');
            document.getElementById("name").value = 'Default';
            document.getElementById("url").value = '';
            document.getElementById("port").value = '';
            document.getElementById("username").value = '';
            document.getElementById("password").value = '';
        }

    }

    if (isMultiHostEnabled()) {
        $('.profile-group').show();
        changeProfile();
    } else {
        $('.profile-group').hide();
        restoreUrl();
    }

    if (callback) {
        callback();
    }
}

function createNewProfile() {
    var allProfiles = getAllProfiles();
    var largestId = 0;

    for (var i = 0; i < allProfiles.length; i++) {
        var profile = allProfiles[i];
        if (profile.id > largestId) {
            largestId = profile.id;
        }
    }

    allProfiles.push({
        id:largestId+1,
        name:'New Profile',
        "url": '',
        "port": '',
        "username": '',
        "password": ''
    });

    browser.storage.sync.set({profiles: allProfiles});
    populateProfiles();
    $('#profiles').val(largestId+1);
    changeProfile();
}

function deleteThisProfile() {
    var allProfiles = getAllProfiles();
    var profiles = $('#profiles');
    var selectedId = profiles.val();
    var indexToRemove = -1;

    for (var i = 0; i < allProfiles.length; i++) {
        var profile = allProfiles[i];
        if (profile.id == selectedId) {
            indexToRemove = i;
            break;
        }
    }

    allProfiles.splice(indexToRemove, 1);

    browser.storage.sync.set({profiles: allProfiles}).then(
        (results) => {
            if (isDebugEnabled()) {
                console.log("Profile deleted");
            }
            populateProfiles();
            if (allProfiles[0]) {
                profiles.val(allProfiles[0].id);
            }
        }, onError);
}

function goToPaypal() {
    var encrypted = '-----BEGIN PKCS7-----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-----END PKCS7-----';
    var cmd = '_s-xclick';
    var url = 'https://www.paypal.com/cgi-bin/webscr?' + 'cmd=' + encodeURIComponent(cmd) + '&encrypted=' + encodeURIComponent(encrypted);

    window.open(url, '_blank');
}
