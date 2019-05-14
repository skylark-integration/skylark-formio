define([
    '../base/Base.form',
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
                key: 'logic',
                components: HTMLEditLogic
            }
        ], ...extend);
    };
});