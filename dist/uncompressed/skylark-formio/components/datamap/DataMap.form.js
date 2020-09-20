define([
    '../_classes/component/Component.form',
    './editForm/DataMap.edit.data',
    './editForm/DataMap.edit.display'
], function (componentEditForm, DataMapEditData, DataMapEditDisplay) {
    'use strict';
    return function (...extend) {
        return componentEditForm([
            {
                key: 'display',
                components: DataMapEditDisplay
            },
            {
                key: 'data',
                components: DataMapEditData
            }
        ], ...extend);
    };
});