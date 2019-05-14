define([
    '../base/Base.form',
    './editForm/DataGrid.edit.display'
], function (baseEditForm, DataGridEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: DataGridEditDisplay
            }], ...extend);
    };
});