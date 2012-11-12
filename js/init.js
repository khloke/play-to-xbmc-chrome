$(document).ready( function() {
    ajaxPost('{"jsonrpc": "2.0", "method": "Application.GetProperties", "params":{"properties":["volume"]}, "id" : 1}', function(data) {
        initialiseSlider(data.result["volume"]);
    });

    clearNonPlayingPlaylist(function(result) {
        initVideoButton();
        initFavouritesTable();
        initQueueCount();
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

    if (!hasUrlSetup()) {
        $('#setupTooltip').css("display", "block");
    }

});