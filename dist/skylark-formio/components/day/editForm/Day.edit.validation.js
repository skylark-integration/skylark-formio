/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"validate.required",ignore:!0},{key:"validate.unique",ignore:!0},{weight:0,type:"checkbox",label:"Require Day",tooltip:"A required field must be filled in before the form can be submitted.",key:"fields.day.required",input:!0},{weight:10,type:"checkbox",label:"Require Month",tooltip:"A required field must be filled in before the form can be submitted.",key:"fields.month.required",input:!0},{weight:20,type:"checkbox",label:"Require Year",tooltip:"A required field must be filled in before the form can be submitted.",key:"fields.year.required",input:!0},{weight:40,type:"textfield",label:"Minimum Day",placeholder:"yyyy-MM-dd",tooltip:"A minimum date that can be set. You can also use Moment.js functions. For example: \n \n moment().subtract(10, 'days')",key:"minDate",input:!0},{weight:30,type:"textfield",label:"Maximum Day",placeholder:"yyyy-MM-dd",tooltip:"A maximum day that can be set. You can also use Moment.js functions. For example: \n \n moment().add(10, 'days')",key:"maxDate",input:!0}]});
//# sourceMappingURL=../../../sourcemaps/components/day/editForm/Day.edit.validation.js.map
