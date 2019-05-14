define(['../radio/Radio.form'], function (radioEditForm) {
    'use strict';
    return function (...extend) {
        return radioEditForm(...extend);
    };
});