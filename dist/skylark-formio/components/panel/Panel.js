/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/nested/NestedComponent"],function(e){"use strict";return class t extends e{static schema(...t){return e.schema({label:"Panel",type:"panel",key:"panel",title:"Panel",theme:"default",breadcrumb:"default",components:[],clearOnHide:!1,input:!1,tableView:!1,persistent:!1},...t)}static get builderInfo(){return{title:"Panel",icon:"list-alt",group:"layout",documentation:"http://help.form.io/userguide/#panels",weight:30,schema:t.schema()}}get defaultSchema(){return t.schema()}checkValidity(e,t,i){return this.checkCondition(i,e)?this.getComponents().reduce((s,a)=>(!a.checkValidity(e,t,i)&&this.collapsed&&(this.collapsed=!1),a.checkValidity(e,t,i)&&s),super.checkValidity(e,t,i)):(this.setCustomValidity(""),!0)}get templateName(){return"panel"}constructor(...e){super(...e),this.noField=!0}}});
//# sourceMappingURL=../../sourcemaps/components/panel/Panel.js.map
