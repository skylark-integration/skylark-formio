/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./base64_url_decode"],function(e){"use strict";function r(e){this.message=e}return r.prototype=new Error,r.prototype.name="InvalidTokenError",function(t,n){if("string"!=typeof t)throw new r("Invalid token specified");var i=!0===(n=n||{}).header?0:1;try{return JSON.parse(e(t.split(".")[i]))}catch(e){throw new r("Invalid token specified: "+e.message)}}});
//# sourceMappingURL=../../sourcemaps/vendors/jwt-decode/decode.js.map
