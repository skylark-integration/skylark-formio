define([
    './comp1',
    './comp2',
    './comp3',
    './comp-with-def-value',
    './comp-row-groups-with-def-value'
], function (comp1, comp2, comp3, withDefValue, withRowGroupsAndDefValue) {
    'use strict';
    return {
        comp1,
        comp2,
        comp3,
        withDefValue,
        withRowGroupsAndDefValue
    };
});