define(['../base/Base.form'], function (baseEditForm) {
    'use strict';
    return function (...extend) {
        return baseEditForm(...extend);
    };
});