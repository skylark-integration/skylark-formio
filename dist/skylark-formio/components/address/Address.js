/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../../vendors/kraaden/autocompleter","skylark-lodash","../../Formio","../../providers/address/GoogleAddressProvider","../_classes/field/Field","../_classes/nested/NestedComponent","../container/Container"],function(e,t,s,i,a,o,n){"use strict";const r="autocomplete",d="manual",h="show = _.get(instance, 'parent.manualMode', false);";return class l extends n{static schema(...e){return n.schema({type:"address",label:"Address",key:"address",switchToManualModeLabel:"Can't find address? Switch to manual mode.",provider:"",providerOptions:{},manualModeViewString:"",hideLabel:!1,disableClearIcon:!1,enableManualMode:!1,components:[{label:"Address 1",tableView:!1,key:"address1",type:"textfield",input:!0,customConditional:h},{label:"Address 2",tableView:!1,key:"address2",type:"textfield",input:!0,customConditional:h},{label:"City",tableView:!1,key:"city",type:"textfield",input:!0,customConditional:h},{label:"State",tableView:!1,key:"state",type:"textfield",input:!0,customConditional:h},{label:"Country",tableView:!1,key:"country",type:"textfield",input:!0,customConditional:h},{label:"Zip Code",tableView:!1,key:"zip",type:"textfield",input:!0,customConditional:h}]},...e)}static get builderInfo(){return{title:"Address",group:"advanced",icon:"home",documentation:"http://help.form.io/userguide/#address",weight:35,schema:l.schema()}}mergeSchema(e={}){let{defaultSchema:s}=this;return e.components&&(s=t.omit(s,"components")),t.defaultsDeep(e,s)}init(){if(this.components=this.components||[],(this.builderMode||this.manualModeEnabled)&&o.prototype.addComponents.call(this,this.manualMode?this.address:{}),a.prototype.init.call(this),!this.builderMode)if(this.component.provider){const{provider:e,providerOptions:t}=this.component;this.provider=this.initializeProvider(e,t)}else if(this.component.map){this.component.provider=i.name,this.component.providerOptions=this.component.providerOptions||{};const{map:e,provider:s,providerOptions:a}=this.component,{key:o,region:n}=e;o&&t.set(a,"params.key",o),n&&t.set(a,"params.region",n),this.provider=this.initializeProvider(s,a)}}initializeProvider(e,t={}){return new(s.Providers.getProvider("address",e))(t)}get emptyValue(){return this.manualModeEnabled?{mode:r,address:{}}:{}}get mode(){return this.manualModeEnabled?this.dataValue?this.dataValue.mode:this.dataValue:r}set mode(e){this.manualModeEnabled&&(this.dataValue.mode=e)}get autocompleteMode(){return this.mode===r}get manualMode(){return this.mode===d}get manualModeEnabled(){return Boolean(this.component.enableManualMode)}restoreComponentsContext(){this.getComponents().forEach(e=>{e.data=this.address,e.setValue(e.dataValue,{noUpdateEvent:!0})})}get address(){return this.manualModeEnabled&&this.dataValue?this.dataValue.address:this.dataValue}set address(e){this.manualModeEnabled?this.dataValue.address=e:this.dataValue=e}get defaultSchema(){return l.schema()}isValueInLegacyFormat(e){return e&&!e.mode}normalizeValue(e){return this.manualModeEnabled&&this.isValueInLegacyFormat(e)?{mode:r,address:e}:e}setValue(e,t={}){const s=a.prototype.setValue.call(this,e,t);return this.manualMode&&this.restoreComponentsContext(),s&&this.redraw(),s}static get modeSwitcherRef(){return"modeSwitcher"}static get removeValueIconRef(){return"removeValueIcon"}static get searchInputRef(){return"searchInput"}get modeSwitcher(){return this.refs&&this.refs[l.modeSwitcherRef]||null}get removeValueIcon(){return this.refs&&this.refs[l.removeValueIconRef]||null}get searchInput(){return this.refs&&this.refs[l.searchInputRef]||null}get searchInputAttributes(){const e={name:this.options.name,type:"text",class:"form-control",lang:this.options.language,tabindex:this.component.tabindex||0};return this.component.placeholder&&(e.placeholder=this.t(this.component.placeholder)),this.disabled&&(e.disabled="disabled"),t.defaults(e,this.component.attributes),e}get templateName(){return"address"}render(){return super.render(this.renderTemplate(this.templateName,{children:this.builderMode||this.manualModeEnabled?this.renderComponents():"",nestedKey:this.nestedKey,inputAttributes:this.searchInputAttributes,ref:{modeSwitcher:l.modeSwitcherRef,removeValueIcon:l.removeValueIconRef,searchInput:l.searchInputRef},displayValue:this.getDisplayValue(),mode:{autocomplete:this.autocompleteMode,manual:this.manualMode}}))}attach(t){const s=(this.builderMode||this.manualMode?super.attach:a.prototype.attach).call(this,t);if(!this.builderMode&&!this.provider&&this.component.provider){const{provider:e,providerOptions:t}=this.component;this.provider=this.initializeProvider(e,t)}if(this.loadRefs(t,{[l.modeSwitcherRef]:"single",[l.removeValueIconRef]:"single",[l.searchInputRef]:"single"}),!this.builderMode&&this.searchInput&&this.provider&&(e({input:this.searchInput,debounceWaitMs:300,fetch:(e,t)=>{const s=e;this.provider.search(s).then(t)},render:e=>{const t=this.ce("div");return t.textContent=this.getDisplayValue(e),t},onSelect:e=>{this.address=e,this.triggerChange({modified:!0}),this.searchInput&&(this.searchInput.value=this.getDisplayValue()),this.updateRemoveIcon()}}),this.addEventListener(this.searchInput,"blur",()=>{this.searchInput&&this.searchInput.value&&(this.searchInput.value=this.getDisplayValue())}),this.addEventListener(this.searchInput,"keyup",()=>{this.searchInput&&(this.searchInput.value||this.clearAddress())})),this.modeSwitcher&&this.addEventListener(this.modeSwitcher,"change",()=>{this.modeSwitcher&&(this.dataValue=this.emptyValue,this.mode=this.modeSwitcher.checked?d:r,this.builderMode||(this.manualMode&&this.restoreComponentsContext(),this.triggerChange({modified:!0})),this.redraw())}),!this.builderMode&&this.removeValueIcon){this.updateRemoveIcon();const e=()=>{this.clearAddress(),this.focus()};this.addEventListener(this.removeValueIcon,"click",e),this.addEventListener(this.removeValueIcon,"keydown",({key:t})=>{"Enter"===t&&e()})}return s}addChildComponent(e){e.customConditional=h}redraw(){const e=this.modeSwitcher&&document.activeElement===this.modeSwitcher;return super.redraw().then(t=>(e&&this.modeSwitcher&&this.modeSwitcher.focus(),t))}clearAddress(){this.isEmpty()||this.triggerChange(),this.dataValue=this.emptyValue,this.searchInput&&(this.searchInput.value=""),this.updateRemoveIcon()}getDisplayValue(e=this.address){return this.provider&&!this.manualMode?this.provider.getDisplayValue(e):""}validateMultiple(){return!1}updateRemoveIcon(){this.removeValueIcon&&(this.isEmpty()||this.disabled?this.addClass(this.removeValueIcon,"address-autocomplete-remove-value-icon--hidden"):this.removeClass(this.removeValueIcon,"address-autocomplete-remove-value-icon--hidden"))}getValueAsString(e){if(!e)return"";const s=this.normalizeValue(e),{address:i,mode:a}=this.manualModeEnabled?s:{address:s,mode:r},o=a===d;return this.provider&&!o?this.getDisplayValue(i):o?this.component.manualModeViewString?this.interpolate(this.component.manualModeViewString,{address:i,data:this.data,component:this.component}):this.getComponents().filter(e=>e.hasValue(i)).map(e=>[e,t.get(i,e.key)]).filter(([e,t])=>!e.isEmpty(t)).map(([e,t])=>e.getValueAsString(t)).join(", "):super.getValueAsString(i)}focus(){this.searchInput&&this.searchInput.focus()}}});
//# sourceMappingURL=../../sourcemaps/components/address/Address.js.map