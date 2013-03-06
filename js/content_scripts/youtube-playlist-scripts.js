
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.method == "getPlaylistVideoIds") {

            var videoIds = new Array();

            $('.playlist-video-item-base-content img[alt="Thumbnail"]').each(
                function (index) {
                    var thisElement = $(this);
                    videoIds.push(extractId(thisElement.attr('src')));
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

