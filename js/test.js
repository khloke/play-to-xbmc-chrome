// $('#runTests').click(function () {
//     runTests();
// });

// function runTests() {
//     for (var i = 0; i < allModules.length; i++) {
//         var module = allModules[i];
//         if (module.testConfig && module.testConfig.length > 0) {
//             var currentTest = module.testConfig[0];
//             if (module.testConfig.length > 1) {
//                 for (var j = 1; j <= module.testConfig.length; j++) {
//                     var nextTestConfig = module.testConfig[j];
//                     var testUrl = nextTestConfig.testUrl;
//                     var testAction = nextTestConfig.testAction;
//                     var nextTest = j == module.testConfig.length
//                         ? function() {}
//                         : function() { runTest(nextTestConfig.testUrl, nextTestConfig.testAction)}
//                 }
//             } else {
//                 runTest(currentTest.testUrl, currentTest.testAction, function(){});
//             }
//         }
//     }
// }

function runTests() {
    run(0, 0);
}

function run(moduleIndex, testConfigIndex) {
    var module = allModules[moduleIndex];
    if (module) {
        while (!(module.testConfig)) {
            module = allModules[++moduleIndex];
        }

        if (module.testConfig[testConfigIndex]) {
            var testConfig = module.testConfig[testConfigIndex];
            chrome.tabs.query({active: true,lastFocusedWindow: true}, function (tab) {
                var activeTabId = tab[0].id;
                chrome.tabs.onUpdated.addListener(function(tabId , info) {
                    if (tabId == activeTabId && info.status == "complete") {
                        var fn = window[testConfig.testAction];
                        if(typeof fn === 'function') {
                            fn($(this), function() {
                                run(moduleIndex, ++testConfigIndex);
                            });
                        }
                        // playCurrentUrl($(this), function() {
                        //     run(moduleIndex, ++testConfigIndex);
                        // });
                    }
                });
                chrome.tabs.update(activeTabId, {url: testConfig.testUrl});
            });
        } else {
            run(moduleIndex++, 0);
        }
    }
}