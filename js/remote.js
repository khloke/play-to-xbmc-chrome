//
// Settings needed: ["enableMultiHost", "selectedHost", "profiles", "url", "port", "username", "password"]
//
function hasUrlSetup(settings) {
    let hasUrl = false;

    if (isMultiHost(settings)) {
        let profiles = settings.profiles;

        if (profiles != null) {
            let selectedHost = settings.selectedHost;

            if (selectedHost != null && selectedHost > 0) {
                for (let i = 0; i < profiles.length; i++) {
                    let profile = profiles[i];
                    if (profile.id == selectedHost) {
                        hasUrl = profile.url != null && profile.url != '' && profile.port != null && profile.port != '';
                    }
                }
            } else {
                hasUrl = profiles[0] != null
                    && profiles[0].url != null
                    && profiles[0].url != ''
                    && profiles[0].port != null
                    && profiles[0].port != '';
            }
        }
    } else {
        let url = settings.url;
        let port = settings.port;

        hasUrl = url != null && url != '' && port != null && port != '';
    }

    return hasUrl;
}

function updateVersion() {
    return browser.storage.sync.set({"installedVersion": currentVersion});
}

function onChangeUpdate() {
    initQueueCount();
    initRepeatMode();
    initPlaylistNumbers();
    initPlayTimes();
}

function setVolume(volume) {
    var setVolume = '{"jsonrpc": "2.0", "method": "Application.SetVolume", "params": {"volume":' + volume + '} , "id" : 1}';
    ajaxPost(setVolume, function() {});
}

function seek(playerId, timeInSeconds) {
    var hours = Math.floor(timeInSeconds / 3600);
    var minutes = Math.floor((timeInSeconds % 3600) / 60);
    var seconds = Math.floor((timeInSeconds % 3600) % 60);

    var seek = '{"jsonrpc":"2.0", "method":"Player.Seek", "params":{"playerid":' + playerId + ', "value":{"hours":' + hours + ', "minutes":' + minutes + ', "seconds":' + seconds + '}},"id":1}';
    ajaxPost(seek, function() {});
}

function doAction(item, callback) {
    getActivePlayerId(function (playerid) {
        if (playerid != null) {
            var action = '{"jsonrpc": "2.0", "method": "' + item + '", "params":{"playerid":' + playerid + '}, "id" : 1}';
            ajaxPost(action, function (response) {
                if (item == actions.PlayPause) {
                    isPlaying = response.result.speed > 0;
                }
                callback(response);
            });
        } else {
            callback(null);
        }
    });
}

function playCurrentUrl(caller) {
    turnOnLoading(caller);
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        chrome.runtime.sendMessage({action: 'playThis', tabId: tab.id, url: tab.url}, function (response) {
            onChangeUpdate();
            turnOffLoading(caller);
        });
    });
}

function playThisUrl(url, caller) {
    turnOnLoading(caller);
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        chrome.runtime.sendMessage({action: 'playThis', tabId: tab.id, url: url}, function (response) {
            onChangeUpdate();
            turnOffLoading(caller);
        });
    });
}

function playNextCurrentUrl(caller) {
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        chrome.runtime.sendMessage({action: 'playThisNext', tabId: tab.id, url: tab.url}, function (response) {
            onChangeUpdate();
        });
    });
}

function queueCurrentUrl(caller) {
    turnOnLoading(caller);
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        chrome.runtime.sendMessage({action: 'queueThis', tabId: tab.id, url: tab.url}, function (response) {
            onChangeUpdate();
            turnOffLoading(caller);
        });
    });

}

function queueThisUrl(url, caller) {
    turnOnLoading(caller);
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        chrome.runtime.sendMessage({action: 'queueThis', url: url, tabId: tab.id}, function (response) {
            onChangeUpdate();
            turnOffLoading(caller);
        });
    });

}

