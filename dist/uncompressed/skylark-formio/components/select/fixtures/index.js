define([
    './comp1',
    './comp2',
    './comp3',
    './comp4'
], function (comp1, comp2, comp3, comp4) {
    'use strict';
    return {
        comp1,
        comp2,
        multiSelect : comp3.multiSelect,
        multiSelectOptions : comp3.multiSelectOptions,
        comp4
    };
});