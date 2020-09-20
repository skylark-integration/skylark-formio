/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){var exports={set:function(e,t,n){var o=n||{},i=exports.defaults,p=o.expires||i.expires,r=o.domain||i.domain,a=void 0!==o.path?o.path:void 0!==i.path?i.path:"/",c=void 0!==o.secure?o.secure:i.secure,s=void 0!==o.httponly?o.httponly:i.httponly,d=void 0!==o.samesite?o.samesite:i.samesite,l=p?new Date("number"==typeof p?(new Date).getTime()+864e5*p:p):0;document.cookie=e.replace(/[^+#$&^`|]/g,encodeURIComponent).replace("(","%28").replace(")","%29")+"="+t.replace(/[^+#$&/:<-\[\]-}]/g,encodeURIComponent)+(l&&l.getTime()>=0?";expires="+l.toUTCString():"")+(r?";domain="+r:"")+(a?";path="+a:"")+(c?";secure":"")+(s?";httponly":"")+(d?";samesite="+d:"")},get:function(e){for(var t=document.cookie.split(";");t.length;){var n=t.pop(),o=n.indexOf("=");if(o=o<0?n.length:o,decodeURIComponent(n.slice(0,o).replace(/^\s+/,""))===e)return decodeURIComponent(n.slice(o+1))}return null},erase:function(e,t){exports.set(e,"",{expires:-1,domain:t&&t.domain,path:t&&t.path,secure:0,httponly:0})},all:function(){for(var e={},t=document.cookie.split(";");t.length;){var n=t.pop(),o=n.indexOf("=");o=o<0?n.length:o,e[decodeURIComponent(n.slice(0,o).replace(/^\s+/,""))]=decodeURIComponent(n.slice(o+1))}return e}};return exports});
//# sourceMappingURL=../../sourcemaps/vendors/browser-cookies/cookies.js.map
