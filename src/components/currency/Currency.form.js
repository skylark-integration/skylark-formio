define([
    '../base/Base.form',
    './editForm/Currency.edit.display',
    './editForm/Currency.edit.data'
], function (baseEditForm, CurrencyEditDisplay, CurrencyEditData) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: CurrencyEditDisplay
            },
            {
                key: 'data',
                components: CurrencyEditData
            }
        ], ...extend);
    };
});