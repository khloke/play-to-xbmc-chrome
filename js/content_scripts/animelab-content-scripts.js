

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getVideoSrc") {
            var $video = $('video');
            var videoSrc = $video.attr('src');
            $video[0].pause();
            sendResponse({videoSrc: videoSrc});
        }
    }
);