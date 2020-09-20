/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{type:"select",input:!0,key:"displayInTimezone",label:"Display in Timezone",tooltip:"This will display the captured date time in the select timezone.",weight:30,defaultValue:"viewer",dataSrc:"values",data:{values:[{label:"of Viewer",value:"viewer"},{label:"of Submission",value:"submission"},{label:"of Location",value:"location"},{label:"UTC",value:"utc"}]}},{type:"select",input:!0,key:"timezone",label:"Select Timezone",tooltip:"Select the timezone you wish to display this Date",weight:31,lazyLoad:!0,defaultValue:"",valueProperty:"name",dataSrc:"url",data:{url:"https://cdn.form.io/timezones.json"},template:"<span>{{ item.label }}</span>",conditional:{json:{"===":[{var:"data.displayInTimezone"},"location"]}}},{type:"checkbox",input:!0,key:"useLocaleSettings",label:"Use Locale Settings",tooltip:"Use locale settings to display date and time.",weight:51},{type:"checkbox",input:!0,key:"allowInput",label:"Allow Manual Input",tooltip:"Check this if you would like to allow the user to manually enter in the date.",weight:51},{type:"textfield",input:!0,key:"format",label:"Format",placeholder:"Format",description:'Use formats provided by <a href="https://github.com/angular-ui/bootstrap/tree/master/src/dateparser/docs#uibdateparsers-format-codes" target="_blank">DateParser Codes</a>',tooltip:"The date format for displaying the datetime value.",weight:52}]});
//# sourceMappingURL=../../../sourcemaps/components/datetime/editForm/DateTime.edit.display.js.map
