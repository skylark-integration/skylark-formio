/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../vendors/uuid/v4","../../vendors/getify/npo"],function(e,n){"use strict";const t=()=>({title:"indexedDB",name:"indexeddb",uploadFile(t,o,d,r,i,s){if("indexedDB"in window)return new n(e=>{const n=indexedDB.open(s.indexeddb,3);n.onsuccess=function(n){const t=n.target.result;e(t)},n.onupgradeneeded=function(e){e.target.result.createObjectStore(s.indexeddbTable)}}).then(o=>{const d=new FileReader;return new n((n,r)=>{d.onload=(()=>{const d=new Blob([t],{type:t.type}),r=e(d),a={id:r,data:d,name:t.name,size:t.size,type:t.type,url:i},l=o.transaction([s.indexeddbTable],"readwrite");l.objectStore(s.indexeddbTable).put(a,r).onerror=function(e){console.log("error storing data"),console.error(e)},l.oncomplete=function(){n({storage:"indexeddb",name:t.name,size:t.size,type:t.type,url:i,id:r})}}),d.onerror=(()=>r(this)),d.readAsDataURL(t)})});console.log("This browser doesn't support IndexedDB")},downloadFile(e,t){return new n(e=>{indexedDB.open(t.indexeddb,3).onsuccess=function(n){const t=n.target.result;e(t)}}).then(o=>new n((n,d)=>{const r=o.transaction([t.indexeddbTable],"readonly"),i=r.objectStore(t.indexeddbTable).get(e.id);i.onsuccess=(()=>{r.oncomplete=(()=>{const t=i.result,o=new File([i.result.data],e.name,{type:i.result.type}),r=new FileReader;r.onload=(e=>{t.url=e.target.result,n(t)}),r.onerror=(()=>d(this)),r.readAsDataURL(o)})}),i.onerror=(()=>d(this))}))}});return t.title="IndexedDB",t});
//# sourceMappingURL=../../sourcemaps/providers/storage/indexeddb.js.map
