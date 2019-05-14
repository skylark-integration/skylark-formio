define([
    '../base/Base.form',
    './editForm/Location.edit.map'
], function (baseEditForm, LocationEditMap) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                label: 'Map',
                key: 'map',
                weight: 1,
                components: LocationEditMap
            }], ...extend);
    };
});