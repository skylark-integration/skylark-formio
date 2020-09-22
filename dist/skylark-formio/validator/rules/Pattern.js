/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(t){"use strict";class e extends t{check(t){const{pattern:e}=this.settings;return!e||new RegExp(`^${e}$`).test(t)}}return e.prototype.defaultMessage="{{field}} does not match the pattern {{settings.pattern}}",e});
//# sourceMappingURL=../../sourcemaps/validator/rules/Pattern.js.map
