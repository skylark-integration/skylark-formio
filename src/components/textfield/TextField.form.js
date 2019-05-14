define([
    '../base/Base.form',
    './editForm/TextField.edit.data',
    './editForm/TextField.edit.display',
    './editForm/TextField.edit.validation'
], function (baseEditForm, TextFieldEditData, TextFieldEditDisplay, TextFieldEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: TextFieldEditDisplay
            },
            {
                key: 'data',
                components: TextFieldEditData
            },
            {
                key: 'validation',
                components: TextFieldEditValidation
            }
        ], ...extend);
    };
});