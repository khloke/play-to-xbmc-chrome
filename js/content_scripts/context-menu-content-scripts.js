var _port;
var getPort = function() {
    if (_port) return _port;
    _port = chrome.extension.connect({name: 'contextMenus'});
    _port.onDisconnect.addListener(function() {
        _port = null;
    });
    return _port;   
}

function addContextMenuTo(selector, listOfCreateProperties) {
    selector = selector + ', ' + selector + ' *';
    var matches;
    ['matches', 'webkitMatchesSelector', 'webkitMatches', 'matchesSelector'].some(function(m) {
        if (m in document.documentElement) {
            matches = m;
            return true;
        }
    });

    var isHovering = false;
    document.addEventListener('mouseover', function(event) {
        if (event.target && event.target[matches](selector)) {
            getPort().postMessage(listOfCreateProperties);
            isHovering = true;
        } else if (isHovering) {
            getPort().postMessage([]);
            isHovering = false;
        }
    });
    document.addEventListener('mouseout', function(event) {
        if (isHovering && (!event.target || !event.target[matches](selector))) {
            getPort().postMessage([]);
            isHovering = false;
        }
    });
}

function concatMusicExtensions() {
    var concatSelector = '';
    var first = true;
    for (var i=0;i<supportedVideoExtensions.length;i++) {
        if (first) {
            first = false;
        } else {
            concatSelector += ',';
        }
        concatSelector += "a[href$='." + supportedVideoExtensions[i] + "']"
    }
    for (var j=0;j<supportedAudioExtensions.length;j++) {
        if (first) {
            first = false;
        } else {
            concatSelector += ',';
        }
        concatSelector += "a[href$='." + supportedAudioExtensions[j] + "']"
    }
    return concatSelector;
}

function checkConnectivity(callback) {
    chrome.extension.sendMessage({action: 'isAvailable'}, function (response) {
        if (response.response == 'OK') {
            callback(true);
        } else {
            callback(false);
        }
    });
}

checkConnectivity(function(isAvailable) {
    if (isAvailable) {
        addContextMenuTo(concatMusicExtensions(),
            [{
                title: "Play now",
                contexts: ["link"],
                onclick: 'musicPlayNow'
            },{
                title: "Queue",
                contexts: ["link"],
                onclick: 'musicPlayNow'
            },{
                title: "Play this Next",
                contexts: ["link"],
                onclick: 'musicPlayNow'
            }]
        );
    }
});