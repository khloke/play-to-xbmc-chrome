
initYouTubeList();

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getPlaylistUrls") {
            sendResponse({urlList: JSON.stringify(urlList)});
        }
    }
);

/**
 * if this is youtube page which is part of a playlist , show all videos and the option to queue them all
 *
 */
function initYouTubeList(){
    var tabUrl = window.location.href;
    var youTubeListId = getURLParameter(tabUrl, 'list');
    if (youTubeListId){
        extractVideosFromYouTubePlaylist(youTubeListId);
    }
}

function extractVideosFromYouTubePlaylist(playListID) {
    var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/' + playListID + '?v=2&alt=json';
    var videoURL = 'http://www.youtube.com/watch?v=';
    $.getJSON(playListURL, function (data) {
        //GLOBAL
        urlList = [];
        $.each(data.feed.entry, function (i, item) {
            var feedURL = item.link[1].href;
            var fragments = feedURL.split("/");
            var videoID = fragments[fragments.length - 2];
            var url = videoURL + videoID;

            urlList.push(url);
        });
    });
}

var urlList = [];