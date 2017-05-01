

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var $video = $('#jw > div.jw-media.jw-reset > video');
        if (request.action == "getVideoSrc") {
            var videoSrc = $video.attr('src');
            console.log("Sending VideoSrc: " + videoSrc);
            sendResponse({videoSrc: videoSrc});
        } else if (request.action == "onPlayback") {
            $video[0].pause();
        }
    }
);
