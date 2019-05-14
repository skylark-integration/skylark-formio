define([
    '../base/Base.form',
    './editForm/Unknown.edit.display'
], function (baseEditForm, UnknownEditDisplay) {
    'use strict';
    return function () {
        return baseEditForm([
            {
                key: 'display',
                components: UnknownEditDisplay
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
                key: 'api',
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