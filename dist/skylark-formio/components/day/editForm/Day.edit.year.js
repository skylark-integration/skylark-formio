/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{wieght:200,type:"select",datasrc:"values",key:"fields.year.type",title:"Type",data:{values:[{label:"Number",value:"number"},{label:"Select",value:"select"}]}},{weight:203,type:"number",input:!0,key:"fields.year.minYear",label:"Minimum Year",placeholder:"1900",tooltip:"The minimum year that can be entered."},{weight:204,type:"number",input:!0,key:"fields.year.maxYear",label:"Maximum Year",placeholder:"2030",tooltip:"The maximum year that can be entered."},{weight:210,type:"textfield",input:!0,key:"fields.year.placeholder",label:"Placeholder",placeholder:"Year Placeholder",tooltip:"The placeholder text that will appear when Year field is empty."},{weight:215,type:"checkbox",label:"Hidden",tooltip:"Hide the Year part of the component.",key:"fields.year.hide",input:!0}]});
//# sourceMappingURL=../../../sourcemaps/components/day/editForm/Day.edit.year.js.map
