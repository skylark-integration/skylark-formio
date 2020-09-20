/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../_classes/component/Component","../../Formio","lodash/get","../../vendors/getify/npo"],function(e,t,r,a){"use strict";return class i extends e{static schema(...t){return e.schema({type:"recaptcha",key:"recaptcha",label:"reCAPTCHA"},...t)}static get builderInfo(){return{title:"reCAPTCHA",group:"premium",icon:"refresh",documentation:"http://help.form.io/userguide/#recaptcha",weight:40,schema:i.schema()}}render(){return this.builderMode?super.render("reCAPTCHA"):super.render("",!0)}createInput(){if(this.builderMode)this.append(this.text(this.name));else{const e=r(this.root.form,"settings.recaptcha.siteKey");if(e){const r=`https://www.google.com/recaptcha/api.js?render=${e}`;this.recaptchaApiReady=t.requireLibrary("googleRecaptcha","grecaptcha",r,!0)}else console.warn("There is no Site Key specified in settings in form JSON")}}createLabel(){}verify(e){const i=r(this.root.form,"settings.recaptcha.siteKey");if(i){if(!this.recaptchaApiReady){const e=`https://www.google.com/recaptcha/api.js?render=${r(this.root.form,"settings.recaptcha.siteKey")}`;this.recaptchaApiReady=t.requireLibrary("googleRecaptcha","grecaptcha",e,!0)}this.recaptchaApiReady&&(this.recaptchaVerifiedPromise=new a((t,r)=>{this.recaptchaApiReady.then(()=>{grecaptcha.ready(()=>{grecaptcha.execute(i,{action:e}).then(e=>this.sendVerificationRequest(e)).then(e=>(this.setValue(e),t(e)))})}).catch(()=>r())}))}else console.warn("There is no Site Key specified in settings in form JSON")}beforeSubmit(){return this.recaptchaVerifiedPromise?this.recaptchaVerifiedPromise.then(()=>super.beforeSubmit()):super.beforeSubmit()}sendVerificationRequest(e){return t.makeStaticRequest(`${t.projectUrl}/recaptcha?recaptchaToken=${e}`)}setValue(e){const t=this.hasChanged(e,this.dataValue);return this.dataValue=e,t}getValue(){return this.dataValue}}});
//# sourceMappingURL=../../sourcemaps/components/recaptcha/ReCaptcha.js.map