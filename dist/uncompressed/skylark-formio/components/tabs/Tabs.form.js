define([
    '../_classes/nested/NestedComponent.form',
    './editForm/Tabs.edit.display'
], function (nestedComponentForm, TabsEditDisplay) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm([{
                key: 'display',
                components: TabsEditDisplay
            }], ...extend);
    };
});