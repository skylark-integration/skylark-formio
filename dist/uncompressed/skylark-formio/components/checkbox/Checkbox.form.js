define([
    '../_classes/component/Component.form',
    './editForm/Checkbox.edit.data',
    './editForm/Checkbox.edit.display',
    './editForm/Checkbox.edit.validation'
], function (baseEditForm, CheckboxEditData, CheckboxEditDisplay, CheckboxEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'data',
                components: CheckboxEditData
            },
            {
                key: 'display',
                components: CheckboxEditDisplay
            },
            {
                key: 'validation',
                components: CheckboxEditValidation
            }
        ], ...extend);
    };
});