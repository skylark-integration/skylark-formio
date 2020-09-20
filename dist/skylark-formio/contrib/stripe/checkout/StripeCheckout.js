/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../../../components/button/Button","../../../Formio"],function(t,i,e){"use strict";return class extends i{constructor(t,i,n){super(t,i,n);this.stripeCheckoutReady=e.requireLibrary("stripeCheckout","StripeCheckout","https://checkout.stripe.com/checkout.js",!0),this.componentAction=this.component.action,this.component.action="event"}static get builderInfo(){return{group:!1,schema:i.schema()}}getValue(){return this.dataValue}setValue(t,i={}){return this.updateValue(t,i)}onToken(t){this.setValue(t.id),"submit"===this.componentAction?this.emit("submitButton"):(this.addClass(this.element,"btn-success"),this.disabled=!0)}onClickButton(i){if(this.component.key!==i.component.key)return;const e=t.cloneDeep(this.component.stripe.popupConfiguration)||{};t.each(e,(t,i)=>{e[i]=this.t(t)}),"submit"===this.componentAction?this.root.isValid(i.data,!0)?this.handler.open(e):this.emit("submitButton"):this.handler.open(e)}build(){super.build(),"submit"===this.componentAction&&(this.on("submitButton",()=>{this.loading=!0,this.disabled=!0},!0),this.on("submitDone",()=>{this.loading=!1,this.disabled=!1},!0),this.on("change",t=>{this.loading=!1,this.disabled=this.component.disableOnInvalid&&!this.root.isValid(t.data,!0)},!0),this.on("error",()=>{this.loading=!1},!0)),this.stripeCheckoutReady.then(()=>{const i=t.cloneDeep(this.component.stripe.handlerConfiguration)||{};i.key=this.component.stripe.apiKey,i.token=this.onToken.bind(this),void 0===i.locale&&(i.locale=this.options.language),this.handler=StripeCheckout.configure(i),this.on("customEvent",this.onClickButton.bind(this)),this.addEventListener(window,"popstate",()=>{this.handler.close()})})}}});
//# sourceMappingURL=../../../sourcemaps/contrib/stripe/checkout/StripeCheckout.js.map