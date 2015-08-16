
initYouTubeList();
injectIcon();

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

/** Adds a little kodi tv icon on each thumnail corner
 * This allows quick play of the video from youtube video
 * search results. Don't have to right click and look in context menu
*/

function injectIcon(){

    // attach the icon to all thumbnails first
    $('.branded-page-v2-primary-col .yt-lockup-thumbnail').prepend('<a class="playquick-link" target="_blank"> \
        <img class="yt-play-icon" src="' + chrome.extension.getURL("images/icon.png") + '"/></a>');

    // apply the appropriate css
    $('img.yt-play-icon').css({"position": "absolute", "left": "168px", "top": "5px", "z-index": "999"});


    // now give them all unique id's
    $.each($('.branded-page-v2-primary-col .playquick-link'), function(){
        var videoId = $(this).parent().find('.yt-uix-sessionlink').attr("href").match('v=([^&]+)')[1];

        $(this).attr("id", "playquick-" + videoId);

        $('#playquick-' + videoId).click(function () {
            playYouTubeVideo(videoId);
        });

    });
}


function playYouTubeVideo(videoId) {
    var url =  "https://www.youtube.com/watch?v=" + videoId;
    chrome.extension.sendMessage({action: 'quickPlayThis', url: url}, function (response) {});
}
