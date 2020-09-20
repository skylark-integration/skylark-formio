define([
    '../_classes/component/Component.form',
    './editForm/Button.edit.display'
], function (baseEditForm, ButtonEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: ButtonEditDisplay
            },
            {
                key: 'data',
                ignore: true
            },
            {
                key: 'validation',
                ignore: true
            }
        ], ...extend);
    };
});