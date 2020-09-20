define([
    '../_classes/nested/NestedComponent.form',
    './editForm/Fieldset.edit.display'
], function (nestedComponentForm, FieldSetEditDisplay) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm([{
                key: 'display',
                components: FieldSetEditDisplay
            }], ...extend);
    };
});