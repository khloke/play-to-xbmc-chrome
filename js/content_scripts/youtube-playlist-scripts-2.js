
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.method == "getPlaylistVideoIds") {

            var videoIds = new Array();

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

        } else {
            sendResponse({});
        }
    }
);

function extractId(srcUrl) {
    var matches = srcUrl.match('/vi\/(.*)\/default\\.jpg');
    return matches[1];
}

