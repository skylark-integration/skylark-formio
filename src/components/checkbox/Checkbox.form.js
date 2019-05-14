define([
    '../base/Base.form',
    './editForm/Checkbox.edit.display'
], function (baseEditForm, CheckboxEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: CheckboxEditDisplay
            }], ...extend);
    };
});