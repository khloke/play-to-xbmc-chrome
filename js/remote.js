/**
 * This file contains Google Chrome specific methods.
 */

var actions = {
    "PlayPause": "Player.PlayPause",
    "Stop": "Player.Stop",
    "SmallSkipBackward":"VideoPlayer.SmallSkipBackward",
    "SmallSkipForward":"VideoPlayer.SmallSkipForward",
    "GoPrevious": "Player.GoPrevious",
    "GoNext": "Player.GoNext"
};

function getURL() {
    var url = localStorage["url"];
    var port = localStorage["port"];
    var username = localStorage["username"];
    var password = localStorage["password"];

    var loginPortion = '';
    if (username && password) {
        loginPortion = username + ':' + password + '@';
    }
    
    return 'http://'+ loginPortion + url + ':' + port;
}

function hasUrlSetup() {
    var url = localStorage["url"];
    var port = localStorage["port"];

    return url != null && url != '' && port != null && port != '';
}

function onChangeUpdate() {
    initQueueCount();
    initRepeatMode();
    initPlaylistNumbers();
}

function setVolume(volume) {
    var setVolume = '{"jsonrpc": "2.0", "method": "Application.SetVolume", "params": {"volume":' + volume + '} , "id" : 1}';
    ajaxPost(setVolume, function() {});
}

