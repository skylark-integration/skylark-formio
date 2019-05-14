define([
    '../nested/NestedComponent.form',
    './editForm/Form.edit.form',
    './editForm/Form.edit.data'
], function (nestedComponentForm, FormEditForm, FormEditData) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm([
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