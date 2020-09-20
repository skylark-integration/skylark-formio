define([
    '../textfield/TextField.form',
    './editForm/Url.edit.display',
    './editForm/Url.edit.data'
], function (textEditForm, UrlEditDisplay, UrlEditData) {
    'use strict';
    return function (...extend) {
        return textEditForm([
            {
                key: 'display',
                components: UrlEditDisplay
            },
            {
                key: 'data',
                components: UrlEditData
            }
        ], ...extend);
    };
});