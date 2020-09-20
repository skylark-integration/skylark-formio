/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){var n,e="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof window.msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto);if(e){var r=new Uint8Array(16);n=function(){return e(r),r}}else{var t=new Array(16);n=function(){for(var n,e=0;e<16;e++)0==(3&e)&&(n=4294967296*Math.random()),t[e]=n>>>((3&e)<<3)&255;return t}}return n});
//# sourceMappingURL=../../sourcemaps/vendors/uuid/rng.js.map
