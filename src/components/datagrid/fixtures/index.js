define([
    './comp1',
    './comp2',
    './comp-with-def-value.json',
    './comp-row-groups-with-def-value.json'
], function (comp1, comp2, withDefValue, withRowGroupsAndDefValue) {
    'use strict';
    return {
        comp1,
        comp2,
        withDefValue,
        withRowGroupsAndDefValue
    };
});