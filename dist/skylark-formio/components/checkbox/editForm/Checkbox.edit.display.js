/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../../utils/builder","skylark-lodash"],function(t,e){"use strict";return[{key:"labelPosition",ignore:!0},{key:"placeholder",ignore:!0},{type:"select",input:!0,weight:350,label:"Shortcut",key:"shortcut",tooltip:"Shortcut for this component.",dataSrc:"custom",valueProperty:"value",customDefaultValue:()=>"",template:"{{ item.label }}",data:{custom:o=>t.getAvailableShortcuts(e.get(o,"instance.options.editForm",{}),e.get(o,"instance.options.editComponent",{}))}},{type:"select",input:!0,key:"inputType",label:"Input Type",tooltip:"This is the input type used for this checkbox.",dataSrc:"values",weight:410,data:{values:[{label:"Checkbox",value:"checkbox"},{label:"Radio",value:"radio"}]}},{type:"textfield",input:!0,key:"name",label:"Radio Key",tooltip:"The key used to trigger the radio button toggle.",weight:420,conditional:{json:{"===":[{var:"data.inputType"},"radio"]}}},{type:"textfield",input:!0,label:"Radio Value",key:"value",tooltip:"The value used with this radio button.",weight:430,conditional:{json:{"===":[{var:"data.inputType"},"radio"]}}}]});
//# sourceMappingURL=../../../sourcemaps/components/checkbox/editForm/Checkbox.edit.display.js.map
