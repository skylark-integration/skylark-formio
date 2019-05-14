define([
    '../textfield/TextField.form',
    './editForm/TextArea.edit.display'
], function (textEditForm, TextAreaEditDisplay) {
    'use strict';
    return function (...extend) {
        return textEditForm([{
                key: 'display',
                components: TextAreaEditDisplay
            }], ...extend);
    };
});