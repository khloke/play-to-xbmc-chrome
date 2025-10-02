// Refactored for MV3: context menu onclick handlers replaced by central onClicked listener.
var currentTabId;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.tabId) currentTabId = request.tabId;
        switch (request.action) {
            case 'isAvailable':
                getXbmcJsonVersion(function (version) {
                    if (version == null) {
                        sendResponse({response: "NOT_DETECTED"});
                    } else {
                        sendResponse({response: "OK"});
                    }
                });
                break;
            case 'playThis':
                if (currentTabId) chrome.tabs.sendMessage(currentTabId, {action: 'onPlayback'});
                playThisUrl(request.url, function() { sendResponse({response: "OK"}); });
                break;
            case 'queueThis':
                queueThisUrl(request.url, function () { sendResponse({response: "OK"}); });
                break;
            case 'queueList':
                queueList(request.url, request.urlList, function () { sendResponse({response: "OK"}); });
                break;
            case 'removeThis':
                removeThisFromPlaylist(function () { sendResponse({response: "OK"}); });
                break;
            case 'playThisNext':
                playThisNext(request.url, function () { sendResponse({response: "OK"}); });
                break;
            case 'isDebugLogsEnabled':
                sendResponse({response: isDebugLogsEnabled()});
                break;
            case 'createContextMenu':
                createContextMenu(request, function() { sendResponse({response: "OK"}); });
                break;
            case 'resume':
                playThisUrl(request.url, function(){
                    resume(request.currentTime, function () { sendResponse({response: "OK"}); })});
                break;
            case 'setLogging':
                debugLogsEnabled = request.enable;
                sendResponse({response: 'OK'});
                break;
        }
        return true; // keep message channel open for async
    }
);

function onContextMenuCreated() {
    if (debugLogsEnabled && chrome.runtime.lastError) {
        console.log("Error creating context menu item:" + chrome.runtime.lastError.message);
    }
}

// --- Restored helper functions from MV2 implementation ---
function doAction(item, callback) {
    getActivePlayerId(function (playerid) {
        if (playerid != null) {
            var action = '{"jsonrpc": "2.0", "method": "' + item + '", "params":{"playerid":' + playerid + '}, "id" : 1}';
            ajaxPost(action, function (result) { callback(result); });
        } else { callback(null); }
    });
}
function playThisUrl(url, callback) {
    doAction(actions.Stop, function () {
        clearPlaylist(function() { queueItem(url, function () { callback(); }); });
    });
}
function playThisNext(url, callback) {
    getPlaylistPosition(function (position) { insertItem(url, (position||0) + 1, function () { callback(); }); });
}
function queueThisUrl(url, callback) { queueItem(url, function () { callback(); }); }
function queueList(tabUrl, urlList, callback) {
    if (!urlList || urlList.length === 0) { callback(); return; }
    queueItems(tabUrl, urlList, function () { callback(); });
}
function removeThisFromPlaylist(callback) {
    getPlaylistPosition(function (position) {
        playerGoNext(function () { removeItemFromPlaylist(position, function () { callback(); }); });
    });
}
// ---------------------------------------------------------

// Helper actions referenced by onClicked listener
function cmPlayNow(url, srcUrl) {
    const target = url || srcUrl;
    if (!target) return;
    doAction(actions.Stop, function () { clearPlaylist(function(){ queueItem(target, function(){}); }); });
}
function cmQueue(url, srcUrl) { const target = url || srcUrl; if (!target) return; queueItem(target, function(){}); }
function cmPlayNext(url, srcUrl) { const target = url || srcUrl; if (!target) return; getPlaylistPosition(function (position) { insertItem(target, (position||0) + 1, function () {}); }); }
function cmShowImage(srcUrl) { if (!srcUrl) return; wakeScreen(function(){ addItemsToPlaylist([{contentType:'picture', pluginPath: srcUrl}], function(){}); }); }

var contextMenuLinks = [];
function isContextMenuCreated(url) { return contextMenuLinks.indexOf(url) >= 0; }

