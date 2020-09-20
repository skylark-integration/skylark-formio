define(['../_classes/component/Component.form'], function (componentEditForm) {
    'use strict';
    return function (...extend) {
        return componentEditForm(...extend);
    };
});