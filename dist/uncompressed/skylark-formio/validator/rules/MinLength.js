define(['./Rule'], function (Rule) {
    'use strict';

    class MinLength extends Rule {
        check(value) {
            const minLength = parseInt(this.settings.length, 10);
            if (!minLength || !value || !value.hasOwnProperty('length') || this.component.isEmpty(value)) {
                return true;
            }
            return value.length >= minLength;
        }
    };
    MinLength.prototype.defaultMessage = '{{field}} must have no more than {{- settings.length}} characters.';

    return MinLength;
});