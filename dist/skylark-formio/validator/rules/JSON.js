/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(e){"use strict";class t extends e{check(e,t,n,s){const{json:r}=this.settings;if(!r)return!0;const o=this.component.evaluate(r,{data:t,row:n,rowIndex:s,input:e});return null===o||o}}return t.prototype.defaultMessage="{{error}}",t});
//# sourceMappingURL=../../sourcemaps/validator/rules/JSON.js.map
