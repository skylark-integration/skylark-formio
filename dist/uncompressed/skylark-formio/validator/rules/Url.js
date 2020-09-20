const Rule = require('./Rule');
module.exports = class Url extends Rule {
    check(value) {
        const re = /(https?:\/\/(?:www\.|(?!www)))?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
        return !value || re.test(value);
    }
};
Url.prototype.defaultMessage = '{{field}} must be a valid url.';