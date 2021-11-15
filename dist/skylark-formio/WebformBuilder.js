/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-langx/langx","./Webform","./components/_classes/component/Component","skylark-dragula","./vendors/tooltip-js/tooltip","./vendors/getify/npo","./components/Components","./Formio","./utils/utils","./utils/formUtils","./utils/builder","skylark-lodash","./templates/Templates","./components/builder"],function(e,t,o,n,i,s,r,a,p,m,h,d,l){"use strict";return class extends o{constructor(){let t,o;arguments[0]instanceof HTMLElement||arguments[1]?(t=arguments[0],o=arguments[1]):o=arguments[0],o.skipInit=!1,super(null,o),this.element=t,this.builderHeight=0,this.schemas={},this.sideBarScroll=d.get(this.options,"sideBarScroll",!0),this.sideBarScrollOffset=d.get(this.options,"sideBarScrollOffset",0);const n={};for(const e in r.components){const t=r.components[e];t.builderInfo&&(t.type=e,n[e]=t.builderInfo)}this.dragDropEnabled=!0,this.builder=d.defaultsDeep({},this.options.builder,this.defaultGroups),e.each(this.defaultGroups,(e,t)=>{!1===e&&(this.builder[t]=!1)}),this.groups={},this.groupOrder=[];for(const e in this.builder)this.builder[e]&&(this.builder[e].key=e,this.groups[e]=this.builder[e],this.groups[e].components=this.groups[e].components||{},this.groups[e].componentOrder=this.groups[e].componentOrder||[],this.groups[e].subgroups=Object.keys(this.groups[e].groups||{}).map(t=>(this.groups[e].groups[t].componentOrder=Object.keys(this.groups[e].groups[t].components).map(e=>e),this.groups[e].groups[t])),this.groupOrder.push(this.groups[e]));this.groupOrder=this.groupOrder.filter(e=>e&&!e.ignore).sort((e,t)=>e.weight-t.weight).map(e=>e.key);for(const e in r.components){const t=r.components[e];if(t.builderInfo){this.schemas[e]=t.builderInfo.schema,t.type=e;const o=t.builderInfo;o.key=t.type,this.addBuilderComponentInfo(o)}}for(const e in this.groups){const t=this.groups[e];for(const e in t.components){const o=t.components[e];o&&(o.schema&&(this.schemas[e]=o.schema),t.components[e]=!0===o?n[e]:o,t.components[e].key=e)}}for(const e in this.groups)this.groups[e]&&this.groups[e].components&&(this.groups[e].componentOrder=Object.keys(this.groups[e].components).map(t=>this.groups[e].components[t]).filter(e=>e&&!e.ignore).sort((e,t)=>e.weight-t.weight).map(e=>e.key));this.options.hooks=this.options.hooks||{},this.options.hooks.renderComponent=((e,{self:t})=>"form"!==t.type||t.key?this.options.disabled&&this.options.disabled.includes(t.key)||t.parent.noDragDrop?e:this.renderTemplate("builderComponent",{html:e}):e.replace("formio-component-form","")),this.options.hooks.renderComponents=((e,{components:t,self:o})=>"datagrid"===o.type&&t.length>0||o.noDragDrop?e:((!t||!t.length&&!t.nodrop||"form"===o.type&&t.length<=1&&(0===t.length||"button"===t[0].type))&&(e=this.renderTemplate("builderPlaceholder",{position:0})+e),this.renderTemplate("builderComponents",{key:o.key,type:o.type,html:e}))),this.options.hooks.renderInput=((e,{self:t})=>"hidden"===t.type?e+t.name:e),this.options.hooks.renderLoading=((e,{self:t})=>"form"===t.type&&t.key?t.name:e),this.options.hooks.attachComponents=((e,t,o,n)=>{if(!e)return;if(n.noDragDrop)return e;const i=e.querySelector(`[ref="${n.component.key}-container"]`)||e;return i.formioContainer=o,i.formioComponent=n,this.dragula&&this.allowDrop(e)&&this.dragula.containers.push(i),("datagrid"===n.type||"datamap"===n.type)&&t.length>0?e:e.children[0]}),this.options.hooks.attachDatagrid=((e,t)=>{t.loadRefs(e,{[`${t.key}-container`]:"single"}),t.attachComponents(t.refs[`${t.key}-container`].parentNode,[],t.component.components)}),this.options.hooks.attachComponent=((e,t)=>{if(e.formioComponent=t,t.loadRefs(e,{removeComponent:"single",editComponent:"single",moveComponent:"single",copyComponent:"single",pasteComponent:"single",editJson:"single"}),t.refs.copyComponent&&(new i(t.refs.copyComponent,{trigger:"hover",placement:"top",title:this.t("Copy")}),t.addEventListener(t.refs.copyComponent,"click",()=>this.copyComponent(t))),t.refs.pasteComponent){const e=new i(t.refs.pasteComponent,{trigger:"hover",placement:"top",title:this.t("Paste below")});t.addEventListener(t.refs.pasteComponent,"click",()=>{e.hide(),this.pasteComponent(t)})}t.refs.moveComponent&&new i(t.refs.moveComponent,{trigger:"hover",placement:"top",title:this.t("Move")});const o=this.getParentElement(e);return t.refs.editComponent&&(new i(t.refs.editComponent,{trigger:"hover",placement:"top",title:this.t("Edit")}),t.addEventListener(t.refs.editComponent,"click",()=>this.editComponent(t.schema,o,!1,!1,t.component))),t.refs.editJson&&(new i(t.refs.editJson,{trigger:"hover",placement:"top",title:this.t("Edit JSON")}),t.addEventListener(t.refs.editJson,"click",()=>this.editComponent(t.schema,o,!1,!0,t.component))),t.refs.removeComponent&&(new i(t.refs.removeComponent,{trigger:"hover",placement:"top",title:this.t("Remove")}),t.addEventListener(t.refs.removeComponent,"click",()=>this.removeComponent(t.schema,o,t.component))),e});const s={params:{type:"resource",limit:4294967295,select:"_id,title,name,components"}};this.options&&this.options.resourceTag?s.params.tags=[this.options.resourceTag]:this.options&&this.options.hasOwnProperty("resourceTag")||(s.params.tags=["builder"]);const p=new a(a.projectUrl),m=this.options.builder&&!1===this.options.builder.resource;if(!p.noProject&&!m){const e=this.options.builder&&this.options.builder.resource;p.loadForms(s).then(t=>{t.length&&(this.builder.resource={title:e?e.title:"Existing Resource Fields",key:"resource",weight:e?e.weight:50,subgroups:[],components:[],componentOrder:[]},this.groups.resource={title:e?e.title:"Existing Resource Fields",key:"resource",weight:e?e.weight:50,subgroups:[],components:[],componentOrder:[]},this.groupOrder.includes("resource")||this.groupOrder.push("resource"),this.addExistingResourceFields(t))})}this.options.attachMode="builder",this.webform=this.webform||this.createForm(this.options)}allowDrop(){return!0}addExistingResourceFields(t){e.each(t,(t,o)=>{const n=`resource-${t.name}`,i={key:n,title:t.title,components:[],componentOrder:[],default:0===o};m.eachComponent(t.components,o=>{if("button"===o.type)return;if(this.options&&this.options.resourceFilter&&(!o.tags||-1===o.tags.indexOf(this.options.resourceFilter)))return;let s=o.label;!s&&o.key&&(s=e.upperFirst(o.key)),i.componentOrder.push(o.key),i.components[o.key]=d.merge(p.fastCloneDeep(r.components[o.type].builderInfo),{key:o.key,title:s,group:"resource",subgroup:n},{schema:{...o,label:o.label,key:o.key,lockKey:!0,source:this.options.noSource?void 0:t._id,isNew:!0}})},!0),this.groups.resource.subgroups.push(i)}),this.triggerRedraw()}createForm(e){return this.webform=new t(this.element,e),this.element&&(this.loadRefs(this.element,{form:"single"}),this.refs.form&&(this.webform.element=this.refs.form)),this.webform}get ready(){return this.webform.ready}get defaultGroups(){return{basic:{title:"Basic",weight:0,default:!0},advanced:{title:"Advanced",weight:10},layout:{title:"Layout",weight:20},data:{title:"Data",weight:30},premium:{title:"Premium",weight:40}}}redraw(){return t.prototype.redraw.call(this)}get form(){return this.webform.form}get schema(){return this.webform.schema}set form(e){e.components||(e.components=[]),!this.options.noDefaultSubmitButton&&!e.components.length&&e.components.push({type:"button",label:"Submit",key:"submit",size:"md",block:!1,action:"submit",disableOnInvalid:!0,theme:"primary"}),this.webform.form=e,this.rebuild()}get container(){return this.webform.form.components}findNamespaceRoot(e){const t=m.getComponent(this.webform.form.components,e.key,!0),o=this.recurseNamespace(t);return o&&this.form.key!==o?o===e.key?[...e.components,e]:m.getComponent(this.form.components,o,!0).components:this.form.components}recurseNamespace(e){return e?["container","datagrid","editgrid","tree"].includes(e.type)||e.tree||e.arrayTree?e.key:this.recurseNamespace(e.parent):null}render(){return this.renderTemplate("builder",{sidebar:this.renderTemplate("builderSidebar",{scrollEnabled:this.sideBarScroll,groupOrder:this.groupOrder,groupId:`builder-sidebar-${this.id}`,groups:this.groupOrder.map(e=>this.renderTemplate("builderSidebarGroup",{group:this.groups[e],groupKey:e,groupId:`builder-sidebar-${this.id}`,subgroups:this.groups[e].subgroups.map(t=>this.renderTemplate("builderSidebarGroup",{group:t,groupKey:t.key,groupId:`group-container-${e}`,subgroups:[]}))}))}),form:this.webform.render()})}attach(e){return this.on("change",e=>{this.populateRecaptchaSettings(e)}),super.attach(e).then(()=>{if(this.loadRefs(e,{form:"single",sidebar:"single",container:"multiple","sidebar-anchor":"multiple","sidebar-group":"multiple","sidebar-container":"multiple"}),this.sideBarScroll&&l.current.handleBuilderSidebarScroll&&l.current.handleBuilderSidebarScroll.call(this,this),window.sessionStorage&&window.sessionStorage.getItem("formio.clipboard")&&this.addClass(this.refs.form,"builder-paste-mode"),p.bootstrapVersion(this.options)||(this.refs["sidebar-group"].forEach(e=>{e.style.display="true"===e.getAttribute("data-default")?"inherit":"none"}),this.refs["sidebar-anchor"].forEach((e,t)=>{this.addEventListener(e,"click",()=>{const o=e.getAttribute("data-parent").slice("#builder-sidebar-".length),n=e.getAttribute("data-target").slice("#group-".length);this.refs["sidebar-group"].forEach((e,i)=>{const s="true"===e.getAttribute("data-default"),r=e.getAttribute("id").slice("group-".length),a=e.getAttribute("data-parent").slice("#builder-sidebar-".length);e.style.display=s&&a===n||r===o||i===t?"inherit":"none"})},!0)})),this.dragDropEnabled&&this.initDragula(),this.refs.form)return this.webform.attach(this.refs.form)})}initDragula(){const e=this.options;this.dragula&&this.dragula.destroy();const t=Array.prototype.slice.call(this.refs["sidebar-container"]).filter(e=>"group-container-resource"!==e.id);this.dragula=n(t,{moves(t){let o=!0;return Array.from(t.classList).filter(e=>0===e.indexOf("formio-component-")).forEach(t=>{const n=t.slice("formio-component-".length);e.disabled&&e.disabled.includes(n)&&(o=!1)}),t.classList.contains("no-drag")&&(o=!1),o},copy:e=>e.classList.contains("drag-copy"),accepts:(e,t)=>!e.contains(t)&&!t.classList.contains("no-drop")}).on("drop",(e,t,o,n)=>this.onDrop(e,t,o,n))}detach(){this.dragula&&this.dragula.destroy(),this.dragula=null,this.sideBarScroll&&l.current.clearBuilderSidebarScroll&&l.current.clearBuilderSidebarScroll.call(this,this),super.detach()}getComponentInfo(e,t){let o;if(this.schemas.hasOwnProperty(e))o=p.fastCloneDeep(this.schemas[e]);else if(this.groups.hasOwnProperty(t)){const n=this.groups[t].components;n.hasOwnProperty(e)&&(o=p.fastCloneDeep(n[e].schema))}if("resource"===t.slice(0,t.indexOf("-"))){const n=this.groups.resource.subgroups,i=d.find(n,{key:t});i&&i.components.hasOwnProperty(e)&&(o=p.fastCloneDeep(i.components[e].schema))}return o&&(o.key=d.camelCase(o.title||o.label||o.placeholder||o.type)),o}getComponentsPath(e,t){let o="components",n=0,i=0,s=0,r=0;switch(t.type){case"table":o=`rows[${i=d.findIndex(t.rows,t=>t.some(t=>t.components.some(t=>t.key===e.key)))}][${s=d.findIndex(t.rows[i],t=>t.components.some(t=>t.key===e.key))}].components`;break;case"columns":o=`columns[${n=d.findIndex(t.columns,t=>t.components.some(t=>t.key===e.key))}].components`;break;case"tabs":o=`components[${r=d.findIndex(t.components,t=>t.components.some(t=>t.key===e.key))}].components`}return o}onDrop(e,t,o,n){if(!t)return;if(e.contains(t))return;const i=e.getAttribute("data-key"),r=e.getAttribute("data-type"),a=e.getAttribute("data-group");let p,m,l,c;if(i?(!(p=this.getComponentInfo(i,a))&&r&&(p=this.getComponentInfo(r,a)),m=!0):o.formioContainer&&-1!==(c=d.findIndex(o.formioContainer,{key:e.formioComponent.component.key}))&&(p=(p=o.formioContainer.splice(d.findIndex(o.formioContainer,{key:e.formioComponent.component.key}),1))[0]),!p)return;t!==o&&h.uniquify(this.findNamespaceRoot(t.formioComponent.component),p);const u=t.formioComponent;let g;return t.formioContainer&&(n?-1!==(c=n.getAttribute("data-noattach")?n.getAttribute("data-position"):-1===(c=d.findIndex(t.formioContainer,{key:d.get(n,"formioComponent.component.key")}))?0:c)&&t.formioContainer.splice(c,0,p):t.formioContainer.push(p),l=this.getComponentsPath(p,u.component),-1===(c=d.findIndex(d.get(u.schema,l),{key:p.key}))&&(c=0)),u&&u.addChildComponent&&u.addChildComponent(p,e,t,o,n),m&&!this.options.noNewEdit&&this.editComponent(p,t,m),t!==o?o.formioContainer&&o.contains(t)?g=o.formioComponent.rebuild():t.contains(o)?g=t.formioComponent.rebuild():(o.formioContainer&&(g=o.formioComponent.rebuild()),g=t.formioComponent.rebuild()):g=t.formioComponent.rebuild(),g||(g=s.resolve()),g.then(()=>{this.emit("addComponent",p,u,l,c,m)})}setForm(e){return this.emit("change",e),super.setForm(e).then(e=>(setTimeout(()=>this.builderHeight=this.refs.form.offsetHeight,200),e))}populateRecaptchaSettings(e){var t=!1;this.form.components&&(m.eachComponent(e.components,e=>{if(!t)return"recaptcha"===e.type?(t=!0,!1):void 0}),t?d.set(e,"settings.recaptcha.isEnabled",!0):d.get(e,"settings.recaptcha.isEnabled")&&d.set(e,"settings.recaptcha.isEnabled",!1))}removeComponent(e,t,o){if(!t)return;let n=!0;if(!e.skipRemoveConfirm&&(Array.isArray(e.components)&&e.components.length||Array.isArray(e.rows)&&e.rows.length||Array.isArray(e.columns)&&e.columns.length)){const e="Removing this component will also remove all of its children. Are you sure you want to do this?";n=window.confirm(this.t(e))}o||(o=t.formioContainer.find(t=>t.key===e.key));const i=t.formioContainer?t.formioContainer.indexOf(o):0;if(n&&-1!==i){const o=this.getComponentsPath(e,t.formioComponent.component);t.formioContainer?t.formioContainer.splice(i,1):t.formioComponent&&t.formioComponent.removeChildComponent&&t.formioComponent.removeChildComponent(e),(t.formioComponent.rebuild()||s.resolve()).then(()=>{this.emit("removeComponent",e,t.formioComponent.schema,o,i),this.emit("change",this.form)})}return n}updateComponent(e,t){if(this.preview){this.preview.form={components:[d.omit(e,["hidden","conditional","calculateValue","logic","autofocus","customConditional"])]};const t=this.componentEdit.querySelector('[ref="preview"]');t&&(this.setContent(t,this.preview.render()),this.preview.attach(t))}const o=m.getComponent(this.editForm.components,"defaultValue");if(o&&(!t||!(t.component&&"defaultValue"===t.component.key||t.instance&&o.hasComponent&&o.hasComponent(t.instance)))){d.assign(o.component,d.omit(e,["key","label","placeholder","tooltip","hidden","autofocus","validate","disabled","defaultValue","customDefaultValue","calculateValue","conditional","customConditional"]));const t=o.parent;let n=-1,i=-1;if(t.tabs.some((e,t)=>{e.some((e,s)=>e.id===o.id&&(n=t,i=s,!0))}),-1!==n&&-1!==i){const e=t.tabs[n][i+1];t.removeComponent(o);const s=t.addComponent(o.component,o.data,e);d.pull(s.validators,"required"),t.tabs[n].splice(i,1,s),s.checkValidity=(()=>!0),s.build(o.element)}}this.emit("updateComponent",e)}highlightInvalidComponents(){const e=[],t=new Map;m.eachComponent(this.form.components,(o,n)=>{o.key&&(t.has(o.key)?t.get(o.key).includes(n)?e.push(n):t.set(o.key,[...t.get(o.key),n]):t.set(o.key,[n]))}),m.eachComponent(this.webform.getComponents(),(t,o)=>{e.includes(o)&&t.setCustomValidity(`API Key is not unique: ${t.key}`)})}saveComponent(e,t,o,n){this.editForm.detach();const i=t?t.formioContainer:this.container,r=t?t.formioComponent:this;this.dialog.close();const a=i?this.getComponentsPath(e,r.component):"";n||(n=t.formioContainer.find(t=>t.key===e.key));const p=i?i.indexOf(n):0;if(-1!==p){let t=this.editForm.submission.data;return t=t.componentJson||t,i?i[p]=t:r&&r.saveChildComponent&&r.saveChildComponent(t),(r.rebuild()||s.resolve()).then(()=>{let t=i?i[p]:[];r.getComponents().forEach(e=>{e.key===t.key&&(t=e.schema)}),this.emit("saveComponent",t,e,r.schema,a,p,o),this.emit("change",this.form),this.highlightInvalidComponents()})}return this.highlightInvalidComponents(),s.resolve()}editComponent(e,o,n,i,s){if(!e.key)return;let a=!1;const m=p.fastCloneDeep(e);let l=r.components[m.type];const c=void 0===l;i=i||c,l=c?r.components.unknown:l,this.dialog&&(this.dialog.close(),this.highlightInvalidComponents());const u=d.clone(d.get(this,"options.editForm",{}));this.editForm&&this.editForm.destroy();const g=d.get(this.options,`editForm.${m.type}`,{});u.editForm=this.form,u.editComponent=e,this.editForm=new t({...d.omit(this.options,["hooks","builder","events","attachMode","skipInit"]),language:this.options.language,...u}),this.editForm.form=i&&!c?{components:[{type:"textarea",as:"json",editor:"ace",weight:10,input:!0,key:"componentJson",label:"Component JSON",tooltip:"Edit the JSON for this component."}]}:l.editForm(d.cloneDeep(g));const f=new l(m);this.editForm.submission=i?{data:{componentJson:f.component}}:{data:f.component},this.preview&&this.preview.destroy(),l.builderInfo.hasOwnProperty("preview")&&!l.builderInfo.preview||(this.preview=new t(d.omit({...this.options,preview:!0},["hooks","builder","events","attachMode","calculateValue"]))),this.componentEdit=this.ce("div",{class:"component-edit-container"}),this.setContent(this.componentEdit,this.renderTemplate("builderEditForm",{componentInfo:l.builderInfo,editForm:this.editForm.render(),preview:!!this.preview&&this.preview.render()})),this.dialog=this.createModal(this.componentEdit,d.get(this.options,"dialogAttr",{})),this.editForm.attach(this.componentEdit.querySelector('[ref="editForm"]')),this.updateComponent(m),this.editForm.on("change",e=>{e.changed&&((e.changed.component&&"key"===e.changed.component.key||i)&&(m.keyModified=!0),e.changed.component&&["label","title"].includes(e.changed.component.key)&&n&&(e.data.keyModified||this.editForm.everyComponent(t=>{if("key"===t.key&&"tabs"===t.parent.component.key)return t.setValue(d.camelCase(e.data.title||e.data.label||e.data.placeholder||e.data.type)),!1}),this.form&&h.uniquify(this.findNamespaceRoot(o.formioComponent.component),e.data)),this.updateComponent(e.data.componentJson||e.data,e.changed))}),this.addEventListener(this.componentEdit.querySelector('[ref="cancelButton"]'),"click",t=>{t.preventDefault(),this.editForm.detach(),this.emit("cancelComponent",e),this.dialog.close(),this.highlightInvalidComponents()}),this.addEventListener(this.componentEdit.querySelector('[ref="removeButton"]'),"click",t=>{t.preventDefault(),a=!0,this.editForm.detach(),this.removeComponent(e,o,s),this.dialog.close(),this.highlightInvalidComponents()}),this.addEventListener(this.componentEdit.querySelector('[ref="saveButton"]'),"click",t=>{if(t.preventDefault(),!this.editForm.checkValidity(this.editForm.data,!0,this.editForm.data))return this.editForm.setPristine(!1),this.editForm.showErrors(),!1;a=!0,this.saveComponent(e,o,n,s)});const y=()=>{this.editForm.destroy(),this.preview&&(this.preview.destroy(),this.preview=null),n&&!a&&(this.removeComponent(e,o,s),this.highlightInvalidComponents()),this.removeEventListener(this.dialog,"close",y),this.dialog=null};this.addEventListener(this.dialog,"close",y),this.emit("editComponent",e)}copyComponent(e){if(!window.sessionStorage)return console.warn("Session storage is not supported in this browser.");this.addClass(this.refs.form,"builder-paste-mode"),window.sessionStorage.setItem("formio.clipboard",JSON.stringify(e.schema))}pasteComponent(e){if(!window.sessionStorage)return console.warn("Session storage is not supported in this browser.");if(this.removeClass(this.refs.form,"builder-paste-mode"),window.sessionStorage){const t=window.sessionStorage.getItem("formio.clipboard");if(t){const o=JSON.parse(t),n=this.getParentElement(e.element);h.uniquify(this.findNamespaceRoot(n.formioComponent.component),o);let i="",s=0;n.formioContainer?(s=n.formioContainer.indexOf(e.component),i=this.getComponentsPath(o,n.formioComponent.component),n.formioContainer.splice(s+1,0,o)):n.formioComponent&&n.formioComponent.saveChildComponent&&n.formioComponent.saveChildComponent(o,!1),n.formioComponent.rebuild(),this.emit("saveComponent",o,o,n.formioComponent.components,i,s+1,!0),this.emit("change",this.form)}}}getParentElement(e){let t=e;do{t=t.parentNode}while(t&&!t.formioComponent);return t}addBuilderComponentInfo(t){if(!t||!t.group||!this.groups[t.group])return;t=e.clone(t);const o=this.groups[t.group];return o.components.hasOwnProperty(t.key)||(o.components[t.key]=t),t}destroy(){this.webform.initialized&&this.webform.destroy(),super.destroy()}addBuilderGroup(e,t){this.groups[e]?this.updateBuilderGroup(e,t):(this.groups[e]=t,this.groupOrder.push(e),this.triggerRedraw())}updateBuilderGroup(e,t){this.groups[e]&&(this.groups[e]=t,this.triggerRedraw())}}});
//# sourceMappingURL=sourcemaps/WebformBuilder.js.map
