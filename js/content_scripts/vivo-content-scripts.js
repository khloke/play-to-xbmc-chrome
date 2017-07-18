chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if ("getVivoVideo" == request.action) {
            // Video-URL is only available when video is playing
            var videoAlreadyPlaying = $("#player.is-playing").length == 1
            if (!videoAlreadyPlaying){
                window.alert("For Vivo, please start the video before streaming to Kodi!");
                return true;
            }

            var videoUrl = $("video.fp-engine").attr("src");
            sendResponse({ url: videoUrl });
        }
    }
);