/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e,t,s,n){const{json:o}=this.settings;if(!o)return!0;const r=this.component.evaluate(o,{data:t,row:s,rowIndex:n,input:e});return null===r||r}},JSON.prototype.defaultMessage="{{error}}";
//# sourceMappingURL=../../sourcemaps/validator/rules/JSON.js.map
