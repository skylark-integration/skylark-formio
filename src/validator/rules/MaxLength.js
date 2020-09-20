const Rule = require('./Rule');
module.exports = class MaxLength extends Rule {
    check(value) {
        const maxLength = parseInt(this.settings.length, 10);
        if (!value || !maxLength || !value.hasOwnProperty('length')) {
            return true;
        }
        return value.length <= maxLength;
    }
};
MaxLength.prototype.defaultMessage = '{{field}} must have no more than {{- settings.length}} characters.';