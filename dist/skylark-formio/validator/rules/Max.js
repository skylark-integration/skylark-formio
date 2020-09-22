/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","./Rule"],function(e,t){"use strict";class s extends t{check(t){const s=parseFloat(this.settings.limit);return!(!Number.isNaN(s)&&e.isNumber(t))||parseFloat(t)<=s}}return s.prototype.defaultMessage="{{field}} cannot be greater than {{settings.limit}}.",s});
//# sourceMappingURL=../../sourcemaps/validator/rules/Max.js.map
