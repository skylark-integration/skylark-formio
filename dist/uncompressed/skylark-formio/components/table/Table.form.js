define([
    '../_classes/nested/NestedComponent.form',
    './editForm/Table.edit.display'
], function (nestedComponentForm, TableEditDisplay) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm([{
                key: 'display',
                components: TableEditDisplay
            }], ...extend);
    };
});