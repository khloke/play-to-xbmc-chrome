function getEventPath(event) {
    var path = [];
    var node = event.target;
    while(node != document.body) {
        path.push(node);
        node = node.parentNode;
    }
    return path;
}

function addContextMenuTo(selector) {
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
        if (event.target && $.isFunction(event.target[matches]) && event.target[matches](selector)) {
            if (!event.path) {
                debugLog("Using workaround to get event.path");
                event.path = getEventPath(event);
            }
            for (var i = 0; i < event.path.length; i++) {
                var element = event.path[i];
                if (element[matches] && element[matches]('a')) {
                    createContextMenu(element.href);
                    isHovering = true;
                    break;
                }
            }
        } else if (isHovering) {
            isHovering = false;
        }
    });
    document.addEventListener('mouseout', function(event) {
        if (isHovering && (!event.target || !event.target[matches](selector))) {
            isHovering = false;
        }
    });
}

function createContextMenu(linkUrl) {
    if (linkUrl && linkUrl.match('^//.*$')) {
        var tabUrl = window.location.href;
        var patternMatch = tabUrl.match('^(https|http)://(.+)/.*$');
        if (patternMatch) {
            chrome.runtime.sendMessage({action: 'createContextMenu', link: patternMatch[1] + ':' + linkUrl}, function (response) {});
        } else {
            debugLog("Could not determine what to do with link: " + linkUrl);
        }
    } else if (linkUrl && linkUrl.match('^/.*$')) {
        var tabUrl = window.location.href;
        var patternMatch = tabUrl.match('^(https|http)://([^/]+)/.*$');
        if (patternMatch) {
            chrome.runtime.sendMessage({action: 'createContextMenu', link: patternMatch[1] + '://' + patternMatch[2] + linkUrl}, function (response) {});
        } else {
            debugLog("Could not determine what to do with link: " + linkUrl);
        }
    } else if (linkUrl && (linkUrl.match('^(https|http|acestream|sop)://.+$') || linkUrl.match('^(http|https)://.*\.(torrent|torrent\?.+)$'))) {
        chrome.runtime.sendMessage({action: 'createContextMenu', link: linkUrl}, function (response) {});
    } else if (!linkUrl || linkUrl.trim() == ''
        || (linkUrl && (linkUrl.indexOf('#') == 0
        || linkUrl.indexOf('mailto') == 0
        || linkUrl.indexOf('javascript') == 0
        || linkUrl.indexOf('irc') == 0))) {
        //Do nothing to these links.
    } else {
        debugLog("Could not determine what to do with link: " + linkUrl);
    }
}

addContextMenuTo('a');

$(document).ready(function() {
    for (var i = 0; i < allModules.length; i++) {
        var module = allModules[i];
        if (module.createCustomContextMenus) {
            module.createCustomContextMenus();
        }
    }
});
