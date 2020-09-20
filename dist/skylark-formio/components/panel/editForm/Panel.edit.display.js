/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"labelPosition",ignore:!0},{key:"placeholder",ignore:!0},{key:"description",ignore:!0},{key:"hideLabel",ignore:!0},{key:"autofocus",ignore:!0},{key:"label",hidden:!0,calculateValue:e=>e.data.title},{key:"tabindex",hidden:!0},{weight:1,type:"textfield",input:!0,placeholder:"Panel Title",label:"Title",key:"title",tooltip:"The title text that appears in the header of this panel."},{weight:20,type:"textarea",input:!0,key:"tooltip",label:"Tooltip",placeholder:"To add a tooltip to this field, enter text here.",tooltip:"Adds a tooltip to the side of this field."},{weight:30,type:"select",input:!0,label:"Theme",key:"theme",dataSrc:"values",data:{values:[{label:"Default",value:"default"},{label:"Primary",value:"primary"},{label:"Info",value:"info"},{label:"Success",value:"success"},{label:"Danger",value:"danger"},{label:"Warning",value:"warning"}]}},{weight:40,type:"fieldset",input:!1,components:[{type:"select",input:!0,label:"Breadcrumb Type",key:"breadcrumb",dataSrc:"values",data:{values:[{label:"Default",value:"default"},{label:"Condensed",value:"condensed"},{label:"Hidden",value:"none"}]}},{input:!0,type:"checkbox",label:"Allow click on Breadcrumb",key:"breadcrumbClickable",defaultValue:!0,conditional:{json:{"!==":[{var:"data.breadcrumb"},"none"]}}},{weight:50,label:"Panel Navigation Buttons",optionsLabelPosition:"right",values:[{label:"Previous",value:"previous"},{label:"Cancel",value:"cancel"},{label:"Next",value:"next"}],inline:!0,type:"selectboxes",key:"buttonSettings",input:!0,inputType:"checkbox",defaultValue:{previous:!0,cancel:!0,next:!0}}],customConditional:e=>"wizard"===e.instance.options.editForm.display},{weight:650,type:"checkbox",label:"Collapsible",tooltip:"If checked, this will turn this Panel into a collapsible panel.",key:"collapsible",input:!0},{weight:651,type:"checkbox",label:"Initially Collapsed",tooltip:"Determines the initial collapsed state of this Panel.",key:"collapsed",input:!0,conditional:{json:{"===":[{var:"data.collapsible"},!0]}}}]});
//# sourceMappingURL=../../../sourcemaps/components/panel/editForm/Panel.edit.display.js.map