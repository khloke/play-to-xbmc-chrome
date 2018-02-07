

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        debugLog("Received message: " + request.action);
        if (request.action == "getVideoSrc") {
            var videoSrc = decodeURIComponent($('video.video-show').attr('src'));
            sendResponse({videoSrc: videoSrc});
        } else if (request.action == 'onPlayback') {
            $('video')[0].pause();
        } else {
            debugLog('Unknown action: ' + request.action);
        }
    }
);
