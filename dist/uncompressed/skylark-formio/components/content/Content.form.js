define([
    '../_classes/component/Component.form',
    './editForm/Content.edit.display',
    './editForm/Content.edit.logic'
], function (baseEditForm, ContentEditDisplay, ContentEditLogic) {
    'use strict';
    return function (...extend) {
        const editForm = baseEditForm([
            {
                key: 'display',
                components: ContentEditDisplay
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
                components: ContentEditLogic
            }
        ], ...extend);
        editForm.components = [{
                weight: 0,
                type: 'textarea',
                editor: 'ckeditor',
                label: 'Content',
                hideLabel: true,
                input: true,
                key: 'html',
                as: 'html',
                rows: 3,
                tooltip: 'The HTML template for the result data items.'
            }].concat(editForm.components);
        return editForm;
    };
});