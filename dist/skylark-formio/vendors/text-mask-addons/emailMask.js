/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./emailPipe"],function(e){const n="*",t=".",c="",l="@",r="[]",i=" ",s="g",u=/[^\s]/,o=/[^.\s]/,a=/\s/g;function h(e,n,t){const c=[];return e[n]===t?c.push(t):c.push(r,t),c.push(r),c}function p(e,n){return e.split(c).map(e=>e===i?e:n?o:u)}return function(e,r){e=e.replace(a,c);const{placeholderChar:u,currentCaretPosition:o}=r,g=e.indexOf(l),f=e.lastIndexOf(t),d=f<g?-1:f;let x=h(e,g+1,l),m=h(e,d-1,t),w=function(e,n){return-1===n?e:e.slice(0,n)}(e,g),C=function(e,r,u,o){let a=c;return-1!==r&&(a=-1===u?e.slice(r+1,e.length):e.slice(r+1,u)),(a=a.replace(new RegExp(`[\\s${o}]`,s),c))===l?n:a.length<1?i:a[a.length-1]===t?a.slice(0,a.length-1):a}(e,g,d,u),E=function(e,l,r,i){let u=c;return-1!==l&&(u=e.slice(l+1,e.length)),0===(u=u.replace(new RegExp(`[\\s${r}.]`,s),c)).length?e[l-1]===t&&i!==e.length?n:c:u}(e,d,u,o);return w=p(w),C=p(C),E=p(E,!0),w.concat(x).concat(C).concat(m).concat(E)}});
//# sourceMappingURL=../../sourcemaps/vendors/text-mask-addons/emailMask.js.map
