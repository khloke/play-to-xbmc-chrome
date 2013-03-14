
function showAlertMessage(status, message) {
    status.html(message);
    status.show();
    setTimeout(function() {
        status.fadeOut("fast");
    }, 3000);
}

// Saves options to localStorage.
function save_options() {
    var status = $("#status");
    var urlControlGroup = $('#urlControlGroup');
    var portControlGroup = $('#portControlGroup');

    var url = document.getElementById("url").value;
    var port = document.getElementById("port").value;
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (url && port && url != '' && port != '') {
        localStorage.setItem("url", url);
        localStorage.setItem("port", port);
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);

        // Update status to let user know options were saved
        showAlertMessage(status, "Options Saved");
        urlControlGroup.removeClass('error');
        portControlGroup.removeClass('error');
        urlControlGroup.find('.controls').find('.help-inline').remove();
        portControlGroup.find('.controls').find('.help-inline').remove();
    } else {
        urlControlGroup.addClass('error');
        portControlGroup.addClass('error');
        urlControlGroup.find('.controls').append('<span class="help-inline">Required</span>');
        portControlGroup.find('.controls').append('<span class="help-inline">Required</span>');
    }
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var url = localStorage["url"];
    var port = localStorage["port"];
    var username = localStorage["username"];
    var password = localStorage["password"];
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

document.addEventListener('DOMContentLoaded', function () {
    restore_options();
    document.querySelector('#saveBtn').addEventListener('click', save_options);
});