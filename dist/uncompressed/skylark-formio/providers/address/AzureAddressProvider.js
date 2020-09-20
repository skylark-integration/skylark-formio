define(['./AddressProvider'], function (a) {
    'use strict';
    class AzureAddressProvider extends a.AddressProvider {
        static get name() {
            return 'azure';
        }
        static get displayName() {
            return 'Azure Maps';
        }
        get defaultOptions() {
            return {
                params: {
                    'api-version': '1.0',
                    typeahead: 'true'
                }
            };
        }
        get responseProperty() {
            return 'results';
        }
        get displayValueProperty() {
            return 'address.freeformAddress';
        }
        getRequestUrl(options = {}) {
            const {params} = options;
            return `https://atlas.microsoft.com/search/address/json?${ this.serialize(params) }`;
        }
    }
    return { AzureAddressProvider: AzureAddressProvider };
});