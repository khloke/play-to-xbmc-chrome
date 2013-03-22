
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if ("getLiveLeakVideoUrl" == request.action) {
            sendResponse({url:$('html').html().match('file: "(.+?)",')[1]});
        }
    }
);

