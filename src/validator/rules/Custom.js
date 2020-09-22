define(['./Rule'], function (Rule) {
    'use strict';

    class Custom extends Rule {
        check(value, data, row, index) {
            const custom = this.settings.custom;
            if (!custom) {
                return true;
            }
            const valid = this.component.evaluate(custom, {
                valid: true,
                data,
                row,
                rowIndex: index,
                input: value
            }, 'valid', true);
            if (valid === null) {
                return true;
            }
            return valid;
        }
    };
    Custom.prototype.defaultMessage = '{{error}}';

    return Custom;

});