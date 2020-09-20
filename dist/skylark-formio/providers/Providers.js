/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","./address/index","./auth/index","./storage/index"],function(r,e,i,d){"use strict";return class{static addProvider(r,e,i){Providers.providers[r]=Providers.providers[r]||{},Providers.providers[r][e]=i}static addProviders(e,i){Providers.providers[e]=r.merge(Providers.providers[e],i)}static getProvider(r,e){if(Providers.providers[r]&&Providers.providers[r][e])return Providers.providers[r][e]}static getProviders(r){if(Providers.providers[r])return Providers.providers[r]}}});
//# sourceMappingURL=../sourcemaps/providers/Providers.js.map
