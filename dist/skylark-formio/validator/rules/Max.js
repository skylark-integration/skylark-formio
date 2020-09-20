/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash"],function(e){"use strict";const t=require("./Rule");module.exports=class extends t{check(t){const s=parseFloat(this.settings.limit);return!(!Number.isNaN(s)&&e.isNumber(t))||parseFloat(t)<=s}},Max.prototype.defaultMessage="{{field}} cannot be greater than {{settings.limit}}."});
//# sourceMappingURL=../../sourcemaps/validator/rules/Max.js.map
