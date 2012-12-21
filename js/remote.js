/**
 * This file contains Google Chrome specific methods.
 */

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

function setVolume(volume) {
    var setVolume = '{"jsonrpc": "2.0", "method": "Application.SetVolume", "params": {"volume":' + volume + '} , "id" : 1}';
    ajaxPost(setVolume, function() {});
}

function doAction(item, callback) {
    var action = '{"jsonrpc": "2.0", "method": "' + item + '", "params":{"playerid":1}, "id" : 1}';

    ajaxPost(action, function(result) {
        callback(result);
    });
}

function initialiseSlider(volume) {
    $('#volume_control').slider({
        orientation: "horizontal",
        range: "min",
        min: 0,
        max: 100,
        value: volume,
        slide: function(event, ui) {
            setVolume(ui.value);
        }
    })
}

function playCurrentUrl() {
    doAction(actions.Stop, function() {
        clearPlaylist(function() {
            queueCurrentUrl();
            initQueueCount();
        });
    });
}

function queueCurrentUrl() {
    chrome.tabs.getSelected(null, function(tab) {
        var tabUrl = tab.url;

        queueItem(tabUrl, function(result) {
            initQueueCount();
        });
    })
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
                favArray = new Array();
            }

            var fav = [];
            fav[0] = title;
            fav[1] = url;
            favArray.push(fav);
            localStorage.setItem(favArrayKey, JSON.stringify(favArray));
            initFavouritesTable();
        }
    })
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
    $('#favourites tbody:last').append("<tr id='favRow" + i + "'><td style='width: 100%;'><a class='btn btn-link youtube-link' target='_blank' href='" + url + "'> " + name + "</a></td><td style='text-align: center; vertical-align: middle;'><div class='btn-group'><a class='btn btn-mini btn-primary' id='favQueueBtn" + i + "' href=\"#\">Play</a>&#32;<a class='btn btn-mini' id='favRemoveBtn" + i + "' href=\"#\">Remove</a></div></td></tr>");
    $('#favQueueBtn' + i).click(function() {
        queueItem(favArray[i][1], function() {
            initQueueCount()
        });
    });
    $('#favRemoveBtn' + i).click(function() {
        removeFromFavourites(i);
    });
}

function initFavouritesTable() {
    $('#favourites').hide();
    $('#favourites tbody').find("tr").remove();
    if (getAllFavourites() != null) {
        favArray = JSON.parse(getAllFavourites());
        if (favArray.length > 0) {
            for (var i = 0; i < favArray.length; i++) {
                createFavouritesActionButtons(i);
            }
            $('#favourites').show();
        }
    }

    $('.sort').sortable({
        cursor: 'move',
        axis: 'y',
        update: function(e, ui) {
            var sortedBody = $(this);
            var newOrder = new Array();
            sortedBody.find('tr').each(function(){
                var link = $(this).find('.youtube-link').first();
                var fav = new Array();
                fav[0] = link.html().trim();
                fav[1] = link.attr('href');
                newOrder.push(fav);
            });
            localStorage.setItem(favArrayKey, JSON.stringify(newOrder));
        }
    });
}

function initVideoButton() {
    chrome.tabs.getSelected(null, function(tab) {
        var url = tab.url;
        var valid = validUrl(url);
        // if valid, enable button
        if (valid) {
            $("#playCurrentVideoButton").removeAttr('disabled');
            $("#queueVideoButton").removeAttr('disabled');
            $("#addToFavButton").removeAttr('disabled');
        }
    });
}

function initQueueCount() {
    var getCurrentPlaylist = '{"jsonrpc": "2.0", "method": "Playlist.GetItems", "params":{"playlistid":1}, "id": 1}';
    ajaxPost(getCurrentPlaylist, function(data) {
        var items = data.result.items;
        if (items != null) {
            $("#queueVideoButton").html("+Queue(" + items.length + ")");
        } else {
            $("#queueVideoButton").html("+Queue");
        }
    });
}

function initRepeatMode() {
    getRepeatMode(function (data) {
        var buttonLabel = "Repeat: ";
        if (data == "one" || data == "One") {
            buttonLabel += "One";
        } else if (data == "all" || data == "All") {
            buttonLabel += "All";
        } else {
            buttonLabel += "Off";
        }

        $('#repeatBtnLabel').html(buttonLabel);
    });
}

function playCurrentPlaylist() {
    doAction(actions.Stop, function() {
        clearPlaylist(function() {
            queueCurrentPlaylist();
        });
    });
}

function queueCurrentPlaylist() {
    chrome.tabs.getSelected(function(tab) {
        chrome.tabs.sendMessage(tab.id, {method: "getPlaylistVideoIds"}, function(response) {
            if (response && response.video_ids) {
                var videoIds = JSON.parse(response.video_ids);
                var videoPluginUrls = new Array();
                for (i in videoIds) {
                    videoPluginUrls.push(getPluginPath('youtube', videoIds[i]));
                }
                addItemsToPlaylist(videoPluginUrls.reverse(), function() {
                    initQueueCount();
                });
            }
        });
    });
}