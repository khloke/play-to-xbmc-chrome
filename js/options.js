$(document).ready(function(){
    getSettings().then(
        settings => {
            if (null != settings.enableDebugLogs) {
                setDebug(settings.enableDebugLogs);
            }
            populateProfiles(settings);
            restoreOptions(settings);
            document.querySelector('#saveBtn').addEventListener('click', saveOptions);
            $('#newProfileBtn').click(function(){
                getSettings().then(settings => { createNewProfile(settings); });
            });
            $('#deleteProfileBtn').click(function(){
                getSettings().then(settings => { deleteThisProfile(settings); });
            });
            $('#enableMultiHost').change(function(){
                // TODO Show host combobox after multi host checkbox changed
                browser.storage.sync.set({enableMultiHost: $(this).prop('checked')}).then( saved => { populateProfiles(); });
            });
            $('#enableDebugLogs').change(function() {
                let debugLogs = $(this).prop('checked');
                browser.storage.sync.set({enableDebugLogs: debugLogs});
                setDebug(debugLogs);
                chrome.runtime.sendMessage({action: 'setDebug', enable: debugLogs}, function (response) {});
            });
            $('#paypalDonate').click(function() {
                goToPaypal();
            });
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
//
// Settings needed: ["enableMultiHost", "url", "port", "username", "password", "profiles"]
//
async function saveOptions() {
    debugLog("saveOptions()");
    
    var status = $("#status");
    var profiles = $('#profiles');
    var urlControlGroup = $('#urlControlGroup');
    var portControlGroup = $('#portControlGroup');
    var selectedProfile = profiles.val();

    var url = document.getElementById("url").value;
    var port = document.getElementById("port").value;
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    let settings = await getSettings();

    if (url && port && url != '' && port != '') {
        let profileSaved;

        if (isMultiHost(settings)) {
            profileSaved = saveProfile(settings);
        } else {
            var opts = {
                url: url,
                port: port,
                username: username,
                password: password
            };
            profileSaved = browser.storage.sync.set(opts);
        }

        profileSaved.then(
            saved => {
                // Update status to let user know options were saved
                showAlertMessage(status, "Options Saved");
                urlControlGroup.removeClass('error');
                portControlGroup.removeClass('error');
                urlControlGroup.find('.controls').find('.help-inline').remove();
                portControlGroup.find('.controls').find('.help-inline').remove();

                let opts = {
                    showRepeat: $('#showRepeat').val(),
                    magnetAddOn: $('#magnetAddOn').val(),
                    enableMultiHost: $('#enableMultiHost').prop('checked'),
                    enableDebugLogs: $('#enableDebugLogs').prop('checked')
                };
                browser.storage.sync.set(opts).then(
                    saved => {
                        // Update status to let user know options were saved
                        showAlertMessage(status, "Options Saved");

                        // Show the previously selected profile
                        populateProfiles(null, function() {
                            // TODO Can we pass 'settings' and 'selectedProfile' variables here?
                            profiles.val(selectedProfile);
                            changeProfile(settings);
                        });
                    });
            });
    } else {
        urlControlGroup.addClass('error');
        portControlGroup.addClass('error');
        urlControlGroup.find('.controls').append('<span class="help-inline">Required</span>');
        portControlGroup.find('.controls').append('<span class="help-inline">Required</span>');
    }
}

// Restores select box state to saved value from storage.
//
// Settings needed: ["enableMultiHost", "enableDebugLogs", "showRepeat", "magnetAddon"]
//
async function restoreOptions(settings) {
    debugLog("restoreOptions()");

    if (isDebug()) {
        console.log("restoreOptions(): enableMultiHost " + settings.enableMultiHost);
        console.log("restoreOptions(): enableDebugLogs: " + settings.enableDebugLogs);
        console.log("restoreOptions(): showRepeat: " + settings.showRepeat);
        console.log("restoreOptions(): magnetAddon: " + settings.magnetAddOn);
    }
    if (isMultiHost(settings)) {
        changeProfile(settings);
        $('#enableMultiHost').prop("checked", true);
    } else {
        restoreUrl(settings);
        $('#enableMultiHost').prop("checked", false);
    }

    if (isDebug(settings)) {
        $('#enableDebugLogs').prop("checked", true);
    } else {
        $('#enableDebugLogs').prop("checked", false);
    }

    $('#showRepeat').val(settings.showRepeat);
    $('#magnetAddOn').val(settings.magnetAddOn);
}

//
// Settings needed: ["url", "port", "username", "password", "showRepeat", "magnetAddOn"];
//
function restoreUrl(settings) {
    debugLog("restoreUrl()");

    if (isMultiHost(settings)) {
        changeProfile(settings);
    } else {
        let url = settings.url;
        let port = settings.port;
        let username = settings.username;
        let password = settings.password;
        let showRepeat = settings.showRepeat;
        let magnetAddOn = settings.magnetAddOn;

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

    $('#showRepeat').val(settings.showRepeat);
    $('#magnetAddOn').val(settings.magnetAddOn);
}

// 
//
// Settings needed: ["profiles"]
//
function saveProfile(settings) {
    let allProfiles = getAllProfiles(settings);

    let profileId = $('#profiles').val();

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
    return browser.storage.sync.set({profiles: allProfiles});
}

//
// Settings needed: ["profiles", "enableMultiHost"];
//
function changeProfile(settings) {
    debugLog("changeProfile()");

    if (isMultiHost(settings)) {
        var profileId = $('#profiles').val();
        var allProfiles = getAllProfiles(settings);

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

// 
//
// Settings needed: ["enableMultiHost", "profiles", "url", "port", "username", "password"]
//
async function populateProfiles(settings, callback) {
    debugLog("populateProfiles()");

    if (!settings) {
        settings = await getSettings();
    }

    let profiles = $('#profiles');
    let allProfiles = settings.profiles;

    profiles.change(function() {
        getSettings().then(
            settings => {
                changeProfile(settings);
            });
    });

    if (allProfiles != null) {
        profiles.children().each(function() {$(this).remove()});

        for (let i=0; i<allProfiles.length; i++) {
            let profile = allProfiles[i];
            profiles.append('<option value="' + profile.id + '">' + profile.name + '</option>');
        }
    } else {
        if (isMultiHost(settings)) {
            profiles.append('<option>Default</option>');
            document.getElementById("name").value = 'Default';
            document.getElementById("url").value = '';
            document.getElementById("port").value = '';
            document.getElementById("username").value = '';
            document.getElementById("password").value = '';
        }

    }

    if (isMultiHost(settings)) {
        $('.profile-group').show();
        changeProfile(settings);
    } else {
        $('.profile-group').hide();
        restoreUrl(settings);
    }

    if (callback) {
        callback();
    }
}

async function createNewProfile(settings) {
    let allProfiles = getAllProfiles(settings);
    let largestId = 0;

    for (var i = 0; i < allProfiles.length; i++) {
        let profile = allProfiles[i];
        if (profile.id > largestId) {
            largestId = profile.id;
        }
    }

    allProfiles.push({
        id: ++largestId,
        name: 'New Profile',
        "url": '',
        "port": '',
        "username": '',
        "password": ''
    });

    browser.storage.sync.set({profiles: allProfiles}).then(
        (saved) => {
            populateProfiles(null, function () {
               $('#profiles').val(largestId);
               changeProfile(settings);
            });
        });
}

// 
//
// Settings needed: ["profiles"]
//
async function deleteThisProfile(settings) {
    let allProfiles = getAllProfiles(settings);
    let profiles = $('#profiles');
    let selectedId = profiles.val();
    let indexToRemove = -1;

    for (var i = 0; i < allProfiles.length; i++) {
        let profile = allProfiles[i];
        if (profile.id == selectedId) {
            indexToRemove = i;
            break;
        }
    }

    allProfiles.splice(indexToRemove, 1);

    browser.storage.sync.set({profiles: allProfiles}).then(
        (results) => {
            populateProfiles();
            if (allProfiles[0]) {
                profiles.val(allProfiles[0].id);
            }
        });
}

function goToPaypal() {
    var encrypted = '-----BEGIN PKCS7-----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-----END PKCS7-----';
    var cmd = '_s-xclick';
    var url = 'https://www.paypal.com/cgi-bin/webscr?' + 'cmd=' + encodeURIComponent(cmd) + '&encrypted=' + encodeURIComponent(encrypted);

    window.open(url, '_blank');
}
