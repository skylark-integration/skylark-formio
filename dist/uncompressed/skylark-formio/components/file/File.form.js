define([
    '../_classes/component/Component.form',
    './editForm/File.edit.data',
    './editForm/File.edit.display',
    './editForm/File.edit.file',
    './editForm/File.edit.validation'
], function (baseEditForm, FileEditData, FileEditDisplay, FileEditFile, FileEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: FileEditDisplay
            },
            {
                key: 'data',
                components: FileEditData
            },
            {
                label: 'File',
                key: 'file',
                weight: 5,
                components: FileEditFile
            },
            {
                key: 'validation',
                components: FileEditValidation
            }
        ], ...extend);
    };
});