

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getVideoSrc") {
            var videoSrc = $('div.play-video').attr('data-vid');
            if (!videoSrc) {
                videoSrc = decodeURIComponent($('div.slide-container param[name="flashvars"]').attr('value')).match("file=([^&]+)")[1];
            }
            sendResponse({videoSrc: videoSrc});
        }
    }
);