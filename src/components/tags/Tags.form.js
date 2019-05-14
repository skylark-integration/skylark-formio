define([
    '../base/Base.form',
    './editForm/Tags.edit.display'
], function (baseEditForm, TagsEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: TagsEditDisplay
            }], ...extend);
    };
});