function createContextMenu(request, callback) {
    var link = request.link;
    for (var i = 0; i < allModules.length; i++) {
        var module = allModules[i];
        if (module.canHandleUrl(link) && !isContextMenuCreated(link)) {
            contextMenuLinks.push(link);
            chrome.contextMenus.create({ id: 'dyn_play_now_'+contextMenuLinks.length, title: 'Play now', contexts: ['link'], targetUrlPatterns: [link] }, onContextMenuCreated);
            chrome.contextMenus.create({ id: 'dyn_queue_'+contextMenuLinks.length, title: 'Queue', contexts: ['link'], targetUrlPatterns: [link] }, onContextMenuCreated);
            chrome.contextMenus.create({ id: 'dyn_play_next_'+contextMenuLinks.length, title: 'Play this Next', contexts: ['link'], targetUrlPatterns: [link] }, onContextMenuCreated);
        }
    }
    callback();
}

function createHtml5VideoContextMenus() {
    chrome.contextMenus.create({ id: 'video_play_now', title: 'Play now', contexts: ['video'] }, onContextMenuCreated);
    chrome.contextMenus.create({ id: 'video_queue', title: 'Queue', contexts: ['video'] }, onContextMenuCreated);
    chrome.contextMenus.create({ id: 'video_play_next', title: 'Play this Next', contexts: ['video'] }, onContextMenuCreated);
    chrome.contextMenus.create({ id: 'audio_play_now', title: 'Play now', contexts: ['audio'] }, onContextMenuCreated);
    chrome.contextMenus.create({ id: 'audio_queue', title: 'Queue', contexts: ['audio'] }, onContextMenuCreated);
    chrome.contextMenus.create({ id: 'audio_play_next', title: 'Play this Next', contexts: ['audio'] }, onContextMenuCreated);
}

function createMagnetAndP2PAndImageContextMenus() {
    chrome.contextMenus.create({ id: 'image_show', title: 'Show Image', contexts: ['image'] }, onContextMenuCreated);
    chrome.contextMenus.create({ id: 'mag_play_now', title: 'Play now', contexts: ['link'], targetUrlPatterns: ['magnet:*', 'acestream:*', 'sop:*'] }, onContextMenuCreated);
    chrome.contextMenus.create({ id: 'mag_queue', title: 'Queue', contexts: ['link'], targetUrlPatterns: ['magnet:*', 'acestream:*', 'sop:*'] }, onContextMenuCreated);
    chrome.contextMenus.create({ id: 'mag_play_next', title: 'Play this Next', contexts: ['link'], targetUrlPatterns: ['magnet:*', 'acestream:*', 'sop:*'] }, onContextMenuCreated);
}

chrome.contextMenus.removeAll(function(){
    createMagnetAndP2PAndImageContextMenus();
    createHtml5VideoContextMenus();
});

chrome.contextMenus.onClicked.addListener(function(info, tab){
    var id = info.menuItemId;
    if (id.startsWith('dyn_play_now')) { cmPlayNow(info.linkUrl); }
    else if (id.startsWith('dyn_queue')) { cmQueue(info.linkUrl); }
    else if (id.startsWith('dyn_play_next')) { cmPlayNext(info.linkUrl); }
    else {
        switch(id) {
            case 'video_play_now': cmPlayNow(null, info.srcUrl); break;
            case 'video_queue': cmQueue(null, info.srcUrl); break;
            case 'video_play_next': cmPlayNext(null, info.srcUrl); break;
            case 'audio_play_now': cmPlayNow(null, info.srcUrl); break;
            case 'audio_queue': cmQueue(null, info.srcUrl); break;
            case 'audio_play_next': cmPlayNext(null, info.srcUrl); break;
            case 'image_show': cmShowImage(info.srcUrl); break;
            case 'mag_play_now': cmPlayNow(info.linkUrl); break;
            case 'mag_queue': cmQueue(info.linkUrl); break;
            case 'mag_play_next': cmPlayNext(info.linkUrl); break;
        }
    }
});
