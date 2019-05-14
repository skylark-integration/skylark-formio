define([
    'vanilla-text-mask',
    'text-mask-addons',
    'lodash',
    '../../utils/utils',
    '../number/Number'
], function (maskInput, a, _, b, NumberComponent) {
    'use strict';
    return class CurrencyComponent extends NumberComponent {
        static schema(...extend) {
            return NumberComponent.schema({
                type: 'currency',
                label: 'Currency',
                key: 'currency'
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Currency',
                group: 'advanced',
                icon: 'fa fa-usd',
                documentation: 'http://help.form.io/userguide/#currency',
                weight: 70,
                schema: CurrencyComponent.schema()
            };
        }
        constructor(component, options, data) {
            if (component && !component.hasOwnProperty('delimiter')) {
                component.delimiter = true;
            }
            super(component, options, data);
            this.decimalLimit = _.get(this.component, 'decimalLimit', 2);
            const affixes = b.getCurrencyAffixes({
                currency: this.component.currency,
                decimalLimit: this.decimalLimit,
                decimalSeparator: this.decimalSeparator,
                lang: this.options.language
            });
            this.prefix = this.options.prefix || affixes.prefix;
            this.suffix = this.options.suffix || affixes.suffix;
        }
        get defaultSchema() {
            return CurrencyComponent.schema();
        }
        parseNumber(value) {
            if (this.prefix) {
                value = value.replace(this.prefix, '');
            }
            if (this.suffix) {
                value = value.replace(this.suffix, '');
            }
            return super.parseNumber(value);
        }
        setInputMask(input) {
            input.mask = maskInput({
                inputElement: input,
                mask: a.createNumberMask({
                    prefix: this.prefix,
                    suffix: this.suffix,
                    thousandsSeparatorSymbol: _.get(this.component, 'thousandsSeparator', this.delimiter),
                    decimalSymbol: _.get(this.component, 'decimalSymbol', this.decimalSeparator),
                    decimalLimit: this.decimalLimit,
                    allowNegative: _.get(this.component, 'allowNegative', true),
                    allowDecimal: _.get(this.component, 'allowDecimal', true)
                })
            });
        }
        clearInput(input) {
            try {
                if (this.prefix) {
                    input = input.replace(this.prefix, '');
                }
                if (this.suffix) {
                    input = input.replace(this.suffix, '');
                }
            } catch (err) {
            }
            return super.clearInput(input);
        }
    };
});