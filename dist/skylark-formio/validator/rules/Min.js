/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash"],function(e){"use strict";const s=require("./Rule");module.exports=class extends s{check(s){const t=parseFloat(this.settings.limit);return!(!Number.isNaN(t)&&e.isNumber(s))||parseFloat(s)>=t}},Min.prototype.defaultMessage="{{field}} cannot be less than {{settings.limit}}."});
//# sourceMappingURL=../../sourcemaps/validator/rules/Min.js.map
