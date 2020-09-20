/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e){return!this.component.isValueHidden()&&!this.component.isEmpty(e)}},Required.prototype.defaultMessage="{{field}} is required";
//# sourceMappingURL=../../sourcemaps/validator/rules/Required.js.map
