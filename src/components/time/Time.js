define([
    'moment',
    '../textfield/TextField'
], function (moment, TextFieldComponent) {
    'use strict';
    return class TimeComponent extends TextFieldComponent {
        static schema(...extend) {
            return TextFieldComponent.schema({
                type: 'time',
                label: 'Time',
                key: 'time',
                inputType: 'time',
                format: 'HH:mm'
            }, ...extend);
        }
        constructor(component, options, data) {
            super(component, options, data);
            const input = this.ce('time');
            this.timeInputSupported = input.type === 'time';
            if (!this.timeInputSupported) {
                this.component.inputMask = '99:99';
            }
        }
        static get builderInfo() {
            return {
                title: 'Time',
                icon: 'fa fa-clock-o',
                group: 'basic',
                documentation: 'http://help.form.io/userguide/#time',
                weight: 60,
                schema: TimeComponent.schema()
            };
        }
        get defaultSchema() {
            return TimeComponent.schema();
        }
        elementInfo() {
            const info = super.elementInfo();
            info.attr.type = 'time';
            return info;
        }
        getValueAt(index) {
            if (!this.inputs.length || !this.inputs[index]) {
                return this.emptyValue;
            }
            const val = this.inputs[index].value;
            if (!val) {
                return this.emptyValue;
            }
            return moment(val, this.component.format).format('HH:mm:ss');
        }
        setValueAt(index, value) {
            this.inputs[index].value = value ? moment(value, 'HH:mm:ss').format(this.component.format) : value;
        }
    };
});