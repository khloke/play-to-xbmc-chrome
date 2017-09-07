chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if ("getSolarmoviezVideo" == request.action) {
            // Video-URL is only available when video is playing
            var videoUrl = $("video.jw-video").attr("src");
            sendResponse({ url: videoUrl });
        }
    }
);