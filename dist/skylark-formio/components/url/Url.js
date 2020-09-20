/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../textfield/TextField"],function(e){"use strict";return class t extends e{static schema(...t){return e.schema({type:"url",label:"Url",key:"url",inputType:"url"},...t)}static get builderInfo(){return{title:"Url",group:"advanced",icon:"link",documentation:"http://help.form.io/userguide/#url",weight:20,schema:t.schema()}}constructor(e,t,r){super(e,t,r),this.validators.push("url")}get defaultSchema(){return t.schema()}elementInfo(){const e=super.elementInfo();return e.attr.type=this.component.mask?"password":"url",e}}});
//# sourceMappingURL=../../sourcemaps/components/url/Url.js.map
