/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/input/Input"],function(e){"use strict";return class t extends e{static schema(...t){return e.schema({type:"hidden",tableView:!1,inputType:"hidden"},...t)}static get builderInfo(){return{title:"Hidden",group:"data",icon:"user-secret",weight:0,documentation:"http://help.form.io/userguide/#hidden",schema:t.schema()}}get defaultSchema(){return t.schema()}get inputInfo(){const e=super.elementInfo();return e.type="input",e.attr.type="hidden",e.changeEvent="change",e}validateMultiple(){return!1}labelIsHidden(){return!0}get emptyValue(){return""}setValue(e,t={}){return this.updateValue(e,t)}getValue(){return this.dataValue}}});
//# sourceMappingURL=../../sourcemaps/components/hidden/Hidden.js.map
