/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"placeholder",ignore:!0},{key:"tabindex",ignore:!0},{type:"textfield",label:"Label for Key column",key:"keyLabel",tooltip:"Provide a label text for Key column (otherwise 'Key' will be used)",weight:404,input:!0},{type:"checkbox",label:"Disable Adding / Removing Rows",key:"disableAddingRemovingRows",tooltip:"Check if you want to hide Add Another button and Remove Row button",weight:405,input:!0},{type:"checkbox",label:"Show key column before value",key:"keyBeforeValue",tooltip:"Check if you would like to show the Key before the Value column.",weight:406,input:!0},{type:"textfield",label:"Add Another Text",key:"addAnother",tooltip:"Set the text of the Add Another button.",placeholder:"Add Another",weight:410,input:!0,customConditional:e=>!e.data.disableAddingRemovingRows}]});
//# sourceMappingURL=../../../sourcemaps/components/datamap/editForm/DataMap.edit.display.js.map
