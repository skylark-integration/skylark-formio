/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../textfield/TextField"],function(e){"use strict";return class t extends e{static schema(...t){return e.schema({type:"email",label:"Email",key:"email",inputType:"email",kickbox:{enabled:!1}},...t)}static get builderInfo(){return{title:"Email",group:"advanced",icon:"at",documentation:"http://help.form.io/userguide/#email",weight:10,schema:t.schema()}}init(){super.init(),this.validators.push("email")}get defaultSchema(){return t.schema()}get inputInfo(){const e=super.inputInfo;return e.attr.type=this.component.mask?"password":"email",e}}});
//# sourceMappingURL=../../sourcemaps/components/email/Email.js.map
