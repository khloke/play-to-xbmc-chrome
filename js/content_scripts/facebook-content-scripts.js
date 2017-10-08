
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if ("getFacebookVideoUrl" == request.action) {
            try {
            var videoLink = $('html').html().match('hd_src_no_ratelimit"?:"([^"]*)')[1];
            } catch (e) {
                videoLink = $('html').html().match('sd_src_no_ratelimit"?:"([^"]*)')[1];
            }
            if (videoLink) {
              sendResponse({url: videoLink});
            }

        }
    }
);

