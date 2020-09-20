define([
    '../_classes/component/Component.form',
    './editForm/Address.edit.data',
    './editForm/Address.edit.display',
    './editForm/Address.edit.provider'
], function (baseEditForm, AddressEditData, AddressEditDisplay, AddressEditProvider) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'data',
                components: AddressEditData
            },
            {
                key: 'display',
                components: AddressEditDisplay
            },
            {
                label: 'Provider',
                key: 'provider',
                weight: 15,
                components: AddressEditProvider
            }
        ], ...extend);
    };
});