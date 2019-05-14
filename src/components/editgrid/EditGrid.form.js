define([
    '../base/Base.form',
    './editForm/EditGrid.edit.data',
    './editForm/EditGrid.edit.templates'
], function (baseEditForm, EditGridEditData, EditGridEditTemplates) {
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
                key: 'data',
                components: EditGridEditData
            }
        ], ...extend);
    };
});