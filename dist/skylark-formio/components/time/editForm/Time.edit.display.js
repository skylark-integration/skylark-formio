/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{type:"select",input:!0,weight:40,tooltip:"Select the type of widget you'd like to use.",key:"inputType",defaultValue:"time",label:"Input Type",dataSrc:"values",data:{values:[{label:"HTML5 Time Input",value:"time"},{label:"Text Input with Mask",value:"text"}]}},{type:"textfield",input:!0,key:"format",label:"Format",placeholder:"Format",tooltip:"The moment.js format for showing the value of this field.",weight:50,defaultValue:"HH:mm",conditional:{json:{"===":[{var:"data.inputType"},"text"]}}},{key:"placeholder",ignore:!0}]});
//# sourceMappingURL=../../../sourcemaps/components/time/editForm/Time.edit.display.js.map
