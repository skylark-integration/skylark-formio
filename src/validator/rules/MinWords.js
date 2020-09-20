const Rule = require('./Rule');
module.exports = class MinWords extends Rule {
    check(value) {
        const minWords = parseInt(this.settings.length, 10);
        if (!minWords || !value || typeof value !== 'string') {
            return true;
        }
        return value.trim().split(/\s+/).length >= minWords;
    }
};
MinWords.prototype.defaultMessage = '{{field}} must have at least {{- settings.length}} words.';