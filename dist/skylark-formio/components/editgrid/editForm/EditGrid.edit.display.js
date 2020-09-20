/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"placeholder",ignore:!0},{type:"checkbox",label:"Open First Row when Empty",key:"openWhenEmpty",tooltip:"Check this if you would like to open up the first row when the EditGrid is empty",weight:1e3,input:!0,conditional:{json:{"!==":[{var:"data.modal"},!0]}}},{type:"checkbox",label:"Disable Adding / Removing Rows",key:"disableAddingRemovingRows",tooltip:"Check if you want to hide Add Another button and Remove Row button",weight:1001,input:!0,clearOnHide:!1,calculateValue:"value = data.disableAddingRemovingRows;"},{weight:1010,type:"textarea",input:!0,key:"conditionalAddButton",label:"Conditional Add Button",placeholder:"show = ...",tooltip:"Specify condition when Add Button should be displayed.",editor:"ace",as:"js",wysiwyg:{minLines:3}}]});
//# sourceMappingURL=../../../sourcemaps/components/editgrid/editForm/EditGrid.edit.display.js.map
