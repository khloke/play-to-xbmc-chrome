var musicExtensions = ['mp3', 'ogg', 'midi', 'wav', 'aiff', 'aac', 'flac', 'ape', 'wma'];

// Port management
var _port;
var getPort = function() {
    if (_port) return _port;
    _port = chrome.extension.connect({name: 'contextMenus'});
    _port.onDisconnect.addListener(function() {
        _port = null;
    });
    return _port;   
}

// listOfCreateProperties is an array of createProperties, which is defined at
// https://developer.chrome.com/extensions/contextMenus.html#method-create
// with a single exception: "onclick" is a string which corresponds to a function
// at the background page. (Functions are not JSON-serializable, hence this approach)
function addContextMenuTo(selector, listOfCreateProperties) {
    // Selector used to match an element. Match if an element, or its child is hovered
    selector = selector + ', ' + selector + ' *';
    var matches;
    ['matches', 'webkitMatchesSelector', 'webkitMatches', 'matchesSelector'].some(function(m) {
        if (m in document.documentElement) {
            matches = m;
            return true;
        }
    });
    // Bind a single mouseover+mouseout event to catch hovers over all current and future elements.
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

// Example: Bind the context menus to the elements which contain a class attribute starts with "story"

function concatMusicExtensions() {
    var concatSelector = '';
    var first = true;
    for (var i=0;i<musicExtensions.length;i++) {
        if (first) {
            first = false;
        } else {
            concatSelector += ',';
        }
        concatSelector += "a[href$='." + musicExtensions[i] + "']"
    }
    return concatSelector;
}

//function checkConnectivity(callback) {
//    chrome.extension.sendMessage({action: 'isAvailable'}, function (response) {
//        if (response.response == 'OK') {
//            callback(true);
//        } else {
//            callback(false);
//        }
//    });
//}
//
//checkConnectivity(function(isAvailable) {
//    if (isAvailable) {
//        addContextMenuTo(concatMusicExtensions(),
//            [{
//                title: "Play now",
//                contexts: ["link"],
//                onclick: 'musicPlayNow'
//            },{
//                title: "Queue",
//                contexts: ["link"],
//                onclick: 'musicPlayNow'
//            },{
//                title: "Play this Next",
//                contexts: ["link"],
//                onclick: 'musicPlayNow'
//            }]
//        );
//    }
//});