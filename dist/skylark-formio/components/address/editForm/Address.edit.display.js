/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"labelPosition",ignore:!0},{weight:20,type:"checkbox",input:!0,key:"enableManualMode",label:"Enable Manual Mode",tooltip:"Should Manual Mode be enabled for that component or not."},{weight:30,type:"textfield",input:!0,key:"switchToManualModeLabel",label:"Switch To Matual Mode Label",placeholder:"Switch To Matual Mode Label",tooltip:"The label for the checkbox used to switch to manual mode.",validate:{required:!0},customConditional:({data:e})=>Boolean(e.enableManualMode)},{weight:40,type:"checkbox",input:!0,key:"disableClearIcon",label:"Disable Clear Icon",tooltip:"Clear Icon allows easily clear component's value."}]});
//# sourceMappingURL=../../../sourcemaps/components/address/editForm/Address.edit.display.js.map
