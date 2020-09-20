/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../textfield/TextField"],function(e){"use strict";return class t extends e{static schema(...t){return e.schema({type:"phoneNumber",label:"Phone Number",key:"phoneNumber",inputType:"tel",inputMask:"(999) 999-9999"},...t)}static get builderInfo(){return{title:"Phone Number",group:"advanced",icon:"phone-square",weight:30,documentation:"http://help.form.io/userguide/#phonenumber",schema:t.schema()}}get defaultSchema(){return t.schema()}}});
//# sourceMappingURL=../../sourcemaps/components/phonenumber/PhoneNumber.js.map
