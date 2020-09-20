define([
    '../_classes/component/Component.form',
    './editForm/Tags.edit.data'
], function (baseEditForm, TagsEditData) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'data',
                components: TagsEditData
            }], ...extend);
    };
});