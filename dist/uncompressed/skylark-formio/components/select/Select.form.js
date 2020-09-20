define([
    '../_classes/component/Component.form',
    './editForm/Select.edit.data',
    './editForm/Select.edit.display',
    './editForm/Select.edit.validation'
], function (baseEditForm, SelectEditData, SelectEditDisplay, SelectEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: SelectEditDisplay
            },
            {
                key: 'data',
                components: SelectEditData
            },
            {
                key: 'validation',
                components: SelectEditValidation
            }
        ], ...extend);
    };
});