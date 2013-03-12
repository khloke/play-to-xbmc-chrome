$(document).ready( function() {
    initJsonVersion();
    initVolumeSlider();

    clearNonPlayingPlaylist(function() {
        initVideoButton();
        initFavouritesTable();
        initQueueCount();
        initRepeatMode();
    });

    $('#previousBtn').click(function() {playerGoPrevious()});
    $('#rewindBtn').click(function() {playerSeek('smallbackward')});
    $('#stopBtn').click(function() {doAction(actions.Stop, function(){onChangeUpdate()}); clearPlaylist(function(){});});
    $('#playBtn').click(function() {doAction(actions.PlayPause, function(){onChangeUpdate()})});
    $('#fastForwardBtn').click(function() {playerSeek('smallforward')});
    $('#nextBtn').click(function() {playerGoNext()});

    $('#playCurrentVideoButton').click(function() {playCurrentUrl()});
    $('#queueVideoButton').click(function() {queueCurrentUrl()});
    $('#addToFavButton').click(function() {addToFavourites()});
    $('#repeatButton').click(function() {toggleRepeat()});
//    $('#testBtn').click(function() { });

    if (!hasUrlSetup()) {
        $('#setupTooltip').css("display", "block");
    }

});
