/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/component/Component","skylark-lodash"],function(t,e){"use strict";return class n extends t{static schema(...e){return t.schema({label:"Content",type:"content",key:"content",input:!1,html:""},...e)}static get builderInfo(){return{title:"Content",group:"layout",icon:"html5",preview:!1,documentation:"http://help.form.io/userguide/#content-component",weight:5,schema:n.schema()}}get defaultSchema(){return n.schema()}get content(){if(this.builderMode)return this.component.html;const t=e.get(this.root,"submission",{});return this.component.html?this.interpolate(this.component.html,{metadata:t.metadata||{},submission:t,data:this.rootValue,row:this.data}):""}render(){return super.render(this.renderTemplate("html",{tag:"div",attrs:[],content:this.content}))}attach(t){return this.loadRefs(t,{html:"single"}),this.component.refreshOnChange&&this.on("change",()=>{this.refs.html&&this.setContent(this.refs.html,this.content)},!0),super.attach(t)}get emptyValue(){return""}}});
//# sourceMappingURL=../../sourcemaps/components/content/Content.js.map