function queuePlaylist(caller) {
    turnOnLoading(caller);
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        var tabUrl = tab.url;
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

function queueList(videoList, caller) {
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        chrome.runtime.sendMessage({
            action: 'queueList',
            tabId: tab.id,
            urlList: videoList,
            url: 'https://www.youtube.com/'
        }, function (response) {
            onChangeUpdate();
            turnOffLoading(caller);
        });
    });
}

function queueYoutubeList(caller) {
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        chrome.tabs.sendMessage(tab.id, {action: 'getPlaylistUrls'}, function (response) {
            if (response && response.urlList) {
                chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
                    tab = tab[0];
                    var tabUrl = tab.url;
                    chrome.runtime.sendMessage({action: 'queueList', tabId: tab.id, urlList:JSON.parse(response.urlList), url:tabUrl}, function (response) {
                        onChangeUpdate();
                        turnOffLoading(caller);
                    });
                });
            }
        });
    });
}

function queueSoundcloudSet(caller) {
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        chrome.tabs.sendMessage(tab.id, {action: 'getPlaylistUrls'}, function (response) {
            if (response && response.trackIds) {
                chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
                    tab = tab[0];
                    var tabUrl = tab.url;
                    chrome.runtime.sendMessage({action: 'queueList', tabId: tab.id,urlList:JSON.parse(response.trackIds), url:tabUrl}, function (response) {
                        onChangeUpdate();
                        turnOffLoading(caller);
                    });
                });
            }
        });
    });
}

function removeThisFromPlaylist(caller) {
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        chrome.runtime.sendMessage({action: 'removeThis', tabId: tab.id}, function (response) {
            onChangeUpdate();
        });
    });
}

//
// Returns array of favourites
//
// Settings needed: ["favArray"]
//
function getAllFavourites(settings) {
    return settings.favArray || [];
}

//
// Adds current tab.url to favourites
//
// Settings needed: ["favArray"]
//
function addToFavourites(settings) {
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        var url = tab.url;
        var title = tab.title.replace(' - YouTube', '').trim();
        addThisToFavourites(settings, title, url);
    });
}

//
// Adds title and ulr to favourites
//
// Settings needed: ["favArray"]
//
function addThisToFavourites(settings, title, url) {
    debugLog("addThisToFavourites()");
    if (validUrl(url)) {
        var favArray = getAllFavourites(settings);

        var fav = [];
        fav[0] = title;
        fav[1] = url;
        favArray.push(fav);
        browser.storage.sync.set({favArray: favArray}).then(
            function(result) {
                return getSettings(["favArray"]).then(
                    settings => {initFavouritesTable(settings);}
                );
            });
    }
}

//
// Remove 'index' from favourites
//
// Settings needed: ["favArray"]
//
function removeFromFavourites(settings, index) {
    debugLog("removeFromFavourites()");
    var favArray = getAllFavourites(settings);
    favArray.splice(index, 1);
    browser.storage.sync.set({favArray: favArray}).then(
        function(result) {
            return getSettings(["favArray"]).then(settings => { initFavouritesTable(settings); });
        });
}

//
// Clear favourites list
//
// Settings needed: ["favArray"]
//
function clearFavouritesTable(settings) {
    browser.storage.sync.set({favArray: []}).getSettings(["favArray"]).then(
        settings => { initFavouritesTable(settings); }
    );
}

//
// Create action button for favourite of index 'i'
//
function createFavouritesActionButtons(settings, i) {
    let fav = getAllFavourites(settings)[i];
    let name = fav[0];
    let url = fav[1];
    $('#favourites').find('tbody:last').append("<tr id='favRow" + i + "'><td style='width: 100%;'><a class='btn btn-link youtube-link' target='_blank' href='" + url + "'> " + name + "</a></td><td style='text-align: center; vertical-align: middle;'><div class='btn-group'><button class='btn btn-mini btn-primary' id='favQueueBtn" + i + "'>Play</a>&#32;<button class='btn btn-mini' id='favRemoveBtn" + i + "'>Remove</a></div></td></tr>");
    $('#favQueueBtn' + i).click(function () {
        queueItem(fav[1], function () {
            onChangeUpdate();
        });
    });
    $('#favRemoveBtn' + i).click(function () {
        getSettings().then(settings => { removeFromFavourites(settings, i); });
    });
}

