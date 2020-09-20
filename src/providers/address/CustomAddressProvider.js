define(['./AddressProvider'], function (a) {
    'use strict';
    class CustomAddressProvider extends a.AddressProvider {
        static get name() {
            return 'custom';
        }
        static get displayName() {
            return 'Custom';
        }
        get queryProperty() {
            return this.options.queryProperty || super.queryProperty;
        }
        get responseProperty() {
            return this.options.responseProperty || super.responseProperty;
        }
        get displayValueProperty() {
            return this.options.displayValueProperty || super.displayValueProperty;
        }
        getRequestUrl(options = {}) {
            const {params, url} = options;
            return `${ url }?${ this.serialize(params) }`;
        }
    }
    return { CustomAddressProvider: CustomAddressProvider };
});