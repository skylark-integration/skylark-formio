/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return function(n,l,t){var u,e,a,i=null,r=0;t||(t={});var o=function(){r=!1===t.leading?0:Date.now(),i=null,a=n.apply(u,e),i||(u=e=null)};return function(){var c=Date.now();r||!1!==t.leading||(r=c);var f=l-(c-r);return u=this,e=arguments,f<=0||f>l?(i&&(clearTimeout(i),i=null),r=c,a=n.apply(u,e),i||(u=e=null)):i||!1===t.trailing||(i=setTimeout(o,f)),a}}});
//# sourceMappingURL=../../sourcemaps/vendors/signature_pad/throttle.js.map
