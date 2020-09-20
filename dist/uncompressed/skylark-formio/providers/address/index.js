define([
    './AzureAddressProvider',
    './CustomAddressProvider',
    './GoogleAddressProvider',
    './NominatimAddressProvider'
], function (a, b, c, d) {
    'use strict';
    return {
        [a.AzureAddressProvider.name]: a.AzureAddressProvider,
        [b.CustomAddressProvider.name]: b.CustomAddressProvider,
        [c.GoogleAddressProvider.name]: c.GoogleAddressProvider,
        [d.NominatimAddressProvider.name]: d.NominatimAddressProvider
    };
});