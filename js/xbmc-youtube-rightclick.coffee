

class XBMCYoutubeRightClickPlugin
  constructor: ->
    chrome.tabs.onCreated.addListener(
      =>
        this.createContextMenu()
    )

    chrome.tabs.onRemoved.addListener(
      =>
        this.createContextMenu()
    )

    chrome.tabs.onUpdated.addListener(
      =>
        this.createContextMenu()
    )


  targetPatterns: ['*://*.youtube.com/watch?*v=*','*://*.youtu.be/*']

  createContextMenu: ->
    chrome.contextMenus.removeAll()

    chrome.contextMenus.create(
      title: "Queue Item"
      contexts: ["link"]
      targetUrlPatterns: @targetPatterns
      onclick: (info) => queueItem(info.linkUrl, (sl) -> console.log(sl))
    )


window.xbmcyoutubeplugin = new XBMCYoutubeRightClickPlugin()
window.xbmcyoutubeplugin.createContextMenu()
