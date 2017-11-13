browser.storage.sync.get().then(
    (opts) => {
        console.log("init.js: " + JSON.stringify(opts));
    });
//console.log("init.js");

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
            initVideoButton();
            getSettings(["favArray"]).then(settings => {initFavouritesTable(settings)});
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
        getSettings(["favArray"]).then(
            settings => {
                addToFavourites(settings);
        });
    });
    $('#repeatButton').click(function() {toggleRepeat()});
    $('#playNextButton').click(function() {playNextCurrentUrl($(this))});
    $('#removeThisButton').click(function() {removeThisFromPlaylist($(this))});
    $('#clearPlaylistButton').click(function() {emptyPlaylist()});
//    $('#testBtn').click(function() { initVideoButton() });

    getSettings().then(
        settings => {
        let hasUrl = hasUrlSetup(settings);
            console.log("tooltip: hasUrl: " + hasUrl);
            console.log("tooltip: hasBeenUpdated: " + hasBeenUpdated());
            console.log("tooltip: updated: " + updated);
            if (!hasUrl) {
                $('#setupTooltip').css("display", "block");
            } else if (hasBeenUpdated()) {
                $('#updateTooltip').css("display", "block");
            }
        }, onError);
    updateVersion();
});
