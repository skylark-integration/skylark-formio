define([
    '../../utils/utils',
    'skylark-moment',
    'skylark-lodash'
], function (a, moment, _) {
    'use strict';
    const Rule = require('./Rule');
    module.exports = class MinDate extends Rule {
        check(value) {
            if (!value) {
                return true;
            }
            const date = moment(value);
            const minDate = a.getDateSetting(this.settings.dateLimit);
            if (_.isNull(minDate)) {
                return true;
            } else {
                minDate.setHours(0, 0, 0, 0);
            }
            return date.isAfter(minDate) || date.isSame(minDate);
        }
    };
    MinData.prototype.defaultMessage = '{{field}} should not contain date before {{settings.dateLimit}}';
});