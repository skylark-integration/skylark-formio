define([
    '../textfield/TextField.form',
    './editForm/PhoneNumber.edit.validation'
], function (textEditForm, PhoneNumberEditValidation) {
    'use strict';
    return function (...extend) {
        return textEditForm([
            {
                key: 'display',
                components: [
                    {
                        key: 'showWordCount',
                        ignore: true
                    },
                    {
                        key: 'showCharCount',
                        ignore: true
                    }
                ]
            },
            {
                key: 'validation',
                components: PhoneNumberEditValidation
            }
        ], ...extend);
    };
});