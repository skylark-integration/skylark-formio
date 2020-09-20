define([
    'skylark-lodash',
    './address/index',
    './auth/index',
    './storage/index'
], function (_, address, auth, storage) {
    'use strict';
    return class {
        static addProvider(type, name, provider) {
            Providers.providers[type] = Providers.providers[type] || {};
            Providers.providers[type][name] = provider;
        }
        static addProviders(type, providers) {
            Providers.providers[type] = _.merge(Providers.providers[type], providers);
        }
        static getProvider(type, name) {
            if (Providers.providers[type] && Providers.providers[type][name]) {
                return Providers.providers[type][name];
            }
        }
        static getProviders(type) {
            if (Providers.providers[type]) {
                return Providers.providers[type];
            }
        }
    };
    Providers.providers = {
        address,
        auth,
        storage
    };
});