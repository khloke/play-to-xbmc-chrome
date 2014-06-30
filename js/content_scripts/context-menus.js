$(document).ready(function() {
    $("a").each(function() {
        var linkUrl = $(this).attr('href');
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
        } else if (linkUrl && linkUrl.match('^(https|http)://.+$')) {
            chrome.extension.sendMessage({action: 'createContextMenu', link: linkUrl}, function (response) {});
        } else {
            console.log("Could not determine what to do with link: " + linkUrl);
        }
    });
});