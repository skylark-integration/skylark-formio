/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e){const t=parseInt(this.settings.length,10);return!t||!e||"string"!=typeof e||e.trim().split(/\s+/).length>=t}},MinWords.prototype.defaultMessage="{{field}} must have at least {{- settings.length}} words.";
//# sourceMappingURL=../../sourcemaps/validator/rules/MinWords.js.map
