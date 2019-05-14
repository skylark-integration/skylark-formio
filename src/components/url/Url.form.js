define(['../textfield/TextField.form'], function (textFieldEditForm) {
    'use strict';
    return function (...extend) {
        return textFieldEditForm(...extend);
    };
});