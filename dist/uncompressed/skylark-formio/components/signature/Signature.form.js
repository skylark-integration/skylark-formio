define([
    '../_classes/component/Component.form',
    './editForm/Signature.edit.data',
    './editForm/Signature.edit.display',
    './editForm/Signature.edit.validation'
], function (baseEditForm, SignatureEditData, SignatureEditDisplay, SignatureEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: SignatureEditDisplay
            },
            {
                key: 'data',
                components: SignatureEditData
            },
            {
                key: 'validation',
                components: SignatureEditValidation
            }
        ], ...extend);
    };
});