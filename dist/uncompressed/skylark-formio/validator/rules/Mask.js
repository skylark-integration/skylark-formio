define(['../../utils/utils'], function (a) {
    'use strict';
    const Rule = require('./Rule');
    module.exports = class Mask extends Rule {
        check(value) {
            let inputMask;
            if (this.component.isMultipleMasksField) {
                const maskName = value ? value.maskName : undefined;
                const formioInputMask = this.component.getMaskByName(maskName);
                if (formioInputMask) {
                    inputMask = a.getInputMask(formioInputMask);
                }
                value = value ? value.value : value;
            } else {
                inputMask = a.getInputMask(this.settings.mask);
            }
            if (value && inputMask) {
                return a.matchInputMask(value, inputMask);
            }
            return true;
        }
    };
    Mask.prototype.defaultMessage = '{{field}} does not match the mask.';
});