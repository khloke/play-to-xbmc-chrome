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
        if (event.target && event.target[matches](selector)) {
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
            chrome.extension.sendMessage({action: 'createContextMenu', link: patternMatch[1] + ':' + linkUrl}, function (response) {});
        } else {
            console.log("Could not determine what to do with link: " + linkUrl);
        }
    } else if (linkUrl && linkUrl.match('^/.*$')) {
        var tabUrl = window.location.href;
        var patternMatch = tabUrl.match('^(https|http)://(.+)/.*$');
        if (patternMatch) {
            chrome.extension.sendMessage({action: 'createContextMenu', link: patternMatch[1] + '://' + patternMatch[2] + linkUrl}, function (response) {});
        } else {
            console.log("Could not determine what to do with link: " + linkUrl);
        }
    } else if (linkUrl && (linkUrl.match('^(https|http|acestream|sop)://.+$'))) {
        chrome.extension.sendMessage({action: 'createContextMenu', link: linkUrl}, function (response) {});
    } else if (!linkUrl || (linkUrl && (linkUrl.indexOf('#') == 0 || linkUrl.indexOf('mailto') == 0 || linkUrl.indexOf('javascript') == 0 || linkUrl.indexOf('irc') == 0))) {
        //Do nothing to these links.
    } else {
        console.log("Could not determine what to do with link: " + linkUrl);
    }
}

addContextMenuTo('a');