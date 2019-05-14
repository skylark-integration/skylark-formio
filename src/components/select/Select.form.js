define([
    '../base/Base.form',
    './editForm/Select.edit.data',
    './editForm/Select.edit.validation'
], function (baseEditForm, SelectEditData, SelectEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
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