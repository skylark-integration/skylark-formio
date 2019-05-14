define([
    '../base/Base.form',
    './editForm/Resource.edit.display'
], function (baseEditForm, ResourceEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: ResourceEditDisplay
            }], ...extend);
    };
});