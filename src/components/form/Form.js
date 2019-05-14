define([
    'lodash',
    '../base/Base',
    'eventemitter2',
    'native-promise-only',
    '../../utils/utils',
    '../../Formio',
    '../../Form'
], function (_, BaseComponent, EventEmitter, Promise, a, Formio, Form) {
    'use strict';
    return class FormComponent extends BaseComponent {
        static schema(...extend) {
            return BaseComponent.schema({
                type: 'form',
                key: 'form',
                src: '',
                reference: true,
                form: '',
                path: ''
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Nested Form',
                icon: 'fa fa-wpforms',
                group: 'advanced',
                documentation: 'http://help.form.io/userguide/#form',
                weight: 110,
                schema: FormComponent.schema()
            };
        }
        constructor(component, options, data) {
            super(component, options, data);
            this.subForm = null;
            this.formSrc = '';
            this.subFormReady = new Promise((resolve, reject) => {
                this.subFormReadyResolve = resolve;
                this.subFormReadyReject = reject;
            });
            this.subFormLoaded = false;
            this.subscribe();
        }
        get dataReady() {
            return this.subFormReady;
        }
        get defaultSchema() {
            return FormComponent.schema();
        }
        get emptyValue() {
            return { data: {} };
        }
        set root(inst) {
            this._root = inst;
            this.nosubmit = inst.nosubmit;
        }
        get root() {
            return this._root;
        }
        set nosubmit(value) {
            this._nosubmit = !!value;
            if (this.subForm) {
                this.subForm.nosubmit = !!value;
            }
        }
        get nosubmit() {
            return this._nosubmit || false;
        }
        get currentForm() {
            return this._currentForm;
        }
        set currentForm(instance) {
            this._currentForm = instance;
            if (!this.subForm) {
                return;
            }
            this.subForm.getComponents().forEach(component => {
                component.currentForm = this;
            });
        }
        subscribe() {
            this.on('nosubmit', value => {
                this.nosubmit = value;
            });
        }
        destroy() {
            const state = super.destroy() || {};
            if (this.subForm) {
                this.subForm.destroy();
            }
            return state;
        }
        renderSubForm(form, options) {
            if (this.options.builder) {
                this.element.appendChild(this.ce('div', { class: 'text-muted text-center p-2' }, this.text(form.title)));
                return;
            }
            options.events = this.createEmitter();
            a.eachComponent(form.components, component => {
                if (component.type === 'button' && (component.action === 'submit' || !component.action)) {
                    component.hidden = true;
                }
            });
            new Form(this.element, form, options).render().then(instance => {
                this.subForm = instance;
                this.subForm.root = this.root;
                this.subForm.currentForm = this;
                this.subForm.parent = this;
                this.subForm.parentVisible = this.visible;
                this.subForm.on('change', () => {
                    this.subForm.off('change');
                    this.subForm.on('change', () => {
                        this.dataValue = this.subForm.getValue();
                        this.triggerChange();
                    });
                });
                this.subForm.url = this.formSrc;
                this.subForm.nosubmit = this.nosubmit;
                this.restoreValue();
                this.subFormReadyResolve(this.subForm);
                return this.subForm;
            });
        }
        show(...args) {
            const state = super.show(...args);
            if (state && !this.subFormLoaded) {
                this.loadSubForm();
            }
            return state;
        }
        loadSubForm() {
            if (this.subFormLoaded) {
                return this.subFormReady;
            }
            this.subFormLoaded = true;
            const srcOptions = {};
            if (this.options && this.options.base) {
                srcOptions.base = this.options.base;
            }
            if (this.options && this.options.project) {
                srcOptions.project = this.options.project;
            }
            if (this.options && this.options.readOnly) {
                srcOptions.readOnly = this.options.readOnly;
            }
            if (this.options && this.options.breadcrumbSettings) {
                srcOptions.breadcrumbSettings = this.options.breadcrumbSettings;
            }
            if (this.options && this.options.buttonSettings) {
                srcOptions.buttonSettings = this.options.buttonSettings;
            }
            if (this.options && this.options.icons) {
                srcOptions.icons = this.options.icons;
            }
            if (this.options && this.options.viewAsHtml) {
                srcOptions.viewAsHtml = this.options.viewAsHtml;
            }
            if (_.has(this.options, 'language')) {
                srcOptions.language = this.options.language;
            }
            if (this.component.reference) {
                this.component.submit = true;
            }
            if (this.component.src) {
                this.formSrc = this.component.src;
            }
            if (!this.component.src && !this.options.formio && (this.component.form || this.component.path)) {
                if (this.component.project) {
                    this.formSrc = Formio.getBaseUrl();
                    if (a.isMongoId(this.component.project)) {
                        this.formSrc += '/project';
                    }
                    this.formSrc += `/${ this.component.project }`;
                    srcOptions.project = this.formSrc;
                } else {
                    this.formSrc = Formio.getProjectUrl();
                    srcOptions.project = this.formSrc;
                }
                if (this.component.form) {
                    this.formSrc += `/form/${ this.component.form }`;
                } else if (this.component.path) {
                    this.formSrc += `/${ this.component.path }`;
                }
            }
            if (!this.formSrc && this.options.formio) {
                const rootSrc = this.options.formio.formsUrl;
                if (this.component.path) {
                    const parts = rootSrc.split('/');
                    parts.pop();
                    this.formSrc = `${ parts.join('/') }/${ this.component.path }`;
                }
                if (this.component.form) {
                    this.formSrc = `${ rootSrc }/${ this.component.form }`;
                }
            }
            if (this.component.formRevision || this.component.formRevision === 0) {
                this.formSrc += `/v/${ this.component.formRevision }`;
            }
            if (this.component && this.component.components && this.component.components.length) {
                this.renderSubForm(this.component, srcOptions);
            } else if (this.formSrc) {
                const query = { params: { live: 1 } };
                new Formio(this.formSrc).loadForm(query).then(formObj => this.renderSubForm(formObj, srcOptions)).catch(err => this.subFormReadyReject(err));
            }
            return this.subFormReady;
        }
        checkValidity(data, dirty) {
            if (this.subForm) {
                return this.subForm.checkValidity(this.dataValue.data, dirty);
            }
            return super.checkValidity(data, dirty);
        }
        checkConditions(data) {
            const visible = super.checkConditions(data);
            const subForm = this.subForm;
            if (!visible) {
                return visible;
            }
            if (subForm && subForm.hasCondition()) {
                return this.subForm.checkConditions(this.dataValue.data);
            }
            return visible;
        }
        calculateValue(data, flags) {
            if (this.subForm) {
                return this.subForm.calculateValue(this.dataValue.data, flags);
            }
            return super.calculateValue(data, flags);
        }
        setPristine(pristine) {
            super.setPristine(pristine);
            if (this.subForm) {
                this.subForm.setPristine(pristine);
            }
        }
        beforeNext() {
            if (this.component.submit) {
                return this.loadSubForm().then(() => {
                    return this.subForm.submitForm().then(result => {
                        this.dataValue = result.submission;
                        return this.dataValue;
                    }).catch(err => {
                        this.subForm.onSubmissionError(err);
                        return Promise.reject(err);
                    });
                });
            } else {
                return super.beforeNext();
            }
        }
        beforeSubmit() {
            const submission = this.dataValue;
            if (submission && submission._id && submission.form) {
                this.dataValue = this.component.reference ? {
                    _id: submission._id,
                    form: submission.form
                } : submission;
                return Promise.resolve(this.dataValue);
            }
            if (this.component.submit) {
                return this.loadSubForm().then(() => {
                    return this.subForm.submitForm().then(result => {
                        this.subForm.loading = false;
                        this.dataValue = this.component.reference ? {
                            _id: result.submission._id,
                            form: result.submission.form
                        } : result.submission;
                        return this.dataValue;
                    }).catch(() => {
                    });
                });
            } else {
                return super.beforeSubmit();
            }
        }
        build() {
            this.createElement();
            if (!this.options.beforeSubmit) {
                this.restoreValue();
            }
            this.attachLogic();
        }
        isHidden() {
            if (!this.visible) {
                return true;
            }
            return !super.checkConditions(this.rootValue);
        }
        setValue(submission, flags) {
            const changed = super.setValue(submission, flags);
            const hidden = this.isHidden();
            let subForm;
            if (hidden) {
                subForm = this.subFormReady;
            } else {
                subForm = this.loadSubForm();
            }
            subForm.then(form => {
                if (submission && submission._id && form.formio && !flags.noload && _.isEmpty(submission.data)) {
                    const submissionUrl = `${ form.formio.formsUrl }/${ submission.form }/submission/${ submission._id }`;
                    form.setUrl(submissionUrl, this.options);
                    form.nosubmit = false;
                    form.loadSubmission();
                } else {
                    form.setValue(submission, flags);
                }
            });
            return changed;
        }
        getValue() {
            if (this.subForm) {
                return this.subForm.getValue();
            }
            return this.dataValue;
        }
        getAllComponents() {
            if (!this.subForm) {
                return [];
            }
            return this.subForm.getAllComponents();
        }
        updateSubFormVisibility() {
            if (this.subForm) {
                this.subForm.parentVisible = this.visible;
            }
        }
        get visible() {
            return super.visible;
        }
        set visible(value) {
            super.visible = value;
            this.updateSubFormVisibility();
        }
        get parentVisible() {
            return super.parentVisible;
        }
        set parentVisible(value) {
            super.parentVisible = value;
            this.updateSubFormVisibility();
        }
        isInternalEvent(event) {
            switch (event) {
            case 'focus':
            case 'blur':
            case 'componentChange':
            case 'componentError':
            case 'error':
            case 'formLoad':
            case 'languageChanged':
            case 'render':
            case 'checkValidity':
            case 'initialized':
            case 'submit':
            case 'submitButton':
            case 'nosubmit':
            case 'updateComponent':
            case 'submitDone':
            case 'submissionDeleted':
            case 'requestDone':
            case 'nextPage':
            case 'prevPage':
            case 'wizardNavigationClicked':
            case 'updateWizardNav':
            case 'restoreDraft':
            case 'saveDraft':
            case 'saveComponent':
                return true;
            default:
                return false;
            }
        }
        createEmitter() {
            const emiter = new EventEmitter({
                wildcard: false,
                maxListeners: 0
            });
            const nativeEmit = emiter.emit;
            const that = this;
            emiter.emit = function (event, ...args) {
                const eventType = event.replace(`${ that.options.namespace }.`, '');
                nativeEmit.call(this, event, ...args);
                if (!that.isInternalEvent(eventType)) {
                    that.emit(eventType, ...args);
                }
            };
            return emiter;
        }
        deleteValue() {
            super.setValue(null, {
                noUpdateEvent: true,
                noDefault: true
            });
            _.unset(this.data, this.key);
        }
    };
});