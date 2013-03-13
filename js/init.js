$(document).ready( function() {
    initJsonVersion();
    initVolumeSlider();

    clearNonPlayingPlaylist(function() {
        initVideoButton();
        initFavouritesTable();
        initQueueCount();
        initRepeatMode();
        initPlaylistNumbers();
    });

    $('#previousBtn').click(function() {previous()});
    $('#rewindBtn').click(function() {playerSeek('smallbackward')});
    $('#stopBtn').click(function() {doAction(actions.Stop);});
    $('#playBtn').click(function() {doAction(actions.PlayPause)});
    $('#fastForwardBtn').click(function() {playerSeek('smallforward')});
    $('#nextBtn').click(function() {next()});

    $('#playCurrentVideoButton').click(function() {playCurrentUrl($(this))});
    $('#queueVideoButton').click(function() {queueCurrentUrl($(this))});
    $('#addToFavButton').click(function() {addToFavourites()});
    $('#repeatButton').click(function() {toggleRepeat()});
    $('#playNextButton').click(function() {playNextCurrentUrl($(this))});
    $('#removeThisButton').click(function() {removeThisFromPlaylist($(this))});
    $('#clearPlaylistButton').click(function() {emptyPlaylist()});
//    $('#testBtn').click(function() { initQueueCount() });

    if (!hasUrlSetup()) {
        $('#setupTooltip').css("display", "block");
    }

});
