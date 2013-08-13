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

        // Update status to let user know options were saved
        showAlertMessage(status, "Options Saved");

        //Show the previously selected profile
        populateProfiles(function() {
            profiles.val(selectedProfile);
            changeProfile();
        });

        localStorage.setItem(storageKeys.enableMultiHost, $('#enableMultiHost').attr('checked')?true:false);
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