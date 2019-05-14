define(['../nested/NestedComponent.form'], function (nestedComponentForm) {
    'use strict';
    return function (...extend) {
        return nestedComponentForm(...extend);
    };
});