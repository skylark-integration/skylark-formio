define(['./Rule'], function (Rule) {
    'use strict';

    class MaxWords extends Rule {
        check(value) {
            const maxWords = parseInt(this.settings.length, 10);
            if (!maxWords || typeof value !== 'string') {
                return true;
            }
            return value.trim().split(/\s+/).length <= maxWords;
        }
    };
    MaxWords.prototype.defaultMessage = '{{field}} must have no more than {{- settings.length}} words.';

    return MaxWords;
});