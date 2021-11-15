/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-langx","../../vendors/text-mask-addons/index","skylark-lodash","../../utils/utils","../number/Number"],function(e,t,i,r,s){"use strict";return class i extends s{static schema(...e){return s.schema({type:"currency",label:"Currency",key:"currency"},...e)}static get builderInfo(){return{title:"Currency",group:"advanced",icon:"usd",documentation:"http://help.form.io/userguide/#currency",weight:70,schema:i.schema()}}constructor(e,t,i){e&&!e.hasOwnProperty("delimiter")&&(e.delimiter=!0),super(e,t,i)}createNumberMask(){const i=e.get(this.component,"decimalLimit",2),s=r.getCurrencyAffixes({currency:this.component.currency,decimalLimit:i,decimalSeparator:this.decimalSeparator,lang:this.options.language});return this.prefix=this.options.prefix||s.prefix,this.suffix=this.options.suffix||s.suffix,t.createNumberMask({prefix:this.prefix,suffix:this.suffix,thousandsSeparatorSymbol:e.get(this.component,"thousandsSeparator",this.delimiter),decimalSymbol:e.get(this.component,"decimalSymbol",this.decimalSeparator),decimalLimit:i,allowNegative:e.get(this.component,"allowNegative",!0),allowDecimal:e.get(this.component,"allowDecimal",!0)})}get defaultSchema(){return i.schema()}parseNumber(e){return super.parseNumber(this.stripPrefixSuffix(e))}parseValue(e){return super.parseValue(this.stripPrefixSuffix(e))}addZerosAndFormatValue(t){if(!t&&0!==t)return;const i=e.get(this.component,"decimalLimit",2);let r,s="",a=[];if(t.includes(this.decimalSeparator)?([r,s]=t.split(this.decimalSeparator),a=[...s.split("")]):r=t,s.length<i)for(;a.length<i;)a.push("0");const u=`${r}${this.decimalSeparator}${a.join("")}`;return super.formatValue(u)}getValueAsString(e){const t=super.getValueAsString(e);return e||"0"==e?this.addZerosAndFormatValue(t):t}formatValue(e){return e&&this.disabled?this.addZerosAndFormatValue(e):super.formatValue(e)}stripPrefixSuffix(e){if("string"==typeof e)try{const t=!!this.prefix&&e.includes(this.prefix),i=!!this.suffix&&e.includes(this.suffix),r=e.includes(this.delimiter),s=e.includes(this.decimalSeparator);this.prefix&&(e=e.replace(this.prefix,"")),this.suffix&&(e=e.replace(this.suffix,"")),!t&&!i||r||s||!Number.isNaN(+e)&&e||(e="0")}catch(e){}return e}addFocusBlurEvents(e){super.addFocusBlurEvents(e),this.addEventListener(e,"blur",()=>{e.value=this.getValueAsString(this.addZerosAndFormatValue(this.parseValue(this.dataValue)))})}}});
//# sourceMappingURL=../../sourcemaps/components/currency/Currency.js.map
