define([
    '../textfield/TextField.form',
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
            },
            {
                key: 'validation',
                components: [
                    {
                        key: 'validate.minLength',
                        ignore: true
                    },
                    {
                        key: 'validate.maxLength',
                        ignore: true
                    },
                    {
                        key: 'validate.minWords',
                        ignore: true
                    },
                    {
                        key: 'validate.maxWords',
                        ignore: true
                    },
                    {
                        key: 'validate.pattern',
                        ignore: true
                    }
                ]
            }
        ], ...extend);
    };
});