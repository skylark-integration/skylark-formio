define([
    '../base/Base.form',
    './editForm/DataMap.edit.display'
], function (baseEditForm, DataMapEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: DataMapEditDisplay
            },
            {
                key: 'data',
                components: [{
                        key: 'defaultValue',
                        ignore: true
                    }]
            }
        ], ...extend);
    };
});