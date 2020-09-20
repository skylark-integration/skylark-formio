/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash"],function(e){"use strict";function t(e){for(var t=5381,r=e.length;r;)t=33*t^e.charCodeAt(--r);return t>>>0}const r={noeval:!1,cache:{},templateSettings:{evaluate:/\{%([\s\S]+?)%\}/g,interpolate:/\{\{([\s\S]+?)\}\}/g,escape:/\{\{\{([\s\S]+?)\}\}\}/g},evaluator:(t,...n)=>r.noeval?(console.warn("No evaluations allowed for this renderer."),e.noop):("object"==typeof n[0]&&(n=e.keys(n[0])),new Function(...n,t)),template(n,a){a=a||t(n);try{return n=n.replace(/ctx\./g,""),r.cache[a]=e.template(n,r.templateSettings)}catch(e){console.warn("Error while processing template",e,n)}},interpolate(n,a){if("function"==typeof n)try{return n(a)}catch(e){return console.warn("Error interpolating template",e,a),e.message}const o=t(n=String(n));let c;if(r.cache[o])c=r.cache[o];else{if(r.noeval)return n.replace(/({{\s*(.*?)\s*}})/g,(t,r,n)=>e.get(a,n));c=r.template(n,o)}if("function"==typeof c)try{return c(a)}catch(e){return console.warn("Error interpolating template",e,n,a),e.message}return c},evaluate:(e,t)=>Array.isArray(t)?e(...t):e(t)};return r});
//# sourceMappingURL=../sourcemaps/utils/Evaluator.js.map
