define([], function () {
    'use strict';

    class Rule {
        constructor(component, settings, config) {
            this.component = component;
            this.settings = settings;
            this.config = config;
        }
        check() {
        }
    };

    return Rule;
});