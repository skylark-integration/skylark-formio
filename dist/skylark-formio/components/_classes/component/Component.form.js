/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-langx","skylark-lodash","./editForm/Component.edit.conditional","./editForm/Component.edit.data","./editForm/Component.edit.api","./editForm/Component.edit.display","./editForm/Component.edit.logic","./editForm/Component.edit.validation","./editForm/Component.edit.layout","./editForm/utils"],function(t,e,o,n,i,a,l,d,p,m){"use strict";return function(...c){const s=t.clone([{type:"tabs",key:"tabs",components:[{label:"Display",key:"display",weight:0,components:a},{label:"Data",key:"data",weight:10,components:n},{label:"Validation",key:"validation",weight:20,components:d},{label:"API",key:"api",weight:30,components:i},{label:"Conditional",key:"conditional",weight:40,components:o},{label:"Logic",key:"logic",weight:50,components:l},{label:"Layout",key:"layout",weight:60,components:p}]}]).concat(c.map(e=>({type:"tabs",key:"tabs",components:t.clone(e)})));return{components:e.unionWith(s,m.unifyComponents).concat({type:"hidden",key:"type"})}}});
//# sourceMappingURL=../../../sourcemaps/components/_classes/component/Component.form.js.map
