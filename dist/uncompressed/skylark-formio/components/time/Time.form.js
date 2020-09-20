define([
    '../_classes/component/Component.form',
    './editForm/Time.edit.data',
    './editForm/Time.edit.display'
], function (baseEditForm, TimeEditData, TimeEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'data',
                components: TimeEditData
            },
            {
                key: 'display',
                components: TimeEditDisplay
            }
        ], ...extend);
    };
});