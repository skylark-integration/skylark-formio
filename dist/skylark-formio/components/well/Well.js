/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/nested/NestedComponent"],function(e){"use strict";return class t extends e{static schema(...t){return e.schema({type:"well",key:"well",input:!1,persistent:!1,components:[]},...t)}static get builderInfo(){return{title:"Well",icon:"square-o",group:"layout",documentation:"http://help.form.io/userguide/#well",weight:60,schema:t.schema()}}get defaultSchema(){return t.schema()}get className(){return`${this.component.customClass}`}get templateName(){return"well"}constructor(...e){super(...e),this.noField=!0}}});
//# sourceMappingURL=../../sourcemaps/components/well/Well.js.map
