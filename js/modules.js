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
        var supportedVideoExtensions = ['avi', 'wmv', 'asf', 'flv', 'mkv', 'mp4', 'webm'];
        for (var i = 0; i < supportedVideoExtensions.length; i++) {
            var extension = supportedVideoExtensions[i];
            var regex = '^.*\.' + extension + "$";
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
    },
    getEmbedSelector: function() {
        return 'video';
    }
};

var DirectAudioLinkModule = {
    canHandleUrl: function(url) {
        var supportedVideoExtensions = ['mp3', 'ogg', 'midi', 'wav', 'aiff', 'aac', 'flac', 'ape', 'wma', 'm4a', 'mka'];
        for (var i = 0; i < supportedVideoExtensions.length; i++) {
            var extension = supportedVideoExtensions[i];
            var regex = '^.*\.' + extension + "$";
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

var TorrentsLinkModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^magnet:",
            ".torrent$"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        if (localStorage['magnetAddOn'] == 'pulsar') {
            callback('plugin://plugin.video.pulsar/play?uri=' + encodeURIComponent(url));
        } else if (localStorage['magnetAddOn'] == 'kmediatorrent') {
            callback('plugin://plugin.video.kmediatorrent/play/' + encodeURIComponent(url));
        } else {
            callback('plugin://plugin.video.xbmctorrent/play/' + encodeURIComponent(url));
        }
    }
};

var AnimeLabModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*animelab.com/player.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        chrome.tabs.sendMessage(currentTabId, {action: 'getVideoSrc'}, function (response) {
            if (response) {
                callback(response.videoSrc);
            }
        });
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

var DailyMotionLiveModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*dailymotion.com/live/.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var videoId = url.match('(https|http)://([^_&/#\?]+\.)?dailymotion.com/live/([^_&/#\?]+)')[3];
        callback('plugin://plugin.video.dailymotion_com/?url=' + videoId + '&mode=playLiveVideo');
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
        chrome.tabs.sendMessage(currentTabId, {action: 'getContentId'}, function (response) {
            if (response) {
                var contentId = JSON.parse(response.contentId);
                chrome.tabs.sendMessage(currentTabId, {action: 'getEid'}, function (response2) {
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
        chrome.tabs.sendMessage(currentTabId, {action: 'getLiveLeakVideoUrl'}, function (response) {
            if (response) {
                var liveLeakUrl = response.url;
                callback(liveLeakUrl);
            }
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

var Mp4UploadModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^(https|http)://(www\.)?mp4upload.com/([a-zA-Z0-9]+)$"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        var id = url.split("/")[3];
        // get embedded data
        $.ajax({ url: 'http://www.mp4upload.com/embed-' + id + ".html", success: function(data) {
                var found = data.match("'file': '(.+?)'");
                if (found) {
                    callback(found[1]);
                }
        }});
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
                callback('plugin://plugin.audio.soundcloud/play/?audio_id=' + videoId);
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

var StreamCloudModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*streamcloud.eu/([a-zA-Z0-9]+)/.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        chrome.tabs.sendMessage(currentTabId, {action: 'getStreamCloudVideo'}, function (response) {
            if (response) {
                callback(response.url);
            }
        });
    }
};

var TwitchTvModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^(https|http)://(www\.)?twitch.tv/([^&/#\?]+).+$"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        if (url.match('/b/')) {
            var videoId = url.match('^(https|http)://(www\.)?twitch.tv/[^&/#\?]+/b/([^&/#\?]+).*$')[3];
            callback('plugin://plugin.video.twitch/playVideo/a' + videoId + '/');
        } else if (url.match('/v/')) {
            var videoId = url.match('^(https|http)://(www\.)?twitch.tv/[^&/#\?]+/v/([^&/#\?]+).*$')[3];
            callback('plugin://plugin.video.twitch/playVideo/v' + videoId + '/');
        } else if (url.match('/c/')) {
            var videoId = url.match('^(https|http)://(www\.)?twitch.tv/[^&/#\?]+/c/([^&/#\?]+).*$')[3];
            callback('plugin://plugin.video.twitch/playVideo/c' + videoId + '/');
        } else {
            var videoId = url.match('^(https|http)://(www\.)?twitch.tv/([^&/#\?]+).*$')[3];
            callback('plugin://plugin.video.twitch/playLive/' + videoId + '/');
        }
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
        callback('plugin://plugin.video.vimeo/play/?video_id=' + videoId);
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
    },
    createCustomContextMenus: function() {
        //Create context menus for embedded youtube videos
        var url = $('a.html5-title-logo').attr('href');
		var player = $('video')[0];
        if (url && url.match('v=([^&]+)')) {
            var videoId = url.match('v=([^&]+)')[1];
			
            var $youtubeContextMenu = $('ul.html5-context-menu');
            $youtubeContextMenu.append('<li><span class="playtoxbmc-icon"></span><a id="playnow-' + videoId + '" class="yt-uix-button-menu-item html5-context-menu-link" target="_blank">Play Now</a></li>');
			$youtubeContextMenu.append('<li><span class="playtoxbmc-icon"></span><a id="resume-' + videoId + '" class="yt-uix-button-menu-item html5-context-menu-link" target="_blank">Resume</a></li>');
            $youtubeContextMenu.append('<li><span class="playtoxbmc-icon"></span><a id="queue-' + videoId + '" class="yt-uix-button-menu-item html5-context-menu-link" target="_blank">Queue</a></li>');
            $youtubeContextMenu.append('<li><span class="playtoxbmc-icon"></span><a id="playnext-' + videoId + '" class="yt-uix-button-menu-item html5-context-menu-link" target="_blank">Play this Next</a></li>');
            $('.playtoxbmc-icon')
                .css('background', 'url(\'' + chrome.extension.getURL('/images/icon.png') + '\') no-repeat 3px 3px')
                .css('height', '25px')
                .css('width', '25px')
                .css('border', 'none')
                .css('background-size', '17px 17px')
                .css('float', 'left');
            $('#playnow-' + videoId).click(function () {
                player.pause();
                chrome.extension.sendMessage({action: 'playThis', url: url}, function (response) {});
                $('ul.html5-context-menu').hide();
            });
			$('#resume-' + videoId).click(function () {
				player.pause();
                chrome.extension.sendMessage({action: 'resume', url: url, currentTime: Math.round(player.currentTime)}, function (response) {});
                $('ul.html5-context-menu').hide();
            });
            $('#queue-' + videoId).click(function () {
                chrome.extension.sendMessage({action: 'queueThis', url: url}, function (response) {});
                $('ul.html5-context-menu').hide();
            });
            $('#playnext-' + videoId).click(function () {
                chrome.extension.sendMessage({action: 'playThisNext', url: url}, function (response) {});
                $('ul.html5-context-menu').hide();
            });
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

var LyndaModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*lynda.com/.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        chrome.tabs.sendMessage(currentTabId, {action: 'getVideoSrc'}, function (response) {
            if (response) {
                callback(response.videoSrc);
            }
        });
    }
};

var AcestreamModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^acestream://"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        callback('plugin://plugin.video.p2p-streams/?url=' + encodeURIComponent(url) + '&mode=1&name=acestream+title');
    }
};

var SopcastModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^sop://"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        callback('plugin://plugin.video.p2p-streams/?url=' + encodeURIComponent(url) + '&mode=2&name=title+sopcast');
    }
};

var UrgantShowModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^.*urgantshow.ru/page/\\d+/\\d+"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },

    getPluginPath: function(url, callback) {
        chrome.tabs.sendMessage(currentTabId, {action: 'getUrgantShowVideoUrl'}, function (response) {
            if (response) {
                var urgantShowLink = response.url;
                callback(urgantShowLink);
            }
        });
    }
};

var KinoLiveModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            "^.*kino-live\\.org/.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },

    getMediaType: function() {
        return 'video';
    },

    getPluginPath: function(url, callback) {
        chrome.tabs.sendMessage(currentTabId, {action: 'getKinoLiveVideoUrl'}, function (response) {
            if (response) {
                callback(response.url);
            }
        });
    }
};

var VesselLabModule = {
    canHandleUrl: function(url) {
        var validPatterns = [
            ".*vessel.com/videos/.*"
        ];
        return urlMatchesOneOfPatterns(url, validPatterns);
    },
    getMediaType: function() {
        return 'video';
    },
    getPluginPath: function(url, callback) {
        if (debugLogsEnabled) console.log("Sending message to tab '" + currentTabId + "' for video source.");
        chrome.tabs.sendMessage(currentTabId, {action: 'getVideoSrc'}, function (response) {
            if (debugLogsEnabled) {console.log("Response from content script:"); console.log(response); }
            if (response) {
                callback(response.videoSrc);
            } else {
                if (debugLogsEnabled) console.log("Did not receive response for message");
            }
        });
    }
};

var SVTPLAYModule = {
  canHandleUrl: function(url) {
      var validPatterns = [
          ".*svtplay.se/(video|klipp)/.*/.*"
      ];
      return urlMatchesOneOfPatterns(url, validPatterns);
  },
  getMediaType: function() {
      return 'video';
  },
  getPluginPath: function(url, callback) {
      var videoId = url.match('(https|http):\/\/(www\.)?svtplay\.se(\/(video|klipp)\/[0-9]{7}\/.*)')[3];
			videoId = videoId.replace(/(\?.*)/,""); // ignore everything after ? (start=auto, tab=, position=)
      callback('plugin://plugin.video.svtplay/?url=' + encodeURIComponent(videoId) + "&mode=video");
  }
};

var allModules = [
    DirectVideoLinkModule,
    DirectAudioLinkModule,
    TorrentsLinkModule,
    YoutubeModule,
    VimeoModule,
    FreerideModule,
    CollegeHumorModule,
    DailyMotionModule,
    DailyMotionLiveModule,
    eBaumsWorldModule,
    ArdMediaThekModule,
    HuluModule,
    LiveleakModule,
    MixcloudModule,
    SoundcloudModule,
    StreamCloudModule,
    SVTPLAYModule,
    MyCloudPlayersModule,
    TwitchTvModule,
    YleAreenaModule,
    RuutuModule,
    KatsomoModule,
    AcestreamModule,
    SopcastModule,
    AnimeLabModule,
    LyndaModule,
    UrgantShowModule,
    KinoLiveModule,
    VesselLabModule,
    Mp4UploadModule
];
