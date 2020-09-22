define(['skylark-lodash',"./Rule"], function (_,Rule) {
    class Min extends Rule {
        check(value) {
            const min = parseFloat(this.settings.limit);
            if (Number.isNaN(min) || !_.isNumber(value)) {
                return true;
            }
            return parseFloat(value) >= min;
        }
    };
    Min.prototype.defaultMessage = '{{field}} cannot be less than {{settings.limit}}.';

    return Min;
});
