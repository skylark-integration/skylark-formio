define([
    '../_classes/component/Component.form',
    './editForm/EditGrid.edit.data',
    './editForm/EditGrid.edit.display',
    './editForm/EditGrid.edit.templates',
    './editForm/EditGrid.edit.validation'
], function (baseEditForm, EditGridEditData, EditGridEditDisplay, EditGridEditTemplates, EditGridEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                label: 'Templates',
                key: 'templates',
                weight: 5,
                components: EditGridEditTemplates
            },
            {
                key: 'display',
                components: EditGridEditDisplay
            },
            {
                key: 'data',
                components: EditGridEditData
            },
            {
                key: 'validation',
                components: EditGridEditValidation
            }
        ], ...extend);
    };
});