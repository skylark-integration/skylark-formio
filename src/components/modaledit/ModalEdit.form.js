define(['../textarea/TextArea.form'], function (textAreaEditForm) {
    'use strict';
    return function (...extend) {
        return textAreaEditForm([{
                key: 'display',
                components: [
                    {
                        key: 'rows',
                        ignore: true
                    },
                    {
                        key: 'multiple',
                        ignore: true
                    }
                ]
            }], ...extend);
    };
});