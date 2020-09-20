define([
    '../_classes/component/Component.form',
    './editForm/ReCaptcha.edit.display'
], function (baseEditForm, ReCaptchaEditDisplay) {
    'use strict';
    return function () {
        return baseEditForm([
            {
                key: 'display',
                components: ReCaptchaEditDisplay
            },
            {
                key: 'data',
                ignore: true
            },
            {
                key: 'validation',
                ignore: true
            },
            {
                key: 'conditional',
                ignore: true
            },
            {
                key: 'logic',
                ignore: true
            }
        ]);
    };
});