define([
    './stripe/stripe/Stripe',
    './stripe/checkout/StripeCheckout',
    './location/Location',
    './edittable/EditTable',
    './modaledit/ModalEdit'
], function (StripeComponent, StripeCheckoutComponent, LocationComponent, EditTableComponent, ModalEdit) {
    'use strict';
    const Contrib = {
        stripe: {
            stripe: StripeComponent,
            checkout: StripeCheckoutComponent
        },
        location: LocationComponent,
        edittable: EditTableComponent,
        modaledit: ModalEdit
    };
    return Contrib;
    if (typeof global === 'object' && global.Formio) {
        global.Formio.contrib = Contrib;
    }
});