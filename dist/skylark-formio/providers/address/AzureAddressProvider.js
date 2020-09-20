/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./AddressProvider"],function(e){"use strict";return{AzureAddressProvider:class extends e.AddressProvider{static get name(){return"azure"}static get displayName(){return"Azure Maps"}get defaultOptions(){return{params:{"api-version":"1.0",typeahead:"true"}}}get responseProperty(){return"results"}get displayValueProperty(){return"address.freeformAddress"}getRequestUrl(e={}){const{params:r}=e;return`https://atlas.microsoft.com/search/address/json?${this.serialize(r)}`}}}});
//# sourceMappingURL=../../sourcemaps/providers/address/AzureAddressProvider.js.map
