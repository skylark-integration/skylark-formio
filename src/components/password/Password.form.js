define([
    '../textfield/TextField.form',
    './editForm/Password.edit.display'
], function (textEditForm, PasswordEditDisplay) {
    'use strict';
    return function (...extend) {
        return textEditForm([{
                key: 'display',
                components: PasswordEditDisplay
            }], ...extend);
    };
});