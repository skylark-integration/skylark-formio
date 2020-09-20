/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(function(){"use strict";return[{weight:0,type:"textfield",input:!0,key:"key",label:"Property Name",tooltip:"The name of this field in the API endpoint.",validate:{pattern:"(\\w|\\w[\\w-.]*\\w)",patternMessage:"The property name must only contain alphanumeric characters, underscores, dots and dashes and should not be ended by dash or dot."}},{weight:100,type:"tags",input:!0,label:"Field Tags",storeas:"array",tooltip:"Tag the field for use in custom logic.",key:"tags"},{weight:200,type:"datamap",label:"Custom Properties",tooltip:"This allows you to configure any custom properties for this component.",key:"properties",valueComponent:{type:"textfield",key:"value",label:"Value",placeholder:"Value",input:!0}}]});
//# sourceMappingURL=../../../../sourcemaps/components/_classes/component/editForm/Component.edit.api.js.map
