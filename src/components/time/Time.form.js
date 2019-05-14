define([
    '../base/Base.form',
    './editForm/Time.edit.display'
], function (baseEditForm, TimeEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: TimeEditDisplay
            }], ...extend);
    };
});