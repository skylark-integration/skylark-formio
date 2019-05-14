define([
    '../base/Base.form',
    './editForm/Day.edit.display',
    './editForm/Day.edit.validation'
], function (baseEditForm, DayEditDisplay, DayEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: DayEditDisplay
            },
            {
                key: 'validation',
                components: DayEditValidation
            }
        ], ...extend);
    };
});