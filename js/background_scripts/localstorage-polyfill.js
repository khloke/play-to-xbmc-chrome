// MV3 service worker localStorage polyfill backed by chrome.storage.local
// Provides synchronous-style access patterns used by existing code (localStorage['key']).
// Data is loaded once at startup before other scripts are imported.
(function(){
  const backing = { _data: {}, _loaded: false };
  const save = (k,v)=>{ const o={}; o[k]=v; chrome.storage.local.set(o); };
  const api = new Proxy(backing, {
    get(target, prop){
      if(prop === 'setItem') return (k,v)=>{ target._data[k]=v; save(k,v); };
      if(prop === 'getItem') return (k)=> target._data[k];
      if(prop === '_replaceData') return (obj)=>{ target._data = Object.assign({}, obj); target._loaded = true; };
      if(prop === '_isLoaded') return ()=> target._loaded;
      if(prop in target) return target[prop];
      return target._data[prop];
    },
    set(target, prop, value){
      if(prop.startsWith('_')) { target[prop]=value; return true; }
      target._data[prop]=value; save(prop,value); return true;
    },
    deleteProperty(target, prop){ delete target._data[prop]; chrome.storage.local.remove(prop); return true; }
  });
  self.localStorage = api; // expose
})();

