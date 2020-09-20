define([
    '../../utils/utils',
    'skylark-moment',
    'skylark-lodash'
], function (a, moment, _) {
    'use strict';
    const Rule = require('./Rule');
    module.exports = class MaxDate extends Rule {
        check(value) {
            if (!value) {
                return true;
            }
            if (value === this.settings.dateLimit) {
                return true;
            }
            const date = moment(value);
            const maxDate = a.getDateSetting(this.settings.dateLimit);
            if (_.isNull(maxDate)) {
                return true;
            } else {
                maxDate.setHours(0, 0, 0, 0);
            }
            return date.isBefore(maxDate) || date.isSame(maxDate);
        }
    };
    MaxDate.prototype.defaultMessage = '{{field}} should not contain date after {{settings.dateLimit}}';
});