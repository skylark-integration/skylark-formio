define([
    '../base/Base.form',
    './editForm/Radio.edit.display'
], function (baseEditForm, RadioEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: RadioEditDisplay
            }], ...extend);
    };
});