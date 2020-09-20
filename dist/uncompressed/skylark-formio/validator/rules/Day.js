define(['./Rule'], function (Rule) {
    'use strict';

     class Day extends Rule {
        check(value) {
            if (!value) {
                return true;
            }
            if (typeof value !== 'string') {
                return false;
            }
            const [DAY, MONTH, YEAR] = this.component.dayFirst ? [
                0,
                1,
                2
            ] : [
                1,
                0,
                2
            ];
            const values = value.split('/').map(x => parseInt(x, 10)), day = values[DAY], month = values[MONTH], year = values[YEAR], maxDay = getDaysInMonthCount(month, year);
            if (isNaN(day) || day < 0 || day > maxDay) {
                return false;
            }
            if (isNaN(month) || month < 0 || month > 12) {
                return false;
            }
            if (isNaN(year) || year < 0 || year > 9999) {
                return false;
            }
            return true;
            function isLeapYear(year) {
                return !(year % 400) || !!(year % 100) && !(year % 4);
            }
            function getDaysInMonthCount(month, year) {
                switch (month) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    return 31;
                case 4:
                case 6:
                case 9:
                case 11:
                    return 30;
                case 2:
                    return isLeapYear(year) ? 29 : 28;
                default:
                    return 31;
                }
            }
        }
    };
    Day.prototype.defaultMessage = '{{field}} is not a valid day.';

    return Day;
});