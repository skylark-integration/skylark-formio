define([
    "./Rule",
    '../../utils/utils',
    'skylark-moment',
    'skylark-lodash'
], function (Rule, utils, moment, _) {
    'use strict';
    
    class MaxDate extends Rule {
        check(value) {
            if (!value) {
                return true;
            }
            if (value === this.settings.dateLimit) {
                return true;
            }
            const date = moment(value);
            const maxDate = utils.getDateSetting(this.settings.dateLimit);
            if (_.isNull(maxDate)) {
                return true;
            } else {
                maxDate.setHours(0, 0, 0, 0);
            }
            return date.isBefore(maxDate) || date.isSame(maxDate);
        }
    };

    MaxDate.prototype.defaultMessage = '{{field}} should not contain date after {{settings.dateLimit}}';

    return MaxDate;
});
