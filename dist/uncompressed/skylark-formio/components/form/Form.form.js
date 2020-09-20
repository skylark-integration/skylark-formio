define([
    '../_classes/nested/NestedComponent.form',
    './editForm/Form.edit.display',
    './editForm/Form.edit.form',
    './editForm/Form.edit.data'
], function (nestedComponentForm, FormEditDisplay, FormEditForm, FormEditData) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm([
            {
                key: 'display',
                components: FormEditDisplay
            },
            {
                label: 'Form',
                key: 'form',
                weight: 10,
                components: FormEditForm
            },
            {
                label: 'Data',
                key: 'data',
                weight: 10,
                components: FormEditData
            }
        ], ...extend);
    };
});