function initFocusFix() {
    //Fix focus issues when using keyboard bindings
    $('input,button,#volume_control').mouseout(function(event) {
        $('#focusAnchor').focus();
    });
}

var watchdog;
var lastIsActive = false;
var watchDogCounter = 0;
var isPlaying = false;
function initWatchdog() {
    clearInterval(watchdog);
    var $seeker = $('#seeker');

    getSpeed(function(speed) {
        if (speed > 0) {
            isPlaying = true;
        }
    });

    watchdog = setInterval(function () {
        var sliderValue = $seeker.slider("value");
        getActivePlayerId(function(playerId) {
            if (playerId == 0 || playerId == 1) {
                if (!lastIsActive) {
                    $seeker.slider({
                        disabled:false
                    });

                    onChangeUpdate();
                    lastIsActive = true;
                }

                if (watchDogCounter % 5 == 0) {
                    getPlayerTimes(playerId, function(timeInSeconds, totalTimeInSeconds){
                        $('#totalTime').html(formatSeconds(totalTimeInSeconds));
                        $seeker.slider({
                            max: totalTimeInSeconds,
                            value: timeInSeconds
                        });
                    });

                    getSpeed(function(speed) {
                        isPlaying = speed > 0;
                    });
                } else {
                    if (isPlaying) {
                        var $currentTime = $('#currentTime');
                        var top = ($('#seekerRow').position().top + 30);
                        $currentTime.css('top', top + 'px');
                        $currentTime.html(formatSeconds(sliderValue + 1));
                        $seeker.slider("value", sliderValue + 1);
                    }
                }
            } else {
                if (lastIsActive) {
                    $seeker.slider({
                        value: 0,
                        disabled: true
                    });

                    onChangeUpdate();
                    lastIsActive = false;
                }
            }
        });

        watchDogCounter++;
    }, 1000);
}

function initConnectivity(callback) {
    getXbmcJsonVersion(function (version) {
        var warningTextContainer = $('#warningTextContainer');
        if (version == null) {
            warningTextContainer.html('<span class="label label-important">Unable to connect to Kodi <i id="tooltipIcon" class="icon-question-sign icon-white" data-toggle="tooltip" data-placement="top" data-original-title="Please make sure that your settings are correct and Kodi is running."></i></span>');
            $('#tooltipIcon').tooltip();
            warningTextContainer.show();
        } else {
            warningTextContainer.hide();
            callback();
        }
    });
}

//
// Initialize favourites table
//
// Settings needed: ["favArray"]
//
function initFavouritesTable(settings) {
    debugLog("initFavouritesTable()");
    var favouritesTable = $('#favourites');
    favouritesTable.hide();
    favouritesTable.find('tbody').find("tr").remove();
    if (getAllFavourites(settings) != null) {
        favArray = getAllFavourites(settings);
        if (favArray.length > 0) {
            for (var i = 0; i < favArray.length; i++) {
                createFavouritesActionButtons(settings, i);
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
            browser.storage.sync.set({favArray: newOrder});
        }
    });
}

