define([
    'lodash',
    '../../../components/Validator',
    '../../../components/base/Base',
    '../../../Formio'
], function (_, Validator, BaseComponent, Formio) {
    'use strict';
    if (typeof Validator.validators.stripe === 'undefined') {
        Validator.validators.stripe = {
            key: 'validate.stripe',
            message(component) {
                let stripeMessage = '';
                if (component.lastResult && component.lastResult.error) {
                    stripeMessage = component.lastResult.error.message;
                }
                return component.t(component.errorMessage('stripe'), {
                    field: component.errorLabel,
                    stripe: stripeMessage,
                    stripeError: component.lastResult.error,
                    data: component.data
                });
            },
            check(component, setting, value) {
                if (!component.paymentDone && component.lastResult) {
                    return !component.lastResult.error && !component.isEmpty(value);
                }
                return true;
            }
        };
    }
    return class StripeComponent extends BaseComponent {
        constructor(component, options, data) {
            super(component, options, data);
            const src = 'https://js.stripe.com/v3/';
            this.stripeReady = Formio.requireLibrary('stripe', 'Stripe', src, true);
            this.lastResult = null;
            this.paymentDone = false;
            this.validators.push('stripe');
        }
        elementInfo() {
            const info = super.elementInfo();
            info.type = 'input';
            info.attr.type = 'hidden';
            info.changeEvent = 'change';
            return info;
        }
        authorizePending() {
            this.addClass(this.element, 'stripe-submitting');
            this.removeClass(this.element, 'stripe-error');
            this.removeClass(this.element, 'stripe-submitted');
        }
        authorizeError(resultError) {
            this.removeClass(this.element, 'stripe-submitting');
            this.addClass(this.element, 'stripe-submit-error');
            this.removeClass(this.element, 'stripe-submitted');
            if (!this.lastResult) {
                this.lastResult = {};
            }
            this.lastResult.error = resultError;
            this.setValue(this.getValue(), { changed: true });
        }
        authorizeDone(result) {
            this.removeClass(this.element, 'stripe-submit-error');
            this.removeClass(this.element, 'stripe-submitting');
            this.addClass(this.element, 'stripe-submitted');
            this.stripeSuccess.style.display = 'block';
            if (this.component.stripe.payButton && this.component.stripe.payButton.enable) {
                this.stripeElementPayButton.style.display = 'none';
                this.stripeSeparator.style.display = 'none';
            }
            this.stripeElementCard.style.display = 'none';
            this.setValue(result.token.id);
            this.paymentDone = true;
        }
        authorize() {
            if (this.paymentDone) {
                return;
            }
            const that = this;
            return new Promise((resolve, reject) => {
                that.authorizePending();
                const cardData = _.cloneDeep(that.component.stripe.cardData) || {};
                _.each(cardData, (value, key) => {
                    cardData[key] = that.t(value);
                });
                return that.stripe.createToken(that.stripeCard, cardData).then(result => {
                    if (result.error) {
                        that.authorizeError(result.error);
                        reject(result.error);
                    } else {
                        that.authorizeDone(result);
                        resolve();
                    }
                });
            });
        }
        onElementCardChange(result) {
            if (result.empty && (!this.component.validate || !this.component.validate.required)) {
                delete result.error;
            }
            const changed = result.complete || this.lastResult && !!this.lastResult.error !== !!result.error || this.lastResult && this.lastResult.error && result.error && this.lastResult.error.code !== result.error.code || false;
            this.lastResult = result;
            const value = result.empty ? '' : '.';
            this.setValue(value, { changed: changed });
        }
        beforeSubmit() {
            if (this.lastResult && !this.lastResult.empty || this.component.validate && this.component.validate.required) {
                return this.authorize();
            }
        }
        build() {
            super.build();
            const successLabel = this.component.stripe.payButton.successLabel || 'Payment successful';
            this.stripeSuccess = this.ce('div', {
                class: 'Stripe-success',
                style: 'display: none'
            }, this.t(successLabel));
            this.element.appendChild(this.stripeSuccess);
            if (this.component.stripe.payButton && this.component.stripe.payButton.enable) {
                this.stripeElementPayButton = this.ce('div', { class: 'Stripe-paybutton' });
                this.element.appendChild(this.stripeElementPayButton);
                const separatorLabel = this.component.stripe.payButton.separatorLabel || 'Or';
                this.stripeSeparator = this.ce('div', {
                    class: 'Stripe-separator',
                    style: 'display: none'
                }, this.t(separatorLabel));
                this.element.appendChild(this.stripeSeparator);
            }
            this.stripeElementCard = this.ce('div');
            this.element.appendChild(this.stripeElementCard);
            this.stripeReady.then(() => {
                this.stripe = new Stripe(this.component.stripe.apiKey);
                let stripeElementsOptions = {};
                if (this.component.stripe) {
                    stripeElementsOptions = _.cloneDeep(this.component.stripe.stripeElementsOptions) || {};
                }
                if (typeof stripeElementsOptions.locale === 'undefined') {
                    stripeElementsOptions.locale = this.options.language;
                }
                const elements = this.stripe.elements(stripeElementsOptions);
                let stripeElementOptions = {};
                if (this.component.stripe) {
                    stripeElementOptions = this.component.stripe.stripeElementOptions || {};
                }
                this.stripeCard = elements.create('card', stripeElementOptions);
                this.stripeCard.mount(this.stripeElementCard);
                this.addEventListener(this.stripeCard, 'change', this.onElementCardChange.bind(this));
                if (this.component.stripe.payButton && this.component.stripe.payButton.enable) {
                    const paymentRequest = this.stripe.paymentRequest(this.component.stripe.payButton.paymentRequest);
                    this.addEventListener(paymentRequest, 'token', result => {
                        this.authorizeDone(result, true);
                        result.complete('success');
                    });
                    let stripeOptionsPayButton = {};
                    if (this.component.stripe.payButton) {
                        stripeOptionsPayButton = this.component.stripe.payButton.stripeOptions || {};
                    }
                    stripeOptionsPayButton.paymentRequest = paymentRequest;
                    const paymentRequestElement = elements.create('paymentRequestButton', stripeOptionsPayButton);
                    paymentRequest.canMakePayment().then(result => {
                        if (result) {
                            this.stripeSeparator.style.display = 'block';
                            paymentRequestElement.mount(this.stripeElementPayButton);
                        }
                    });
                }
            });
        }
    };
    if (typeof global === 'object' && global.Formio && global.Formio.registerComponent) {
        global.Formio.registerComponent('stripe', StripeComponent);
    }
});