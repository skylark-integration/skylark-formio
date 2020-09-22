/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(t){"use strict";class e extends t{check(t,e,n,s){const r=this.settings.custom;if(!r)return!0;const o=this.component.evaluate(r,{valid:!0,data:e,row:n,rowIndex:s,input:t},"valid",!0);return null===o||o}}return e.prototype.defaultMessage="{{error}}",e});
//# sourceMappingURL=../../sourcemaps/validator/rules/Custom.js.map
