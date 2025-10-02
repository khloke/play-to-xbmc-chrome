// Synchronize window.localStorage with chrome.storage.local so MV3 service worker polyfill stays consistent.
(function(){
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
  if (window.__lsSyncInstalled) return; // idempotent
  window.__lsSyncInstalled = true;
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);
  // Initial merge: prefer existing localStorage values, backfill from chrome.storage.local
  chrome.storage.local.get(null, data => {
    Object.keys(data || {}).forEach(k => {
      if (localStorage.getItem(k) === null) originalSetItem(k, data[k]);
    });
  });
  // Monkey-patch mutators to mirror to chrome.storage.local
  localStorage.setItem = function(key, value){
    originalSetItem(key, value);
    const o={}; o[key]=value; chrome.storage.local.set(o);
  };
  localStorage.removeItem = function(key){
    originalRemoveItem(key);
    chrome.storage.local.remove(key);
  };
  // Listen for external changes (e.g., from service worker polyfill)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    Object.keys(changes).forEach(k => {
      const c = changes[k];
      if (c.newValue === undefined) {
        originalRemoveItem(k);
      } else {
        // Avoid redundant writes triggering another storage event cascade
        if (localStorage.getItem(k) !== String(c.newValue)) {
          originalSetItem(k, c.newValue);
        }
      }
    });
  });
})();

