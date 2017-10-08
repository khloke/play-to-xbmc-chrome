

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var $video = $('#player video:first');
        if (request.action == "getVideoSrc") {
            var videoSrc = $video.find('source:first').attr('src');
            sendResponse({videoSrc: videoSrc});
        } else if (request.action == "onPlayback") {
            $video[0].pause();
        }
    }
);
