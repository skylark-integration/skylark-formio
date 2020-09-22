/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule","../../utils/utils","skylark-moment","skylark-lodash"],function(t,e,s,i){class n extends t{check(t){if(!t)return!0;const n=s(t),a=e.getDateSetting(this.settings.dateLimit);return!!i.isNull(a)||(a.setHours(0,0,0,0),n.isAfter(a)||n.isSame(a))}}return n.prototype.defaultMessage="{{field}} should not contain date before {{settings.dateLimit}}",n});
//# sourceMappingURL=../../sourcemaps/validator/rules/MinDate.js.map
