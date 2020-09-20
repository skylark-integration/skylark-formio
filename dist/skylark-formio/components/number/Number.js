/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../vendors/vanilla-text-mask/maskInput","../../vendors/vanilla-text-mask/conformToMask","skylark-lodash","../../vendors/text-mask-addons/index","../_classes/input/Input","../../utils/utils"],function(e,t,a,i,s,r){"use strict";return class n extends s{static schema(...e){return s.schema({type:"number",label:"Number",key:"number",validate:{min:"",max:"",step:"any",integer:""}},...e)}static get builderInfo(){return{title:"Number",icon:"hashtag",group:"basic",documentation:"http://help.form.io/userguide/#number",weight:30,schema:n.schema()}}constructor(...e){super(...e),this.validators=this.validators.concat(["min","max"]);const t=r.getNumberSeparators(this.options.language);this.decimalSeparator=this.options.decimalSeparator=this.options.decimalSeparator||t.decimalSeparator,this.component.delimiter?(this.options.hasOwnProperty("thousandsSeparator")&&console.warn("Property 'thousandsSeparator' is deprecated. Please use i18n to specify delimiter."),this.delimiter=this.options.thousandsSeparator||t.delimiter):this.delimiter="";const i=a.get(this.component,"requireDecimal",!1);if(this.decimalLimit=r.getNumberDecimalLimit(this.component,i?2:20),a.has(this.options,`languageOverride.${this.options.language}`)){const e=a.get(this.options,`languageOverride.${this.options.language}`);this.decimalSeparator=e.decimalSeparator,this.delimiter=e.delimiter}this.numberMask=this.undefined()}createNumberMask(){return i.createNumberMask({prefix:"",suffix:"",requireDecimal:a.get(this.component,"requireDecimal",!1),thousandsSeparatorSymbol:a.get(this.component,"thousandsSeparator",this.delimiter),decimalSymbol:a.get(this.component,"decimalSymbol",this.decimalSeparator),decimalLimit:a.get(this.component,"decimalLimit",this.decimalLimit),allowNegative:a.get(this.component,"allowNegative",!0),allowDecimal:a.get(this.component,"allowDecimal",!(this.component.validate&&this.component.validate.integer))})}get defaultSchema(){return n.schema()}get defaultValue(){let e=super.defaultValue;return e||0!==this.component.defaultValue||(e=this.component.defaultValue),e}parseNumber(e){return e=e.split(this.delimiter).join("").replace(this.decimalSeparator,"."),this.component.validate&&this.component.validate.integer?parseInt(e,10):parseFloat(e)}setInputMask(t){let a="[0-9";a+=this.decimalSeparator||"",a+=this.delimiter||"",a+="]*",t.setAttribute("pattern",a),t.mask=e({inputElement:t,mask:this.numberMask})}get inputInfo(){const e=super.inputInfo;return this.component.mask?e.attr.type="password":e.attr.type="text",e.attr.inputmode="numeric",e.changeEvent="input",e}getValueAt(e){if(!this.refs.input.length||!this.refs.input[e])return null;const t=this.refs.input[e].value;return t?this.parseNumber(t):null}setValueAt(e,t,a={}){return super.setValueAt(e,this.formatValue(this.parseValue(t)),a)}parseValue(e){let t=parseFloat(e);return t=a.isNaN(t)?null:String(t).replace(".",this.decimalSeparator)}formatValue(e){return this.component.requireDecimal&&e&&!e.includes(this.decimalSeparator)?`${e}${this.decimalSeparator}${a.repeat("0",this.decimalLimit)}`:this.component.requireDecimal&&e&&e.includes(this.decimalSeparator)?`${e}${a.repeat("0",this.decimalLimit-e.split(this.decimalSeparator)[1].length)}`:e}focus(){const e=this.refs.input[0];e&&(e.focus(),e.setSelectionRange(0,e.value.length))}getMaskedValue(e){return t(null===e?"0":e.toString(),this.numberMask).conformedValue}getValueAsString(e){return e||0===e?(e=this.getWidgetValueAsString(e),Array.isArray(e)?e.map(this.getMaskedValue).join(", "):this.getMaskedValue(e)):""}addFocusBlurEvents(e){super.addFocusBlurEvents(e),this.addEventListener(e,"blur",()=>{e.value=this.getValueAsString(this.formatValue(this.parseValue(this.dataValue)))})}}});
//# sourceMappingURL=../../sourcemaps/components/number/Number.js.map