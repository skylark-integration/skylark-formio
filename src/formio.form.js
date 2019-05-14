define([
    './components/index',
    './components/Components',
    './Formio'
], function (AllComponents, Components, Formio) {
    'use strict';
    Components.setComponents(AllComponents);
    Formio.Components = Components;
    return {
        Components,
        Formio
    };
});