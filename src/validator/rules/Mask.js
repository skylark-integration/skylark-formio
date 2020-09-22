define([
    './Rule',
    '../../utils/utils'
], function (Rule,utils) {
    'use strict';
    class Mask extends Rule {
        check(value) {
            let inputMask;
            if (this.component.isMultipleMasksField) {
                const maskName = value ? value.maskName : undefined;
                const formioInputMask = this.component.getMaskByName(maskName);
                if (formioInputMask) {
                    inputMask = utils.getInputMask(formioInputMask);
                }
                value = value ? value.value : value;
            } else {
                inputMask = utils.getInputMask(this.settings.mask);
            }
            if (value && inputMask) {
                return utils.matchInputMask(value, inputMask);
            }
            return true;
        }
    };

    Mask.prototype.defaultMessage = '{{field}} does not match the mask.';

    return Mask;
});