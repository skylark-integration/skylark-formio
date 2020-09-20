define(['./editForm/Unknown.edit.display'], function (UnknownEditDisplay) {
    'use strict';
    return function () {
        return {
            components: [{
                    type: 'tabs',
                    key: 'tabs',
                    components: [{
                            label: 'Custom',
                            key: 'display',
                            weight: 0,
                            components: UnknownEditDisplay
                        }]
                }]
        };
    };
});