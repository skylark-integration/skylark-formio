define(['skylark-lodash'], function (_) {
    'use strict';
    const Rule = require('./Rule');
    module.exports = class Max extends Rule {
        check(value) {
            const max = parseFloat(this.settings.limit);
            if (Number.isNaN(max) || !_.isNumber(value)) {
                return true;
            }
            return parseFloat(value) <= max;
        }
    };
    Max.prototype.defaultMessage = '{{field}} cannot be greater than {{settings.limit}}.';
});