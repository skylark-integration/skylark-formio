/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e){const t=this.settings;let s=/\d{4}$/.exec(e);return s=s?s[0]:null,!+t||!+s||+s>=+t}},MinYear.prototype.defaultMessage="{{field}} should not contain year less than {{minYear}}";
//# sourceMappingURL=../../sourcemaps/validator/rules/MinYear.js.map
