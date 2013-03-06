
// Saves options to localStorage.
function showAlertMessage(status) {
    status.html("Options Saved");
    status.show();
    setTimeout(function() {
        status.fadeOut("fast");
    }, 3000);
}
function save_options() {
    var url = document.getElementById("url").value;
    var port = document.getElementById("port").value;
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    localStorage.setItem("url", url);
    localStorage.setItem("port", port);
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);

    // Update status to let user know options were saved.
    var status = $("#status");
    showAlertMessage(status);
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