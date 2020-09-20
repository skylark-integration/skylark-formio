/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e){const{pattern:t}=this.settings;return!t||new RegExp(`^${t}$`).test(e)}},Pattern.prototype.defaultMessage="{{field}} does not match the pattern {{settings.pattern}}";
//# sourceMappingURL=../../sourcemaps/validator/rules/Pattern.js.map
