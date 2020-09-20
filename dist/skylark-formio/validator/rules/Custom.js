/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e,t,s,o){const r=this.settings.custom;if(!r)return!0;const u=this.component.evaluate(r,{valid:!0,data:t,row:s,rowIndex:o,input:e},"valid",!0);return null===u||u}},Custom.prototype.defaultMessage="{{error}}";
//# sourceMappingURL=../../sourcemaps/validator/rules/Custom.js.map
