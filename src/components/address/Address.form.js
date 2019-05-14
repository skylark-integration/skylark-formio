define([
    '../base/Base.form',
    './editForm/Address.edit.display'
], function (baseEditForm, AddressEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: AddressEditDisplay
            }], ...extend);
    };
});