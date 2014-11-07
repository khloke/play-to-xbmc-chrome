
function urlMatchesOneOfPatterns(url, patterns) {
    for (var i = 0; i < patterns.length; i++) {
        var pattern = patterns[i];
        if (url.match(pattern)) {
            return true;
        }
    }

    return false;
}

var DirectVideoLinkModule = {
    canHandleUrl: function(url) {
        var supportedVideoExtensions = ['avi', 'wmv', 'asf', 'flv', 'mkv', 'mp4'];
        for (var i = 0; i < supportedVideoExtensions.length; i++) {
            var extension = supportedVideoExtensions[i];
            var regex = '.*\.' + extension;
            if (url.match(regex)) {
                return true;
            }
        }

        return false;
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        callback(url);
    }
};

var DirectAudioLinkModule = {
    canHandleUrl: function(url) {
        var supportedVideoExtensions = ['mp3', 'ogg', 'midi', 'wav', 'aiff', 'aac', 'flac', 'ape', 'wma', 'm4a', 'mka'];
        for (var i = 0; i < supportedVideoExtensions.length; i++) {
            var extension = supportedVideoExtensions[i];
            var regex = '.*\.' + extension;
            if (url.match(regex)) {
                return true;
            }
        }

        return false;
    },
    getMediaType: function() {
        return 'audio';
    },
    getPluginPath: function(url, callback) {
        callback(url);
    }
};

var MagnetLinkModule = {
    canHandleUrl: function(url) {
        return url.indexOf('magnet') == 0;
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        callback('plugin://plugin.video.xbmctorrent/play/' + encodeURIComponent(url));
    }
};

var ArdMediaThekModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*ardmediathek.de/.*documentId=.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        callback('plugin://plugin.video.ardmediathek_de/?mode=playVideo&url=' + encodeURIComponent(url));
    }
};

var CollegeHumorModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*collegehumor.com/[video|embed]+/\\d+/\\w+"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('(https|http)://(www\.)?collegehumor.com/[video|embed]+/([^_&/#\?]+)')[3];
        callback('plugin://plugin.video.collegehumor/watch/' + encodeURIComponent(videoId) + '/');
    }
};

var DailyMotionModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*dailymotion.com/video/.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('(https|http)://(www\.)?dailymotion.com/video/([^_&/#\?]+)')[3];
        callback('plugin://plugin.video.dailymotion_com/?url=' + videoId + '&mode=playVideo');
    }
};

var eBaumsWorldModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*ebaumsworld.com/video/.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('(https|http)://(www\.)?ebaumsworld.com/video/watch/([^_&/#\?]+)')[3];
        callback('plugin://plugin.video.ebaumsworld_com/?url=' + videoId + '&mode=playVideo');
    }
};

var FreerideModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^.*freeride.se.*/\\d+.*$"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('^(https|http)://(www\.)?freeride.se.*/(\\d+).*$')[3];
        callback('http://v.freeride.se/encoded/mp4-hd/' + videoId + '.mp4');
    }
};

var HuluModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*hulu.com/watch.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('(https|http)://(www\.)?hulu.com/watch/([^_&/#\?]+)')[3];
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, {action: 'getContentId'}, function (response) {
                if (response) {
                    var contentId = JSON.parse(response.contentId);
                    chrome.tabs.sendMessage(tab.id, {action: 'getEid'}, function (response2) {
                        if (response2) {
                            var eId = JSON.parse(response2.eid);
                            callback(
                                'plugin://plugin.video.hulu/?mode=\\"TV_play\\"&url=\\"' + encodeURIComponent(contentId) + '\\"&videoid=\\"' +
                                    encodeURIComponent(videoId) + '\\"&eid=\\"' + encodeURIComponent(eId) + '\\"'
                            );
                        }
                    })
                }
            });
        });
    }
};

var LiveleakModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*liveleak.com/view.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, {action: 'getLiveLeakVideoUrl'}, function (response) {
                if (response) {
                    var liveLeakUrl = response.url;
                    callback(liveLeakUrl);
                }
            });
        });
    }
};

var MixcloudModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*mixcloud.com.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'audio';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('(https|http)://(www\.)?mixcloud.com(/[^_&#\?]+/[^_&#\?]+)')[3];
        callback('plugin://plugin.audio.mixcloud/?mode=40&key=' + encodeURIComponent(videoId));
    }
};

var MyCloudPlayersModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*mycloudplayers.com.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'audio';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('play=([^&]+)')[1];
        callback('plugin://plugin.audio.soundcloud/?url=plugin%3A%2F%2Fmusic%2FSoundCloud%2Ftracks%2F' + videoId + '&permalink=' + videoId + '&oauth_token=&mode=15');
    }
};

var SoundcloudModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*soundcloud.com/[^/]*/.+"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'audio';
    },
    getPluginPath: function(url, callback) {
        getSoundcloudTrackId(url, function(videoId) {
            if (videoId != null) {
                callback('plugin://plugin.audio.soundcloud/?url=plugin%3A%2F%2Fmusic%2FSoundCloud%2Ftracks%2F' + videoId + '&permalink=' + videoId + '&oauth_token=&mode=15');
            }
        });
    }
};

function getSoundcloudTrackId(url, callback) {
    var soundcloudRegex = 'url=.+tracks%2F([^&]+).+';
    jQuery.ajax({
        type: 'POST',
        url: 'http://soundcloud.com/oembed?url=' + url,
        success: function (result) {
            var iframetext = $(result).find("html").text();
            if (iframetext.indexOf('tracks')) {
                var trackId = iframetext.match(soundcloudRegex)[1];

                callback(trackId);
            } else {
                callback(null);
            }
        }
    });
}

var TwitchTvModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^(https|http)://(www\.)?twitch.tv/([^_&/#\?]+).*$"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('^(https|http)://(www\.)?twitch.tv/([^_&/#\?]+).*$')[3];
        callback('plugin://plugin.video.twitch/playLive/' + videoId + '/');
    }
};

var VimeoModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^.*vimeo.com[^/]*/\\d+.*$"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('^(https|http)://(www\.)?vimeo.com[^/]*/(\\d+).*$')[3];
        callback('plugin://plugin.video.vimeo/?action=play_video&videoid=' + videoId);
    }
};

var YoutubeModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*youtube.com/watch.*",
            ".*youtu.be/.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        if (url.match('v=([^&]+)')) {
            var videoId = url.match('v=([^&]+)')[1];
            callback('plugin://plugin.video.youtube/?action=play_video&videoid=' + videoId);
        }

        if (url.match('.*youtu.be/(.+)')) {
            var videoId = url.match('.*youtu.be/(.+)')[1];
            callback('plugin://plugin.video.youtube/?action=play_video&videoid=' + videoId);
        }
    }
};

var YleAreenaModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^(https|http)://areena.yle.fi/tv/*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        callback('plugin://plugin.video.yleareena/?view=video&link=' + encodeURIComponent(url));
    }
};

var RuutuModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^(https|http)://www.ruutu.fi/ohjelmat/*",
            "^(https|http)://www.ruutu.fi/video/f/*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        callback('plugin://plugin.video.ruutu/?view=video&link=' + encodeURIComponent(url));
    }
};

var KatsomoModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^(https|http)://www.katsomo.fi/\\?progId=(\\d+)$",
            "^(https|http)://www.mtv3katsomo.fi/\\?progId=(\\d+)$"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        callback('plugin://plugin.video.katsomo/?view=video&link=' + encodeURIComponent(url.replace('mtv3katsomo', 'katsomo')));
    }
};

var allModules = [
    DirectVideoLinkModule,
    DirectAudioLinkModule,
    MagnetLinkModule,
    YoutubeModule,
    VimeoModule,
    FreerideModule,
    CollegeHumorModule,
    DailyMotionModule,
    eBaumsWorldModule,
    ArdMediaThekModule,
    HuluModule,
    LiveleakModule,
    MixcloudModule,
    SoundcloudModule,
    MyCloudPlayersModule,
    TwitchTvModule,
    YleAreenaModule,
    RuutuModule,
    KatsomoModule
];