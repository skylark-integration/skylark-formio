/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../utils/utils","skylark-moment","skylark-lodash"],function(t,e,s){"use strict";const i=require("./Rule");module.exports=class extends i{check(i){if(!i)return!0;const n=e(i),a=t.getDateSetting(this.settings.dateLimit);return!!s.isNull(a)||(a.setHours(0,0,0,0),n.isAfter(a)||n.isSame(a))}},MinData.prototype.defaultMessage="{{field}} should not contain date before {{settings.dateLimit}}"});
//# sourceMappingURL=../../sourcemaps/validator/rules/MinDate.js.map
