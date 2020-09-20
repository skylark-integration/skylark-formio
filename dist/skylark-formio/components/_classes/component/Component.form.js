/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","./editForm/Component.edit.conditional","./editForm/Component.edit.data","./editForm/Component.edit.api","./editForm/Component.edit.display","./editForm/Component.edit.logic","./editForm/Component.edit.validation","./editForm/Component.edit.layout","./editForm/utils"],function(e,t,o,n,i,a,l,p,d){"use strict";return function(...m){const c=e.cloneDeep([{type:"tabs",key:"tabs",components:[{label:"Display",key:"display",weight:0,components:i},{label:"Data",key:"data",weight:10,components:o},{label:"Validation",key:"validation",weight:20,components:l},{label:"API",key:"api",weight:30,components:n},{label:"Conditional",key:"conditional",weight:40,components:t},{label:"Logic",key:"logic",weight:50,components:a},{label:"Layout",key:"layout",weight:60,components:p}]}]).concat(m.map(t=>({type:"tabs",key:"tabs",components:e.cloneDeep(t)})));return{components:e.unionWith(c,d.unifyComponents).concat({type:"hidden",key:"type"})}}});
//# sourceMappingURL=../../../sourcemaps/components/_classes/component/Component.form.js.map
