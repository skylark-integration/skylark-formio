define([
    './Formio',
    './builders',
    './Form'
], function (Formio, Builders, Form) {
    'use strict';
    return class FormBuilder extends Form {
        constructor(element, form, options) {
            form = form || {};
            options = options || {};
            super(element, form, Object.assign(options, FormBuilder.options, Formio.options && Formio.options.builder ? Formio.options.builder : {}));
        }
        create(display) {
            if (Builders.builders[display]) {
                return new Builders.builders[display](this.element, this.options);
            } else {
                return new Builders.builders['webform'](this.element, this.options);
            }
        }
    };
    FormBuilder.options = {};
    Formio.builder = (...args) => {
        return new FormBuilder(...args).ready;
    };
    Formio.FormBuilder = FormBuilder;
});