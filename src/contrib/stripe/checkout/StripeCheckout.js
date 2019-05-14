define([
    'lodash',
    '../../../components/button/Button',
    '../../../Formio'
], function (_, ButtonComponent, Formio) {
    'use strict';
    return class StripeCheckoutComponent extends ButtonComponent {
        constructor(component, options, data) {
            super(component, options, data);
            const src = 'https://checkout.stripe.com/checkout.js';
            this.stripeCheckoutReady = Formio.requireLibrary('stripeCheckout', 'StripeCheckout', src, true);
            this.componentAction = this.component.action;
            this.component.action = 'event';
        }
        getValue() {
            return this.dataValue;
        }
        setValue(value, flags) {
            flags = this.getFlags.apply(this, arguments);
            return this.updateValue(flags);
        }
        onToken(token) {
            this.setValue(token.id);
            if (this.componentAction === 'submit') {
                this.emit('submitButton');
            } else {
                this.addClass(this.element, 'btn-success');
                this.disabled = true;
            }
        }
        onClickButton(event) {
            if (this.component.key !== event.component.key) {
                return;
            }
            const popupConfiguration = _.cloneDeep(this.component.stripe.popupConfiguration) || {};
            _.each(popupConfiguration, (value, key) => {
                popupConfiguration[key] = this.t(value);
            });
            if (this.componentAction === 'submit') {
                if (this.root.isValid(event.data, true)) {
                    this.handler.open(popupConfiguration);
                } else {
                    this.emit('submitButton');
                }
            } else {
                this.handler.open(popupConfiguration);
            }
        }
        build() {
            super.build();
            if (this.componentAction === 'submit') {
                this.on('submitButton', () => {
                    this.loading = true;
                    this.disabled = true;
                }, true);
                this.on('submitDone', () => {
                    this.loading = false;
                    this.disabled = false;
                }, true);
                this.on('change', value => {
                    this.loading = false;
                    this.disabled = this.component.disableOnInvalid && !this.root.isValid(value.data, true);
                }, true);
                this.on('error', () => {
                    this.loading = false;
                }, true);
            }
            this.stripeCheckoutReady.then(() => {
                const handlerConfiguration = _.cloneDeep(this.component.stripe.handlerConfiguration) || {};
                handlerConfiguration.key = this.component.stripe.apiKey;
                handlerConfiguration.token = this.onToken.bind(this);
                if (typeof handlerConfiguration.locale === 'undefined') {
                    handlerConfiguration.locale = this.options.language;
                }
                this.handler = StripeCheckout.configure(handlerConfiguration);
                this.on('customEvent', this.onClickButton.bind(this), true);
                this.addEventListener(window, 'popstate', () => {
                    this.handler.close();
                });
            });
        }
    };
    if (typeof global === 'object' && global.Formio && global.Formio.registerComponent) {
        global.Formio.registerComponent('stripeCheckout', StripeCheckoutComponent);
    }
});