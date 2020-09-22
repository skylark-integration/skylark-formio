/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(e){"use strict";class t extends e{check(e){return!e||e instanceof Date||"Invalid date"!==e&&"Invalid Date"!==e&&("string"==typeof e&&(e=new Date(e)),"Invalid Date"!==e.toString())}}return t.prototype.defaultMessage="{{field}} is not a valid date.",t});
//# sourceMappingURL=../../sourcemaps/validator/rules/Date.js.map
