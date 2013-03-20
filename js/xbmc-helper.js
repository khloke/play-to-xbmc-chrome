/**
 *  Handy curl command:
 *  curl -i -X POST --header Content-Type:"application/json" -d '' http://localhost:8085/jsonrpc
 */

function getPluginPath(url, callback) {
    var videoId;

    var typeRegex = '(https|http)://(www\.)?([^\.]+)\.([^/]+).+';
    var type = url.match(typeRegex)[3];

    var youtubeRegex = 'v=([^&]+)';
    var vimeoRegex = '(https|http)://(www\.)?vimeo.com/([^_&/#\?]+)';
    var collegehumorRegex = '(https|http)://(www\.)?collegehumor.com/[video|embed]+/([^_&/#\?]+)';
    var dailymotionRegex = '(https|http)://(www\.)?dailymotion.com/video/([^_&/#\?]+)';
    var ebaumsworldRegex = '(https|http)://(www\.)?ebaumsworld.com/video/watch/([^_&/#\?]+)';

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

        case 'ebaumsworld':
            videoId = url.match(ebaumsworldRegex)[3];
            break;

        case 'soundcloud':
            getSoundcloudTrackId(url, function(trackId){
                callback('audio', buildPluginPath(type, trackId));
            });
            return;


        default:
            console.log('An error has occurred while attempting to obtain content id.');
    }

    callback('video', buildPluginPath(type, videoId));
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

        case 'mixcloud':
            //%2FLaidBackRadio%2Fmr-leenknecht-aint-no-sunshine%2F
            return 'plugin://plugin.audio.mixcloud/?mode=40&key=' + encodeURIComponent(videoId);

        default:
            return '';
    }
}

function queueItem(url, callback) {
    getPluginPath(url, function(contentType, pluginPath){
        addItemToPlaylist(contentType, pluginPath, function(result) {
            callback(result);
        });
    });
}

function insertItem(url, position, callback) {
    getPluginPath(url, function(contentType, pluginPath){
        insertItemToPlaylist(contentType, pluginPath, position, function(result) {
            callback(result);
        });
    });
}

function ajaxPost(data, callback) {
    var url = getURL();
    var fullPath = url + "/jsonrpc";

    jQuery.ajax({
        type: 'POST',
        url : fullPath,
        success: function(response) {
            callback(response);
        },
        contentType: "application/json",
        data : data,
        dataType: 'json',
        timeout: 5000,
        error: function(jqXHR, textStatus, erroThrown) {
            callback(0);
        }
    });
}

