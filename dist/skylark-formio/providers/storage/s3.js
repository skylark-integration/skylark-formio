/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../vendors/getify/npo","./xhr"],function(e,t){"use strict";const a=a=>({uploadFile:(e,n,r,d)=>t.upload(a,"s3",(a,d)=>{if(d.data.fileName=n,d.data.key=t.path([d.data.key,r,n]),d.signed)return a.open("PUT",d.signed),a.setRequestHeader("Content-Type",e.type),e;{const t=new FormData;for(const e in d.data)t.append(e,d.data[e]);return t.append("file",e),a.open("POST",d.url),t}},e,n,r,d).then(a=>({storage:"s3",name:n,bucket:a.bucket,key:a.data.key,url:t.path([a.url,a.data.key]),acl:a.data.acl,size:e.size,type:e.type})),downloadFile:n=>"public-read"!==n.acl?a.makeRequest("file",`${a.formUrl}/storage/s3?bucket=${t.trim(n.bucket)}&key=${t.trim(n.key)}`,"GET"):e.resolve(n)});return a.title="S3",a});
//# sourceMappingURL=../../sourcemaps/providers/storage/s3.js.map
