define([
    './stripe/stripe/Stripe',
    './stripe/checkout/StripeCheckout',
    './sketchpad/sketchpad',
    './tagpad/tagpad'
], function (StripeComponent, StripeCheckoutComponent, SketchPad, Tagpad) {
    'use strict';
    const Contrib = {
        stripe: {
            stripe: StripeComponent,
            checkout: StripeCheckoutComponent
        },
        sketchpad: SketchPad,
        tagpad: Tagpad
    };
    return Contrib;
    if (typeof global === 'object' && global.Formio) {
        global.Formio.contrib = Contrib;
    }
});