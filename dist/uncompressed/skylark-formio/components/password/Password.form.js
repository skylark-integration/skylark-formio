define([
    '../textfield/TextField.form',
    './editForm/Password.edit.display',
    './editForm/Password.edit.data',
    './editForm/Password.edit.validation'
], function (textEditForm, PasswordEditDisplay, PasswordEditData, PasswordEditValidation) {
    'use strict';
    return function (...extend) {
        return textEditForm([
            {
                key: 'data',
                components: PasswordEditData
            },
            {
                key: 'display',
                components: PasswordEditDisplay
            },
            {
                key: 'validation',
                components: PasswordEditValidation
            }
        ], ...extend);
    };
});