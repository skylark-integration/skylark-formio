/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e){const t=parseInt(this.settings.length,10);return!(e&&t&&e.hasOwnProperty("length"))||e.length<=t}},MaxLength.prototype.defaultMessage="{{field}} must have no more than {{- settings.length}} characters.";
//# sourceMappingURL=../../sourcemaps/validator/rules/MaxLength.js.map
