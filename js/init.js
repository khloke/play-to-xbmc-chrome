$(document).ready( function() {
    initProfiles();
    initConnectivity(function() {
        initJsonVersion();
        initVolumeSlider();
        initKeyBindings();

        clearNonPlayingPlaylist(function() {
            initVideoButton();
            initFavouritesTable();
            initQueueCount();
            initRepeatMode();
            initPlaylistNumbers();
        });
    });

    $('#previousBtn').click(function() {previous()});
    $('#rewindBtn').click(function() {playerSeek('smallbackward')});
    $('#stopBtn').click(function() {stop()});
    $('#playBtn').click(function() {playPause()});
    $('#fastForwardBtn').click(function() {playerSeek('smallforward')});
    $('#nextBtn').click(function() {next()});

    $('#playCurrentVideoButton').click(function() {playCurrentUrl($(this))});
    $('#queueVideoButton').click(function() {queueCurrentUrl($(this))});
    $('#queueListButton').click(function() {queuePlaylist($(this))});
    $('#addToFavButton').click(function() {addToFavourites()});
    $('#repeatButton').click(function() {toggleRepeat()});
    $('#playNextButton').click(function() {playNextCurrentUrl($(this))});
    $('#removeThisButton').click(function() {removeThisFromPlaylist($(this))});
    $('#clearPlaylistButton').click(function() {emptyPlaylist()});
//    $('#testBtn').click(function() { initConnectivity() });

    if (!hasUrlSetup()) {
        $('#setupTooltip').css("display", "block");
    } else if (hasBeenUpdated()) {
        $('#updateTooltip').css("display", "block");
    }
    updateVersion();

});
