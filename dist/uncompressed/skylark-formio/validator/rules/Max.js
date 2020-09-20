define([
    'skylark-lodash',
    './Rule'
], function (_, Rule) {
    'use strict';
    class Max extends Rule {
        check(value) {
            const max = parseFloat(this.settings.limit);
            if (Number.isNaN(max) || !_.isNumber(value)) {
                return true;
            }
            return parseFloat(value) <= max;
        }
    };
    Max.prototype.defaultMessage = '{{field}} cannot be greater than {{settings.limit}}.';


    return Max;
});