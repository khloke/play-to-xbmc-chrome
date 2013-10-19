
var contentId;
var eid;
init();

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getContentId") {
            if (contentId) {
                sendResponse({contentId: JSON.stringify(contentId)});
            }
        } else if (request.action == "getEid") {
            if (eid) {
                sendResponse({eid: JSON.stringify(eid)});
            }
        }
    }
);

function init() {
    contentId = $('html').html().match('"content_id": "(.+?)",')[1];
    eid = $('html').html().match('eid=(.+?)"')[1];
}