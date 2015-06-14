

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getVideoSrc") {
            var videoSrc = decodeURIComponent($('video.video-show').attr('src'));
            $('video')[0].pause();
            sendResponse({videoSrc: videoSrc});
        }
    }
);