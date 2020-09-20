/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../../Formio"],function(e,t){"use strict";return{AddressProvider:class{static get name(){return"address"}static get displayName(){return"Address"}constructor(t={}){this.options=e.merge({},this.defaultOptions,t)}get defaultOptions(){return{}}get queryProperty(){return"query"}get responseProperty(){return null}get displayValueProperty(){return null}serialize(t){return e.toPairs(t).map(([e,t])=>`${encodeURIComponent(e)}=${encodeURIComponent(t)}`).join("&")}getRequestOptions(t={}){return e.merge({},this.options,t)}getRequestUrl(e={}){throw new Error("Method AddressProvider#getRequestUrl(options) is abstract.")}makeRequest(e={}){return t.makeStaticRequest(this.getRequestUrl(e),"GET",null,{noToken:!0})}search(t,r={}){const s=this.getRequestOptions(r);return(s.params=s.params||{})[this.queryProperty]=t,this.makeRequest(s).then(t=>this.responseProperty?e.get(t,this.responseProperty,[]):t)}getDisplayValue(t){return this.displayValueProperty?e.get(t,this.displayValueProperty,""):String(t)}}}});
//# sourceMappingURL=../../sourcemaps/providers/address/AddressProvider.js.map
