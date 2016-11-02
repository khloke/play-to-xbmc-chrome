initYouTubeList();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getPlaylistUrls") {
            initYouTubeList();
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
    if (youTubeListId && youTubeListId != playlistId){
        playlistId = youTubeListId;
        extractVideosFromYouTubePlaylist(youTubeListId);
    }
}

function extractVideosFromYouTubePlaylist(playListID, token) {
    var videoURL = 'https://www.youtube.com/watch?v=';
    var playListURL = '//www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=' + playListID + '&key=AIzaSyA3INgfTLddMbrJm8f68xpvfPZDAzDqk10';
    if (token) {
        playListURL = playListURL + '&pageToken=' + token;
    }

    $.getJSON(playListURL, function (data) {
        var nextPageToken;
        if (data.nextPageToken) {
            nextPageToken = data.nextPageToken;
        }

        $.each(data.items, function (i, item) {
            var videoID = item.contentDetails.videoId;
            var url = videoURL + videoID;

            urlList.push(url);
        });

        if (nextPageToken) {
            extractVideosFromYouTubePlaylist(playListID, startIndex + itemsPerPage);
        }
    });
}

var playlistId;
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