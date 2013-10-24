
var youtubeid;
init();

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "isValid") {
            if (youtubeid) {
                sendResponse({valid: JSON.stringify(true)});
            } else {
                sendResponse({valid: JSON.stringify(false)})
            }

        } else if (request.action == "getYoutubeId") {
            if (youtubeid) {
                sendResponse({youtubeId: JSON.stringify(youtubeid)});
            }
        }
    }
);

function init() {
    youtubeid = $('.youtube-video iframe.player').attr('data-youtubeid');
}