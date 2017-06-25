/**
 *  Handy curl command:
 *  curl -i -X POST --header Content-Type:"application/json" -d '' http://localhost:8085/jsonrpc
 */

var debugLogsEnabled = localStorage[storageKeys.enableDebugLogs] == 'true';

function getSiteName(url) {
    if (url.match("magnet:")) {
        return "magnet"
    }
    var typeRegex = '(https|http)://(www\.)?([^\.]+)\.([^/]+).+';
    return url.match(typeRegex)[3];
}

function getPluginPath(url, callback) {
    if (debugLogsEnabled) console.log("Number of modules available: " + allModules.length);
    var foundModule = false;
    for (var i = 0; i < allModules.length; i++) {
        var module = allModules[i];
        if (module.canHandleUrl(url)) {
            foundModule = true;
            if (debugLogsEnabled) console.log("Found module to handle url: " + url);
            
            module.getPluginPath(url, getAddOnVersion, function(path) {
                if (debugLogsEnabled) console.log("Path to play media: " + path);
                callback(module.getMediaType(), path);
            });
        }
    }

    if (debugLogsEnabled && !foundModule) console.log("No module found to handle url: " + url + "");
}

function getAddOnVersion(addonId, callback) {
    var json = '{"jsonrpc": "2.0", "method": "Addons.GetAddonDetails", "params": {"addonid": "' + addonId + '", "properties": ["version"]}, "id": 1}';
    ajaxPost(json, function(response) {
        callback(response.result.addon.version);
    });
}

function queueItem(url, callback) {
    getPluginPath(url, function (contentType, pluginPath) {
        addItemsToPlaylist([
            {"contentType": contentType, "pluginPath": pluginPath}
        ], function (result) {
            callback(result);
        });
    });
}

function queueItems(tabUrl, urlList, callback) {
    var contentArr = [];
    var name = getSiteName(tabUrl);
    $.each(urlList, function (i, item) {
        var url = item;
        switch (name) {
            case 'youtube':
                getPluginPath(url, function (contentType, pluginPath) {
                    var element = {"contentType": contentType, "pluginPath": pluginPath};
                    contentArr.push(element);
                    // do we have the whole items.
                    if (contentArr.length == urlList.length) {
                        addItemsToPlaylist(contentArr, function (result) {
                            callback(result);
                        });
                    }
                });
                break;

            case 'soundcloud':
                SoundcloudModule.getPluginPath(url, function(path) {
                    var element = {"contentType": 'audio', "pluginPath": path};
                    contentArr.push(element);
                    if (contentArr.length == urlList.length) {
                        addItemsToPlaylist(contentArr, function (result) {
                            callback(result);
                        });
                    }
                });
                break;
        }
    });
}

function insertItem(url, position, callback) {
    getPluginPath(url, function (contentType, pluginPath) {
        insertItemToPlaylist(contentType, pluginPath, position, function (result) {
            callback(result);
        });
    });
}

function ajaxPost(data, callback, timeout) {
    var url = getURL();
    var fullPath = url + "/jsonrpc";
    var credentials = getCredentials();
    var defaultTimeout = 5000;
    if (timeout) {
        defaultTimeout = timeout;
    }
    if (debugLogsEnabled) {
        console.log("POST " + data);
    }

    jQuery.ajax({
        type: 'POST',
        url: fullPath,
        success: function (response) {
            if (debugLogsEnabled) {
                console.log(response);
            }
            callback(response);
        },
        contentType: "application/json",
        data: data,
        dataType: 'json',
        timeout: defaultTimeout,
        username: credentials[0],
        password: credentials[1],
        error: function (jqXHR, textStatus, erroThrown) {
            callback(0);
        },
        beforeSend: function(xhr, settings){
            xhr.mozBackgroundRequest = true;
        }
    });
}

function getSoundcloudTrackId(url, callback) {
    var soundcloudRegex = 'url=.+tracks%2F([^&]+).+';
    jQuery.ajax({
        type: 'POST',
        url: 'http://soundcloud.com/oembed?url=' + url,
        success: function (result) {
            var iframetext = $(result).find("html").text();
            if (iframetext.indexOf('tracks') && iframetext.match(soundcloudRegex)) {
                var trackId = iframetext.match(soundcloudRegex)[1];

                callback(trackId);
            } else {
                callback(null);
            }
        }
    });
}

function validUrl(url) {
    for (var i = 0; i < allModules.length; i++) {
        var module = allModules[i];
        if (module.canHandleUrl(url)) {
            return true;
        }
    }

    return false;
}

