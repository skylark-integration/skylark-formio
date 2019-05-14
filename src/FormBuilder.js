define([
    './Formio',
    './WebformBuilder',
    './WizardBuilder',
    './PDFBuilder',
    './Form'
], function (Formio, WebformBuilder, WizardBuilder, PDFBuilder, Form) {
    'use strict';
    return class FormBuilder extends Form {
        constructor(element, form, options) {
            super(element, form, options);
        }
        create() {
            if (!this.form) {
                this.form = {};
            }
            if (!this.form.components) {
                this.form.components = [];
            }
            if (this.form.display === 'wizard') {
                return new WizardBuilder(this.element, this.options);
            } else if (this.form.display === 'pdf') {
                return new PDFBuilder(this.element, this.options);
            } else {
                return new WebformBuilder(this.element, this.options);
            }
        }
    };
    Formio.builder = (element, form, options) => {
        const builder = new FormBuilder(element, form, options);
        return builder.render();
    };
    Formio.FormBuilder = FormBuilder;
});