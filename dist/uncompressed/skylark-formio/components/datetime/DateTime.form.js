define([
    '../_classes/component/Component.form',
    './editForm/DateTime.edit.data',
    './editForm/DateTime.edit.date',
    './editForm/DateTime.edit.display',
    './editForm/DateTime.edit.time'
], function (baseEditForm, DateTimeEditData, DateTimeEditDate, DateTimeEditDisplay, DateTimeEditTime) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: DateTimeEditDisplay
            },
            {
                label: 'Date',
                key: 'date',
                weight: 1,
                components: DateTimeEditDate
            },
            {
                label: 'Time',
                key: 'time',
                weight: 2,
                components: DateTimeEditTime
            },
            {
                key: 'data',
                components: DateTimeEditData
            }
        ], ...extend);
    };
});