function initJsonVersion() {
    getXbmcJsonVersion(function (version) {
        browser.storage.sync.set({jsonVersion: version});
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
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        if (typeof tab == 'undefined') {
            return;
        }
        var url = tab.url;

        validVideoPage(url, function() {
            $('#playCurrentVideoButton').click(function() { playCurrentUrl($(this)) });
            $('#queueVideoButton').click(function() { queueCurrentUrl($(this)) });
            enableVideoButtons();
        });

        if (validPlaylistUrl(url)) {
            enablePlaylistButtons();
        }

        getEmbeddedVideos(function(videoList) {
            if (videoList.length > 0) {
                if (videoList.length == 1) {
                    var videoUrl = videoList[0].url;
                    $('#playCurrentVideoButton').click(function() { playThisUrl(videoUrl, $(this)) });
                    $('#queueVideoButton').click(function() { queueThisUrl(videoUrl, $(this)) });
                    enableVideoButtons();
                } else {
                    $('.single-action-btn').hide();
                    $('.multi-video-btn-group').show();
                    $('.video-menu').empty();
                    var urlList = [];
                    for (var i = 0; i < videoList.length; i++) {
                        var video = videoList[i];
                        urlList.push(video.url);
                        $('#videoButtons').append('<li><a id="' + video.id + '" href="#" url="' + video.url + '">' + video.title + '</a></li>');
                        $('#' + video.id).click(function() { playThisUrl($(this).attr('url'), $(this)) });
                        $('#videoQueueButtons').append('<li><a id="queue-' + video.id + '" href="#" url="' + video.url + '">' + video.title + '</a></li>');
                        $('#queue-' + video.id).click(function() { queueThisUrl($(this).attr('url'), $(this)) });
                        $('#videoFavButtons').append('<li><a id="fav-' + video.id + '" href="#" url="' + video.url + '">' + video.title + '</a></li>');
                        $('#fav-' + video.id).click(function() {
                            getSettings().then( settings => { addThisToFavourites($(this).html(), $(this).attr('url')); });
                        });
                    }

                    $('#videoQueueButtons').append('<li class="divider"></li>').append('<li><a id="queueAllBtn">Queue All</a></li>');
                    $('#queueAllBtn').click(function() { queueList(urlList, $(this)); });
                }
            }
        });
    });
}

function getEmbeddedVideos(callback) {
    chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
        tab = tab[0];
        chrome.tabs.sendMessage(tab.id, {action: 'getEmbeddedVideos'}, function (response) {
            if (response && response.length > 0) {
                callback(response);
            }
        });
    });
}

function initQueueCount() {
    getActivePlaylistSize(function (playlistSize) {
        if (playlistSize != null) {
            getPlaylistPosition(function (playlistPosition) {
                var leftOvers = playlistSize - playlistPosition;
                if (playlistPosition != null) {
                    debugLog("playlistSize:" + playlistSize + ", playlistPosition:" + playlistPosition);
                    $("#queueVideoButton").html("+Queue(" + leftOvers + ")");
                    return;
                }
            });
        }
    });

    $("#queueVideoButton").html("+Queue");
}

async function initRepeatMode() {
    let hasRepeat = 1;
    let showRepeat = await getSettings(["showRepeat"]);

    if ($('#repeatButton').length <= 0) {
        if (showRepeat == 'always') {
            $('#moreBtnGroup').before('<button id="repeatButton" class="btn btn-small" disabled style="padding: 5px; margin-left: -1px;">Repeat: Stopped</button>');
            $('#repeatButton').click(function () {
                toggleRepeat()
            });
        } else if (showRepeat == 'dropdown') {
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

var lastRecordedWheelTime = 0;
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
            },
            change: function (event, ui) {
                setVolume(ui.value);
            }
        });
    });

    $('#volume_control').bind("mousewheel", function (e) {
        var $volumecontrol = $('#volume_control');
        var addDiff = 1;
        var diff = e.originalEvent.timeStamp - lastRecordedWheelTime;
        if (diff < 10) {
            addDiff+=15;
        } else if (diff < 100) {
            addDiff+=5;
        } else if (diff < 150) {
            addDiff+=2;
        }
        if (e.originalEvent.wheelDelta > 0) {
            $volumecontrol.slider("value", $volumecontrol.slider("value") + addDiff);
        } else {
            $volumecontrol.slider("value", $volumecontrol.slider("value") - addDiff);
        }

        lastRecordedWheelTime = e.originalEvent.timeStamp;
    });
}

