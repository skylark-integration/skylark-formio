define(['./Rule'], function (Rule) {
    'use strict';

    class Pattern extends Rule {
        check(value) {
            const {pattern} = this.settings;
            if (!pattern) {
                return true;
            }
            return new RegExp(`^${ pattern }$`).test(value);
        }
    };

    Pattern.prototype.defaultMessage = '{{field}} does not match the pattern {{settings.pattern}}';

    return Pattern;
});