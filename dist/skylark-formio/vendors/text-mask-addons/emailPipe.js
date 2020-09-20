/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){const e="@",n=/@/g,t="",r="@.",i=".",l="..",c=[],u=/\./g;return function(o,f){const{currentCaretPosition:s,rawValue:a,previousConformedValue:d,placeholderChar:h}=f;let g=o;const x=(g=function(r){let i=0;return r.replace(n,()=>1==++i?e:t)}(g)).indexOf(r);if(null===a.match(new RegExp(`[^@\\s.${h}]`)))return t;if(-1!==g.indexOf(l)||-1!==x&&s!==x+1||-1===a.indexOf(e)&&d!==t&&-1!==a.indexOf(i))return!1;const O=g.indexOf(e);return(g.slice(O+1,g.length).match(u)||c).length>1&&g.substr(-1)===i&&s!==a.length&&(g=g.slice(0,g.length-1)),g}});
//# sourceMappingURL=../../sourcemaps/vendors/text-mask-addons/emailPipe.js.map
