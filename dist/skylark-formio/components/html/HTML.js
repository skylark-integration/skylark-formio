/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/component/Component","skylark-lodash"],function(t,e){"use strict";return class n extends t{static schema(...e){return t.schema({label:"HTML",type:"htmlelement",tag:"p",attrs:[],content:"",input:!1,persistent:!1},...e)}static get builderInfo(){return{title:"HTML Element",group:"layout",icon:"code",weight:0,documentation:"http://help.form.io/userguide/#html-element-component",schema:n.schema()}}get defaultSchema(){return n.schema()}get content(){if(this.builderMode)return this.component.content;const t=e.get(this.root,"submission",{});return this.component.content?this.interpolate(this.component.content,{metadata:t.metadata||{},submission:t,data:this.rootValue,row:this.data}):""}get singleTags(){return["br","img","hr"]}checkRefreshOn(t){super.checkRefreshOn(t),!this.builderMode&&this.component.refreshOnChange&&this.element&&this.conditionallyVisible(this.data,this.row)&&this.setContent(this.element,this.renderContent())}renderContent(){const t=e.get(this.root,"submission",{});return this.renderTemplate("html",{component:this.component,tag:this.component.tag,attrs:(this.component.attrs||[]).map(e=>({attr:e.attr,value:this.interpolate(e.value,{metadata:t.metadata||{},submission:t,data:this.rootValue,row:this.data})})),content:this.content,singleTags:this.singleTags})}render(){return super.render(this.renderContent())}attach(t){return this.loadRefs(t,{html:"single"}),super.attach(t)}}});
//# sourceMappingURL=../../sourcemaps/components/html/HTML.js.map
