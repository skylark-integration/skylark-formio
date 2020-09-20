define([
    '../textfield/TextField.form',
    './editForm/Email.edit.display',
    './editForm/Email.edit.validation'
], function (baseEditForm, EmailEditFormDisplay, EmailEditFormValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: EmailEditFormDisplay
            },
            {
                key: 'validation',
                components: EmailEditFormValidation
            }
        ], ...extend);
    };
});