define([
    '../base/Base.form',
    './editForm/Button.edit.display'
], function (baseEditForm, ButtonEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: ButtonEditDisplay
            }], ...extend);
    };
});