define([
    '../_classes/input/Input'
], function (Input) {
    'use strict';
    return class HiddenComponent extends Input {
        static schema(...extend) {
            return Input.schema({
                type: 'hidden',
                tableView: false,
                inputType: 'hidden'
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Hidden',
                group: 'data',
                icon: 'user-secret',
                weight: 0,
                documentation: 'http://help.form.io/userguide/#hidden',
                schema: HiddenComponent.schema()
            };
        }
        get defaultSchema() {
            return HiddenComponent.schema();
        }
        get inputInfo() {
            const info = super.elementInfo();
            info.type = 'input';
            info.attr.type = 'hidden';
            info.changeEvent = 'change';
            return info;
        }
        validateMultiple() {
            return false;
        }
        labelIsHidden() {
            return true;
        }
        get emptyValue() {
            return '';
        }
        setValue(value, flags = {}) {
            return this.updateValue(value, flags);
        }
        getValue() {
            return this.dataValue;
        }
    };
});