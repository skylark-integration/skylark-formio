define([
    '../_classes/component/Component.form',
    './editForm/Hidden.edit.display',
    './editForm/Hidden.edit.data'
], function (baseEditForm, HiddenEditDisplay, HiddenEditData) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: HiddenEditDisplay
            },
            {
                key: 'data',
                components: HiddenEditData
            },
            {
                key: 'validation',
                ignore: true
            },
            {
                key: 'conditional',
                ignore: true
            }
        ], ...extend);
    };
});