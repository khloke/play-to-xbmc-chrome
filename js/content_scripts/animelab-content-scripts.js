

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getVideoSrc") {
            var videoSrc = $('video').attr('src');
            sendResponse({videoSrc: videoSrc});
        }
    }
);