define([
    '../_classes/component/Component.form',
    './editForm/HTML.edit.display',
    './editForm/HTML.edit.logic'
], function (baseEditForm, HTMLEditDisplay, HTMLEditLogic) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: HTMLEditDisplay
            },
            {
                key: 'data',
                ignore: true
            },
            {
                key: 'validation',
                ignore: true
            },
            {
                key: 'logic',
                components: HTMLEditLogic
            }
        ], ...extend);
    };
});