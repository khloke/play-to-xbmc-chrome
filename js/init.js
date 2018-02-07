$(document).ready( function() {
    initFocusFix();
    initWatchdog();
    initProfiles();
    initConnectivity(function() {
        initJsonVersion();
        initSeekerSlider();
        initVolumeSlider();
        initKeyBindings();

        clearNonPlayingPlaylist(function() {
            getSettings(["favArray"]).then(settings => {initFavouritesTable(settings)});
            initVideoButton();
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

    $('#queueListButton').click(function() {queuePlaylist($(this))});
    $('#addToFavButton').click(function() {
        getSettings(["favArray"]).then(settings => { addToFavourites(settings); });
    });
    $('#repeatButton').click(function() {toggleRepeat()});
    $('#playNextButton').click(function() {playNextCurrentUrl($(this))});
    $('#removeThisButton').click(function() {removeThisFromPlaylist($(this))});
    $('#clearPlaylistButton').click(function() {emptyPlaylist()});
//    $('#testBtn').click(function() { initVideoButton() });

    getSettings().then(
        settings => {
            let hasUrl = hasUrlSetup(settings);
            if (!hasUrl) {
                debugLog("Add-on not configured");
                $('#setupTooltip').css("display", "block");
            } else if (hasBeenUpdated()) {
                debugLog("Add-on has been updated");
                $('#updateTooltip').css("display", "block");
            }
            updateVersion();
        });

});
