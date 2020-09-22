/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../../Formio","../_classes/field/Field","../../Form","../../vendors/getify/npo"],function(e,t,s,i,o){"use strict";return class n extends s{static schema(...e){return s.schema({type:"select",label:"Select",key:"select",data:{values:[],json:"",url:"",resource:"",custom:""},clearOnRefresh:!1,limit:100,dataSrc:"values",valueProperty:"",lazyLoad:!0,filter:"",searchEnabled:!0,searchField:"",minSearch:0,readOnlyValue:!1,authenticate:!1,template:"<span>{{ item.label }}</span>",selectFields:"",searchThreshold:.3,tableView:!0,fuseOptions:{include:"score",threshold:.3},customOptions:{}},...e)}static get builderInfo(){return{title:"Select",group:"basic",icon:"th-list",weight:70,documentation:"http://help.form.io/userguide/#select",schema:n.schema()}}init(){super.init(),this.validators=this.validators.concat(["select"]);let t=[];const s=e.debounce((...e)=>(t=[],this.updateItems.apply(this,e)),100);this.triggerUpdate=((...e)=>(e.length&&(t=e),s(...t))),this.selectOptions=[],this.isInfiniteScrollProvided&&(this.isFromSearch=!1,this.searchServerCount=null,this.defaultServerCount=null,this.isScrollLoading=!1,this.searchDownloadedResources=[],this.defaultDownloadedResources=[]),this.activated=!1,this.itemsLoaded=new o(e=>{this.itemsLoadedResolve=e})}get dataReady(){return this.itemsLoaded}get defaultSchema(){return n.schema()}get emptyValue(){return this.valueProperty?"":{}}get valueProperty(){return this.component.valueProperty?this.component.valueProperty:"values"===this.component.dataSrc?"value":""}get inputInfo(){const e=super.elementInfo();return e.type="select",e.changeEvent="change",e}get isSelectResource(){return"resource"===this.component.dataSrc}get isSelectURL(){return"url"===this.component.dataSrc}get isInfiniteScrollProvided(){return this.isSelectResource||this.isSelectURL}get shouldDisabled(){return super.shouldDisabled||this.parentDisabled}itemTemplate(e){if(!e)return"";if(this.options.readOnly&&this.component.readOnlyValue)return this.itemValue(e);if(e&&!this.component.template){const t=e.label||e;return"string"==typeof t?this.t(t):t}if("string"==typeof e)return this.t(e);const t=this.component.template?this.interpolate(this.component.template,{item:e}):e.label;if(t){const e=t.replace(/<\/?[^>]+(>|$)/g,"");return t.replace(e,this.t(e))}return JSON.stringify(e)}addOption(t,s,i={},o){const n={value:e.isObject(t)?t:e.isNull(t)?this.emptyValue:String(this.normalizeSingleValue(t)),label:s};if(t&&this.selectOptions.push(n),this.refs.selectContainer&&"html5"===this.component.widget){const s=document.createElement("div");s.innerHTML=this.sanitize(this.renderTemplate("selectOption",{selected:e.isEqual(this.dataValue,n.value),option:n,attrs:i,id:o,useId:""===this.valueProperty&&e.isObject(t)&&o})).trim(),n.element=s.firstChild,this.refs.selectContainer.appendChild(n.element)}}addValueOptions(e){if(e=e||[],!this.selectOptions.length){if(this.choices){const t=Array.isArray(this.dataValue)?this.dataValue:[this.dataValue];return this.addCurrentChoices(t,e)}this.component.multiple||this.addPlaceholder()}return!1}disableInfiniteScroll(){this.downloadedResources&&(this.downloadedResources.serverCount=this.downloadedResources.length,this.serverCount=this.downloadedResources.length)}setItems(t,s){if("string"==typeof t)try{t=JSON.parse(t)}catch(e){console.warn(e.message),t=[]}if(this.component.onSetItems&&"function"==typeof this.component.onSetItems){const e=this.component.onSetItems(this,t);e&&(t=e)}let i;if(!this.choices&&this.refs.selectContainer&&(this.loading,this.empty(this.refs.selectContainer)),this.component.selectValues&&(t=e.get(t,this.component.selectValues,t)||[]),this.isInfiniteScrollProvided){i=!!this.isSelectURL&&e.isEqual(t,this.downloadedResources);const s=this.component.limit>t.length,o=i&&this.downloadedResources&&this.downloadedResources.length===t.length;s?this.disableInfiniteScroll():o?this.selectOptions=[]:this.serverCount=t.serverCount}if(this.isScrollLoading&&t?(i||(this.downloadedResources=this.downloadedResources?this.downloadedResources.concat(t):t),this.downloadedResources.serverCount=t.serverCount||this.downloadedResources.serverCount):(this.downloadedResources=t||[],this.selectOptions=[]),s||this.addValueOptions(t),"html5"!==this.component.widget||this.component.placeholder||this.addOption(null,""),e.each(t,(e,t)=>{this.addOption(this.itemValue(e),this.itemTemplate(e),{},String(t))}),this.choices?this.choices.setChoices(this.selectOptions,"value","label",!0):this.loading,this.isScrollLoading=!1,this.loading=!1,this.dataValue)this.setValue(this.dataValue,{noUpdateEvent:!0});else{const e=this.multiple?this.defaultValue||[]:this.defaultValue;e&&this.setValue(e)}this.itemsLoadedResolve()}loadItems(s,i,o,n,r,a){n=n||{};const l=parseInt(this.component.minSearch,10);if(this.component.searchField&&l>0&&(!i||i.length<l))return this.setItems([]);"GET"===(r=r||"GET").toUpperCase()&&(a=null);const h=this.component.limit||100,c=this.isScrollLoading?this.selectOptions.length:0,d="url"===this.component.dataSrc?{}:{limit:h,skip:c};s=this.interpolate(s,{formioBase:t.getBaseUrl(),search:i,limit:h,skip:c,page:Math.abs(Math.floor(c/h))}),this.component.searchField&&i&&(Array.isArray(i)?d[`${this.component.searchField}`]=i.join(","):d[`${this.component.searchField}`]=i),this.component.selectFields&&(d.select=this.component.selectFields),this.component.sort&&(d.sort=this.component.sort),e.isEmpty(d)||(s+=(s.includes("?")?"&":"?")+t.serialize(d,e=>this.interpolate(e))),this.component.filter&&(s+=(s.includes("?")?"&":"?")+this.interpolate(this.component.filter)),n.header=o,this.loading=!0,t.makeRequest(this.options.formio,"select",s,r,a,n).then(e=>{this.loading=!1,this.setItems(e,!!i)}).catch(e=>{this.isInfiniteScrollProvided&&(this.setItems([]),this.disableInfiniteScroll()),this.isScrollLoading=!1,this.loading=!1,this.itemsLoadedResolve(),this.emit("componentError",{component:this.component,message:e.toString()}),console.warn(`Unable to load resources for ${this.key}`)})}get requestHeaders(){const s=new t.Headers;if(this.component.data&&this.component.data.headers)try{e.each(this.component.data.headers,e=>{e.key&&s.set(e.key,this.interpolate(e.value))})}catch(e){console.warn(e.message)}return s}getCustomItems(){return this.evaluate(this.component.data.custom,{values:[]},"values")}updateCustomItems(){this.setItems(this.getCustomItems()||[])}refresh(){this.component.clearOnRefresh&&this.setValue(this.emptyValue),this.component.lazyLoad&&(this.activated=!1,this.loading=!0,this.setItems([])),this.updateItems(null,!0)}get additionalResourcesAvailable(){return e.isNil(this.serverCount)||this.serverCount>this.downloadedResources.length}get serverCount(){return this.isFromSearch?this.searchServerCount:this.defaultServerCount}set serverCount(e){this.isFromSearch?this.searchServerCount=e:this.defaultServerCount=e}get downloadedResources(){return this.isFromSearch?this.searchDownloadedResources:this.defaultDownloadedResources}set downloadedResources(e){this.isFromSearch?this.searchDownloadedResources=e:this.defaultDownloadedResources=e}updateItems(s,i){if(!this.component.data)return console.warn(`Select component ${this.key} does not have data configuration.`),void this.itemsLoadedResolve();if(this.checkConditions())switch(this.component.dataSrc){case"values":this.setItems(this.component.data.values);break;case"json":this.setItems(this.component.data.json);break;case"custom":this.updateCustomItems();break;case"resource":{if(!this.component.data.resource||!i&&!this.active)return;let e=this.options.formio?this.options.formio.formsUrl:`${t.getProjectUrl()}/form`;if(e+=`/${this.component.data.resource}/submission`,i||this.additionalResourcesAvailable)try{this.loadItems(e,s,this.requestHeaders)}catch(e){console.warn(`Unable to load resources for ${this.key}`)}else this.setItems(this.downloadedResources);break}case"url":{if(!i&&!this.active)return;let e,o,{url:n}=this.component.data;if(n.startsWith("/")){n=(n.startsWith("/project")?t.getBaseUrl():t.getProjectUrl()||t.getBaseUrl())+n}this.component.data.method?o="POST"===(e=this.component.data.method).toUpperCase()?this.component.data.body:null:e="GET";const r=this.component.authenticate?{}:{noToken:!0};this.loadItems(n,s,this.requestHeaders,r,e,o);break}case"indexeddb":if(window.indexedDB||window.alert("Your browser doesn't support current version of indexedDB"),this.component.indexeddb&&this.component.indexeddb.database&&this.component.indexeddb.table){const t=window.indexedDB.open(this.component.indexeddb.database);t.onupgradeneeded=(e=>{if(this.component.customOptions){const t=e.target.result;t.createObjectStore(this.component.indexeddb.table,{keyPath:"myKey",autoIncrement:!0}).transaction.oncomplete=(()=>{const e=t.transaction(this.component.indexeddb.table,"readwrite");this.component.customOptions.forEach(t=>{e.objectStore(this.component.indexeddb.table).put(t)})})}}),t.onerror=(()=>{window.alert(t.errorCode)}),t.onsuccess=(t=>{const s=t.target.result.transaction(this.component.indexeddb.table,"readwrite").objectStore(this.component.indexeddb.table);new o(e=>{const t=[];s.getAll().onsuccess=(s=>{s.target.result.forEach(e=>{t.push(e)}),e(t)})}).then(t=>{e.isEmpty(this.component.indexeddb.filter)||(t=e.filter(t,this.component.indexeddb.filter)),this.setItems(t)})})}}else this.itemsLoadedResolve()}addPlaceholder(){this.component.placeholder&&this.addOption("",this.component.placeholder,{placeholder:!0})}activate(){this.active||(this.activated=!0,this.choices?this.choices.setChoices([{value:"",label:`<i class="${this.iconClass("refresh")}" style="font-size:1.3em;"></i>`,disabled:!0}],"value","label",!0):"url"!==this.component.dataSrc&&"resource"!==this.component.dataSrc||this.addOption("",this.t("loading...")),this.triggerUpdate())}get active(){return!this.component.lazyLoad||this.activated||this.options.readOnly}render(){const e=this.inputInfo;return e.attr=e.attr||{},e.multiple=this.component.multiple,super.render(this.wrapElement(this.renderTemplate("select",{input:e,selectOptions:"",index:null})))}wrapElement(e){return this.component.addResource?this.renderTemplate("resourceAdd",{element:e}):e}choicesOptions(){const t=!this.component.hasOwnProperty("searchEnabled")||this.component.searchEnabled,s=this.t(this.component.placeholder);let i=this.component.customOptions||{};if("string"==typeof i)try{i=JSON.parse(i)}catch(e){console.warn(e.message),i={}}return{removeItemButton:!this.component.disabled&&e.get(this.component,"removeItemButton",!0),itemSelectText:"",classNames:{containerOuter:"choices form-group formio-choices",containerInner:this.transform("class","form-control ui fluid selection dropdown")},addItemText:!1,placeholder:!!this.component.placeholder,placeholderValue:s,noResultsText:this.t("No results found"),noChoicesText:this.t("No choices to choose from"),searchPlaceholderValue:this.t("Type to search"),shouldSort:!1,position:this.component.dropdown||"auto",searchEnabled:t,searchChoices:!this.component.searchField,searchFields:e.get(this,"component.searchFields",["label"]),fuseOptions:Object.assign({},e.get(this,"component.fuseOptions",{}),{include:"score",threshold:e.get(this,"component.searchThreshold",.3)}),valueComparer:e.isEqual,resetScrollPosition:!1,...i}}attach(s){const o=super.attach(s);this.loadRefs(s,{selectContainer:"single",addResource:"single",autocompleteInput:"single"});const n=this.refs.autocompleteInput;n&&this.addEventListener(n,"change",e=>{this.setValue(e.target.value)});const r=this.refs.selectContainer;if(!r)return;if(this.addEventListener(r,this.inputInfo.changeEvent,()=>this.updateValue(null,{modified:!0})),"html5"===this.component.widget)return this.triggerUpdate(),this.focusableElement=r,this.addEventListener(r,"focus",()=>this.update()),void this.addEventListener(r,"keydown",e=>{const{key:t}=e;["Backspace","Delete"].includes(t)&&this.setValue(this.emptyValue)});const a=r.tabIndex;this.addPlaceholder(),r.setAttribute("dir",this.i18next.dir()),this.choices&&this.choices.destroy();const l=this.choicesOptions();return this.choices=new Choices(r,l),this.addEventListener(r,"hideDropdown",()=>{this.choices.input.element.value="",this.updateItems(null,!0)}),this.selectOptions&&this.selectOptions.length&&this.choices.setChoices(this.selectOptions,"value","label",!0),this.component.multiple?this.focusableElement=this.choices.input.element:(this.focusableElement=this.choices.containerInner.element,this.choices.containerOuter.element.setAttribute("tabIndex","-1"),l.searchEnabled&&this.addEventListener(this.choices.containerOuter.element,"focus",()=>this.focusableElement.focus())),this.isInfiniteScrollProvided&&(this.scrollList=this.choices.choiceList.element,this.onScroll=(()=>{!this.isScrollLoading&&this.additionalResourcesAvailable&&this.scrollList.scrollTop+this.scrollList.clientHeight>=this.scrollList.scrollHeight&&(this.isScrollLoading=!0,this.choices.setChoices([{value:`${this.id}-loading`,label:"Loading...",disabled:!0}],"value","label"),this.triggerUpdate(this.choices.input.element.value))}),this.addEventListener(this.scrollList,"scroll",this.onScroll)),this.focusableElement.setAttribute("tabIndex",a),this.component.searchField&&(this.choices&&this.choices.input&&this.choices.input.element&&this.addEventListener(this.choices.input.element,"input",e=>{this.isFromSearch=!!e.target.value,e.target.value?(this.serverCount=null,this.downloadedResources=[]):this.triggerUpdate()}),this.addEventListener(r,"search",e=>this.triggerUpdate(e.detail.value)),this.addEventListener(r,"stopSearch",()=>this.triggerUpdate())),this.addEventListener(r,"showDropdown",()=>{this.dataValue&&this.triggerUpdate(),this.update()}),l.placeholderValue&&this.choices._isSelectOneElement&&(this.addPlaceholderItem(l.placeholderValue),this.addEventListener(r,"removeItem",()=>{this.addPlaceholderItem(l.placeholderValue)})),this.addValueOptions(),this.setChoicesValue(this.dataValue),this.isSelectResource&&this.refs.addResource&&this.addEventListener(this.refs.addResource,"click",s=>{s.preventDefault();const o=this.ce("div"),n=this.createModal(o),r=`${e.get(this.root,"formio.projectUrl",t.getBaseUrl())}/form/${this.component.data.resource}`;new i(o,r,{}).ready.then(e=>{e.on("submit",e=>{this.component.multiple&&(e=[...this.dataValue,e]),this.setValue(e),n.close()})})}),this.disabled=this.shouldDisabled,this.triggerUpdate(),o}addPlaceholderItem(e){this.choices._store.activeItems.length||this.choices._addItem({value:e,label:e,choiceId:0,groupId:-1,customProperties:null,placeholder:!0,keyCode:null})}update(){"custom"===this.component.dataSrc&&this.updateCustomItems(),this.activate()}set disabled(e){super.disabled=e,this.choices&&(e?(this.setDisabled(this.choices.containerInner.element,!0),this.focusableElement.removeAttribute("tabIndex"),this.choices.disable()):(this.setDisabled(this.choices.containerInner.element,!1),this.focusableElement.setAttribute("tabIndex",this.component.tabindex||0),this.choices.enable()))}get disabled(){return super.disabled}set visible(e){e&&!this._visible!=!e&&this.triggerUpdate(),super.visible=e}get visible(){return super.visible}addCurrentChoices(t,s,i){if(!t)return!1;const o=[],n=t.reduce((t,n)=>{if(!n||e.isEmpty(n))return t;let r=!1;const a=s===this.selectOptions;return s&&s.length&&e.each(s,t=>{if(t._id&&n._id&&t._id===n._id)return r=!0,!1;const s=i?t.value:this.itemValue(t,a);return!(r|=e.isEqual(s,n))}),r?r||t:(o.push({value:this.itemValue(n),label:this.itemTemplate(n)}),!0)},!1);return o.length&&(this.choices?this.choices.setChoices(o,"value","label",!0):o.map(e=>{this.addOption(e.value,e.label)})),n}getValueAsString(e){return this.component.multiple&&Array.isArray(e)?e.map(this.asString.bind(this)).join(", "):this.asString(e)}getValue(){if(this.viewOnly||this.loading||!this.component.lazyLoad&&!this.selectOptions.length||!this.element)return this.dataValue;let t=this.emptyValue;if(this.choices)t=this.choices.getValue(!0),!this.component.multiple&&this.component.placeholder&&t===this.t(this.component.placeholder)&&(t=this.emptyValue);else if(this.refs.selectContainer){if(t=this.refs.selectContainer.value,""===this.valueProperty){if(""===t)return{};const s=this.selectOptions[t];s&&e.isObject(s.value)&&(t=s.value)}}else t=this.dataValue;return void 0!==t&&null!==t||(t=""),t}redraw(){const e=super.redraw();return this.triggerUpdate(),e}normalizeSingleValue(t){if(!t)return;const s=this.component.dataType||"auto",i={value:"string"==typeof t?t.toLowerCase():t,toNumber(){try{const e=parseFloat(this.value);return!Number.isNaN(e)&&isFinite(e)?(this.value=e,this):this}catch(e){return this}},toBoolean(){try{return"true"===this.value||"false"===this.value?(this.value="true"===this.value,this):this}catch(e){return this}},toString(){try{const e="object"==typeof this.value?JSON.stringify(this.value):this.value.toString();return e?(this.value=e,this):this}catch(e){return this}},auto(){try{const t=this.toString().toNumber().toBoolean();return t&&!e.isObject(t)&&(this.value=t),this}catch(e){return this}}};switch(s){case"auto":return i.auto().value;case"number":return i.toNumber().value;case"string":return i.toString().value;case"boolean":return i.toBoolean().value}}normalizeValue(e){return this.component.multiple&&Array.isArray(e)?e.map(e=>this.normalizeSingleValue(e)):super.normalizeValue(this.normalizeSingleValue(e))}setValue(t,s={}){const i=this.dataValue,o=this.updateValue(t,s);t=this.dataValue;const n=Array.isArray(i)?i.length:i,r=Array.isArray(t)?t.length:t;if(this.component.multiple&&Array.isArray(t)?t=t.map(e=>"boolean"==typeof e||"number"==typeof e?e.toString():e):"boolean"!=typeof t&&"number"!=typeof t||(t=t.toString()),this.loading)return o;if(this.isInitApiCallNeeded(r)){this.loading=!0,this.lazyLoadInit=!0;const s=this.component.searchField||this.component.valueProperty;return this.triggerUpdate(e.get(t.data||t,s,t),!0),o}return this.addValueOptions(),this.setChoicesValue(t,n),o}isInitApiCallNeeded(e){return this.component.lazyLoad&&!this.lazyLoadInit&&!this.active&&!this.selectOptions.length&&e&&this.visible&&(this.component.searchField||this.component.valueProperty)}setChoicesValue(t,s){const i=Array.isArray(t)?t.length:t;if(s=void 0===s||s,this.choices)if(i){this.choices.removeActiveItems();const e=Array.isArray(t)?t:[t];this.addCurrentChoices(e,this.selectOptions,!0)||this.choices.setChoices(this.selectOptions,"value","label",!0),this.choices.setChoiceByValue(t)}else s&&this.choices.removeActiveItems();else if(i){const s=Array.isArray(t)?t:[t];e.each(this.selectOptions,t=>{e.each(s,s=>{if(e.isEqual(s,t.value)&&t.element)return t.element.selected=!0,t.element.setAttribute("selected","selected"),!1})})}else e.each(this.selectOptions,e=>{e.element&&(e.element.selected=!1,e.element.removeAttribute("selected"))})}deleteValue(){this.setValue("",{noUpdateEvent:!0}),this.unset()}validateMultiple(){return!1}isBooleanOrNumber(e){return"number"==typeof e||"boolean"==typeof e}asString(t){if(t=t||this.getValue(),this.isBooleanOrNumber(t)&&(t=t.toString()),Array.isArray(t)&&t.some(e=>this.isBooleanOrNumber(e))&&(t=t.map(e=>{this.isBooleanOrNumber(e)&&(e=e.toString())})),["values","custom"].includes(this.component.dataSrc)){const{items:s,valueProperty:i}="values"===this.component.dataSrc?{items:this.component.data.values,valueProperty:"value"}:{items:this.getCustomItems(),valueProperty:this.valueProperty};t=this.component.multiple&&Array.isArray(t)?e.filter(s,e=>t.includes(e.value)):i?e.find(s,[i,t]):t}if(e.isString(t))return t;if(Array.isArray(t)){const e=[];return t.forEach(t=>e.push(this.itemTemplate(t))),e.length>0?e.join("<br />"):"-"}return e.isNil(t)?"-":this.itemTemplate(t)}detach(){super.detach(),this.choices&&(this.choices.destroy(),this.choices=null)}focus(){this.focusableElement&&this.focusableElement.focus()}setErrorClasses(e,t,s){super.setErrorClasses(e,t,s),this.choices?super.setErrorClasses([this.choices.containerInner.element],t,s):super.setErrorClasses([this.refs.selectContainer],t,s)}}});
//# sourceMappingURL=../../sourcemaps/components/select/Select.js.map
