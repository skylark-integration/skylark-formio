define([
    '../base/Base.form',
    './editForm/Number.edit.data',
    './editForm/Number.edit.validation'
], function (baseEditForm, NumberEditData, NumberEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'data',
                components: NumberEditData
            },
            {
                key: 'validation',
                components: NumberEditValidation
            }
        ], ...extend);
    };
});