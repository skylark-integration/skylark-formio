/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/component/Component.form","./editForm/Content.edit.display","./editForm/Content.edit.logic"],function(t,e,o){"use strict";return function(...n){const i=t([{key:"display",components:e},{key:"data",ignore:!0},{key:"validation",ignore:!0},{key:"logic",components:o}],...n);return i.components=[{weight:0,type:"textarea",editor:"ckeditor",label:"Content",hideLabel:!0,input:!0,key:"html",as:"html",rows:3,tooltip:"The HTML template for the result data items."}].concat(i.components),i}});
//# sourceMappingURL=../../sourcemaps/components/content/Content.form.js.map
