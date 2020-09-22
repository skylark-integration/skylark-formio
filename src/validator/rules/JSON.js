define(['./Rule'], function (Rule) {
    'use strict';

    class JSON extends Rule {
        check(value, data, row, index) {
            const {json} = this.settings;
            if (!json) {
                return true;
            }
            const valid = this.component.evaluate(json, {
                data,
                row,
                rowIndex: index,
                input: value
            });
            if (valid === null) {
                return true;
            }
            return valid;
        }
    };
    JSON.prototype.defaultMessage = '{{error}}';

    return JSON;
});