function validPlaylistUrl(url) {
    for (var i = 0; i < validPlaylistPatterns.length; i++) {
        var pattern = validPlaylistPatterns[i];
        if (url.match(pattern)) {
            return true;
        }
    }

    return false;
}

function validVideoPage(url, callback) {
    if (validUrl(url)) {
        callback();
    } else {
        chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
            tab = tab[0];
            chrome.tabs.sendMessage(tab.id, {action: 'isValid'}, function (response) {
                if (response) {
                    callback();
                }
            });
        });
    }
}

function clearPlaylist(callback) {
    var clearVideoPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Clear", "params":{"playlistid":1}, "id": 1}';
    var clearAudioPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Clear", "params":{"playlistid":0}, "id": 1}';

    ajaxPost(clearVideoPlaylist, function () {
        ajaxPost(clearAudioPlaylist, function (response) {
            callback(response);
        });
    });
}

function addItemsToPlaylist(items, callback, resumeTime) {
    if (!items || items.length <= 0) {
        callback(null);
        return;
    }
    // assuming all of the same type
    var contentType = items[0].contentType;
    if (contentType != 'picture') {
        getPlaylistId(contentType, function (playlistId) {
            getActivePlayerId(function (playerId) {
                //if nothing is playing, clear the playlist
                if (playerId == null) {
                    clearPlaylist(function() {});
                }
                var addToPlaylist = "[";
                for (var i = 0; i < items.length; i++) {
                    if (i > 0) {
                        addToPlaylist += ",";
                    }
                    addToPlaylist += '{"jsonrpc": "2.0", "method": "Playlist.Add", "params":{"playlistid":' + playlistId + ', "item" :{ "file" : "' + items[i].pluginPath + '" }}, "id" :' + (i + 1) + '}';
                }
                addToPlaylist += "]";

                ajaxPost(addToPlaylist, function (response) {
                    var resume = '';
                    if (resumeTime) {
                        var hours = Math.floor(resumeTime / 3600);
                        var minutes = Math.floor((resumeTime % 3600) / 60);
                        var seconds = Math.floor((resumeTime % 3600) % 60);
                        resume = ', "value":{"hours":' + hours + ', "minutes":' + minutes + ', "seconds":' + seconds + '}';
                    }
                    var playVideo = '{"jsonrpc": "2.0", "method": "Player.Open", "params":{"item":{"playlistid":' + playlistId + ', "position" : 0}' + resume + '}, "id": 1}';

                    //if nothing is playing, play what we inserted
                    if (playerId == null) {
                        ajaxPost(playVideo, function (response_2) {
                            callback(response_2);
                        }, 10000);
                    } else {
                        callback(response);
                    }
                });
            });
        });
    } else {
        var playImage = '{"jsonrpc": "2.0", "method": "Player.Open", "params":{"item":{ "file" : "' + items[0].pluginPath + '" }}, "id": 1}';
        ajaxPost(playImage, function () {});
    }
}

function insertItemToPlaylist(contentType, pluginPath, position, callback) {
    getPlaylistId(contentType, function (playlistId) {
        var insertToPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Insert", "params":{"playlistid":' + playlistId + ', "position": ' + position + ', "item" :{ "file" : "' + pluginPath + '" }}, "id" : 1}';

        ajaxPost(insertToPlaylist, function (response) {
            callback(response);
        });
    });
}

function removeItemFromPlaylist(position, callback) {
    getActivePlayerId(function (playlistId) {
        var removeFromPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.Remove", "params":{"playlistid":' + playlistId + ', "position": ' + position + '}, "id" : 1}';

        ajaxPost(removeFromPlaylist, function (response) {
            callback(response);
        });
    });
}

