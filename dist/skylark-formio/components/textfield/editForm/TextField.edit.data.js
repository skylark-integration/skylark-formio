/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{type:"select",label:"Input Format",key:"inputFormat",weight:105,placeholder:"Input Format",tooltip:"Force the output of this field to be sanitized in a specific format.",template:"<span>{{ item.label }}</span>",data:{values:[{value:"plain",label:"Plain"},{value:"html",label:"HTML"},{value:"raw",label:"Raw (Insecure)"}]},defaultValue:"plain",input:!0},{weight:200,type:"radio",label:"Text Case",key:"case",tooltip:"When data is entered, you can change the case of the value.",input:!0,values:[{value:"mixed",label:"Mixed (Allow upper and lower case)"},{value:"uppercase",label:"Uppercase"},{value:"lowercase",label:"Lowercase"}]}]});
//# sourceMappingURL=../../../sourcemaps/components/textfield/editForm/TextField.edit.data.js.map
