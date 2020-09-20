/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const scripts=document.getElementsByTagName("script");let thisScript=null,i=scripts.length;for(;i--;)if(scripts[i].src&&-1!==scripts[i].src.indexOf("formio.embed")){thisScript=scripts[i];break}if(thisScript){const t=require("./formio.form").Form;Formio.loadModules();const e={};let r=thisScript.src.replace(/^([^?]+).*/,"$1").split("/");r.pop(),r=r.join("/"),thisScript.src.replace(/^[^?]+\??/,"").replace(/\?/g,"&").split("&").forEach(t=>{e[t.split("=")[0]]=t.split("=")[1]&&decodeURIComponent(t.split("=")[1])}),e.styles=e.styles||`${r}/formio.full.min.css`,t.embed(e).then(t=>{Formio.events.emit("formEmbedded",t),t.on("submit",r=>{let i=e.return||e.redirect;if(!i&&t._form&&t._form.settings&&(t._form.settings.returnUrl||t._form.settings.redirect)&&(i=t._form.settings.returnUrl||t._form.settings.redirect),i){const e=t.formio?t.formio.formUrl:"",o=!!i.match(/\?/),s=0===i.indexOf(location.origin);i+=o?"&":"?",i+=`sub=${r._id}`,!s&&e&&(i+=`&form=${encodeURIComponent(e)}`),window.location.href=i,s&&window.location.reload()}})})}else document.write("<span>Could not locate the Embedded form.</span>");
//# sourceMappingURL=sourcemaps/formio.embed.js.map
