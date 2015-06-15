
initYouTubeList();

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getPlaylistUrls") {
            sendResponse({urlList: JSON.stringify(urlList)});
        } else if (request.action == "onPlayback") {
            $("video")[0].pause();
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

function extractVideosFromYouTubePlaylist(playListID, index) {
    var currentIndex;
    if (!index) {
        urlList = [];
        currentIndex = 1;
    } else {
        currentIndex = index;
    }
    var playListURL = '//gdata.youtube.com/feeds/api/playlists/' + playListID + '?v=2&alt=json&start-index=' + currentIndex;
    var videoURL = 'https://www.youtube.com/watch?v=';
    $.getJSON(playListURL, function (data) {
        //GLOBAL

        var totalVideoCount = data.feed.openSearch$totalResults.$t;
        var itemsPerPage = data.feed.openSearch$itemsPerPage.$t;
        var startIndex = data.feed.openSearch$startIndex.$t;

        $.each(data.feed.entry, function (i, item) {
            var feedURL = item.link[1].href;
            var fragments = feedURL.split("/");
            var videoID = fragments[fragments.length - 2];
            var url = videoURL + videoID;

            urlList.push(url);
        });

        if (totalVideoCount > itemsPerPage && startIndex < (totalVideoCount - totalVideoCount%itemsPerPage + 1)) {
            extractVideosFromYouTubePlaylist(playListID, startIndex + itemsPerPage);
        }
    });
}

var urlList = [];


function getURLParameter(tabUrl, sParam) {
    var sPageURL = tabUrl.substring(tabUrl.indexOf('?') + 1 );
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return null;
}