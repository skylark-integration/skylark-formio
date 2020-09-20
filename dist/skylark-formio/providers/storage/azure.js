/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./xhr"],function(e){"use strict";const t=t=>({uploadFile:(r,a,o,s)=>e.upload(t,"azure",(e,t)=>(e.open("PUT",t.url),e.setRequestHeader("Content-Type",r.type),e.setRequestHeader("x-ms-blob-type","BlockBlob"),r),r,a,o,s).then(()=>({storage:"azure",name:e.path([o,a]),size:r.size,type:r.type})),downloadFile:r=>t.makeRequest("file",`${t.formUrl}/storage/azure?name=${e.trim(r.name)}`,"GET")});return t.title="Azure File Services",t});
//# sourceMappingURL=../../sourcemaps/providers/storage/azure.js.map
