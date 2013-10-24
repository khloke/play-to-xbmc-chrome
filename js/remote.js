/**
 * This file contains Google Chrome specific methods.
 */

function hasUrlSetup() {
    if (isMultiHostEnabled()) {
        var allProfiles = getAllProfiles();

        if (allProfiles != null) {
            var selectedHost = localStorage[storageKeys.selectedHost];
            var profiles = JSON.parse(allProfiles);

            if (selectedHost != null && selectedHost > 0) {
                if (profiles[selectedHost] != null) {
                    return profiles[selectedHost].url != null && profiles[selectedHost].url != '' && profiles[selectedHost].port != null && profiles[selectedHost].port != '';
                }
            } else {
                return profiles[0].url != null && profiles[0].url != '' && profiles[0].port != null && profiles[0].port != '';
            }
        }

        return false;
    } else {
        var url = localStorage["url"];
        var port = localStorage["port"];

        return url != null && url != '' && port != null && port != '';
    }
}

function hasBeenUpdated() {
    var installedVersion = localStorage["installed-version"];
    return !installedVersion || installedVersion < currentVersion;
}

function updateVersion() {
    localStorage.setItem("installed-version", currentVersion);
}

function onChangeUpdate() {
    initQueueCount();
    initRepeatMode();
    initPlaylistNumbers();
}

function setVolume(volume) {
    var setVolume = '{"jsonrpc": "2.0", "method": "Application.SetVolume", "params": {"volume":' + volume + '} , "id" : 1}';
    ajaxPost(setVolume, function () {
    });
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

function playCurrentUrl(caller) {
    turnOnLoading(caller);
    chrome.extension.sendMessage({action: 'playNow'}, function (response) {
        onChangeUpdate();
        turnOffLoading(caller);
    });
}

function playNextCurrentUrl(caller) {
    chrome.extension.sendMessage({action: 'playNextCurrent'}, function (response) {
        onChangeUpdate();
    });
}

function queueCurrentUrl(caller) {
    turnOnLoading(caller);
    chrome.extension.sendMessage({action: 'queue'}, function (response) {
        onChangeUpdate();
        turnOffLoading(caller);
    });

}

function queuePlaylist(caller) {
    turnOnLoading(caller);
    getCurrentUrl(function(tabUrl) {
        var name = getSiteName(tabUrl);
        switch (name) {
            case 'youtube':
                queueYoutubeList(caller);
                break;

            case 'soundcloud':
                queueSoundcloudSet(caller);
                break;
        }
    });
}

function queueYoutubeList(caller) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'getPlaylistUrls'}, function (response) {
            if (response && response.urlList) {
                getCurrentUrl(function(tabUrl) {
                    chrome.extension.sendMessage({action: 'queueList',urlList:JSON.parse(response.urlList), url:tabUrl}, function (response) {
                        onChangeUpdate();
                        turnOffLoading(caller);
                    });
                });
            }
        });
    });
}

function queueSoundcloudSet(caller) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendMessage(tab.id, {action: 'getPlaylistUrls'}, function (response) {
            if (response && response.trackIds) {
                getCurrentUrl(function(tabUrl) {
                    chrome.extension.sendMessage({action: 'queueList',urlList:JSON.parse(response.trackIds), url:tabUrl}, function (response) {
                        onChangeUpdate();
                        turnOffLoading(caller);
                    });
                });
            }
        });
    });
}

function removeThisFromPlaylist(caller) {
    chrome.extension.sendMessage({action: 'removeThis'}, function (response) {
        onChangeUpdate();
    });
}

var favArrayKey = "fav-array";

function getAllFavourites() {
    return localStorage[favArrayKey];
}

