/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/component/Component.form","./editForm/Day.edit.data","./editForm/Day.edit.display","./editForm/Day.edit.validation","./editForm/Day.edit.day","./editForm/Day.edit.month","./editForm/Day.edit.year"],function(e,t,o,n,a,i,d){"use strict";return function(...y){return e([{key:"display",components:o},{key:"data",components:t},{key:"validation",components:n},{key:"day",label:"Day",weight:3,components:a},{key:"month",label:"Month",weight:3,components:i},{key:"year",label:"Year",weight:3,components:d}],...y)}});
//# sourceMappingURL=../../sourcemaps/components/day/Day.form.js.map
