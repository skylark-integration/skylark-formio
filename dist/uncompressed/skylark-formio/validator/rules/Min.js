define(['skylark-lodash'], function (_) {
    'use strict';
    const Rule = require('./Rule');
    module.exports = class Min extends Rule {
        check(value) {
            const min = parseFloat(this.settings.limit);
            if (Number.isNaN(min) || !_.isNumber(value)) {
                return true;
            }
            return parseFloat(value) >= min;
        }
    };
    Min.prototype.defaultMessage = '{{field}} cannot be less than {{settings.limit}}.';
});