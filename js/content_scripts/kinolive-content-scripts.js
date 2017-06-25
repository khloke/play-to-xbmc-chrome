
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if ("getKinoLiveVideoUrl" == request.action) {
            var videoLink = $('html').html().match('file=(https?\\:.+?\\.flv)')[1];
            if (videoLink) {
                sendResponse({url: videoLink});
            }
        }
    }
);

