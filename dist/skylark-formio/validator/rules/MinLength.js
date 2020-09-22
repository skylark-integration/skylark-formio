/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(t){"use strict";class e extends t{check(t){const e=parseInt(this.settings.length,10);return!(e&&t&&t.hasOwnProperty("length")&&!this.component.isEmpty(t))||t.length>=e}}return e.prototype.defaultMessage="{{field}} must have no more than {{- settings.length}} characters.",e});
//# sourceMappingURL=../../sourcemaps/validator/rules/MinLength.js.map
