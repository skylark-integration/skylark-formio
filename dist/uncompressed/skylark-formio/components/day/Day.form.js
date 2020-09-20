define([
    '../_classes/component/Component.form',
    './editForm/Day.edit.data',
    './editForm/Day.edit.display',
    './editForm/Day.edit.validation',
    './editForm/Day.edit.day',
    './editForm/Day.edit.month',
    './editForm/Day.edit.year'
], function (baseEditForm, DayEditData, DayEditDisplay, DayEditValidation, DayEditDay, DayEditMonth, DayEditYear) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: DayEditDisplay
            },
            {
                key: 'data',
                components: DayEditData
            },
            {
                key: 'validation',
                components: DayEditValidation
            },
            {
                key: 'day',
                label: 'Day',
                weight: 3,
                components: DayEditDay
            },
            {
                key: 'month',
                label: 'Month',
                weight: 3,
                components: DayEditMonth
            },
            {
                key: 'year',
                label: 'Year',
                weight: 3,
                components: DayEditYear
            }
        ], ...extend);
    };
});