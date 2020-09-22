/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule","../../utils/utils","../../vendors/getify/npo","../../vendors/fetch-ponyfill/fetch","skylark-lodash"],function(e,t,n,s,r){const{fetch:l,Headers:a,Request:i}=s({Promise:n});class o extends e{check(e,n,s,o){if(!e||r.isEmpty(e))return!0;if(!o)return!0;const u=this.component.component,d={url:this.settings.url,method:"GET",qs:{},json:!0,headers:{}};if(r.isBoolean(d.url)){if(d.url=!!d.url,!d.url||"url"!==u.dataSrc||!u.data.url||!u.searchField)return!0;d.url=u.data.url,d.qs[u.searchField]=e,u.filter&&(d.url+=(d.url.includes("?")?"&":"?")+u.filter),u.selectFields&&(d.qs.select=u.selectFields)}return!d.url||(d.url=t.interpolate(d.url,{data:this.component.data}),d.url+=(d.url.includes("?")?"&":"?")+r.chain(d.qs).map((e,t)=>`${encodeURIComponent(t)}=${encodeURIComponent(e)}`).join("&").value(),u.data&&u.data.headers&&r.each(u.data.headers,e=>{e.key&&(d.headers[e.key]=e.value)}),u.authenticate&&this.config.token&&(d.headers["x-jwt-token"]=this.config.token),l(new i(d.url,{headers:new a(d.headers)})).then(e=>!!e.ok&&e.json()).then(e=>e&&e.length).catch(()=>!1))}}return o.prototype.defaultMessage="{{field}} contains an invalid selection",o});
//# sourceMappingURL=../../sourcemaps/validator/rules/Select.js.map
