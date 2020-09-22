/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule","../../utils/utils"],function(t,e){"use strict";class s extends t{check(t){let s;if(this.component.isMultipleMasksField){const a=t?t.maskName:void 0,n=this.component.getMaskByName(a);n&&(s=e.getInputMask(n)),t=t?t.value:t}else s=e.getInputMask(this.settings.mask);return!t||!s||e.matchInputMask(t,s)}}return s.prototype.defaultMessage="{{field}} does not match the mask.",s});
//# sourceMappingURL=../../sourcemaps/validator/rules/Mask.js.map
