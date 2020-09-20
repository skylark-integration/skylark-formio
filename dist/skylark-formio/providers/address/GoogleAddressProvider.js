/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./AddressProvider"],function(e){"use strict";return{GoogleAddressProvider:class extends e.AddressProvider{static get name(){return"google"}static get displayName(){return"Google Maps"}get defaultOptions(){return{params:{sensor:"false"}}}get queryProperty(){return"address"}get responseProperty(){return"results"}get displayValueProperty(){return"formatted_address"}makeRequest(e={}){return new Promise((r,s)=>{var t=new XMLHttpRequest;t.responseType="json",t.open("GET",this.getRequestUrl(e),!0),t.onload=(()=>r(t.response)),t.onerror=s,t.send()})}getRequestUrl(e={}){const{params:r}=e;return`https://maps.googleapis.com/maps/api/geocode/json?${this.serialize(r)}`}}}});
//# sourceMappingURL=../../sourcemaps/providers/address/GoogleAddressProvider.js.map
