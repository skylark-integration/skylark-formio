/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/nested/NestedComponent"],function(e){"use strict";return class t extends e{static schema(...t){return e.schema({label:"Field Set",key:"fieldSet",type:"fieldset",legend:"",components:[],input:!1,persistent:!1},...t)}static get builderInfo(){return{title:"Field Set",icon:"th-large",group:"layout",documentation:"http://help.form.io/userguide/#fieldset",weight:20,schema:t.schema()}}get defaultSchema(){return t.schema()}get className(){return`form-group ${super.className}`}get templateName(){return"fieldset"}constructor(...e){super(...e),this.noField=!0}}});
//# sourceMappingURL=../../sourcemaps/components/fieldset/Fieldset.js.map