function initSeekerSlider() {
    var $seeker = $('#seeker');
    $seeker.slider({
        animate: 'fast',
        orientation: "horizontal",
        range: "min",
        min: 0,
        start: function(event, ui) {
            clearInterval(watchdog);
            $('#scrollerTime').show();
        },
        slide: function (event, ui) {
            $(document).bind('mousemove', function(e) {
                var $scrollerTime = $('#scrollerTime');
                $scrollerTime.css({
                    left: e.pageX + 18,
                    top: e.pageY + 8
                });
                $scrollerTime.html(formatSeconds(ui.value));
            });
        },
        stop: function (event, ui) {
            initWatchdog();
            getActivePlayerId(function (playerId) {
                if (playerId == 0 || playerId == 1) {
                    seek(playerId, ui.value);
                }
            });
            $('#scrollerTime').hide();
        }
    });

    getActivePlayerId(function (playerId, type) {
        if (playerId == 0 || playerId == 1) {
            getPlayerTimes(playerId, function (timeInSeconds, totalTimeInSeconds) {
                if (timeInSeconds >= 0 && totalTimeInSeconds >= 0) {
                    var $currentTime = $('#currentTime');
                    var $totalTime = $('#totalTime');
                    var top = ($('#seekerRow').position().top + 30);
                    $currentTime.css('top', top + 'px');
                    $totalTime.css('top', top + 'px');
                    $currentTime.html(formatSeconds(timeInSeconds));
                    $totalTime.html(formatSeconds(totalTimeInSeconds));
                    debugLog('Total time in seconds: ' + totalTimeInSeconds);
                    $seeker.slider({
                        max: totalTimeInSeconds,
                        value: timeInSeconds
                    });
                }
            });
        } else {
            $seeker.slider({
                max: 100,
                value: 0
            });
            $seeker.slider({disabled:true});    //Setting disabled on a separate line to make sure the slider appeared 'dimmed'.
        }
    });
}

function formatSeconds(timeInSeconds) {
    var hours = Math.floor(timeInSeconds / 3600);
    var minutes = Math.floor((timeInSeconds % 3600) / 60);
    var seconds = Math.floor((timeInSeconds % 3600) % 60);
    var output = '';
    if (hours > 0) {
        output = output + hours.toString() + ":";
    }

    output = output + ('0' + minutes).slice(-2) + ':';
    output = output + ('0' + seconds).slice(-2);

    return output;
}

function initPlayTimes() {
    getActivePlayerId(function (playerId, type) {
        if (playerId == 0 || playerId == 1) {
            getPlayerTimes(playerId, function (timeInSeconds, totalTimeInSeconds) {
                if (timeInSeconds >= 0 && totalTimeInSeconds >= 0) {
                    var $currentTime = $('#currentTime');
                    var $totalTime = $('#totalTime');
                    var top = ($('#seekerRow').position().top + 30);
                    $currentTime.css('top', top + 'px');
                    $totalTime.css('top', top + 'px');
                    $currentTime.html(formatSeconds(timeInSeconds));
                    $totalTime.html(formatSeconds(totalTimeInSeconds));
                }
            });
        } else {
            $('#currentTime').html('');
            $('#totalTime').html('');
        }
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

async function initProfiles() {
    let toGet = [
        "profiles",
        "selectedHost",
        "enableMultiHost",
    ];
    let settings = await getSettings(toGet);

    if (settings.enableMultiHost) {
        var allProfiles = settings.profiles;
        var profiles = $('#profiles');

        profiles.children().each(function () {
            $(this).remove()
        });
        for (var i = 0; i < allProfiles.length; i++) {
            var profile = allProfiles[i];
            profiles.append('<option value="' + profile.id + '">' + profile.name + '</option>');
        }

        profiles.val(settings.selectedHost);

        profiles.change(function () {
            browser.storage.sync.set({selectedHost: profiles.val()});
            document.location.reload(true)
        });

        $('#profileRow').show();
    }
}

function initKeyBindings() {
    $(document).keydown(function (e) {
        $('#focusAnchor').focus();
        var keyCode = e.keyCode || e.which,
            keypress = {left: 37, up: 38, right: 39, down: 40, backspace: 8, enter: 13, c: 67, i: 73 };

        debugLog(e.keyCode);

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
