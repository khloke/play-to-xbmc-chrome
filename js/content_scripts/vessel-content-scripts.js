

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getVideoSrc") {
            var videoSrc = decodeURIComponent($('video.video-show').attr('src'));
            sendResponse({videoSrc: videoSrc});
        }
    }
);