/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../../utils/builder","skylark-lodash"],function(e,t){"use strict";return[{key:"multiple",ignore:!0},{type:"datagrid",input:!0,label:"Values",key:"values",tooltip:"The radio button values that can be picked for this field. Values are text submitted with the form data. Labels are text that appears next to the radio buttons on the form.",weight:10,reorder:!0,defaultValue:[{label:"",value:""}],components:[{label:"Label",key:"label",input:!0,type:"textfield"},{label:"Value",key:"value",input:!0,type:"textfield",allowCalculateOverride:!0,calculateValue:{_camelCase:[{var:"row.label"}]},validate:{required:!0}},{type:"select",input:!0,weight:180,label:"Shortcut",key:"shortcut",tooltip:"The shortcut key for this option.",dataSrc:"custom",valueProperty:"value",customDefaultValue:()=>"",template:"{{ item.label }}",data:{custom:a=>e.getAvailableShortcuts(t.get(a,"instance.options.editForm",{}),t.get(a,"instance.options.editComponent",{}))}}]},{type:"select",input:!0,label:"Storage Type",key:"dataType",clearOnHide:!0,tooltip:"The type to store the data. If you select something other than autotype, it will force it to that type.",weight:12,template:"<span>{{ item.label }}</span>",dataSrc:"values",data:{values:[{label:"Autotype",value:"auto"},{label:"String",value:"string"},{label:"Number",value:"number"},{label:"Boolean",value:"boolean"},{label:"Object",value:"object"}]}}]});
//# sourceMappingURL=../../../sourcemaps/components/radio/editForm/Radio.edit.data.js.map