function doAction(item, callback) {
    getActivePlayerId(function(playerid) {
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

function playCurrentUrl(caller) {
    turnOnLoading(caller);
    chrome.extension.sendMessage({action: 'playNow'}, function(response) {
        onChangeUpdate();
        turnOffLoading(caller);
    });
}

function playNextCurrentUrl(caller) {
    chrome.extension.sendMessage({action: 'playNextCurrent'}, function(response) {
        onChangeUpdate();
    });
}

function queueCurrentUrl(caller) {
    turnOnLoading(caller);
    chrome.extension.sendMessage({action: 'queue'}, function(response) {
        onChangeUpdate();
        turnOffLoading(caller);
    });
}

function removeThisFromPlaylist(caller) {
    chrome.extension.sendMessage({action: 'removeThis'}, function(response) {
        onChangeUpdate();
    });
}

var favArrayKey = "fav-array";

function getAllFavourites() {
    return localStorage[favArrayKey];
}

function addToFavourites() {
    chrome.tabs.getSelected(null, function(tab) {
        var url = tab.url;
        var title = tab.title.replace(' - YouTube', '').trim();

        if (validUrl(url)) {
            var favArrayObj = getAllFavourites();

            var favArray;
            if (favArrayObj != null) {
                favArray = JSON.parse(favArrayObj);
            } else {
                favArray = [];
            }

            var fav = [];
            fav[0] = title;
            fav[1] = url;
            favArray.push(fav);
            localStorage.setItem(favArrayKey, JSON.stringify(favArray));
            initFavouritesTable();
        }
    });
}

function removeFromFavourites(index) {
    var favArrayObj = getAllFavourites();
    if (favArrayObj != null) {
        var favArray = JSON.parse(favArrayObj);
        favArray.splice(index, 1);
        localStorage.setItem(favArrayKey, JSON.stringify(favArray));
    }
    initFavouritesTable();
}

function clearFavouritesTable() {
    localStorage.removeItem(favArrayKey);
    initFavouritesTable();
}

var favArray = JSON.parse(getAllFavourites());

function createFavouritesActionButtons(i) {
    var name = favArray[i][0];
    var url = favArray[i][1];
    $('#favourites').find('tbody:last').append("<tr id='favRow" + i + "'><td style='width: 100%;'><a class='btn btn-link youtube-link' target='_blank' href='" + url + "'> " + name + "</a></td><td style='text-align: center; vertical-align: middle;'><div class='btn-group'><a class='btn btn-mini btn-primary' id='favQueueBtn" + i + "' href=\"#\">Play</a>&#32;<a class='btn btn-mini' id='favRemoveBtn" + i + "' href=\"#\">Remove</a></div></td></tr>");
    $('#favQueueBtn' + i).click(function() {
        queueItem(favArray[i][1], function() {
            onChangeUpdate();
        });
    });
    $('#favRemoveBtn' + i).click(function() {
        removeFromFavourites(i);
    });
}

function initConnectivity(callback) {
    getXbmcJsonVersion(function(version) {
        var warningTextContainer = $('#warningTextContainer');
        if (version == null) {
            warningTextContainer.html('<span class="label label-important">Unable to connect to XBMC <i id="tooltipIcon" class="icon-question-sign icon-white" data-toggle="tootip" data-placement="top" data-original-title="Please make sure that your settings are correct and XBMC is running."></i></span>');
            $('#tooltipIcon').tooltip();
            warningTextContainer.show();
        } else {
            warningTextContainer.hide();
            callback();
        }
    });
}

function initFavouritesTable() {
    var favouritesTable = $('#favourites');
    favouritesTable.hide();
    favouritesTable.find('tbody').find("tr").remove();
    if (getAllFavourites() != null) {
        favArray = JSON.parse(getAllFavourites());
        if (favArray.length > 0) {
            for (var i = 0; i < favArray.length; i++) {
                createFavouritesActionButtons(i);
            }
            favouritesTable.show();
        }
    }

    $('.sort').sortable({
        cursor: 'move',
        axis: 'y',
        update: function(e, ui) {
            var sortedBody = $(this);
            var newOrder = [];
            sortedBody.find('tr').each(function(){
                var link = $(this).find('.youtube-link').first();
                var fav = [];
                fav[0] = link.html().trim();
                fav[1] = link.attr('href');
                newOrder.push(fav);
            });
            localStorage.setItem(favArrayKey, JSON.stringify(newOrder));
        }
    });
}

function initJsonVersion() {
    getXbmcJsonVersion(function(version) {
        localStorage.setItem('jsonVersion', version);
    });
}

function initVideoButton() {
    chrome.tabs.getSelected(null, function(tab) {
        var url = tab.url;
        var valid = validUrl(url);
        // if valid, enable buttons
        if (valid) {
            $(".disabled-btn").each(function() { $(this).removeAttr('disabled') });
            $(".disabled-link").each(function() { $(this).removeClass('disabled') });
        }
    });
}

function initQueueCount() {
    getActivePlaylistSize(function(playlistSize) {
        if (playlistSize != null) {
            getPlaylistPosition(function (playlistPosition) {
                var leftOvers = playlistSize - playlistPosition;
                if (playlistPosition != null) {
                    console.log("playlistSize:" + playlistSize + ", playlistPosition:" + playlistPosition);
                    $("#queueVideoButton").html("+Queue(" + leftOvers + ")");
                    return;
                }
            });
        }
    });

    $("#queueVideoButton").html("+Queue");
}

function initRepeatMode() {
    getRepeatMode(function (repeat) {
        var buttonLabel = "Repeat: ";
        var repeatButton = $('#repeatButton');

        if (repeat == "one" || repeat == "One") {
            buttonLabel += "One";
            repeatButton.removeAttr('disabled');
        } else if (repeat == "all" || repeat == "All") {
            buttonLabel += "All";
            repeatButton.removeAttr('disabled');
        } else if (repeat == "off" || repeat == "Off") {
            buttonLabel += "Off";
            repeatButton.removeAttr('disabled');
        } else {
            buttonLabel += "Stopped";
            repeatButton.attr('disabled', true);
        }

        repeatButton.html(buttonLabel);
    });
}

function initVolumeSlider() {
    getVolumeLevel(function(volume) {
        $('#volume_control').slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: volume,
            slide: function(event, ui) {
                setVolume(ui.value);
            }
        });
    });
}

function initPlaylistNumbers() {
    getActivePlaylistSize(function(size) {
        if (size != null) {
            getPlaylistPosition(function (position) {
                if (size != null && position != null) {
                    $('#playlistText').html('Playing: ' + (position + 1) + '/' + size);
                    $('#playlistTextContainer').show();
                } else {
                    $('#playlistTextContainer').hide();
                }
            });
        } else {
            $('#playlistTextContainer').hide();
        }
    });
}

function toggleRepeat() {
    $('#repeatButton').html('<img src="/images/loading.gif"/>');
    getRepeatMode(function (repeat) {
        if (repeat == "one" || repeat == "One") {
            setRepeatMode('all', function(){
                initRepeatMode();
            });
        } else if (repeat == "all" || repeat == "All") {
            setRepeatMode('off', function(){
                initRepeatMode();
            });
        } else if (repeat == "off" || repeat == "Off") {
            setRepeatMode('one', function(){
                initRepeatMode();
            });
        } else {
            initRepeatMode();
        }
    });
}

function turnOnLoading(jObj) {
    jObj.attr('disabled', true);
    jObj.css('background', 'url("/images/loading.gif") no-repeat center #e6e6e6')
}

function turnOffLoading(jObj) {
    jObj.css('background', '');
    jObj.removeAttr('disabled');
}

function previous() {
    playerGoPrevious(function() {
        onChangeUpdate();
    })
}

function stop() {
    doAction(actions.Stop, function() {
        onChangeUpdate();
    });
}

function playPause() {
    doAction(actions.PlayPause, function() {
        onChangeUpdate();
    });
}

function next() {
    playerGoNext(function() {
        onChangeUpdate();
    })
}

function emptyPlaylist() {
    clearPlaylist(function() {
        onChangeUpdate();
    });
}

//function playCurrentPlaylist() {
//    doAction(actions.Stop, function() {
//        clearPlaylist(function() {
//            queueCurrentPlaylist();
//        });
//    });
//}

//function queueCurrentPlaylist() {
//    chrome.tabs.getSelected(function(tab) {
//        chrome.tabs.sendMessage(tab.id, {method: "getPlaylistVideoIds"}, function(response) {
//            if (response && response.video_ids) {
//                var videoIds = JSON.parse(response.video_ids);
//                var videoPluginUrls = new Array();
//                for (i in videoIds) {
//                    videoPluginUrls.push(getPluginPath('youtube', videoIds[i]));
//                }
//                addItemsToPlaylist(videoPluginUrls.reverse(), function() {
//                    initQueueCount();
//                });
//            }
//        });
//    });
//}