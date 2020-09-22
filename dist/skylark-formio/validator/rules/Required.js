/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(e){"use strict";class t extends e{check(e){return!this.component.isValueHidden()&&!this.component.isEmpty(e)}}return t.prototype.defaultMessage="{{field}} is required",t});
//# sourceMappingURL=../../sourcemaps/validator/rules/Required.js.map
