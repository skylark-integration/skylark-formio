/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(e){"use strict";class t extends e{check(e){const t=this.settings;let n=/\d{4}$/.exec(e);return n=n?n[0]:null,!+t||!+n||+n>=+t}}return t.prototype.defaultMessage="{{field}} should not contain year less than {{minYear}}",t});
//# sourceMappingURL=../../sourcemaps/validator/rules/MinYear.js.map
