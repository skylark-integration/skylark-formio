/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../vendors/getify/npo"],function(e){"use strict";const o=o=>({uploadFile:(t,r,n,s)=>new e((e,p)=>{const a=new XMLHttpRequest;"function"==typeof s&&(a.upload.onprogress=s);const l=new FormData;l.append("name",r),l.append("dir",n),l.append("file",t),a.onerror=(e=>{e.networkError=!0,p(e)}),a.onload=(()=>{if(a.status>=200&&a.status<300){const o=JSON.parse(a.response);o.storage="dropbox",o.size=t.size,o.type=t.type,o.url=o.path_lower,e(o)}else p(a.response||"Unable to upload file")}),a.onabort=p,a.open("POST",`${o.formUrl}/storage/dropbox`);const d=o.getToken();d&&a.setRequestHeader("x-jwt-token",d),a.send(l)}),downloadFile(t){const r=o.getToken();return t.url=`${o.formUrl}/storage/dropbox?path_lower=${t.path_lower}${r?`&x-jwt-token=${r}`:""}`,e.resolve(t)}});return o.title="Dropbox",o});
//# sourceMappingURL=../../sourcemaps/providers/storage/dropbox.js.map
