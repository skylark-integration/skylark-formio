define(['./Rule'], function (Rule) {
    'use strict';

    class MaxYear extends Rule {
        check(value) {
            const maxYear = this.settings;
            let year = /\d{4}$/.exec(value);
            year = year ? year[0] : null;
            if (!+maxYear || !+year) {
                return true;
            }
            return +year <= +maxYear;
        }
    };
    
    MaxYear.prototype.defaultMessage = '{{field}} should not contain year greater than {{maxYear}}';

    return MaxYear;

});