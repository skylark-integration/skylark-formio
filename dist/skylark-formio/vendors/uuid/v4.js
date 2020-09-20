/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./rng","./bytesToUuid"],function(n,r){return function(e,i,t){var u=i&&t||0;"string"==typeof e&&(i="binary"===e?new Array(16):null,e=null);var a=(e=e||{}).random||(e.rng||n)();if(a[6]=15&a[6]|64,a[8]=63&a[8]|128,i)for(var f=0;f<16;++f)i[u+f]=a[f];return i||r(a)}});
//# sourceMappingURL=../../sourcemaps/vendors/uuid/v4.js.map
