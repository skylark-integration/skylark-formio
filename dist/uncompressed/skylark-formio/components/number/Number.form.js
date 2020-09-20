define([
    '../textfield/TextField.form',
    './editForm/Number.edit.display',
    './editForm/Number.edit.data',
    './editForm/Number.edit.validation'
], function (textEditForm, NumberEditDisplay, NumberEditData, NumberEditValidation) {
    'use strict';
    return function (...extend) {
        return textEditForm([
            {
                key: 'display',
                components: NumberEditDisplay
            },
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