define([
    '../_classes/component/Component.form',
    './editForm/DataGrid.edit.data',
    './editForm/DataGrid.edit.display',
    './editForm/DataGrid.edit.validation'
], function (baseEditForm, DataGridEditData, DataGridEditDisplay, DataGridEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: DataGridEditDisplay
            },
            {
                key: 'data',
                components: DataGridEditData
            },
            {
                key: 'validation',
                components: DataGridEditValidation
            }
        ], ...extend);
    };
});