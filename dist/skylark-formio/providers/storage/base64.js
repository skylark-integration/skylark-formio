/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../vendors/getify/npo"],function(e){"use strict";const t=()=>({title:"Base64",name:"base64",uploadFile(t,n){const s=new FileReader;return new e((e,r)=>{s.onload=(s=>{const r=s.target.result;e({storage:"base64",name:n,url:r,size:t.size,type:t.type})}),s.onerror=(()=>r(this)),s.readAsDataURL(t)})},downloadFile:t=>e.resolve(t)});return t.title="Base64",t});
//# sourceMappingURL=../../sourcemaps/providers/storage/base64.js.map
