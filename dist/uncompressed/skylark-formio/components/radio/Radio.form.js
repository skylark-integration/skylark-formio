define([
    '../_classes/component/Component.form',
    './editForm/Radio.edit.data',
    './editForm/Radio.edit.display',
    './editForm/Radio.edit.validation'
], function (baseEditForm, RadioEditData, RadioEditDisplay, RadioEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: RadioEditDisplay
            },
            {
                key: 'data',
                components: RadioEditData
            },
            {
                key: 'validation',
                components: RadioEditValidation
            }
        ], ...extend);
    };
});