/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../utils/utils","../../vendors/getify/npo","fetch-ponyfill","skylark-lodash"],function(e,t,s,n){"use strict";const{fetch:l,Headers:r,Request:a}=s({Promise:t}),i=require("./Rule");module.exports=class extends i{check(t,s,i,o){if(!t||n.isEmpty(t))return!0;if(!o)return!0;const u=this.component.component,d={url:this.settings.url,method:"GET",qs:{},json:!0,headers:{}};if(n.isBoolean(d.url)){if(d.url=!!d.url,!d.url||"url"!==u.dataSrc||!u.data.url||!u.searchField)return!0;d.url=u.data.url,d.qs[u.searchField]=t,u.filter&&(d.url+=(d.url.includes("?")?"&":"?")+u.filter),u.selectFields&&(d.qs.select=u.selectFields)}return!d.url||(d.url=e.interpolate(d.url,{data:this.component.data}),d.url+=(d.url.includes("?")?"&":"?")+n.chain(d.qs).map((e,t)=>`${encodeURIComponent(t)}=${encodeURIComponent(e)}`).join("&").value(),u.data&&u.data.headers&&n.each(u.data.headers,e=>{e.key&&(d.headers[e.key]=e.value)}),u.authenticate&&this.config.token&&(d.headers["x-jwt-token"]=this.config.token),l(new a(d.url,{headers:new r(d.headers)})).then(e=>!!e.ok&&e.json()).then(e=>e&&e.length).catch(()=>!1))}},Select.prototype.defaultMessage="{{field}} contains an invalid selection"});
//# sourceMappingURL=../../sourcemaps/validator/rules/Select.js.map
