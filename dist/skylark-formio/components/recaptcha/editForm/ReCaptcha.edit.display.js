/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{key:"eventType",label:"Type of event",tooltip:"Specify type of event that this reCAPTCHA would react to",type:"radio",values:[{label:"Form Load",value:"formLoad"},{label:"Button Click",value:"buttonClick"}],weight:650},{key:"buttonKey",label:"Button Key",tooltip:"Specify key of button on this form that this reCAPTCHA should react to",type:"textfield",customConditional:e=>"buttonClick"===e.data.eventType,weight:660},{key:"label",ignore:!0},{key:"hideLabel",ignore:!0},{key:"labelPosition",ignore:!0},{key:"placeholder",ignore:!0},{key:"description",ignore:!0},{key:"tooltip",ignore:!0},{key:"errorLabel",ignore:!0},{key:"customClass",ignore:!0},{key:"tabindex",ignore:!0},{key:"multiple",ignore:!0},{key:"clearOnHide",ignore:!0},{key:"hidden",ignore:!0},{key:"mask",ignore:!0},{key:"dataGridLabel",ignore:!0},{key:"disabled",ignore:!0},{key:"autofocus",ignore:!0},{key:"tableView",ignore:!0}]});
//# sourceMappingURL=../../../sourcemaps/components/recaptcha/editForm/ReCaptcha.edit.display.js.map
