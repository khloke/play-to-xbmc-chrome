
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getPlaylistVideoIds") {

            var videoIds = [];

            $('li.video-list-item').each(
                function (index) {
                    var thisElement = $(this);
                    var videoId = thisElement.attr('data-video-id');
                    if (videoId) {
                        videoIds.push(videoId);
                    }
                }
            );

            sendResponse({video_ids: JSON.stringify(videoIds)});

        } else if ("getLiveLeakVideoUrl" == request.action) {
            sendResponse({url:$('html').html().match('file: "(.+?)",')[1]});
        }
    }
);

function extractId(srcUrl) {
    var matches = srcUrl.match('/vi\/(.*)\/default\\.jpg');
    return matches[1];
}

