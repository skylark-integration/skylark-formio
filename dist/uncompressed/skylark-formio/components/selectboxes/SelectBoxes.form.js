define([
    '../radio/Radio.form',
    './editForm/SelectBoxes.edit.validation'
], function (radioEditForm, SelectBoxesEditValidation) {
    'use strict';
    return function (...extend) {
        return radioEditForm([
            {
                key: 'data',
                components: [{
                        key: 'dataType',
                        ignore: true
                    }]
            },
            {
                key: 'validation',
                components: SelectBoxesEditValidation
            }
        ], ...extend);
    };
});