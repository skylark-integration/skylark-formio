define([
    "skylark-langx",
    '../../vendors/text-mask-addons/index',
    'skylark-lodash',
    '../../utils/utils',
    '../number/Number'
], function (langx,textMasks, _, utils, NumberComponent) {
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
                icon: 'usd',
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
        }
        createNumberMask() {
            const decimalLimit = langx.get(this.component, 'decimalLimit', 2);
            const affixes = utils.getCurrencyAffixes({
                currency: this.component.currency,
                decimalLimit: decimalLimit,
                decimalSeparator: this.decimalSeparator,
                lang: this.options.language
            });
            this.prefix = this.options.prefix || affixes.prefix;
            this.suffix = this.options.suffix || affixes.suffix;
            return textMasks.createNumberMask({
                prefix: this.prefix,
                suffix: this.suffix,
                thousandsSeparatorSymbol: langx.get(this.component, 'thousandsSeparator', this.delimiter),
                decimalSymbol: langx.get(this.component, 'decimalSymbol', this.decimalSeparator),
                decimalLimit: decimalLimit,
                allowNegative: langx.get(this.component, 'allowNegative', true),
                allowDecimal: langx.get(this.component, 'allowDecimal', true)
            });
        }
        get defaultSchema() {
            return CurrencyComponent.schema();
        }
        parseNumber(value) {
            return super.parseNumber(this.stripPrefixSuffix(value));
        }
        parseValue(value) {
            return super.parseValue(this.stripPrefixSuffix(value));
        }
        addZerosAndFormatValue(value) {
            if (!value && value !== 0)
                return;
            const decimalLimit = langx.get(this.component, 'decimalLimit', 2);
            let integerPart;
            let decimalPart = '';
            let decimalPartNumbers = [];
            if (value.includes(this.decimalSeparator)) {
                [integerPart, decimalPart] = value.split(this.decimalSeparator);
                decimalPartNumbers = [...decimalPart.split('')];
            } else {
                integerPart = value;
            }
            if (decimalPart.length < decimalLimit) {
                while (decimalPartNumbers.length < decimalLimit) {
                    decimalPartNumbers.push('0');
                }
            }
            const formattedValue = `${ integerPart }${ this.decimalSeparator }${ decimalPartNumbers.join('') }`;
            return super.formatValue(formattedValue);
        }
        getValueAsString(value) {
            const stringValue = super.getValueAsString(value);
            if (value || value == '0') {
                return this.addZerosAndFormatValue(stringValue);
            }
            return stringValue;
        }
        formatValue(value) {
            if (value && this.disabled) {
                return this.addZerosAndFormatValue(value);
            }
            return super.formatValue(value);
        }
        stripPrefixSuffix(value) {
            if (typeof value === 'string') {
                try {
                    const hasPrefix = this.prefix ? value.includes(this.prefix) : false;
                    const hasSuffix = this.suffix ? value.includes(this.suffix) : false;
                    const hasDelimiter = value.includes(this.delimiter);
                    const hasDecimalSeparator = value.includes(this.decimalSeparator);
                    if (this.prefix) {
                        value = value.replace(this.prefix, '');
                    }
                    if (this.suffix) {
                        value = value.replace(this.suffix, '');
                    }
                    if ((hasPrefix || hasSuffix) && !hasDelimiter && !hasDecimalSeparator && (Number.isNaN(+value) || !value)) {
                        value = '0';
                    }
                } catch (err) {
                }
            }
            return value;
        }
        addFocusBlurEvents(element) {
            super.addFocusBlurEvents(element);
            this.addEventListener(element, 'blur', () => {
                element.value = this.getValueAsString(this.addZerosAndFormatValue(this.parseValue(this.dataValue)));
            });
        }
    };
});