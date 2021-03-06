define(['./Rule'], function (Rule) {
    'use strict';

    class DateRule extends Rule {
        check(value) {
            if (!value || value instanceof Date) {
                return true;
            }
            if (value === 'Invalid date' || value === 'Invalid Date') {
                return false;
            }
            if (typeof value === 'string') {
                value = new Date(value);
            }
            return value.toString() !== 'Invalid Date';
        }
    };
    DateRule.prototype.defaultMessage = '{{field}} is not a valid date.';

    return DateRule;
});