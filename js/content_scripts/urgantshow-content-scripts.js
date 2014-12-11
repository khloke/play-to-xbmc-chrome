
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if ("getUrgantShowVideoUrl" == request.action) {
            sendResponse({url:$('html').html().match('http.*?\\.mp4')[0]});
        }
    }
);

