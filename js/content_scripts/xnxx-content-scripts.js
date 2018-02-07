chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        debugLog("Received message: " + request.action);
        if (request.action == "getEmbeddedVideos" || request.action == "getVideoSrc") {
//            debugger;
            var embed = $('embed');
            for (var i = 0; i < embed.length; i++) {
                var flashvars = embed[i].attributes.flashvars.nodeValue;
                var urls = flashvars.split("&");
                for (var j = 0; j < urls.length; j++) {
                    if (urls[j].indexOf('flv_url=') == 0 ) {
                        var videoSrc = decodeURIComponent(urls[j].substring(8));
                        sendResponse({videoSrc: videoSrc});
                        return;
                    }
                }
            }
        } else {
            debugLog('Unknown action: ' + request.action);
        }
    }
);
