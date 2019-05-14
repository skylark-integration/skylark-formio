define([
    '../base/Base.form',
    './editForm/Signature.edit.display'
], function (baseEditForm, SignatureEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: SignatureEditDisplay
            }], ...extend);
    };
});