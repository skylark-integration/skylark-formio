/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"multiple",ignore:!0},{type:"datagrid",input:!0,label:"Questions",key:"questions",tooltip:"The questions you would like to ask in this survey question.",weight:0,reorder:!0,defaultValue:[{label:"",value:""}],components:[{label:"Label",key:"label",input:!0,type:"textfield"},{label:"Value",key:"value",input:!0,type:"textfield",allowCalculateOverride:!0,calculateValue:{_camelCase:[{var:"row.label"}]}}]},{type:"datagrid",input:!0,label:"Values",key:"values",tooltip:"The values that can be selected per question. Example: 'Satisfied', 'Very Satisfied', etc.",weight:1,reorder:!0,defaultValue:[{label:"",value:""}],components:[{label:"Label",key:"label",input:!0,type:"textfield"},{label:"Value",key:"value",input:!0,type:"textfield",allowCalculateOverride:!0,calculateValue:{_camelCase:[{var:"row.label"}]}}]}]});
//# sourceMappingURL=../../../sourcemaps/components/survey/editForm/Survey.edit.data.js.map
