
initSoundcloudList();

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "getPlaylistUrls") {
            sendResponse({trackIds: JSON.stringify(trackIds)});
        }
    }
);

/**
 * if this is youtube page which is part of a playlist , show all videos and the option to queue them all
 *
 */
function initSoundcloudList(){
    var tabUrl = window.location.href;
    var queueListButton = $('#queueListButton');
    getSoundcloudSetId(tabUrl, function(setId) {
        getSoundcloudSetTrackIds(setId, function(){});
    });
}

function getSoundcloudSetId(url, callback) {
    var soundcloudRegex = 'url=.+playlists%2F([^&]+).+';
    jQuery.ajax({
        type: 'POST',
        url: 'http://soundcloud.com/oembed?url=' + url,
        success: function (result) {
            var iframetext = $(result).find("html").text();
            if (iframetext.indexOf('tracks')) {
                var setId = iframetext.match(soundcloudRegex)[1];

                callback(setId);
            } else {
                callback(null);
            }
        }
    });
}

function getSoundcloudSetTrackIds(setId, callback) {
    var apiUrl = 'http://api.soundcloud.com/playlists/' + setId + '.json?client_id=869ae8a206b21cdec128954e69aaf5b9';

    $.getJSON(apiUrl, function (result) {
        if (result && result.tracks) {
            var tracksJson = result.tracks;
            for (var i in tracksJson) {
                if (tracksJson.hasOwnProperty(i)) {
                    trackIds.push(tracksJson[i].id);
                }
            }

            callback(trackIds);
        }
//        $.each(result.tracks, function (i, item) {
//            trackIds.push(item.id);
//        });
    });

//    jQuery.ajax({
//        type: 'POST',
//        url: apiUrl,
//        success: function (result) {
//            if (result && result.tracks) {
//                var tracksJson = result.tracks;
//                for (var i in tracksJson) {
//                    if (tracksJson.hasOwnProperty(i)) {
//                        trackIds.push(tracksJson[i].id);
//                    }
//                }
//
//                callback(trackIds);
//            }
//        }
//    });
}

var trackIds = [];