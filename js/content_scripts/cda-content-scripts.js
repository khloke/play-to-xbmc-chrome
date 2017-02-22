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

function showdialog(urls, done) {
//    debugger;
    for (var i = 0; i < urls.length; i++) {
        if (urls[i].indexOf('.flv') > 0 || urls[i].indexOf('.mp4') > 0) {
            var url = urls[i];
            return done(url);
        }
    }
    var buttons = [];
    for (var i = 0; i < urls.length; i++) {
        if (urls[i].indexOf('.flv') > 0 || urls[i].indexOf('.mp4') > 0) {
            var url = urls[i];
            buttons.push({
                text: url,
                click: function() {
                    done(url);
                    $(this).dialog("close");
                }
            });
        }
    }

    var layerNode= document.createElement('div');
    layerNode.setAttribute('id','x-kodi-cda-dialog');
    layerNode.setAttribute('title','Links information');
/*
    var pNode= document.createElement('p');
    pNode.innerHTML  = "<b>woow</b>";
    layerNode.appendChild(pNode);
*/
    document.body.appendChild(layerNode);

    jQuery("#x-kodi-cda-dialog").dialog({
        autoOpen: true,
        draggable: true,
        resizable: true,
        height: 'auto',
        width: "800",
        zIndex:3999,
        modal: false,
        closeOnEscape: true,
        buttons: buttons,
        open: function(event, ui) {
            $(event.target).parent().css('position','fixed');
            $(event.target).parent().css('top', '5px');
            $(event.target).parent().css('left', '10px');
        }
    });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("Received message: " + request.action);
        if (request.action == "getEmbeddedVideos" || request.action == "getVideoSrc") {
//            debugger;
            try {
                var url = $('video').attr('src');
                if( url === undefined )
                    throw "url is undefined";
                url = decodeURIComponent(url);
                showdialog([url], function(url) {
                    sendResponse({videoSrc: url});
                });
                return;
            } catch (e) {
                console.log("not html5 player:" + e);
            };
            var stext = $('#player').text();
            var es = stext.search('eval');
            var ei = stext.slice(es).search('return p');
            var ej = stext.slice(es).search(',{}');
            var et = '['+stext.slice(es+ei+10,es+ej+3)+']';
            var eo = eval(et);
            var pp=function(p,a,c,k,e,d){
                e=function(c){
                    return(
                        c<a?'':e(parseInt(c/a))
                    )+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))
                };
                if(!''.replace(/^/,String)){
                    while(c--){d[e(c)]=k[c]||e(c)}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1
                };
                while(c--){
                    if(k[c]){
                        p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])
                    }
                }
                return p
            }
            var result = pp(eo[0], eo[1], eo[2], eo[3], eo[4], eo[5]);
            var urls = findUrls(result);
            showdialog(urls, function(url) {
                    var videoSrc = decodeURIComponent(url);
                    sendResponse({videoSrc: videoSrc});
            });
        } else {
            console.log('Unknown action: ' + request.action);
        }
    }
);