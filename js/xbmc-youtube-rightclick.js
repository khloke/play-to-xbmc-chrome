(function() {
  var XBMCYoutubeRightClickPlugin;

  XBMCYoutubeRightClickPlugin = (function() {

    function XBMCYoutubeRightClickPlugin() {
      var _this = this;
      chrome.tabs.onCreated.addListener(function() {
        return _this.createContextMenu();
      });
      chrome.tabs.onRemoved.addListener(function() {
        return _this.createContextMenu();
      });
      chrome.tabs.onUpdated.addListener(function() {
        return _this.createContextMenu();
      });
    }

    XBMCYoutubeRightClickPlugin.prototype.targetPatterns = ['*://*.youtube.com/watch?*v=*', '*://*.youtu.be/*'];

    XBMCYoutubeRightClickPlugin.prototype.createContextMenu = function() {
      var _this = this;
      chrome.contextMenus.removeAll();
      return chrome.contextMenus.create({
        title: "Queue Item",
        contexts: ["link"],
        targetUrlPatterns: this.targetPatterns,
        onclick: function(info) {
          return queueItem(info.linkUrl, function(sl) {
            return console.log(sl);
          });
        }
      });
    };

    return XBMCYoutubeRightClickPlugin;

  })();

  window.xbmcyoutubeplugin = new XBMCYoutubeRightClickPlugin();

  window.xbmcyoutubeplugin.createContextMenu();

}).call(this);
