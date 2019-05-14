define([
    './InputWidget',
    './CalendarWidget'
], function (InputWidget, CalendarWidget) {
    'use strict';
    return {
        input: InputWidget,
        calendar: CalendarWidget
    };
});