var e=function(){try{if("undefined"!=typeof indexedDB)return indexedDB;if("undefined"!=typeof webkitIndexedDB)return webkitIndexedDB;if("undefined"!=typeof mozIndexedDB)return mozIndexedDB;if("undefined"!=typeof OIndexedDB)return OIndexedDB;if("undefined"!=typeof msIndexedDB)return msIndexedDB}catch(e){return}}();function n(e,n){e=e||[],n=n||{};try{return new Blob(e,n)}catch(o){if("TypeError"!==o.name)throw o;for(var r=new("undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder),t=0;t<e.length;t+=1)r.append(e[t]);return r.getBlob(n.type)}}var r=Promise;function t(e,n){n&&e.then((function(e){n(null,e)}),(function(e){n(e)}))}function o(e,n,r){"function"==typeof n&&e.then(n),"function"==typeof r&&e.catch(r)}function a(e){return"string"!=typeof e&&(console.warn(`${e} used as a key, but it is not a string.`),e=String(e)),e}function i(){if(arguments.length&&"function"==typeof arguments[arguments.length-1])return arguments[arguments.length-1]}const c="local-forage-detect-blob-support";let u;const f={},s=Object.prototype.toString,d="readonly",l="readwrite";function v(e){return"boolean"==typeof u?r.resolve(u):function(e){return new r((function(r){var t=e.transaction(c,l),o=n([""]);t.objectStore(c).put(o,"key"),t.onabort=function(e){e.preventDefault(),e.stopPropagation(),r(!1)},t.oncomplete=function(){var e=navigator.userAgent.match(/Chrome\/(\d+)/),n=navigator.userAgent.match(/Edge\//);r(n||!e||parseInt(e[1],10)>=43)}})).catch((function(){return!1}))}(e).then((function(e){return u=e,u}))}function h(e){var n=f[e.name],t={};t.promise=new r((function(e,n){t.resolve=e,t.reject=n})),n.deferredOperations.push(t),n.dbReady?n.dbReady=n.dbReady.then((function(){return t.promise})):n.dbReady=t.promise}function b(e){var n=f[e.name].deferredOperations.pop();if(n)return n.resolve(),n.promise}function y(e,n){var r=f[e.name].deferredOperations.pop();if(r)return r.reject(n),r.promise}function g(n,t){return new r((function(r,o){if(f[n.name]=f[n.name]||{forages:[],db:null,dbReady:null,deferredOperations:[]},n.db){if(!t)return r(n.db);h(n),n.db.close()}var a=[n.name];t&&a.push(n.version);var i=e.open.apply(e,a);t&&(i.onupgradeneeded=function(e){var r=i.result;try{r.createObjectStore(n.storeName),e.oldVersion<=1&&r.createObjectStore(c)}catch(r){if("ConstraintError"!==r.name)throw r;console.warn('The database "'+n.name+'" has been upgraded from version '+e.oldVersion+" to version "+e.newVersion+', but the storage "'+n.storeName+'" already exists.')}}),i.onerror=function(e){e.preventDefault(),o(i.error)},i.onsuccess=function(){r(i.result),b(n)}}))}function m(e){return g(e,!1)}function p(e){return g(e,!0)}function _(e,n){if(!e.db)return!0;var r=!e.db.objectStoreNames.contains(e.storeName),t=e.version<e.db.version,o=e.version>e.db.version;if(t&&(e.version!==n&&console.warn('The database "'+e.name+"\" can't be downgraded from version "+e.db.version+" to version "+e.version+"."),e.version=e.db.version),o||r){if(r){var a=e.db.version+1;a>e.version&&(e.version=a)}return!0}return!1}function I(e){var r=function(e){for(var n=e.length,r=new ArrayBuffer(n),t=new Uint8Array(r),o=0;o<n;o++)t[o]=e.charCodeAt(o);return r}(atob(e.data));return n([r],{type:e.type})}function S(e){return e&&e.__local_forage_encoded_blob}function w(e){var n=this,r=n._initReady().then((function(){var e=f[n._dbInfo.name];if(e&&e.dbReady)return e.dbReady}));return o(r,e,e),r}function E(e,n,t,o){void 0===o&&(o=1);try{var a=e.db.transaction(e.storeName,n);t(null,a)}catch(a){if(o>0&&(!e.db||"InvalidStateError"===a.name||"NotFoundError"===a.name))return r.resolve().then((()=>{if(!e.db||"NotFoundError"===a.name&&!e.db.objectStoreNames.contains(e.storeName)&&e.version<=e.db.version)return e.db&&(e.version=e.db.version+1),p(e)})).then((()=>function(e){h(e);for(var n=f[e.name],r=n.forages,t=0;t<r.length;t++){const e=r[t];e._dbInfo.db&&(e._dbInfo.db.close(),e._dbInfo.db=null)}return e.db=null,m(e).then((n=>(e.db=n,_(e)?p(e):n))).then((t=>{e.db=n.db=t;for(var o=0;o<r.length;o++)r[o]._dbInfo.db=t})).catch((n=>{throw y(e,n),n}))}(e).then((function(){E(e,n,t,o-1)})))).catch(t);t(a)}}var N={_driver:"asyncStorage",_initStorage:function(e){var n=this,t={db:null};if(e)for(var o in e)t[o]=e[o];var a=f[t.name];a||(a={forages:[],db:null,dbReady:null,deferredOperations:[]},f[t.name]=a),a.forages.push(n),n._initReady||(n._initReady=n.ready,n.ready=w);var i=[];function c(){return r.resolve()}for(var u=0;u<a.forages.length;u++){var s=a.forages[u];s!==n&&i.push(s._initReady().catch(c))}var d=a.forages.slice(0);return r.all(i).then((function(){return t.db=a.db,m(t)})).then((function(e){return t.db=e,_(t,n._defaultConfig.version)?p(t):e})).then((function(e){t.db=a.db=e,n._dbInfo=t;for(var r=0;r<d.length;r++){var o=d[r];o!==n&&(o._dbInfo.db=t.db,o._dbInfo.version=t.version)}}))},_support:function(){try{if(!e||!e.open)return!1;var n="undefined"!=typeof openDatabase&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform),r="function"==typeof fetch&&-1!==fetch.toString().indexOf("[native code");return(!n||r)&&"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange}catch(e){return!1}}(),iterate:function(e,n){var o=this,a=new r((function(n,r){o.ready().then((function(){E(o._dbInfo,d,(function(t,a){if(t)return r(t);try{var i=a.objectStore(o._dbInfo.storeName).openCursor(),c=1;i.onsuccess=function(){var r=i.result;if(r){var t=r.value;S(t)&&(t=I(t));var o=e(t,r.key,c++);void 0!==o?n(o):r.continue()}else n()},i.onerror=function(){r(i.error)}}catch(e){r(e)}}))})).catch(r)}));return t(a,n),a},getItem:function(e,n){var o=this;e=a(e);var i=new r((function(n,r){o.ready().then((function(){E(o._dbInfo,d,(function(t,a){if(t)return r(t);try{var i=a.objectStore(o._dbInfo.storeName).get(e);i.onsuccess=function(){var e=i.result;void 0===e&&(e=null),S(e)&&(e=I(e)),n(e)},i.onerror=function(){r(i.error)}}catch(e){r(e)}}))})).catch(r)}));return t(i,n),i},setItem:function(e,n,o){var i=this;e=a(e);var c=new r((function(t,o){var a;i.ready().then((function(){return a=i._dbInfo,"[object Blob]"===s.call(n)?v(a.db).then((function(e){return e?n:(t=n,new r((function(e,n){var r=new FileReader;r.onerror=n,r.onloadend=function(n){var r=btoa(n.target.result||"");e({__local_forage_encoded_blob:!0,data:r,type:t.type})},r.readAsBinaryString(t)})));var t})):n})).then((function(n){E(i._dbInfo,l,(function(r,a){if(r)return o(r);try{var c=a.objectStore(i._dbInfo.storeName);null===n&&(n=void 0);var u=c.put(n,e);a.oncomplete=function(){void 0===n&&(n=null),t(n)},a.onabort=a.onerror=function(){var e=u.error?u.error:u.transaction.error;o(e)}}catch(e){o(e)}}))})).catch(o)}));return t(c,o),c},removeItem:function(e,n){var o=this;e=a(e);var i=new r((function(n,r){o.ready().then((function(){E(o._dbInfo,l,(function(t,a){if(t)return r(t);try{var i=a.objectStore(o._dbInfo.storeName).delete(e);a.oncomplete=function(){n()},a.onerror=function(){r(i.error)},a.onabort=function(){var e=i.error?i.error:i.transaction.error;r(e)}}catch(e){r(e)}}))})).catch(r)}));return t(i,n),i},clear:function(e){var n=this,o=new r((function(e,r){n.ready().then((function(){E(n._dbInfo,l,(function(t,o){if(t)return r(t);try{var a=o.objectStore(n._dbInfo.storeName).clear();o.oncomplete=function(){e()},o.onabort=o.onerror=function(){var e=a.error?a.error:a.transaction.error;r(e)}}catch(e){r(e)}}))})).catch(r)}));return t(o,e),o},length:function(e){var n=this,o=new r((function(e,r){n.ready().then((function(){E(n._dbInfo,d,(function(t,o){if(t)return r(t);try{var a=o.objectStore(n._dbInfo.storeName).count();a.onsuccess=function(){e(a.result)},a.onerror=function(){r(a.error)}}catch(e){r(e)}}))})).catch(r)}));return t(o,e),o},key:function(e,n){var o=this,a=new r((function(n,r){e<0?n(null):o.ready().then((function(){E(o._dbInfo,d,(function(t,a){if(t)return r(t);try{var i=a.objectStore(o._dbInfo.storeName),c=!1,u=i.openKeyCursor();u.onsuccess=function(){var r=u.result;r?0===e||c?n(r.key):(c=!0,r.advance(e)):n(null)},u.onerror=function(){r(u.error)}}catch(e){r(e)}}))})).catch(r)}));return t(a,n),a},keys:function(e){var n=this,o=new r((function(e,r){n.ready().then((function(){E(n._dbInfo,d,(function(t,o){if(t)return r(t);try{var a=o.objectStore(n._dbInfo.storeName).openKeyCursor(),i=[];a.onsuccess=function(){var n=a.result;n?(i.push(n.key),n.continue()):e(i)},a.onerror=function(){r(a.error)}}catch(e){r(e)}}))})).catch(r)}));return t(o,e),o},dropInstance:function(n,o){o=i.apply(this,arguments);var a,c=this.config();if((n="function"!=typeof n&&n||{}).name||(n.name=n.name||c.name,n.storeName=n.storeName||c.storeName),n.name){const t=n.name===c.name&&this._dbInfo.db?r.resolve(this._dbInfo.db):m(n).then((e=>{const r=f[n.name],t=r.forages;r.db=e;for(var o=0;o<t.length;o++)t[o]._dbInfo.db=e;return e}));a=n.storeName?t.then((t=>{if(!t.objectStoreNames.contains(n.storeName))return;const o=t.version+1;h(n);const a=f[n.name],i=a.forages;t.close();for(let e=0;e<i.length;e++){const n=i[e];n._dbInfo.db=null,n._dbInfo.version=o}const c=new r(((r,t)=>{const a=e.open(n.name,o);a.onerror=e=>{a.result.close(),t(e)},a.onupgradeneeded=()=>{a.result.deleteObjectStore(n.storeName)},a.onsuccess=()=>{const e=a.result;e.close(),r(e)}}));return c.then((e=>{a.db=e;for(let n=0;n<i.length;n++){const r=i[n];r._dbInfo.db=e,b(r._dbInfo)}})).catch((e=>{throw(y(n,e)||r.resolve()).catch((()=>{})),e}))})):t.then((t=>{h(n);const o=f[n.name],a=o.forages;t.close();for(var i=0;i<a.length;i++){a[i]._dbInfo.db=null}const c=new r(((r,t)=>{var o=e.deleteDatabase(n.name);o.onerror=o.onblocked=e=>{const n=o.result;n&&n.close(),t(e)},o.onsuccess=()=>{const e=o.result;e&&e.close(),r(e)}}));return c.then((e=>{o.db=e;for(var n=0;n<a.length;n++){b(a[n]._dbInfo)}})).catch((e=>{throw(y(n,e)||r.resolve()).catch((()=>{})),e}))}))}else a=r.reject("Invalid arguments");return t(a,o),a}};var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",R=/^~~local_forage_type~([^~]+)~/,O="__lfsc__:",D="arbf",B="blob",k="si08",j="ui08",x="uic8",T="si16",C="si32",L="ur16",z="ui32",F="fl32",M="fl64",P=Object.prototype.toString;function U(e){var n,r,t,o,a,i=.75*e.length,c=e.length,u=0;"="===e[e.length-1]&&(i--,"="===e[e.length-2]&&i--);var f=new ArrayBuffer(i),s=new Uint8Array(f);for(n=0;n<c;n+=4)r=A.indexOf(e[n]),t=A.indexOf(e[n+1]),o=A.indexOf(e[n+2]),a=A.indexOf(e[n+3]),s[u++]=r<<2|t>>4,s[u++]=(15&t)<<4|o>>2,s[u++]=(3&o)<<6|63&a;return f}function W(e){var n,r=new Uint8Array(e),t="";for(n=0;n<r.length;n+=3)t+=A[r[n]>>2],t+=A[(3&r[n])<<4|r[n+1]>>4],t+=A[(15&r[n+1])<<2|r[n+2]>>6],t+=A[63&r[n+2]];return r.length%3==2?t=t.substring(0,t.length-1)+"=":r.length%3==1&&(t=t.substring(0,t.length-2)+"=="),t}var $={serialize:function(e,n){var r="";if(e&&(r=P.call(e)),e&&("[object ArrayBuffer]"===r||e.buffer&&"[object ArrayBuffer]"===P.call(e.buffer))){var t,o=O;e instanceof ArrayBuffer?(t=e,o+=D):(t=e.buffer,"[object Int8Array]"===r?o+=k:"[object Uint8Array]"===r?o+=j:"[object Uint8ClampedArray]"===r?o+=x:"[object Int16Array]"===r?o+=T:"[object Uint16Array]"===r?o+=L:"[object Int32Array]"===r?o+=C:"[object Uint32Array]"===r?o+=z:"[object Float32Array]"===r?o+=F:"[object Float64Array]"===r?o+=M:n(new Error("Failed to get type for BinaryArray"))),n(o+W(t))}else if("[object Blob]"===r){var a=new FileReader;a.onload=function(){var r="~~local_forage_type~"+e.type+"~"+W(this.result);n(O+B+r)},a.readAsArrayBuffer(e)}else try{n(JSON.stringify(e))}catch(r){console.error("Couldn't convert value into a JSON string: ",e),n(null,r)}},deserialize:function(e){if(e.substring(0,9)!==O)return JSON.parse(e);var r,t=e.substring(13),o=e.substring(9,13);if(o===B&&R.test(t)){var a=t.match(R);r=a[1],t=t.substring(a[0].length)}var i=U(t);switch(o){case D:return i;case B:return n([i],{type:r});case k:return new Int8Array(i);case j:return new Uint8Array(i);case x:return new Uint8ClampedArray(i);case T:return new Int16Array(i);case L:return new Uint16Array(i);case C:return new Int32Array(i);case z:return new Uint32Array(i);case F:return new Float32Array(i);case M:return new Float64Array(i);default:throw new Error("Unkown type: "+o)}},stringToBuffer:U,bufferToString:W};function q(e,n,r,t){e.executeSql(`CREATE TABLE IF NOT EXISTS ${n.storeName} (id INTEGER PRIMARY KEY, key unique, value)`,[],r,t)}function H(e,n,r,t,o,a){e.executeSql(r,t,o,(function(e,i){i.code===i.SYNTAX_ERR?e.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?",[n.storeName],(function(e,c){c.rows.length?a(e,i):q(e,n,(function(){e.executeSql(r,t,o,a)}),a)}),a):a(e,i)}),a)}function K(e,n,o,i){var c=this;e=a(e);var u=new r((function(r,t){c.ready().then((function(){void 0===n&&(n=null);var a=n,u=c._dbInfo;u.serializer.serialize(n,(function(n,f){f?t(f):u.db.transaction((function(o){H(o,u,`INSERT OR REPLACE INTO ${u.storeName} (key, value) VALUES (?, ?)`,[e,n],(function(){r(a)}),(function(e,n){t(n)}))}),(function(n){if(n.code===n.QUOTA_ERR){if(i>0)return void r(K.apply(c,[e,a,o,i-1]));t(n)}}))}))})).catch(t)}));return t(u,o),u}var Q={_driver:"webSQLStorage",_initStorage:function(e){var n=this,t={db:null};if(e)for(var o in e)t[o]="string"!=typeof e[o]?e[o].toString():e[o];var a=new r((function(e,r){try{t.db=openDatabase(t.name,String(t.version),t.description,t.size)}catch(e){return r(e)}t.db.transaction((function(o){q(o,t,(function(){n._dbInfo=t,e()}),(function(e,n){r(n)}))}),r)}));return t.serializer=$,a},_support:"function"==typeof openDatabase,iterate:function(e,n){var o=this,a=new r((function(n,r){o.ready().then((function(){var t=o._dbInfo;t.db.transaction((function(o){H(o,t,`SELECT * FROM ${t.storeName}`,[],(function(r,o){for(var a=o.rows,i=a.length,c=0;c<i;c++){var u=a.item(c),f=u.value;if(f&&(f=t.serializer.deserialize(f)),void 0!==(f=e(f,u.key,c+1)))return void n(f)}n()}),(function(e,n){r(n)}))}))})).catch(r)}));return t(a,n),a},getItem:function(e,n){var o=this;e=a(e);var i=new r((function(n,r){o.ready().then((function(){var t=o._dbInfo;t.db.transaction((function(o){H(o,t,`SELECT * FROM ${t.storeName} WHERE key = ? LIMIT 1`,[e],(function(e,r){var o=r.rows.length?r.rows.item(0).value:null;o&&(o=t.serializer.deserialize(o)),n(o)}),(function(e,n){r(n)}))}))})).catch(r)}));return t(i,n),i},setItem:function(e,n,r){return K.apply(this,[e,n,r,1])},removeItem:function(e,n){var o=this;e=a(e);var i=new r((function(n,r){o.ready().then((function(){var t=o._dbInfo;t.db.transaction((function(o){H(o,t,`DELETE FROM ${t.storeName} WHERE key = ?`,[e],(function(){n()}),(function(e,n){r(n)}))}))})).catch(r)}));return t(i,n),i},clear:function(e){var n=this,o=new r((function(e,r){n.ready().then((function(){var t=n._dbInfo;t.db.transaction((function(n){H(n,t,`DELETE FROM ${t.storeName}`,[],(function(){e()}),(function(e,n){r(n)}))}))})).catch(r)}));return t(o,e),o},length:function(e){var n=this,o=new r((function(e,r){n.ready().then((function(){var t=n._dbInfo;t.db.transaction((function(n){H(n,t,`SELECT COUNT(key) as c FROM ${t.storeName}`,[],(function(n,r){var t=r.rows.item(0).c;e(t)}),(function(e,n){r(n)}))}))})).catch(r)}));return t(o,e),o},key:function(e,n){var o=this,a=new r((function(n,r){o.ready().then((function(){var t=o._dbInfo;t.db.transaction((function(o){H(o,t,`SELECT key FROM ${t.storeName} WHERE id = ? LIMIT 1`,[e+1],(function(e,r){var t=r.rows.length?r.rows.item(0).key:null;n(t)}),(function(e,n){r(n)}))}))})).catch(r)}));return t(a,n),a},keys:function(e){var n=this,o=new r((function(e,r){n.ready().then((function(){var t=n._dbInfo;t.db.transaction((function(n){H(n,t,`SELECT key FROM ${t.storeName}`,[],(function(n,r){for(var t=[],o=0;o<r.rows.length;o++)t.push(r.rows.item(o).key);e(t)}),(function(e,n){r(n)}))}))})).catch(r)}));return t(o,e),o},dropInstance:function(e,n){n=i.apply(this,arguments);var o=this.config();(e="function"!=typeof e&&e||{}).name||(e.name=e.name||o.name,e.storeName=e.storeName||o.storeName);var a,c=this;return t(a=e.name?new r((function(n){var t;t=e.name===o.name?c._dbInfo.db:openDatabase(e.name,"","",0),e.storeName?n({db:t,storeNames:[e.storeName]}):n(function(e){return new r((function(n,r){e.transaction((function(t){t.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",[],(function(r,t){for(var o=[],a=0;a<t.rows.length;a++)o.push(t.rows.item(a).name);n({db:e,storeNames:o})}),(function(e,n){r(n)}))}),(function(e){r(e)}))}))}(t))})).then((function(e){return new r((function(n,t){e.db.transaction((function(o){function a(e){return new r((function(n,r){o.executeSql(`DROP TABLE IF EXISTS ${e}`,[],(function(){n()}),(function(e,n){r(n)}))}))}for(var i=[],c=0,u=e.storeNames.length;c<u;c++)i.push(a(e.storeNames[c]));r.all(i).then((function(){n()})).catch((function(e){t(e)}))}),(function(e){t(e)}))}))})):r.reject("Invalid arguments"),n),a}};function X(e,n){var r=e.name+"/";return e.storeName!==n.storeName&&(r+=e.storeName+"/"),r}function V(){return!function(){var e="_localforage_support_test";try{return localStorage.setItem(e,!0),localStorage.removeItem(e),!1}catch(e){return!0}}()||localStorage.length>0}var G={_driver:"localStorageWrapper",_initStorage:function(e){var n={};if(e)for(var t in e)n[t]=e[t];return n.keyPrefix=X(e,this._defaultConfig),V()?(this._dbInfo=n,n.serializer=$,r.resolve()):r.reject()},_support:function(){try{return"undefined"!=typeof localStorage&&"setItem"in localStorage&&!!localStorage.setItem}catch(e){return!1}}(),iterate:function(e,n){var r=this,o=r.ready().then((function(){for(var n=r._dbInfo,t=n.keyPrefix,o=t.length,a=localStorage.length,i=1,c=0;c<a;c++){var u=localStorage.key(c);if(0===u.indexOf(t)){var f=localStorage.getItem(u);if(f&&(f=n.serializer.deserialize(f)),void 0!==(f=e(f,u.substring(o),i++)))return f}}}));return t(o,n),o},getItem:function(e,n){var r=this;e=a(e);var o=r.ready().then((function(){var n=r._dbInfo,t=localStorage.getItem(n.keyPrefix+e);return t&&(t=n.serializer.deserialize(t)),t}));return t(o,n),o},setItem:function(e,n,o){var i=this;e=a(e);var c=i.ready().then((function(){void 0===n&&(n=null);var t=n;return new r((function(r,o){var a=i._dbInfo;a.serializer.serialize(n,(function(n,i){if(i)o(i);else try{localStorage.setItem(a.keyPrefix+e,n),r(t)}catch(e){"QuotaExceededError"!==e.name&&"NS_ERROR_DOM_QUOTA_REACHED"!==e.name||o(e),o(e)}}))}))}));return t(c,o),c},removeItem:function(e,n){var r=this;e=a(e);var o=r.ready().then((function(){var n=r._dbInfo;localStorage.removeItem(n.keyPrefix+e)}));return t(o,n),o},clear:function(e){var n=this,r=n.ready().then((function(){for(var e=n._dbInfo.keyPrefix,r=localStorage.length-1;r>=0;r--){var t=localStorage.key(r);0===t.indexOf(e)&&localStorage.removeItem(t)}}));return t(r,e),r},length:function(e){var n=this.keys().then((function(e){return e.length}));return t(n,e),n},key:function(e,n){var r=this,o=r.ready().then((function(){var n,t=r._dbInfo;try{n=localStorage.key(e)}catch(e){n=null}return n&&(n=n.substring(t.keyPrefix.length)),n}));return t(o,n),o},keys:function(e){var n=this,r=n.ready().then((function(){for(var e=n._dbInfo,r=localStorage.length,t=[],o=0;o<r;o++){var a=localStorage.key(o);0===a.indexOf(e.keyPrefix)&&t.push(a.substring(e.keyPrefix.length))}return t}));return t(r,e),r},dropInstance:function(e,n){if(n=i.apply(this,arguments),!(e="function"!=typeof e&&e||{}).name){var o=this.config();e.name=e.name||o.name,e.storeName=e.storeName||o.storeName}var a,c=this;return a=e.name?new r((function(n){e.storeName?n(X(e,c._defaultConfig)):n(`${e.name}/`)})).then((function(e){for(var n=localStorage.length-1;n>=0;n--){var r=localStorage.key(n);0===r.indexOf(e)&&localStorage.removeItem(r)}})):r.reject("Invalid arguments"),t(a,n),a}};const J=(e,n)=>{const r=e.length;let t=0;for(;t<r;){if((o=e[t])===(a=n)||"number"==typeof o&&"number"==typeof a&&isNaN(o)&&isNaN(a))return!0;t++}var o,a;return!1},Y=Array.isArray||function(e){return"[object Array]"===Object.prototype.toString.call(e)},Z={},ee={},ne={INDEXEDDB:N,WEBSQL:Q,LOCALSTORAGE:G},re=[ne.INDEXEDDB._driver,ne.WEBSQL._driver,ne.LOCALSTORAGE._driver],te=["dropInstance"],oe=["clear","getItem","iterate","key","keys","length","removeItem","setItem"].concat(te),ae={description:"",driver:re.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1};function ie(e,n){e[n]=function(){const r=arguments;return e.ready().then((function(){return e[n].apply(e,r)}))}}function ce(){for(let e=1;e<arguments.length;e++){const n=arguments[e];if(n)for(let e in n)n.hasOwnProperty(e)&&(Y(n[e])?arguments[0][e]=n[e].slice():arguments[0][e]=n[e])}return arguments[0]}class ue{constructor(e){for(let e in ne)if(ne.hasOwnProperty(e)){const n=ne[e],r=n._driver;this[e]=r,Z[r]||this.defineDriver(n)}this._defaultConfig=ce({},ae),this._config=ce({},this._defaultConfig,e),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver).catch((()=>{}))}config(e){if("object"==typeof e){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(let n in e){if("storeName"===n&&(e[n]=e[n].replace(/\W/g,"_")),"version"===n&&"number"!=typeof e[n])return new Error("Database version must be a number.");this._config[n]=e[n]}return!("driver"in e)||!e.driver||this.setDriver(this._config.driver)}return"string"==typeof e?this._config[e]:this._config}defineDriver(e,n,a){const i=new r((function(n,o){try{const a=e._driver,i=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");if(!e._driver)return void o(i);const c=oe.concat("_initStorage");for(let n=0,r=c.length;n<r;n++){const r=c[n];if((!J(te,r)||e[r])&&"function"!=typeof e[r])return void o(i)}const u=function(){const n=function(e){return function(){const n=new Error(`Method ${e} is not implemented by the current driver`),o=r.reject(n);return t(o,arguments[arguments.length-1]),o}};for(let r=0,t=te.length;r<t;r++){const t=te[r];e[t]||(e[t]=n(t))}};u();const f=function(r){Z[a]&&console.info(`Redefining LocalForage driver: ${a}`),Z[a]=e,ee[a]=r,n()};"_support"in e?e._support&&"function"==typeof e._support?e._support().then(f,o):f(!!e._support):f(!0)}catch(e){o(e)}}));return o(i,n,a),i}driver(){return this._driver||null}getDriver(e,n,t){const a=Z[e]?r.resolve(Z[e]):r.reject(new Error("Driver not found."));return o(a,n,t),a}getSerializer(e){const n=r.resolve($);return o(n,e),n}ready(e){const n=this,r=n._driverSet.then((()=>(null===n._ready&&(n._ready=n._initDriver()),n._ready)));return o(r,e,e),r}setDriver(e,n,t){const a=this;Y(e)||(e=[e]);const i=this._getSupportedDrivers(e);function c(){a._config.driver=a.driver()}function u(e){return a._extend(e),c(),a._ready=a._initStorage(a._config),a._ready}const f=null!==this._driverSet?this._driverSet.catch((()=>r.resolve())):r.resolve();return this._driverSet=f.then((()=>{const e=i[0];return a._dbInfo=null,a._ready=null,a.getDriver(e).then((e=>{a._driver=e._driver,c(),a._wrapLibraryMethodsWithReady(),a._initDriver=function(e){return function(){let n=0;return function t(){for(;n<e.length;){let r=e[n];return n++,a._dbInfo=null,a._ready=null,a.getDriver(r).then(u).catch(t)}c();const o=new Error("No available storage method found.");return a._driverSet=r.reject(o),a._driverSet}()}}(i)}))})).catch((()=>{c();const e=new Error("No available storage method found.");return a._driverSet=r.reject(e),a._driverSet})),o(this._driverSet,n,t),this._driverSet}supports(e){return!!ee[e]}_extend(e){ce(this,e)}_getSupportedDrivers(e){const n=[];for(let r=0,t=e.length;r<t;r++){const t=e[r];this.supports(t)&&n.push(t)}return n}_wrapLibraryMethodsWithReady(){for(let e=0,n=oe.length;e<n;e++)ie(this,oe[e])}createInstance(e){return new ue(e)}}const fe=new ue;export{fe as default};
