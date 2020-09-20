/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"labelPosition",ignore:!0},{key:"placeholder",ignore:!0},{key:"description",ignore:!0},{key:"tooltip",ignore:!0},{key:"autofocus",ignore:!0},{key:"tabindex",ignore:!0},{key:"disabled",ignore:!0},{weight:150,type:"datagrid",input:!0,key:"columns",label:"Column Properties",addAnother:"Add Column",tooltip:"The width, offset, push, and pull settings for each column.",reorder:!0,components:[{type:"hidden",key:"components",defaultValue:[]},{type:"select",key:"size",defaultValue:"md",label:"Size",data:{values:[{label:"xs",value:"xs"},{label:"sm",value:"sm"},{label:"md",value:"md"},{label:"lg",value:"lg"},{label:"xl",value:"xl"}]}},{type:"number",key:"width",defaultValue:6,label:"Width"},{type:"number",key:"offset",defaultValue:0,label:"Offset"},{type:"number",key:"push",defaultValue:0,label:"Push"},{type:"number",key:"pull",defaultValue:0,label:"Pull"}]},{weight:160,type:"checkbox",label:"Auto adjust columns",tooltip:"Will automatically adjust columns based on if nested components are hidden.",key:"autoAdjust",input:!0},{weight:161,type:"checkbox",label:"Hide Column when Children Hidden",key:"hideOnChildrenHidden",tooltip:"Check this if you would like to hide any column when the children within that column are also hidden",input:!0}]});
//# sourceMappingURL=../../../sourcemaps/components/columns/editForm/Columns.edit.display.js.map
