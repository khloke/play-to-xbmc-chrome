
var youtubeid;
init();

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getYoutubeId") {
            if (youtubeid) {
                sendResponse({youtubeId: JSON.stringify(youtubeid)});
            }
        }
    }
);

function init() {
    youtubeid = $('.youtube-video iframe.player').attr('data-youtubeid');
}