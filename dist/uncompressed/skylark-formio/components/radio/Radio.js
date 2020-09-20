define([
    'skylark-lodash',
    '../_classes/field/Field'
], function (_, Field) {
    'use strict';
    return class RadioComponent extends Field {
        static schema(...extend) {
            return Field.schema({
                type: 'radio',
                inputType: 'radio',
                label: 'Radio',
                key: 'radio',
                values: [{
                        label: '',
                        value: ''
                    }],
                fieldSet: false
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Radio',
                group: 'basic',
                icon: 'dot-circle-o',
                weight: 80,
                documentation: 'http://help.form.io/userguide/#radio',
                schema: RadioComponent.schema()
            };
        }
        constructor(component, options, data) {
            super(component, options, data);
            this.previousValue = this.dataValue || null;
        }
        get defaultSchema() {
            return RadioComponent.schema();
        }
        get inputInfo() {
            const info = super.elementInfo();
            info.type = 'input';
            info.changeEvent = 'click';
            info.attr.class = 'form-check-input';
            info.attr.name = info.attr.name += `[${ this.id }]`;
            return info;
        }
        get emptyValue() {
            return '';
        }
        get isRadio() {
            return this.component.inputType === 'radio';
        }
        render() {
            return super.render(this.renderTemplate('radio', {
                input: this.inputInfo,
                inline: this.component.inline,
                values: this.component.values,
                value: this.dataValue,
                row: this.row
            }));
        }
        attach(element) {
            this.loadRefs(element, {
                input: 'multiple',
                wrapper: 'multiple'
            });
            this.refs.input.forEach((input, index) => {
                this.addEventListener(input, this.inputInfo.changeEvent, () => this.updateValue(null, { modified: true }));
                this.addShortcut(input, this.component.values[index].shortcut);
                if (this.isRadio) {
                    input.checked = this.dataValue === input.value;
                    this.addEventListener(input, 'keyup', event => {
                        if (event.key === ' ' && this.dataValue === input.value) {
                            event.preventDefault();
                            this.updateValue(null, { modified: true });
                        }
                    });
                }
            });
            return super.attach(element);
        }
        detach(element) {
            if (element && this.refs.input) {
                this.refs.input.forEach((input, index) => {
                    this.removeShortcut(input, this.component.values[index].shortcut);
                });
            }
        }
        getValue() {
            if (this.viewOnly || !this.refs.input || !this.refs.input.length) {
                return this.dataValue;
            }
            let value = this.dataValue;
            this.refs.input.forEach(input => {
                if (input.checked) {
                    value = input.value;
                }
            });
            return value;
        }
        getValueAsString(value) {
            if (!value) {
                return '';
            }
            if (!_.isString(value)) {
                return _.toString(value);
            }
            const option = _.find(this.component.values, v => v.value === value);
            return _.get(option, 'label', '');
        }
        setValueAt(index, value) {
            if (this.refs.input && this.refs.input[index] && value !== null && value !== undefined) {
                const inputValue = this.refs.input[index].value;
                this.refs.input[index].checked = inputValue === value.toString();
            }
        }
        updateValue(value, flags) {
            const changed = super.updateValue(value, flags);
            if (changed && this.refs.wrapper) {
                const value = this.dataValue;
                const optionSelectedClass = 'radio-selected';
                this.refs.wrapper.forEach((wrapper, index) => {
                    const input = this.refs.input[index];
                    if (input && input.value.toString() === value.toString()) {
                        this.addClass(wrapper, optionSelectedClass);
                    } else {
                        this.removeClass(wrapper, optionSelectedClass);
                    }
                });
            }
            if (!flags || !flags.modified || !this.isRadio) {
                return changed;
            }
            this.currentValue = this.dataValue;
            const shouldResetValue = !(flags && flags.noUpdateEvent) && this.previousValue === this.currentValue;
            if (shouldResetValue) {
                this.resetValue();
                this.triggerChange();
            }
            this.previousValue = this.dataValue;
            return changed;
        }
        normalizeValue(value) {
            const dataType = this.component['dataType'] || 'auto';
            switch (dataType) {
            case 'auto':
                if (!isNaN(parseFloat(value)) && isFinite(value)) {
                    value = +value;
                }
                if (value === 'true') {
                    value = true;
                }
                if (value === 'false') {
                    value = false;
                }
                break;
            case 'number':
                value = +value;
                break;
            case 'string':
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                } else {
                    value = value.toString();
                }
                break;
            case 'boolean':
                value = !(!value || value.toString() === 'false');
                break;
            }
            return super.normalizeValue(value);
        }
    };
});