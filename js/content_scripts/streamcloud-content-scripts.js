chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if ("getStreamCloudVideo" == request.action) {
            sendResponse({ url: $('html').html().match("http.*?\\.mp4")[0] });
        }
    }
);
