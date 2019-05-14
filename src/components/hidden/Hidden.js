define(['../base/Base'], function (BaseComponent) {
    'use strict';
    return class HiddenComponent extends BaseComponent {
        static schema(...extend) {
            return BaseComponent.schema({
                type: 'hidden',
                inputType: 'hidden'
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Hidden',
                group: 'data',
                icon: 'fa fa-user-secret',
                weight: 0,
                documentation: 'http://help.form.io/userguide/#hidden',
                schema: HiddenComponent.schema()
            };
        }
        get defaultSchema() {
            return HiddenComponent.schema();
        }
        elementInfo() {
            const info = super.elementInfo();
            info.type = 'input';
            info.attr.type = 'hidden';
            info.changeEvent = 'change';
            return info;
        }
        build() {
            super.build();
            if (this.options.builder) {
                this.append(this.text(this.name));
            }
        }
        createLabel() {
            return;
        }
        setValue(value, flags) {
            flags = this.getFlags.apply(this, arguments);
            this.dataValue = value;
            return this.updateValue(flags);
        }
        getValue() {
            return this.dataValue;
        }
    };
});