function addToFavourites() {
    chrome.tabs.getSelected(null, function (tab) {
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



function createFavouritesActionButtons(i) {
    var name = favArray[i][0];
    var url = favArray[i][1];
    $('#favourites').find('tbody:last').append("<tr id='favRow" + i + "'><td style='width: 100%;'><a class='btn btn-link youtube-link' target='_blank' href='" + url + "'> " + name + "</a></td><td style='text-align: center; vertical-align: middle;'><div class='btn-group'><button class='btn btn-mini btn-primary' id='favQueueBtn" + i + "'>Play</a>&#32;<button class='btn btn-mini' id='favRemoveBtn" + i + "'>Remove</a></div></td></tr>");
    $('#favQueueBtn' + i).click(function () {
        queueItem(favArray[i][1], function () {
            onChangeUpdate();
        });
    });
    $('#favRemoveBtn' + i).click(function () {
        removeFromFavourites(i);
    });
}

function initConnectivity(callback) {
    getXbmcJsonVersion(function (version) {
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
        update: function (e, ui) {
            var sortedBody = $(this);
            var newOrder = [];
            sortedBody.find('tr').each(function () {
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
    getXbmcJsonVersion(function (version) {
        localStorage.setItem('jsonVersion', version);
    });
}

function enableVideoButtons() {
    $(".disabled-btn").each(function () {
        $(this).removeAttr('disabled')
    });
    $(".disabled-link").each(function () {
        $(this).removeClass('disabled')
    });
}

function enablePlaylistButtons() {
    var queueListButton = $('#queueListButton');
    queueListButton.attr('disabled', false);
    queueListButton.parent().removeClass('disabled');
}
function initVideoButton() {
    chrome.tabs.getSelected(null, function (tab) {
        var url = tab.url;

        validVideoPage(url, function() {
            enableVideoButtons();
        });

        if (validPlaylistUrl(url)) {
            enablePlaylistButtons();
        }
    });
}

function initQueueCount() {
    getActivePlaylistSize(function (playlistSize) {
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
    var hasRepeat = 1;

    if ($('#repeatButton').length <= 0) {
        if (localStorage["showRepeat"] == 'always') {
            $('#addToFavButton').after('<button id="repeatButton" class="btn btn-small" disabled style="padding: 5px">Repeat: Stopped</button>');
            $('#repeatButton').click(function () {
                toggleRepeat()
            });
        } else if (localStorage["showRepeat"] == 'dropdown') {
            $('#dropdown-first').after('<li class="disabled disabled-link"><a tabindex="-1" href="#" id="repeatButton">Repeat: Stopped</a></li>');
            $('#repeatButton').click(function () {
                toggleRepeat()
            });
        } else {
            hasRepeat = 0;
        }
    }

    if (hasRepeat) {
        getRepeatMode(function (repeat) {
            var buttonLabel = "Repeat: ";
            var repeatButton = $('#repeatButton');

            if (repeat == "one" || repeat == "One") {
                buttonLabel += "One";
                repeatButton.removeAttr('disabled');
                repeatButton.parent().removeClass('disabled');
            } else if (repeat == "all" || repeat == "All") {
                buttonLabel += "All";
                repeatButton.removeAttr('disabled');
                repeatButton.parent().removeClass('disabled');
            } else if (repeat == "off" || repeat == "Off") {
                buttonLabel += "Off";
                repeatButton.removeAttr('disabled');
                repeatButton.parent().removeClass('disabled');
            } else {
                buttonLabel += "Stopped";
                repeatButton.attr('disabled', true);
                repeatButton.parent().addClass('disabled');
            }

            repeatButton.html(buttonLabel);
            repeatButton.find('img').remove();
        });
    }
}

function initVolumeSlider() {
    getVolumeLevel(function (volume) {
        $('#volume_control').slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: volume,
            slide: function (event, ui) {
                setVolume(ui.value);
            }
        });
    });
}

function initPlaylistNumbers() {
    getActivePlaylistSize(function (size) {
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

function initProfiles() {
    if (isMultiHostEnabled()) {
        var allProfiles = JSON.parse(getAllProfiles());
        var profiles = $('#profiles');

        profiles.children().each(function () {
            $(this).remove()
        });
        for (var i = 0; i < allProfiles.length; i++) {
            var profile = allProfiles[i];
            profiles.append('<option value="' + profile.id + '">' + profile.name + '</option>');
        }

        profiles.val(localStorage[storageKeys.selectedHost]);

        profiles.change(function () {
            localStorage.setItem(storageKeys.selectedHost, profiles.val());
            document.location.reload(true)
        });

        $('#profileRow').show();
    }
}

function initKeyBindings() {
    $(document).keydown(function (e) {
        var keyCode = e.keyCode || e.which,
            keypress = {left: 37, up: 38, right: 39, down: 40, backspace: 8, enter: 13, c: 67, i: 73 };

        console.log(e.keyCode);

        switch (keyCode) {
            case keypress.left:
                navigate('Left');
                break;
            case keypress.up:
                navigate('Up');
                break;
            case keypress.right:
                navigate('Right');
                break;
            case keypress.down:
                navigate('Down');
                break;
            case keypress.backspace:
                navigate('Back');
                break;
            case keypress.enter:
                navigate('Select');
                break;
            case keypress.i:
                navigate('Info');
                break;
            case keypress.c:
                navigate('ContextMenu');
                break;
        }
    });
}

function toggleRepeat() {
    $('#repeatButton').html('<img src="/images/loading.gif"/>');
    getRepeatMode(function (repeat) {
        if (repeat == "one" || repeat == "One") {
            setRepeatMode('all', function () {
                initRepeatMode();
            });
        } else if (repeat == "all" || repeat == "All") {
            setRepeatMode('off', function () {
                initRepeatMode();
            });
        } else if (repeat == "off" || repeat == "Off") {
            setRepeatMode('one', function () {
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
    playerGoPrevious(function () {
        onChangeUpdate();
    })
}

function stop() {
    doAction(actions.Stop, function () {
        clearPlaylist(function () {
            onChangeUpdate();
        });
    });
}

function playPause() {
    doAction(actions.PlayPause, function () {
        onChangeUpdate();
    });
}

function next() {
    playerGoNext(function () {
        onChangeUpdate();
    })
}

function emptyPlaylist() {
    clearPlaylist(function () {
        onChangeUpdate();
    });
}

var urlList = [];
var favArray = JSON.parse(getAllFavourites());