function getSoundcloudTrackId(url, callback) {
    var soundcloudRegex = 'url=.+tracks%2F([^&]+).+';
    jQuery.ajax({
        type: 'POST',
        url : 'http://soundcloud.com/oembed?url=' + url,
        success: function(result) {
            var iframetext = $(result).find("html").text();
            if (iframetext.indexOf('tracks')) {
                var trackId = iframetext.match(soundcloudRegex)[1];

                callback(trackId);
            } else {
                callback(null);
            }
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
    var clearVideoPlaylist ='{"jsonrpc": "2.0", "method": "Playlist.Clear", "params":{"playlistid":1}, "id": 1}';
    var clearAudioPlaylist ='{"jsonrpc": "2.0", "method": "Playlist.Clear", "params":{"playlistid":0}, "id": 1}';

    ajaxPost(clearVideoPlaylist, function() {
        ajaxPost(clearAudioPlaylist, function(response) {
            callback(response);
        });
    });
}

function addItemToPlaylist(contentType, pluginPath, callback) {
    getPlaylistId(contentType, function(playlistId) {
        var addToPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Add", "params":{"playlistid":' + playlistId + ', "item" :{ "file" : "' + pluginPath + '" }}, "id" : 1}';

        ajaxPost(addToPlaylist, function(response){
            getActivePlayerId(function(playerid_2) {
                getPlaylistSize(playlistId, function(playlistSize) {
                    var position = playlistSize - 1;
                    var playVideo = '{"jsonrpc": "2.0", "method": "Player.Open", "params":{"item":{"playlistid":' + playlistId + ', "position" : ' + position + '}}, "id": 1}';

                    //if nothing is playing, play what we inserted
                    if (playerid_2 == null){
                        ajaxPost(playVideo, function(response_2) {
                            callback(response_2);
                        });
                    } else {
                        callback(response);
                    }
                });
            });
        });
    });
}

function insertItemToPlaylist(contentType, pluginPath, position, callback) {
    getPlaylistId(contentType, function(playlistId) {
        var insertToPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Insert", "params":{"playlistid":' + playlistId + ', "position": ' + position + ', "item" :{ "file" : "' + pluginPath + '" }}, "id" : 1}';

        ajaxPost(insertToPlaylist, function(response){
            callback(response);
        });
    });
}

function removeItemFromPlaylist(position, callback) {
    getActivePlayerId(function(playlistId) {
        var removeFromPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Remove", "params":{"playlistid":' + playlistId + ', "position": ' + position + '}, "id" : 1}';

        ajaxPost(removeFromPlaylist, function(response){
            callback(response);
        });
    });
}

function getActivePlayerId(callback) {
    var getActivePlayers = '{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}';

    ajaxPost(getActivePlayers, function(response) {
        if (response && response.result.length > 0) {
            var playerid = response.result[0].playerid;
            var type = response.result[0].type;
            callback(playerid, type);
        } else {
            callback(null, null);
        }
    });
}

function clearNonPlayingPlaylist(callback) {
    getActivePlayerId(function(playerid){
        if (playerid == null) {
            //If nothing is playing, clear the list, probably left over from before
            clearPlaylist(function(){});
        }
        callback();
    });
}

function playerSeek(value) {
    getActivePlayerId(function(playerid) {
        if (playerid != null) {
            var playerseek = '{"jsonrpc": "2.0", "method": "Player.Seek", "params":{"playerid":' + playerid + ', "value":"' + value + '"}, "id" : 1}';
            ajaxPost(playerseek, function () {onChangeUpdate()});
        }
    });
}

function playerGoPrevious(callback) {
    getActivePlayerId(function(playerid) {
        if (playerid != null) {
            var version = localStorage["jsonVersion"];
            var playerPreviousV6 = '{"jsonrpc": "2.0", "method": "Player.GoTo", "params":{"playerid":' + playerid + ', "to":"previous"}, "id" : 1}';

            if (version >= 6) {
                ajaxPost(playerPreviousV6, function () {callback()});

            } else if (version >= 4) {
                doAction(actions.GoPrevious, function () {callback()});

            }
        }
    });
}

function playerGoNext(callback) {
    getActivePlayerId(function(playerid) {
        if (playerid != null) {
            var version = localStorage["jsonVersion"];
            var playerNextV6 = '{"jsonrpc": "2.0", "method": "Player.GoTo", "params":{"playerid":' + playerid + ', "to":"next"}, "id" : 1}';

            if (version >= 6) {
                ajaxPost(playerNextV6, function(){callback()});

            } else if (version >= 4) {
                doAction(actions.GoNext, function(){callback()});

            }
        }
    });
}

function getXbmcJsonVersion(callback) {
    var getJsonVersion = '{"jsonrpc": "2.0", "method": "JSONRPC.Version", "id" : 1}';

    ajaxPost(getJsonVersion, function(response) {
        if (response && response.result) {
            var version = response.result.version.major;
            if (!version) {
                version = response.result.version;
            }
            callback(version);
        } else {
            callback(null);
        }
    });
}

function getRepeatMode(callback) {
    getActivePlayerId(function(playerid) {
        if (playerid != null) {
            var playerRepeat = '{"jsonrpc": "2.0", "method": "Player.GetProperties", "params":{"playerid":' + playerid + ', "properties":["repeat"]}, "id" : 1}';

            ajaxPost(playerRepeat, function (response) {
                if (response && response.result && response.result.repeat) {
                    callback(response.result.repeat);
                } else {
                    callback(null);
                }
            });
        } else {
            callback(null);
        }
    });
}

function setRepeatMode(mode, callback) {
    getActivePlayerId(function(playerid) {
        if (playerid != null) {
            var playerSetRepeatV6 = '{"jsonrpc": "2.0", "method": "Player.SetRepeat", "params":{"playerid":' + playerid + ', "repeat":"' + mode + '"}, "id" : 1}';
            var playerSetRepeatV4 = '{"jsonrpc": "2.0", "method": "Player.Repeat", "params":{"playerid":' + playerid + ', "state":"' + mode + '"}, "id" : 1}';

            var version = localStorage["jsonVersion"];

            if (version >= 6) {
                ajaxPost(playerSetRepeatV6, function (response) {
                    callback(response);
                });

            } else if (version >= 4) {
                ajaxPost(playerSetRepeatV4, function (response) {
                    callback(response);
                });

            } else {
                callback(null);
            }
        } else {
            callback(null);
        }
    });
}

function getPlaylistPosition(callback) {

    getActivePlayerId(function(playerid) {
        if (playerid != null) {
            var getQueuePosition = '{"jsonrpc": "2.0", "method": "Player.GetProperties", "params":{"playerid":' + playerid + ', "properties":["position"]}, "id" : 1}';

            ajaxPost(getQueuePosition, function (response) {
                if (response && response.result) {
                    var position = response.result.position;
                    callback(position);
                }
            });
        } else {
            callback(null);
        }
    });
}

function getActivePlaylistSize(callback) {
    getActivePlayerId(function(playerid, type) {
        if (playerid != null && type != null) {
            getPlaylistId(type, function (playlistId) {
                if (playlistId != null) {
                    getPlaylistSize(playlistId, function (playlistSize) {
                        if (playlistSize != null) {
                            callback(playlistSize);
                        } else {
                            callback(null);
                        }
                    });
                } else {
                    callback(null);
                }
            });
        } else {
            callback(null);
        }
    });
}

function getPlaylistSize(playlistId, callback) {
    var getCurrentPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.GetItems", "params":{"playlistid":' + playlistId + '}, "id": 1}';

    ajaxPost(getCurrentPlaylist, function(response) {
        if (response && response.result && response.result.items) {
            var playlistSize = response.result.items.length;
            callback(playlistSize);
        } else {
            callback(null);
        }
    });
}

function getPlaylistId(type, callback) {
    var getPlaylistId = '{"jsonrpc": "2.0", "method": "Playlist.GetPlaylists", "id": 1}';

    ajaxPost(getPlaylistId, function(response) {
        if (response && response.result.length > 0) {
            var playlists = response.result;
            for (var i=0; i<playlists.length; i++) {
                if (playlists[i].type == type) {
                    callback(playlists[i].playlistid);
                }
            }
        } else {
            callback(null);
        }
    });
}

function getVolumeLevel(callback) {
    var getVolumeLevel = '{"jsonrpc": "2.0", "method": "Application.GetProperties", "params":{"properties":["volume"]}, "id" : 1}';

    ajaxPost(getVolumeLevel, function(response) {
        if (response && response.result) {
            callback(response.result["volume"]);
        } else {
            callback(null);
        }
    });
}