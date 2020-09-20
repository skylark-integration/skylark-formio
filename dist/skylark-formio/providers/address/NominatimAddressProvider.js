/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./AddressProvider"],function(e){"use strict";return{NominatimAddressProvider:class extends e.AddressProvider{static get name(){return"nominatim"}static get displayName(){return"OpenStreetMap Nominatim"}get defaultOptions(){return{params:{addressdetails:"1",format:"json"}}}get queryProperty(){return"q"}get displayValueProperty(){return"display_name"}getRequestUrl(e={}){const{params:t}=e;return`https://nominatim.openstreetmap.org/search?${this.serialize(t)}`}}}});
//# sourceMappingURL=../../sourcemaps/providers/address/NominatimAddressProvider.js.map
