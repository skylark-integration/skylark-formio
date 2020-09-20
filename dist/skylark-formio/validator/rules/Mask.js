/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../utils/utils"],function(e){"use strict";const t=require("./Rule");module.exports=class extends t{check(t){let s;if(this.component.isMultipleMasksField){const a=t?t.maskName:void 0,i=this.component.getMaskByName(a);i&&(s=e.getInputMask(i)),t=t?t.value:t}else s=e.getInputMask(this.settings.mask);return!t||!s||e.matchInputMask(t,s)}},Mask.prototype.defaultMessage="{{field}} does not match the mask."});
//# sourceMappingURL=../../sourcemaps/validator/rules/Mask.js.map
