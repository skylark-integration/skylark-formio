/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"labelPosition",ignore:!0},{key:"placeholder",ignore:!0},{key:"description",ignore:!0},{key:"tooltip",ignore:!0},{key:"hideLabel",ignore:!0},{key:"autofocus",ignore:!0},{key:"disabled",ignore:!0},{key:"tabindex",ignore:!0},{type:"textfield",input:!0,key:"tag",weight:50,label:"HTML Tag",placeholder:"HTML Element Tag",tooltip:"The tag of this HTML element."},{type:"textfield",input:!0,key:"className",weight:60,label:"CSS Class",placeholder:"CSS Class",tooltip:"The CSS class for this HTML element."},{type:"datagrid",input:!0,label:"Attributes",key:"attrs",tooltip:"The attributes for this HTML element. Only safe attributes are allowed, such as src, href, and title.",weight:70,components:[{label:"Attribute",key:"attr",input:!0,type:"textfield"},{label:"Value",key:"value",input:!0,type:"textfield"}]},{type:"textarea",input:!0,editor:"ace",rows:10,as:"html",label:"Content",tooltip:"The content of this HTML element.",defaultValue:'<div class="well">Content</div>',key:"content",weight:80},{weight:85,type:"checkbox",label:"Refresh On Change",tooltip:"Rerender the field whenever a value on the form changes.",key:"refreshOnChange",input:!0}]});
//# sourceMappingURL=../../../sourcemaps/components/html/editForm/HTML.edit.display.js.map
