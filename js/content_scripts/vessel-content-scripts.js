

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getVideoSrc") {
            var videoSrc = decodeURIComponent($('video.video-show').attr('src'));
            sendResponse({videoSrc: videoSrc});
        } else if (request.action == 'onPlayback') {
            $('video')[0].pause();
        }
    }
);