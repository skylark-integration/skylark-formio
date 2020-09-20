/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./createTextMaskInputElement"],function(e){return function(t){const{inputElement:n}=t,u=e(t),r=({target:{value:e}})=>u.update(e);return n.addEventListener("input",r),u.update(n.value),{textMaskInputElement:u,destroy(){n.removeEventListener("input",r)}}}});
//# sourceMappingURL=../../sourcemaps/vendors/vanilla-text-mask/maskInput.js.map
