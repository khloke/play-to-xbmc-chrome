chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log("in switch");
        switch (request.action) {

            case 'playNow':
                playCurrentUrl(function () {
                    sendResponse({response: "OK"});
                });
                break;

            case 'queue':
                queueCurrentUrl(function () {
                    sendResponse({response: "OK"});
                });
                break;
            case 'queueList':
                queueList(function (listHtml) {

                    sendResponse({response: "OK",listHtml:listHtml});
                });
                break;

            case 'removeThis':
                removeThisFromPlaylist(function () {
                    sendResponse({response: "OK"});
                });
                break;

            case 'playNextCurrent':
                playNextCurrentUrl(function () {
                    sendResponse({response: "OK"});
                });
        }

        return true;
    }
);

function getCurrentUrl(callback) {
    chrome.tabs.getSelected(null, function (tab) {
        var tabUrl = tab.url;
        callback(tabUrl);
    });
}

function getURLParameter(tabUrl, sParam) {
    var sPageURL = tabUrl;
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return null;
}

function doAction(item, callback) {
    getActivePlayerId(function (playerid) {
        if (playerid != null) {
            var action = '{"jsonrpc": "2.0", "method": "' + item + '", "params":{"playerid":' + playerid + '}, "id" : 1}';
            ajaxPost(action, function (result) {
                callback(result);
            });
        } else {
            callback(null);
        }
    });
}

function playCurrentUrl(callback) {
    doAction(actions.Stop, function () {
        queueCurrentUrl(callback);
    });
}

function playNextCurrentUrl(callback) {
    getCurrentUrl(function (tabUrl) {
        getPlaylistPosition(function (position) {
            insertItem(tabUrl, position + 1, function () {
                callback();
            });
        });
    });
}

function queueCurrentUrl(callback) {
    getCurrentUrl(function (tabUrl) {
        queueItem(tabUrl, function () {
            callback();
        });
    });
}

function queueList(callback) {
    getCurrentUrl(function (tabUrl) {


        console.log("tab=" + tabUrl);
        var youTubeListId = getURLParameter(tabUrl, 'list');
        if (youTubeListId) {
            extractVideosFromYouTubePlaylist(youTubeListId,function(listHtml){

                callback(listHtml);
            });
        }
        else{
            callback();
        }

    });
}


function removeThisFromPlaylist(callback) {
    getPlaylistPosition(function (position) {
        playerGoNext(function () {
            removeItemFromPlaylist(position, function () {
                callback();
            });
        });
    });
}

function extractVideosFromYouTubePlaylist(playListID,callback) {
    var playListURL = 'http://gdata.youtube.com/feeds/api/playlists/' + playListID + '?v=2&alt=json';
    var videoURL = 'http://www.youtube.com/watch?v=';
    $.getJSON(playListURL, function (data) {
        var list_data = "";

        $.each(data.feed.entry, function (i, item) {

            var feedTitle = item.title.$t;
            var feedURL = item.link[1].href;
            var fragments = feedURL.split("/");
            var videoID = fragments[fragments.length - 2];
            var url = videoURL + videoID;
            var thumb = "http://img.youtube.com/vi/" + videoID + "/default.jpg";
            console.log(url);

           list_data += '<li><a href="'+ url +'" title="'+ feedTitle +'"><img alt="'+ feedTitle+'" src="'+ thumb +'"</a></li>';


        });
        console.log(list_data);

        callback(list_data);

    });
}