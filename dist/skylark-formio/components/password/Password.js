/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../textfield/TextField","skylark-lodash"],function(e,t){"use strict";return class s extends e{static schema(...t){return e.schema({type:"password",label:"Password",key:"password",protected:!0,tableView:!1},...t)}static get builderInfo(){return{title:"Password",icon:"asterisk",group:"basic",documentation:"http://help.form.io/userguide/#password",weight:40,schema:s.schema()}}get defaultSchema(){return t.omit(s.schema(),["protected","tableView"])}get inputInfo(){const e=super.inputInfo;return e.attr.type="password",e}}});
//# sourceMappingURL=../../sourcemaps/components/password/Password.js.map
