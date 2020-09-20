define(function () {
    'use strict';
    return [
        {
            mode: 'autocomplete',
            address: {}
        },
        {
            mode: 'manual',
            address: {
                street: '',
                city: '',
                county: '',
                state: '',
                zip: '',
                country: ''
            }
        }
    ];
});