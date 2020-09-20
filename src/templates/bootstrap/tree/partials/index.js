define([
    './edit.ejs',
    './view.ejs'
], function (edit, view) {
    'use strict';
    return {
        treeView: { form: view },
        treeEdit: { form: edit }
    };
});