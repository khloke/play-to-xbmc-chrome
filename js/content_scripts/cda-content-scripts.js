function findUrls( text )
{
    var source = (text || '').toString();
    var urlArray = [];
    var url;
    var matchArray;

    // Regular expression to find FTP, HTTP(S) and email URLs.
    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

    // Iterate through any URLs in the text.
    while( (matchArray = regexToken.exec( source )) !== null )
    {
        var token = matchArray[0];
        urlArray.push( token );
    }

    return urlArray;
}

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Received message: " + request.action);
        if (request.action == "getVideoSrc") {
            var urls = findUrls($('#player').text());
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].indexOf('.flv') >= 0 || urls[i].indexOf('.mp4') >= 0) {
                    var videoSrc = decodeURIComponent(urls[i]);
                    sendResponse({videoSrc: videoSrc});
                    return;
                }
            }
        } else {
            console.log('Unknown action: ' + request.action);
        }
    }
);