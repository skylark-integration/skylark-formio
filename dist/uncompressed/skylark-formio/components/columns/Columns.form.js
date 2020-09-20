define([
    '../_classes/nested/NestedComponent.form',
    './editForm/Columns.edit.display'
], function (nestedComponentForm, ColumnsEditDisplay) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm([{
                key: 'display',
                components: ColumnsEditDisplay
            }], ...extend);
    };
});