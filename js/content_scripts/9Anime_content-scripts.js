function checkVideo(){
    var playBTN = document.evaluate("//*[@id='player']/div[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if(playBTN)
    {
        playBTN.click();
    }
    return;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var $video = $('#jw > div.jw-media.jw-reset > video');
        if (request.action == "getVideoSrc") {
            var videoSrc = $video.attr('src');
            console.log("Sending VideoSrc: " + videoSrc);
            sendResponse({videoSrc: videoSrc});
        } else if (request.action == "onPlayback") {
            $video[0].pause();
        }
    }
);
