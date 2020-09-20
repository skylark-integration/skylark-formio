define([
    '../_classes/component/Component.form',
    './editForm/Container.edit.display',
    './editForm/Container.edit.data'
], function (baseEditForm, ContainerEditDisplay, ContainerEditData) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: ContainerEditDisplay
            },
            {
                key: 'data',
                components: ContainerEditData
            }
        ], ...extend);
    };
});