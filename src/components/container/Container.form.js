define(['../base/Base.form'], function (baseEditForm) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'data',
                components: [{
                        key: 'defaultValue',
                        ignore: true
                    }]
            }], ...extend);
    };
});