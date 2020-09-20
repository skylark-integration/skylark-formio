const Rule = require('./Rule');
module.exports = class Required extends Rule {
    check(value) {
        return !this.component.isValueHidden() && !this.component.isEmpty(value);
    }
};
Required.prototype.defaultMessage = '{{field}} is required';