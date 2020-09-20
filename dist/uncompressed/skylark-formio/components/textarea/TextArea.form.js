define([
    '../textfield/TextField.form',
    './editForm/TextArea.edit.display',
    './editForm/TextArea.edit.validation'
], function (textEditForm, TextAreaEditDisplay, TextAreaEditValidation) {
    'use strict';
    return function (...extend) {
        return textEditForm([
            {
                key: 'display',
                components: TextAreaEditDisplay
            },
            {
                key: 'validation',
                components: TextAreaEditValidation
            }
        ], ...extend);
    };
});