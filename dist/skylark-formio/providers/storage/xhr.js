/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../vendors/getify/npo","skylark-lodash"],function(e,t){"use strict";t.trim;const o={trim:e=>_trim(e,"/"),path:e=>e.filter(e=>!!e).map(o.trim).join("/"),upload:(t,n,r,s,a,p,i)=>new e((e,l)=>{const u=new XMLHttpRequest;u.onerror=(e=>{e.networkError=!0,l(e)}),u.onabort=l,u.onload=(()=>{if(u.status>=200&&u.status<300){const t=JSON.parse(u.response),o=new XMLHttpRequest;"function"==typeof i&&(o.upload.onprogress=i),o.onerror=(e=>{e.networkError=!0,l(e)}),o.onabort=(e=>{e.networkError=!0,l(e)}),o.onload=(()=>{o.status>=200&&o.status<300?e(t):l(o.response||"Unable to upload file")}),o.onabort=l,o.send(r(o,t))}else l(u.response||"Unable to sign file")}),u.open("POST",`${t.formUrl}/storage/${n}`),u.setRequestHeader("Accept","application/json"),u.setRequestHeader("Content-Type","application/json; charset=UTF-8");const d=t.getToken();d&&u.setRequestHeader("x-jwt-token",d),u.send(JSON.stringify({name:o.path([p,a]),size:s.size,type:s.type}))})};return o});
//# sourceMappingURL=../../sourcemaps/providers/storage/xhr.js.map
