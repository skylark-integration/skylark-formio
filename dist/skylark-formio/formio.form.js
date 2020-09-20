/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./components","./builders/Builders","./components/Components","./displays/Displays","./templates/Templates","./providers/index","./validator/Rules","./Formio","./Form","./utils/index"],function(e,s,o,r,t,a,i,n,l,p){"use strict";o.setComponents(e);const d=e=>{if("object"==typeof e)for(const l of Object.keys(e)){const p=e.framework||t.framework||"bootstrap";switch(l){case"options":n.options=e.options;break;case"templates":for(const s of Object.keys(e.templates))t.extendTemplate(s,e.templates[s]);e.templates[p]&&(t.current=e.templates[p]);break;case"components":o.setComponents(e.components);break;case"framework":t.framework=e.framework;break;case"fetch":for(const s of Object.keys(e.fetch))n.registerPlugin(e.fetch[s],s);break;case"providers":for(const s of Object.keys(e.providers))a.addProviders(s,e.providers[s]);break;case"displays":r.addDisplays(e.displays);break;case"builders":s.addBuilders(e.builders);break;case"rules":i.addRules(e.rules);break;default:console.log("Unknown plugin option",l)}}};return n.use=((...e)=>{e.forEach(e=>{Array.isArray(e)?e.forEach(e=>d(e)):d(e)})}),n.loadModules=((e=`${n.getApiUrl()}/externalModules.js`,s="externalModules")=>{n.requireLibrary(s,s,e,!0).then(e=>{n.use(e)})}),n.Components=o,n.Templates=t,n.Builders=s,n.Utils=p,n.Form=l,n.Displays=r,n.Providers=a,n.Formio=n,{Builders:s,Components:o,Displays:r,Providers:a,Templates:t,Utils:p,Form:l,Formio:n}});
//# sourceMappingURL=sourcemaps/formio.form.js.map
