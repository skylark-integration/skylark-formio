/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../multivalue/Multivalue","../../../utils/utils","../../../widgets/index","skylark-lodash"],function(t,e,s,i){"use strict";return class extends t{constructor(t,e,s){super(t,e,s),this.triggerUpdateValueAt=i.debounce(this.updateValueAt.bind(this),100)}static schema(...e){return t.schema({widget:{type:"input"}},...e)}get inputInfo(){const t={name:this.options.name,type:this.component.inputType||"text",class:"form-control",lang:this.options.language};return this.component.placeholder&&(t.placeholder=this.t(this.component.placeholder)),this.component.tabindex&&(t.tabindex=this.component.tabindex),this.disabled&&(t.disabled="disabled"),i.defaults(t,this.component.attributes),{id:this.key,type:"input",changeEvent:"input",content:"",attr:t}}get maskOptions(){return i.map(this.component.inputMasks,t=>({label:t.label,value:t.label}))}get isMultipleMasksField(){return this.component.allowMultipleMasks&&!!this.component.inputMasks&&!!this.component.inputMasks.length}getMaskByName(t){const e=i.find(this.component.inputMasks,e=>e.label===t);return e?e.mask:void 0}setInputMask(t,e){return super.setInputMask(t,e||this.component.inputMask,!this.component.placeholder)}getMaskOptions(){return this.component.inputMasks.map(t=>({label:t.label,value:t.label}))}get remainingWords(){return i.parseInt(i.get(this.component,"validate.maxWords"),10)-i.words(this.dataValue).length}renderElement(t,e){t&&"string"==typeof t&&(t=t.replace(/"/g,"&quot;"));const s=this.inputInfo;if(s.attr=s.attr||{},s.attr.value=this.getValueAsString(this.formatValue(this.parseValue(t))),this.isMultipleMasksField&&(s.attr.class+=" formio-multiple-mask-input"),this.component.widget&&"calendar"===this.component.widget.type){const t=this.renderTemplate("icon",{ref:"icon",className:this.iconClass(this.component.enableDate||this.component.widget.enableDate?"calendar":"time"),styles:"",content:""}).trim();this.component.prefix!==t&&(this.component.suffix=t)}return this.isMultipleMasksField?this.renderTemplate("multipleMasksInput",{input:s,value:t,index:e,selectOptions:this.getMaskOptions()||[]}):this.renderTemplate("input",{input:s,value:this.formatValue(this.parseValue(t)),index:e})}setCounter(t,e,s,i){if(i){const n=i-s;n>0?this.removeClass(e,"text-danger"):this.addClass(e,"text-danger"),this.setContent(e,this.t(`{{ remaining }} ${t} remaining.`,{remaining:n}))}else this.setContent(e,this.t(`{{ count }} ${t}`,{count:s}))}updateValueAt(t,e,s){if(e=e||{},i.get(this.component,"showWordCount",!1)&&this.refs.wordcount&&this.refs.wordcount[s]){const e=i.parseInt(i.get(this.component,"validate.maxWords",0),10);this.setCounter("words",this.refs.wordcount[s],i.words(t).length,e)}if(i.get(this.component,"showCharCount",!1)&&this.refs.charcount&&this.refs.charcount[s]){const e=i.parseInt(i.get(this.component,"validate.maxLength",0),10);this.setCounter("characters",this.refs.charcount[s],t.length,e)}}getValueAt(t){const e=this.performInputMapping(this.refs.input[t]);return e&&e.widget?e.widget.getValue():e?e.value:void 0}updateValue(t,e,s){e=e||{};const i=super.updateValue(t,e);return this.triggerUpdateValueAt(this.dataValue,e,s),i}parseValue(t){return t}formatValue(t){return t}attach(t){return this.loadRefs(t,{charcount:"multiple",wordcount:"multiple",prefix:"multiple",suffix:"multiple"}),super.attach(t)}getWidget(t){return t=t||0,this.refs.input&&this.refs.input[t]?this.refs.input[t].widget:null}getValueAsString(t){return super.getValueAsString(this.getWidgetValueAsString(t))}attachElement(t,e){super.attachElement(t,e),t.widget&&t.widget.destroy(),t.widget=this.createWidget(e),t.widget&&(t.widget.attach(t),this.refs.prefix&&this.refs.prefix[e]&&t.widget.addPrefix(this.refs.prefix[e]),this.refs.suffix&&this.refs.suffix[e]&&t.widget.addSuffix(this.refs.suffix[e])),this.addFocusBlurEvents(t),this.options.submitOnEnter&&this.addEventListener(t,"keypress",t=>{13===(t.keyCode||t.which)&&(t.preventDefault(),t.stopPropagation(),this.emit("submitButton"))})}createWidget(t){if(!this.component.widget)return null;const e="string"==typeof this.component.widget?{type:this.component.widget}:this.component.widget;if(!s.hasOwnProperty(e.type))return null;const i=new s[e.type](e,this.component);return i.on("update",()=>this.updateValue(i.getValue(),{modified:!0},t),!0),i.on("redraw",()=>this.redraw(),!0),i}detach(){if(super.detach(),this.refs&&this.refs.input)for(let t=0;t<=this.refs.input.length;t++){const e=this.getWidget(t);e&&e.destroy()}}addFocusBlurEvents(t){this.addEventListener(t,"focus",()=>{this.root.focusedComponent!==this?(this.root.pendingBlur&&this.root.pendingBlur(),this.root.focusedComponent=this,this.emit("focus",this)):this.root.focusedComponent===this&&this.root.pendingBlur&&(this.root.pendingBlur.cancel(),this.root.pendingBlur=null)}),this.addEventListener(t,"blur",()=>{this.root.pendingBlur=e.delay(()=>{this.emit("blur",this),"blur"===this.component.validateOn&&this.root.triggerChange({},{instance:this,component:this.component,value:this.dataValue,flags:{}}),this.root.focusedComponent=null,this.root.pendingBlur=null})})}}});
//# sourceMappingURL=../../../sourcemaps/components/_classes/input/Input.js.map
