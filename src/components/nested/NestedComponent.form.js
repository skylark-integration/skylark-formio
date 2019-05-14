define(['../base/Base.form'], function (baseEditForm) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'data',
                ignore: true
            },
            {
                key: 'validation',
                ignore: true
            }
        ], ...extend);
    };
});