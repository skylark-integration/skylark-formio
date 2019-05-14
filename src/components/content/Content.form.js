define([
    '../base/Base.form',
    './editForm/Content.edit.display',
    './editForm/Content.edit.logic'
], function (baseEditForm, ContentEditDisplay, ContentEditLogic) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: ContentEditDisplay
            },
            {
                key: 'logic',
                components: ContentEditLogic
            }
        ], ...extend);
    };
});