/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../_classes/field/Field","../../utils/utils"],function(e,t,s){"use strict";return class u extends t{static schema(...e){return t.schema({type:"survey",label:"Survey",key:"survey",questions:[],values:[]},...e)}static get builderInfo(){return{title:"Survey",group:"advanced",icon:"list",weight:110,documentation:"http://help.form.io/userguide/#survey",schema:u.schema()}}get defaultSchema(){return u.schema()}render(){return super.render(this.renderTemplate("survey"))}attach(e){this.loadRefs(e,{input:"multiple"});const t=super.attach(e);return this.refs.input.forEach(e=>{this.disabled?e.setAttribute("disabled","disabled"):this.addEventListener(e,"change",()=>this.updateValue(null,{modified:!0}))}),this.setValue(this.dataValue),t}setValue(t,s={}){return!!t&&(e.each(this.component.questions,s=>{e.each(this.refs.input,e=>{e.name===this.getInputName(s)&&(e.checked=e.value===t[s.value])})}),this.updateValue(t,s))}get emptyValue(){return{}}getValue(){if(this.viewOnly||!this.refs.input||!this.refs.input.length)return this.dataValue;const t={};return e.each(this.component.questions,s=>{e.each(this.refs.input,e=>{if(e.checked&&e.name===this.getInputName(s))return t[s.value]=e.value,!1})}),t}set disabled(t){super.disabled=t,e.each(this.refs.input,e=>{e.disabled=!0})}get disabled(){return super.disabled}validateRequired(e,t){return!s.boolValue(e)||this.component.questions.reduce((e,s)=>e&&Boolean(t[s.value]),!0)}getInputName(e){return`${this.options.name}[${e.value}]`}}});
//# sourceMappingURL=../../sourcemaps/components/survey/Survey.js.map
