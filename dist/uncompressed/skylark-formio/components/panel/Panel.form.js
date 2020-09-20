define([
    '../_classes/nested/NestedComponent.form',
    './editForm/Panel.edit.display',
    './editForm/Panel.edit.conditional'
], function (nestedComponentForm, PanelEditDisplay, PanelEditConditional) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm([
            {
                key: 'display',
                components: PanelEditDisplay
            },
            {
                key: 'conditional',
                components: PanelEditConditional
            }
        ], ...extend);
    };
});