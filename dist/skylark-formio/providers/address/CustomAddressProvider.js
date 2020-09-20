/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./AddressProvider"],function(r){"use strict";return{CustomAddressProvider:class extends r.AddressProvider{static get name(){return"custom"}static get displayName(){return"Custom"}get queryProperty(){return this.options.queryProperty||super.queryProperty}get responseProperty(){return this.options.responseProperty||super.responseProperty}get displayValueProperty(){return this.options.displayValueProperty||super.displayValueProperty}getRequestUrl(r={}){const{params:e,url:t}=r;return`${t}?${this.serialize(e)}`}}}});
//# sourceMappingURL=../../sourcemaps/providers/address/CustomAddressProvider.js.map
