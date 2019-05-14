define([
    '../base/Base.form',
    './editForm/File.edit.file'
], function (baseEditForm, FileEditFile) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                label: 'File',
                key: 'file',
                weight: 5,
                components: FileEditFile
            }], ...extend);
    };
});