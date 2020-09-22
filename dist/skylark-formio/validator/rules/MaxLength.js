/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(e){"use strict";class t extends e{check(e){const t=parseInt(this.settings.length,10);return!(e&&t&&e.hasOwnProperty("length"))||e.length<=t}}return t.prototype.defaultMessage="{{field}} must have no more than {{- settings.length}} characters.",t});
//# sourceMappingURL=../../sourcemaps/validator/rules/MaxLength.js.map
