define([
    "./Rule",
    '../../utils/utils',
    'skylark-moment',
    'skylark-lodash'
], function (Rule,utils, moment, _) {
    class MinDate extends Rule {
        check(value) {
            if (!value) {
                return true;
            }
            const date = moment(value);
            const minDate = utils.getDateSetting(this.settings.dateLimit);
            if (_.isNull(minDate)) {
                return true;
            } else {
                minDate.setHours(0, 0, 0, 0);
            }
            return date.isAfter(minDate) || date.isSame(minDate);
        }
    };
    MinDate.prototype.defaultMessage = '{{field}} should not contain date before {{settings.dateLimit}}';

    return MinDate;
});
