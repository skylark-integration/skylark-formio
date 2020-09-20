define([
    '../_classes/nested/NestedComponent.form',
    './editForm/Well.edit.display'
], function (nestedComponentForm, WellEditDisplay) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm([{
                key: 'display',
                components: WellEditDisplay
            }], ...extend);
    };
});