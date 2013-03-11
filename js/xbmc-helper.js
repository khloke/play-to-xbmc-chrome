function getPluginPath(url, callback) {
    var videoId;

    var typeRegex = '(https|http)://(www\.)?([^\.]+)\.([^/]+).+';
    var type = url.match(typeRegex)[3];

    var youtubeRegex = 'v=([^&]+)';
    var vimeoRegex = '(https|http)://(www\.)?vimeo.com/([^_&]+)';
    var collegehumorRegex = '(https|http)://(www\.)?collegehumor.com/[video|embed]+/([^&/]+)';
    var dailymotionRegex = '(https|http)://(www\.)?dailymotion.com/video/([^_&]+)';

    switch (type) {
        case 'youtube':
            videoId = url.match(youtubeRegex)[1];
            break;

        case 'vimeo':
            videoId = url.match(vimeoRegex)[3];
            break;

        case 'collegehumor':
            videoId = url.match(collegehumorRegex)[3];
            break;

        case 'dailymotion':
            videoId = url.match(dailymotionRegex)[3];
            break;

        case 'soundcloud':
            getSoundcloudTrackId(url, function(trackId){
                callback(buildPluginPath(type, trackId));
            });
            return;


        default:
            console.log('An error has occurred while attempting to obtain content id.');
    }

    callback(buildPluginPath(type, videoId));
}

function queueItem(url, callback) {
    getPluginPath(url, function(pluginPath){
        addItemToPlaylist(pluginPath, function(result) {
            callback(result);
        });
    });
}

function buildPluginPath(type, videoId) {
    switch (type) {
        case 'youtube':
        case 'vimeo':
            return 'plugin://plugin.video.' + type + '/?action=play_video&videoid=' + videoId;

        case 'collegehumor':
            return 'plugin://plugin.video.' + type + '/watch/' + encodeURIComponent(videoId) + '/';

        case 'dailymotion':
        case 'ebaumsworld':
            return 'plugin://plugin.video.' + type + '_com/?url=' + videoId + '&mode=playVideo';

        case 'soundcloud':
            return 'plugin://plugin.audio.soundcloud/?url=plugin%3A%2F%2Fmusic%2FSoundCloud%2Ftracks%2F' + videoId + '&permalink=' + videoId + '&oauth_token=&mode=15';

        default:
            return '';
    }
}

function getUrlVars(url, attribute) {
    var vars = [], hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars[attribute];
}

function ajaxPost(data, callback) {
    var url = getURL();
    var fullPath = url + "/jsonrpc";

    jQuery.ajax({
        type: 'POST',
        url : fullPath,
        success: function(result) {
            callback(result);
        },
        contentType: "application/json",
        data : data,
        dataType: 'json'
    });
}

function getSoundcloudTrackId(url, callback) {
    var soundcloudRegex = 'url=.+tracks%2F([^&]+).+';
    jQuery.ajax({
        type: 'POST',
        url : 'http://soundcloud.com/oembed?url=' + url,
        success: function(result) {
            var iframetext = $(result).find("html").text();
            var trackId = iframetext.match(soundcloudRegex)[1];

            callback(trackId);
        }
    });
}

function validUrl(url) {
    // regex checking for the websites --
    // chrome tab should be at a specific video.
    var reYoutube = ".*youtube.com/watch.*";
    var reVimeo = ".*vimeo.com/\\d+";
    var reCollegeHumor = ".*collegehumor.com/[video|embed]+/\\d+/\\w+";
    var reDailyMotion = ".*dailymotion.com/video/.*";
    var reEbaumsworld = ".*ebaumsworld.com/video/.*";
    var reSoundcloud = ".*soundcloud.com.*";


    return (
            url.match(reYoutube) ||
            url.match(reVimeo) ||
            url.match(reCollegeHumor) ||
            url.match(reDailyMotion) ||
            url.match(reEbaumsworld) ||
            url.match(reSoundcloud)
        );

}

