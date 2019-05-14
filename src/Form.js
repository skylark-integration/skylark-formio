define([
    './Formio',
    './Wizard',
    './PDF',
    './Webform'
], function (Formio, Wizard, PDF, Webform) {
    'use strict';
    return class Form {
        constructor(element, form, options) {
            this.instance = null;
            this.element = element;
            this.form = form;
            this.options = options;
        }
        create() {
            const isFlat = this.options && this.options.flatten;
            if (this.form.display === 'wizard' && !isFlat) {
                return new Wizard(this.element, this.options);
            } else if (this.form.display === 'pdf' && !isFlat) {
                return new PDF(this.element, this.options);
            } else {
                return new Webform(this.element, this.options);
            }
        }
        setForm(formParam) {
            formParam = formParam || this.form;
            this.element.innerHTML = '';
            if (typeof formParam === 'string') {
                return new Formio(formParam).loadForm().then(form => {
                    this.form = form;
                    if (this.instance) {
                        this.instance.destroy();
                    }
                    this.instance = this.create();
                    this.instance.url = formParam;
                    this.instance.nosubmit = false;
                    this.instance.loadSubmission();
                    this.form = this.instance.form = form;
                    return this.instance.ready.then(() => this.instance);
                });
            } else {
                this.form = formParam;
                if (this.instance) {
                    this.instance.destroy();
                }
                this.instance = this.create();
                this.instance.form = this.form;
                return this.instance.ready.then(() => this.instance);
            }
        }
        setDisplay(display) {
            this.form.display = display;
            return this.render();
        }
        static embed(embed) {
            if (!embed || !embed.src) {
                return null;
            }
            const id = this.id || `formio-${ Math.random().toString(36).substring(7) }`;
            const className = embed.class || 'formio-form-wrapper';
            if (embed.styles) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = embed.styles;
                document.head.appendChild(link);
            }
            document.write(`<div id="${ id }" class="${ className }"></div>`);
            const formElement = document.getElementById(id);
            return new Form(formElement, embed.src).render();
        }
        render(form) {
            return this.setForm(form);
        }
    };
    Formio.embedForm = embed => Form.embed(embed);
    Formio.createForm = (element, form, options) => {
        return new Form(element, form, options).render();
    };
    Formio.Form = Form;
});