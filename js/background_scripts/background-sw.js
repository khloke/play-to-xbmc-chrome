// Background Service Worker for MV3
// Load localStorage polyfill and then legacy scripts after syncing chrome.storage.local
importScripts('localstorage-polyfill.js');

// Minimal jQuery-like ajax implementation to satisfy existing code expectations
(function(){
  function ajax(opts){
    const method = (opts.type || 'GET').toUpperCase();
    const controller = new AbortController();
    if (opts.timeout) {
      setTimeout(()=>controller.abort(), opts.timeout);
    }
    const headers = {};
    if (opts.contentType) headers['Content-Type'] = opts.contentType;
    if (opts.username) headers['Authorization'] = 'Basic ' + btoa(opts.username + ':' + (opts.password||''));
    const fetchOpts = {method, headers, signal: controller.signal};
    if (method === 'POST') fetchOpts.body = opts.data;
    fetch(opts.url, fetchOpts).then(async res => {
      let text;
      try { text = await res.text(); } catch(e){ text=''; }
      let data = text;
      if (opts.dataType === 'json' || (opts.contentType||'').indexOf('application/json')>=0) {
        try { data = JSON.parse(text); } catch(e){}
      }
      if (res.ok) {
        if (opts.success) opts.success(data);
      } else {
        if (opts.error) opts.error(null, res.statusText);
      }
    }).catch(err => {
      if (opts.error) opts.error(null, err.message);
    });
  }
  function each(arr, cb){ if(!arr) return; for(let i=0;i<arr.length;i++){ cb(i, arr[i]); } }
  function dollarStub(input){
    return { find: function(){ return { text: function(){ return typeof input === 'string'? input : (input && input.html ? input.html : ''); } }; } };
  }
  self.jQuery = self.$ = { ajax, each };
  // Allow $(...) minimal usage in helper (very narrow implementation)
  self.$ = Object.assign(function(i){ return dollarStub(i); }, self.$);
})();

// Sync chrome.storage.local into polyfilled localStorage then load legacy scripts
chrome.storage.local.get(null, data => {
  localStorage._replaceData(data || {});
  // Load shared logic and background scripts
  importScripts('../shared.js', '../modules.js', '../xbmc-helper.js', 'background.js');
});

// Persist any storage changes initiated inside service worker (defensive; polyfill already writes)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    Object.keys(changes).forEach(k => {
      const c = changes[k];
      if (c.newValue === undefined) delete localStorage[k]; else localStorage[k] = c.newValue;
    });
  }
});
