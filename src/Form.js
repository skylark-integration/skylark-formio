define([
    './Element',
    './Formio',
    './displays/index',
    './templates/index',
    './utils/utils',
    './vendors/getify/npo'
], function (Element, Formio, Displays, templates, FormioUtils, NativePromise) {
    'use strict';
    
    class Form extends Element {
        constructor(...args) {
            let options = args[0] instanceof HTMLElement ? args[2] : args[1];
            if (Formio.options && Formio.options.form) {
                options = Object.assign(options, Formio.options.form);
            }
            super(options);
            this.ready = new NativePromise((resolve, reject) => {
                this.readyResolve = resolve;
                this.readyReject = reject;
            });
            this.instance = null;
            if (args[0] instanceof HTMLElement) {
                this.element = args[0];
                this.options = args[2] || {};
                this.options.events = this.events;
                this.setForm(args[1]).then(() => this.readyResolve(this.instance)).catch(this.readyReject);
            } else if (args[0]) {
                this.element = null;
                this.options = args[1] || {};
                this.options.events = this.events;
                this.setForm(args[0]).then(() => this.readyResolve(this.instance)).catch(this.readyReject);
            } else {
                this.element = null;
                this.options = {};
                this.options.events = this.events;
            }
            this.display = '';
        }
        create(display) {
            if (this.options && (this.options.flatten || this.options.renderMode === 'flat')) {
                display = 'form';
            }
            this.display = display;
            if (Displays.displays[display]) {
                return new Displays.displays[display](this.element, this.options);
            } else {
                return new Displays.displays['webform'](this.element, this.options);
            }
        }
        set form(formParam) {
            return this.setForm(formParam);
        }
        errorForm(err) {
            return {
                components: [{
                        'label': 'HTML',
                        'tag': 'div',
                        'className': 'error error-message alert alert-danger ui red message',
                        'attrs': [{
                                'attr': 'role',
                                'value': 'alert'
                            }],
                        'key': 'errorMessage',
                        'type': 'htmlelement',
                        'input': false,
                        'content': typeof err === 'string' ? err : err.message
                    }]
            };
        }
        setForm(formParam) {
            let result;
            formParam = formParam || this.form;
            if (typeof formParam === 'string') {
                const formio = new Formio(formParam);
                let error;
                result = this.getSubmission(formio).catch(err => {
                    error = err;
                }).then(submission => {
                    return formio.loadForm().catch(err => {
                        error = err;
                    }).then(form => {
                        if (error) {
                            form = this.errorForm(error);
                        }
                        this.instance = this.instance || this.create(form.display);
                        this.instance.url = formParam;
                        this.instance.nosubmit = false;
                        this._form = this.instance.form = form;
                        if (submission) {
                            this.instance.submission = submission;
                        }
                        if (error) {
                            throw error;
                        }
                        return this.instance;
                    });
                });
            } else {
                this.instance = this.instance || this.create(formParam.display);
                this._form = this.instance.form = formParam;
                result = this.instance.ready;
            }
            return result.then(() => {
                this.element = this.instance.element;
                return this.instance;
            });
        }
        getSubmission(formio) {
            if (formio.submissionId) {
                return formio.loadSubmission();
            }
            return NativePromise.resolve();
        }
        get form() {
            return this._form;
        }
        setDisplay(display) {
            if (this.display === display && this.instance) {
                return NativePromise.resolve(this.instance);
            }
            this.form.display = display;
            this.instance.destroy();
            this.instance = this.create(display);
            return this.setForm(this.form);
        }
        empty() {
            if (this.element) {
                while (this.element.firstChild) {
                    this.element.removeChild(this.element.firstChild);
                }
            }
        }
        static embed(embed) {
            return new NativePromise(resolve => {
                if (!embed || !embed.src) {
                    resolve();
                }
                const id = this.id || `formio-${ Math.random().toString(36).substring(7) }`;
                const className = embed.class || 'formio-form-wrapper';
                let code = embed.styles ? `<link rel="stylesheet" href="${ embed.styles }">` : '';
                code += `<div id="${ id }" class="${ className }"></div>`;
                document.write(code);
                let attempts = 0;
                const wait = setInterval(() => {
                    attempts++;
                    const formElement = document.getElementById(id);
                    if (formElement || attempts > 10) {
                        resolve(new Form(formElement, embed.src).ready);
                        clearInterval(wait);
                    }
                }, 10);
            });
        }
        sanitize(dirty) {
            return FormioUtils.sanitize(dirty, this.options);
        }
        setContent(element, content) {
            if (element instanceof HTMLElement) {
                element.innerHTML = this.sanitize(content);
                return true;
            }
            return false;
        }
        build() {
            if (!this.instance) {
                return NativePromise.reject('Form not ready. Use form.ready promise');
            }
            if (!this.element) {
                return NativePromise.reject('No DOM element for form.');
            }
            const template = this.options && this.options.template ? this.options.template : 'bootstrap';
            const loader = templates[template].loader || templates.bootstrap.loader;
            this.setContent(this.element, loader.form);
            return this.render().then(html => {
                this.setContent(this.element, html);
                return this.attach(this.element).then(() => this.instance);
            }).then(param => {
                this.emit('build', param);
                return param;
            });
        }
        render() {
            if (!this.instance) {
                return NativePromise.reject('Form not ready. Use form.ready promise');
            }
            return NativePromise.resolve(this.instance.render()).then(param => {
                this.emit('render', param);
                return param;
            });
        }
        attach(element) {
            if (!this.instance) {
                return NativePromise.reject('Form not ready. Use form.ready promise');
            }
            this.element = element;
            return this.instance.attach(this.element).then(param => {
                this.emit('attach', param);
                return param;
            });
        }
    };
    Formio.embedForm = embed => Form.embed(embed);
    Formio.createForm = (...args) => {
        return new Form(...args).ready;
    };
    
    return Formio.Form = Form;
});