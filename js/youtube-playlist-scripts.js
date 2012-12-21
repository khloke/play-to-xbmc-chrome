
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.method == "getPlaylistVideoIds") {

            $('.playlist-video-item-base-content img[alt="Thumbnail"]').each(
                function (index) {
                    var thisElement = $(this);
                    chrome.extension.getBackgroundPage().addItemToPlaylist(extractId(thisElement.attr('src')), function() {});
                    alert(extractId(thisElement.attr('src')));
                });

            sendResponse({video_ids: "blah"});

        } else {
            sendResponse({});
        }
    }
);

function extractId(srcUrl) {
    var matches = srcUrl.match('/vi\/(.*)\/default\\.jpg');
    return matches[1];
}

