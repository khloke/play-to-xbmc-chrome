$(document).ready(function(){
    checkVersion();
    populateProfiles();
    restoreOptions();
    document.querySelector('#saveBtn').addEventListener('click', saveOptions);
    $('#newProfileBtn').click(function(){createNewProfile()});
    $('#deleteProfileBtn').click(function(){deleteThisProfile()});
    $('#enableMultiHost').change(function(){
        localStorage.setItem(storageKeys.enableMultiHost, $(this).attr('checked') == 'checked');
        populateProfiles();
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

// Saves options to localStorage.
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
            localStorage.setItem("url", url);
            localStorage.setItem("port", port);
            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
        }

        // Update status to let user know options were saved
        showAlertMessage(status, "Options Saved");
        urlControlGroup.removeClass('error');
        portControlGroup.removeClass('error');
        urlControlGroup.find('.controls').find('.help-inline').remove();
        portControlGroup.find('.controls').find('.help-inline').remove();

        localStorage.setItem(storageKeys.showRepeat, $('#showRepeat').val());
        localStorage.setItem(storageKeys.enableMultiHost, $('#enableMultiHost').attr('checked')=='checked');
        localStorage.setItem(storageKeys.enableDebugLogs, $('#enableDebugLogs').attr('checked')=='checked');

        // Update status to let user know options were saved
        showAlertMessage(status, "Options Saved");

        //Show the previously selected profile
        populateProfiles(function() {
            profiles.val(selectedProfile);
            changeProfile();
        });

    } else {
        urlControlGroup.addClass('error');
        portControlGroup.addClass('error');
        urlControlGroup.find('.controls').append('<span class="help-inline">Required</span>');
        portControlGroup.find('.controls').append('<span class="help-inline">Required</span>');
    }
}

// Restores select box state to saved value from localStorage.
function restoreOptions() {
    if (isMultiHostEnabled()) {
        changeProfile();
    } else {
        restoreUrl();
    }

    if (isMultiHostEnabled()) {
        $('#enableMultiHost').attr("checked", true);
    } else {
        $('#enableMultiHost').removeAttr("checked");
    }

    if (isDebugLogsEnabled()) {
        $('#enableDebugLogs').attr("checked", true);
    } else {
        $('#enableDebugLogs').removeAttr("checked");
    }

    var showRepeat = localStorage[storageKeys.showRepeat];
    $('#showRepeat').val(showRepeat);
}

function restoreUrl() {
    if (isMultiHostEnabled()) {
        changeProfile();
    } else {
        var url = localStorage["url"];
        var port = localStorage["port"];
        var username = localStorage["username"];
        var password = localStorage["password"];
        var showRepeat = localStorage[storageKeys.showRepeat];

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

    if (isMultiHostEnabled()) {
        $('#enableMultiHost').attr("checked", true);
    } else {
        $('#enableMultiHost').removeAttr("checked");
    }

    $('#showRepeat').val(showRepeat);
}

function checkVersion() {
    var storageVersion = localStorage["storage-version"];

    if (storageVersion == null) {
        localStorage.setItem("storage-version", 0);
        storageVersion = 0;
    }

    if (storageVersion < currentVersion) {
        doUpgrade(storageVersion, currentVersion);
        localStorage.setItem("storage-version", currentVersion);
    }
}

function doUpgrade(from, to) {
    if (from < 1310) {
        var storageUrl = localStorage["url"];
        var storagePort = localStorage["port"];
        var storageUsername = localStorage["username"];
        var storagePassword = localStorage["password"];

        var profiles = [];
        var profile;

        if (storageUrl != null && storagePort != null && storageUrl != '' && storagePort != '') {
            profile = {
                "id": 0,
                "name": 'Default',
                "url": storageUrl,
                "port": storagePort,
                "username": storageUsername,
                "password": storagePassword
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

        profiles.push(profile);

        localStorage.setItem(storageKeys.profiles, JSON.stringify(profiles));
        localStorage.setItem(storageKeys.selectedHost, 0);
    }
}

function saveProfile() {
    var profileId = $('#profiles').val();
    var allProfilesObj = getAllProfiles();
    var allProfiles;

    if (allProfilesObj != null) {
        allProfiles = JSON.parse(allProfilesObj);

        for (var i = 0; i < allProfiles.length; i++) {
            var profile = allProfiles[i];
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
        allProfiles = [{
            id:0,
            name: document.getElementById("name").value,
            "url": document.getElementById("url").value,
            "port": document.getElementById("port").value,
            "username": document.getElementById("username").value,
            "password": document.getElementById("password").value
        }];
    }

    localStorage.setItem(storageKeys.profiles, JSON.stringify(allProfiles));
}

function changeProfile() {
    if (isMultiHostEnabled()) {
        var profileId = $('#profiles').val();
        var allProfiles = JSON.parse(getAllProfiles());

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
    var profiles = $('#profiles');
    var allProfilesObj = getAllProfiles();

    profiles.change(function(){
        changeProfile();
    });


    if (allProfilesObj != null) {
        var allProfiles = JSON.parse(allProfilesObj);

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
    var allProfiles = JSON.parse(getAllProfiles());
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

    localStorage.setItem(storageKeys.profiles, JSON.stringify(allProfiles));
    populateProfiles();
    $('#profiles').val(largestId+1);
    changeProfile();
}

function deleteThisProfile() {
    var allProfiles = JSON.parse(getAllProfiles());
    var profiles = $('#profiles');
    var selectedId = profiles.val();
    var indexToRemove = -1;

    for (var i = 0; i < allProfiles.length; i++) {
        var profile = allProfiles[i];
        if (profile.id == selectedId) {
            indexToRemove = i;
        }
    }

    allProfiles.splice(indexToRemove, 1);

    localStorage.setItem(storageKeys.profiles, JSON.stringify(allProfiles));
    populateProfiles();
    profiles.val(allProfiles[0].id);
}

function goToPaypal() {
    var encrypted = '-----BEGIN PKCS7-----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-----END PKCS7-----';
    var cmd = '_s-xclick';
    var url = 'https://www.paypal.com/cgi-bin/webscr?' + 'cmd=' + encodeURIComponent(cmd) + '&encrypted=' + encodeURIComponent(encrypted);

    window.open(url, '_blank');
}