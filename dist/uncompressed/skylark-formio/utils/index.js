define(['./utils'], function (FormioUtils) {
    'use strict';
    if (typeof global === 'object') {
        global.FormioUtils = FormioUtils;
    }
    return FormioUtils;
});