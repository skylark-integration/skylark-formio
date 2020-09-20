/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{type:"radio",key:"modalLayout",input:!0,label:"Layout Type",inline:!0,values:[{label:"Fixed",value:"fixed"},{label:"Fluid",value:"fluid"}],defaultValue:"fluid",tooltip:"Fixed - modal with fixed width.\nFluid - Width of modal will be equal to preview width or minmal width."},{type:"number",key:"width",label:"Fixed Width",input:!0,defaultValue:300,conditional:{json:{"===":[{var:"data.modalLayout"},"fixed"]}}},{type:"number",key:"minWidth",label:"Minimum Width",input:!0,defaultValue:300,conditional:{json:{"===":[{var:"data.modalLayout"},"fluid"]}}}]});
//# sourceMappingURL=../../../sourcemaps/contrib/modaledit/editForm/ModalEdit.edit.display.js.map
