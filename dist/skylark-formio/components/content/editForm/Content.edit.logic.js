/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"logic",components:[{key:"actions",components:[{key:"actionPanel",components:[{data:{json:[{label:"Hidden",value:"hidden",type:"boolean"},{label:"Required",value:"validate.required",type:"boolean"},{label:"Disabled",value:"disabled",type:"boolean"},{label:"Label",value:"label",type:"string"},{label:"Title",value:"title",type:"string"},{label:"Tooltip",value:"tooltip",type:"string"},{label:"Description",value:"description",type:"string"},{label:"Placeholder",value:"placeholder",type:"string"},{label:"CSS Class",value:"className",type:"string"},{label:"Container Custom Class",value:"customClass",type:"string"},{label:"Content",value:"html",type:"string",component:"content"}]},key:"property"},{type:"textarea",editor:"ace",rows:10,as:"html",label:"Content",tooltip:"The content of this HTML element.",defaultValue:'<div class="well">Content</div>',key:"content",weight:30,input:!0,customConditional:e=>"property"===e.row.type&&e.row.hasOwnProperty("property")&&"string"===e.row.property.type&&"content"===e.row.property.component}]}]}]}]});
//# sourceMappingURL=../../../sourcemaps/components/content/editForm/Content.edit.logic.js.map
