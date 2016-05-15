

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getVideoSrc") {
            var videoSrc = $('div.play-video').attr('data-vid');
            if (!videoSrc) {
                var flashVars = decodeURIComponent($('div.slide-container param[name="flashvars"]').attr('value')).match("file=([^&]+)");
                if (flashVars && flashVars.length > 1) {
                    videoSrc = flashVars[1];
                }
            }
            if (!videoSrc) {
                videoSrc = $('.videoStage video').attr('h264');
            }
            sendResponse({videoSrc: videoSrc});
        }
    }
);