function checkVideo(){
    var playBTN = document.evaluate("//*[@id='player']/div[1]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    if(playBTN)
        playBTN.click();
    return;
}

function getLink(){
        var link = $('.item.mbtn.download.movie.pull-right').attr('href');
        videoSrc = link;
        videoSrc = videoSrc.replace(/\s+/g, '');
        return;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        checkVideo()
        getLink()
        var $video = $('#jw > div.jw-media.jw-reset > video');
        if (request.action == "getVideoSrc") {
            console.log("Sending VideoSrc: " + videoSrc);
            sendResponse({videoSrc: videoSrc});
        } else if (request.action == "onPlayback") {
            $video[0].pause();
        }
    }
);
