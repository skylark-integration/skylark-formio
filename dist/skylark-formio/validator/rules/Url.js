/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(e){"use strict";class t extends e{check(e){return!e||/(https?:\/\/(?:www\.|(?!www)))?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/.test(e)}}return t.prototype.defaultMessage="{{field}} must be a valid url.",t});
//# sourceMappingURL=../../sourcemaps/validator/rules/Url.js.map
