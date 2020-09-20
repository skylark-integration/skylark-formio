/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e){return!e||e instanceof Date||"Invalid date"!==e&&"Invalid Date"!==e&&("string"==typeof e&&(e=new Date(e)),"Invalid Date"!==e.toString())}},DateRule.prototype.defaultMessage="{{field}} is not a valid date.";
//# sourceMappingURL=../../sourcemaps/validator/rules/Date.js.map