function clearPlaylist(callback) {
    var clearPlaylist ='{"jsonrpc": "2.0", "method": "Playlist.Clear", "params":{"playlistid":1}, "id": 1}';

    ajaxPost(clearPlaylist, function(result) {
        callback(result);
    });
}

function addItemToPlaylist(video_url, callback) {
    var getActivePlayers = '{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}';
    var addToPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Add", "params":{"playlistid":1, "item" :{ "file" : "' + video_url + '" }}, "id" : 1}';

    ajaxPost(getActivePlayers, function(result) {
        if ($.isEmptyObject(result.result)) {
            //If nothing is playing, clear the list, probably left over from be
            clearPlaylist(function(){});
        }
        ajaxPost(addToPlaylist, function(result){
            ajaxPost(getActivePlayers,function( result ){
                var playVideo = '{"jsonrpc": "2.0", "method": "Player.Open", "params":{"item":{"playlistid":1, "position" : 0}}, "id": 1}';

                //if nothing is playing, play what we inserted
                if (jQuery.isEmptyObject(result.result)){
                    ajaxPost(playVideo, function(result) {
                        callback(result);
                    });
                } else {
                    callback(result);
                }
            });
        });
    });
}

function getActivePlayers(callback) {
    var getActivePlayers = '{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}';

    ajaxPost(getActivePlayers, function(result) {
        callback(result);
    });
}

function clearNonPlayingPlaylist(callback) {
    var getActivePlayers = '{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}';

    ajaxPost(getActivePlayers, function(result) {
        if ($.isEmptyObject(result.result)) {
            //If nothing is playing, clear the list, probably left over from be
            clearPlaylist(function(){});
        }

        callback(result);
    });
}

function getPlaylistSize() {
    var getcurrentplaylist = '{"jsonrpc": "2.0", "method": "Playlist.GetItems", "params":{"playlistid":1}, "id": 1}';

    ajaxPost(getcurrentplaylist, function(data) {
        return data.result.items.length;
    });
}

function playerSeek(value) {
    getActivePlayers(function(result) {
        if (result && result.result.length > 0) {
            var playerseek = '{"jsonrpc": "2.0", "method": "Player.Seek", "params":{"playerid":' + result.result[0].playerid + ', "value":"' + value + '"}, "id" : 1}';
            ajaxPost(playerseek, function (data) {
                //Do nothing
            });
        }
    });
}

function playerGoPrevious() {
    getActivePlayers(function(result) {
        if (result && result.result.length > 0) {
            var version = localStorage["jsonVersion"];
            var playerPreviousV6 = '{"jsonrpc": "2.0", "method": "Player.GoTo", "params":{"playerid":' + result.result[0].playerid + ', "to":"previous"}, "id" : 1}';

            if (version >= 6) {
                ajaxPost(playerPreviousV6, function (data) {
                });

            } else if (version >= 4) {
                doAction(actions.GoPrevious, function () {
                });

            }
        }
    });
}

function playerGoNext() {
    getActivePlayers(function(result) {
        if (result && result.result.length > 0) {
            var version = localStorage["jsonVersion"];
            var playerNextV6 = '{"jsonrpc": "2.0", "method": "Player.GoTo", "params":{"playerid":' + result.result[0].playerid + ', "to":"next"}, "id" : 1}';

            if (version >= 6) {
                ajaxPost(playerNextV6, function(data){});

            } else if (version >= 4) {
                doAction(actions.GoNext, function(){});

            }
        }
    });
}

function hasUrlSetup() {
    var url = localStorage["url"];
    var port = localStorage["port"];

    return url != null && url != '' && port != null && port != '';
}

function getXbmcJsonVersion(callback) {
    var getJsonVersion = '{"jsonrpc": "2.0", "method": "JSONRPC.Version", "id" : 1}';

    ajaxPost(getJsonVersion, function(data) {
        version = data.result.version.major;
        if (!version) {
            version = data.result.version;
        }
        callback(version);
    });
}
