/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule","../../utils/utils","skylark-moment","skylark-lodash"],function(t,e,s,i){"use strict";class n extends t{check(t){if(!t)return!0;if(t===this.settings.dateLimit)return!0;const n=s(t),r=e.getDateSetting(this.settings.dateLimit);return!!i.isNull(r)||(r.setHours(0,0,0,0),n.isBefore(r)||n.isSame(r))}}return n.prototype.defaultMessage="{{field}} should not contain date after {{settings.dateLimit}}",n});
//# sourceMappingURL=../../sourcemaps/validator/rules/MaxDate.js.map
