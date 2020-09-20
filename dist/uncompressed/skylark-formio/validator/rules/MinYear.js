define(['./Rule'], function (Rule) {
    'use strict';

    class MinYear extends Rule {
        check(value) {
            const minYear = this.settings;
            let year = /\d{4}$/.exec(value);
            year = year ? year[0] : null;
            if (!+minYear || !+year) {
                return true;
            }
            return +year >= +minYear;
        }
    };
    MinYear.prototype.defaultMessage = '{{field}} should not contain year less than {{minYear}}';


    return MinYear;
});