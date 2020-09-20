/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../textfield/TextField.form","./editForm/Currency.edit.display","./editForm/Currency.edit.data"],function(e,t,i){"use strict";return function(...n){return e([{key:"display",components:t},{key:"data",components:i},{key:"validation",components:[{key:"validate.minLength",ignore:!0},{key:"validate.maxLength",ignore:!0},{key:"validate.minWords",ignore:!0},{key:"validate.maxWords",ignore:!0},{key:"validate.pattern",ignore:!0}]}],...n)}});
//# sourceMappingURL=../../sourcemaps/components/currency/Currency.form.js.map