function getActivePlayerId(callback) {
    var getActivePlayers = '{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}';

    ajaxPost(getActivePlayers, function (response) {
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
    getActivePlayerId(function (playerid) {
        if (playerid == null) {
            //If nothing is playing, clear the list, probably left over from before
            clearPlaylist(function () {
            });
        }
        callback();
    });
}

function playerSeek(value) {
    var hours = Math.floor(value / 3600);
    var minutes = Math.floor((value % 3600) / 60);
    var seconds = Math.floor((value % 3600) % 60);
    getActivePlayerId(function (playerid) {
        if (playerid != null) {
            var playerseek = '{"jsonrpc":"2.0", "method":"Player.Seek", "params":{"playerid":' + playerid + ', "value":{"hours":' + hours + ', "minutes":' + minutes + ', "seconds":' + seconds + '}},"id":1}';
            ajaxPost(playerseek, function () {
                onChangeUpdate();
            });
        }
    });
}

function playerGoPrevious(callback) {
    getActivePlayerId(function (playerid) {
        if (playerid != null) {
            var version = localStorage["jsonVersion"];
            var playerPreviousV6 = '{"jsonrpc": "2.0", "method": "Player.GoTo", "params":{"playerid":' + playerid + ', "to":"previous"}, "id" : 1}';

            if (version >= 6) {
                ajaxPost(playerPreviousV6, function () {
                    callback()
                }, 10000);

            } else if (version >= 4) {
                doAction(actions.GoPrevious, function () {
                    callback()
                });

            }
        }
    });
}

function playerGoNext(callback) {
    getActivePlayerId(function (playerid) {
        if (playerid != null) {
            var version = localStorage["jsonVersion"];
            var playerNextV6 = '{"jsonrpc": "2.0", "method": "Player.GoTo", "params":{"playerid":' + playerid + ', "to":"next"}, "id" : 1}';

            if (version >= 6) {
                ajaxPost(playerNextV6, function () {
                    callback()
                }, 10000);

            } else if (version >= 4) {
                doAction(actions.GoNext, function () {
                    callback()
                });

            }
        }
    });
}

function navigate(type) {
    var navigateTo = '{"jsonrpc": "2.0", "method": "Input.' + type + '", "id": 1}';

    ajaxPost(navigateTo, function () {
    }, 1000);
}

function getXbmcJsonVersion(callback) {
    var getJsonVersion = '{"jsonrpc": "2.0", "method": "JSONRPC.Version", "id" : 1}';

    ajaxPost(getJsonVersion, function (response) {
        if (response && response.result) {
            var version = response.result.version.major;
            if (!version) {
                version = response.result.version;
            }
            callback(version);
        } else {
            callback(null);
        }
    }, 2000);
}

function getRepeatMode(callback) {
    getActivePlayerId(function (playerid) {
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

function getSpeed(callback) {
    getActivePlayerId(function (playerid) {
        if (playerid != null) {
            var playerRepeat = '{"jsonrpc": "2.0", "method": "Player.GetProperties", "params":{"playerid":' + playerid + ', "properties":["speed"]}, "id" : 1}';

            ajaxPost(playerRepeat, function (response) {
                if (response && response.result && response.result.speed) {
                    callback(response.result.speed);
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
    getActivePlayerId(function (playerid) {
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

    getActivePlayerId(function (playerid) {
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
    getActivePlayerId(function (playerid, type) {
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

    ajaxPost(getCurrentPlaylist, function (response) {
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

    ajaxPost(getPlaylistId, function (response) {
        if (response && response.result.length > 0) {
            var playlists = response.result;
            for (var i = 0; i < playlists.length; i++) {
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

    ajaxPost(getVolumeLevel, function (response) {
        if (response && response.result) {
            callback(response.result["volume"]);
        } else {
            callback(null);
        }
    });
}

function getPlayerTimes(playerId, callback) {
    var getPlayerTimes = '{"jsonrpc":"2.0", "method":"Player.GetProperties", "params":{"playerid":' + playerId + ', "properties":["time", "totaltime"]},"id":1}';

    ajaxPost(getPlayerTimes, function(response) {
        if (response && response.result) {
            var timeInSeconds = toSeconds(response.result.time["hours"], response.result.time["minutes"], response.result.time["seconds"]);
            var totalTimeInSeconds = toSeconds(response.result.totaltime["hours"], response.result.totaltime["minutes"], response.result.totaltime["seconds"]);

            callback(
                timeInSeconds,
                totalTimeInSeconds
            );
        } else {
            callback(null);
        }
    });
}

function wakeScreen(callback) {
    var doNothing = '{"jsonrpc":"2.0", "method":"Input.ExecuteAction", "params":{"action":"noop"},"id":1}';

    ajaxPost(doNothing, function(response) {
       if (response && response.result == 'OK') {
           callback();
       }
    });
}

function toSeconds(hours, minutes, seconds) {
    var secondsInHour = 3600;
    var secondsInMinute = 60;
    var totalSeconds = 0;

    totalSeconds = seconds + (minutes*secondsInMinute) + (hours*secondsInHour);

    return totalSeconds
}

function resume(currentTime, callback){
	getSpeed(function(speed) {
        if (speed > 0) {
			setTimeout(function(){playerSeek(currentTime);},1000)
		}
		else{
			resume(currentTime, callback);
		}
	}); 
}

