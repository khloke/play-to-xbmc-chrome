chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {

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
                queueList(request.urlList, function () {

                    sendResponse({response: "OK"});
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

function queueList(urlList, callback) {

    if (urlList.length === 0) {
        callback();
        return;
    }
    queueItems(urlList, function (result) {
        callback();

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

