
function runTests() {
    run(0, 0);
}

function run(moduleIndex, testConfigIndex) {
    log("Processing " + moduleIndex + " " + testConfigIndex);
    var module = allModules[moduleIndex];
    if (module) {
        while (!(module.testConfig)) {
            module = allModules[++moduleIndex];
        }

        if (module.testConfig[testConfigIndex]) {
            var testConfig = module.testConfig[testConfigIndex];
            chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
                if (tab && tab[0]) {
                    var activeTabId = tab[0].id;
                    chrome.tabs.onUpdated.addListener(function (tabId, info) {
                        if (tabId == activeTabId && info.status == "complete") {
                            var fn = window[testConfig.testAction];
                            if (typeof fn === 'function') {
                                fn(undefined, function () {
                                    getActivePlayerId(function(playerId) {
                                        //Check if player is playing
                                    });
                                    run(moduleIndex, ++testConfigIndex);
                                });
                            }
                        }
                    });

                    log("Updating tab " + activeTabId);
                    chrome.tabs.update(activeTabId, {url: testConfig.testUrl});
                }
            });
        } else {
            run(++moduleIndex, 0);
        }
    }
    log (moduleIndex + " " + testConfigIndex + " complete")
}

function log(text) {
    $('#log').append('<div>' + text + '</div>');
}