/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","./Rule"],function(e,s){class t extends s{check(s){const t=parseFloat(this.settings.limit);return!(!Number.isNaN(t)&&e.isNumber(s))||parseFloat(s)>=t}}return t.prototype.defaultMessage="{{field}} cannot be less than {{settings.limit}}.",t});
//# sourceMappingURL=../../sourcemaps/validator/rules/Min.js.map
