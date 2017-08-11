chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "getChannelId") {
        let channelId = $('figure[data-id!=""][data-id]').attr('data-id');
        sendResponse({channelId: channelId});
    }
});