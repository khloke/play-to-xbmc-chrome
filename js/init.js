$(document).ready( function() {
    ajaxPost('{"jsonrpc": "2.0", "method": "Application.GetProperties", "params":{"properties":["volume"]}, "id" : 1}', function(data) {
        initialiseSlider(data.result["volume"]);
    });

    clearNonPlayingPlaylist(function(result) {
        initVideoButton();
        initFavouritesTable();
        initQueueCount();
        initRepeatMode();
    });

    $('#previousBtn').click(function() {doAction(actions.GoPrevious, function(){})});
    $('#rewindBtn').click(function() {playerSeek('smallbackward')});
    $('#stopBtn').click(function() {doAction(actions.Stop, function(){initQueueCount()}); clearPlaylist(function(){});});
    $('#playBtn').click(function() {doAction(actions.PlayPause, function(){})});
    $('#fastForwardBtn').click(function() {playerSeek('smallforward')});
    $('#nextBtn').click(function() {doAction(actions.GoNext, function(){})});

    $('#playCurrentVideoButton').click(function() {playCurrentUrl()});
    $('#queueVideoButton').click(function() {queueCurrentUrl()});
    $('#addToFavButton').click(function() {addToFavourites()});
//    $('#testBtn').click(function() { getCurrentPlaytime() });
    if (localStorage['showRepeat'] == 'true') {
        $('#repeatBtn').show();
    }
    $('#repeatOff').click(function() {setRepeatMode('off', function() {initRepeatMode();});});
    $('#repeatOne').click(function() {setRepeatMode('one', function() {initRepeatMode();});});
    $('#repeatAll').click(function() {setRepeatMode('all', function() {initRepeatMode();});});

    if (!hasUrlSetup()) {
        $('#setupTooltip').css("display", "block");
    }

});