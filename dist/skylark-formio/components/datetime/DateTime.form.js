/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/component/Component.form","./editForm/DateTime.edit.data","./editForm/DateTime.edit.date","./editForm/DateTime.edit.display","./editForm/DateTime.edit.time"],function(e,t,i,n,o){"use strict";return function(...m){return e([{key:"display",components:n},{label:"Date",key:"date",weight:1,components:i},{label:"Time",key:"time",weight:2,components:o},{key:"data",components:t}],...m)}});
//# sourceMappingURL=../../sourcemaps/components/datetime/DateTime.form.js.map
