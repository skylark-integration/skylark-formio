define([
    'skylark-lodash',
    'skylark-moment',
    './EventEmitter',
    'skylark-i18next',
    './Formio',
    './vendors/getify/npo',
    './components/Components',
    './components/_classes/nesteddata/NestedDataComponent',
    './utils/utils',
    './utils/formUtils',
    "./i18n"
], function (_, moment, EventEmitter, i18next, Formio, NativePromise, Components, NestedDataComponent, utils, formUtils,i18n) {
    'use strict';
    Formio.forms = {};
    Formio.registerComponent = Components.setComponent;
    function getIconSet(icons) {
        if (icons === 'fontawesome') {
            return 'fa';
        }
        return icons || '';
    }
    function getOptions(options) {
        options = _.defaults(options, {
            submitOnEnter: false,
            iconset: getIconSet(options && options.icons ? options.icons : Formio.icons),
            i18next,
            saveDraft: false,
            alwaysDirty: false,
            saveDraftThrottle: 5000
        });
        if (!options.events) {
            options.events = new EventEmitter({
                wildcard: false,
                maxListeners: 0
            });
        }
        return options;
    }
    class Webform extends NestedDataComponent {
        constructor() {
            let element, options;
            if (arguments[0] instanceof HTMLElement || arguments[1]) {
                element = arguments[0];
                options = arguments[1];
            } else {
                options = arguments[0];
            }
            super(null, getOptions(options));
            this.element = element;
            Formio.forms[this.id] = this;
            if (this.options.baseUrl) {
                Formio.setBaseUrl(this.options.baseUrl);
            }
            //let i18n = require('./i18n').default;
            if (options && options.i18n && !options.i18nReady) {
                if (options.i18n.resources) {
                    i18n = options.i18n;
                } else {
                    _.each(options.i18n, (lang, code) => {
                        if (code === 'options') {
                            _.merge(i18n, lang);
                        } else if (!i18n.resources[code]) {
                            i18n.resources[code] = { translation: lang };
                        } else {
                            _.assign(i18n.resources[code].translation, lang);
                        }
                    });
                }
                options.i18n = i18n;
                options.i18nReady = true;
            }
            if (options && options.i18n) {
                this.options.i18n = options.i18n;
            } else {
                this.options.i18n = i18n;
            }
            if (this.options.language) {
                this.options.i18n.lng = this.options.language;
            }
            this.type = 'form';
            this._src = '';
            this._loading = false;
            this._form = {};
            this.draftEnabled = false;
            this.savingDraft = true;
            if (this.options.saveDraftThrottle) {
                this.triggerSaveDraft = _.throttle(this.saveDraft.bind(this), this.options.saveDraftThrottle);
            } else {
                this.triggerSaveDraft = this.saveDraft.bind(this);
            }
            this.customErrors = [];
            this.nosubmit = false;
            this.submitted = false;
            this.submitting = false;
            this.formio = null;
            this.loader = null;
            this.alert = null;
            this.onSubmission = null;
            this.submissionSet = false;
            this.formReady = new NativePromise((resolve, reject) => {
                this.formReadyResolve = resolve;
                this.formReadyReject = reject;
            });
            this.submissionReady = new NativePromise((resolve, reject) => {
                this.submissionReadyResolve = resolve;
                this.submissionReadyReject = reject;
            });
            this.shortcuts = [];
            this.localize().then(() => {
                this.language = this.options.language;
            });
            if (this.options.saveDraft && Formio.events) {
                Formio.events.on('formio.user', user => {
                    this.formReady.then(() => {
                        if (!this.submissionSet) {
                            this.restoreDraft(user._id);
                        }
                    });
                });
            }
            this.component.clearOnHide = false;
            this.root = this;
        }
        set language(lang) {
            return new NativePromise((resolve, reject) => {
                this.options.language = lang;
                if (i18next.language === lang) {
                    return resolve();
                }
                try {
                    i18next.changeLanguage(lang, err => {
                        if (err) {
                            return reject(err);
                        }
                        this.redraw();
                        this.emit('languageChanged');
                        resolve();
                    });
                } catch (err) {
                    return reject(err);
                }
            });
        }
        addLanguage(code, lang, active = false) {
            i18next.addResourceBundle(code, 'translation', lang, true, true);
            if (active) {
                this.language = code;
            }
        }
        localize() {
            if (i18next.initialized) {
                return NativePromise.resolve(i18next);
            }
            i18next.initialized = true;
            return new NativePromise((resolve, reject) => {
                try {
                    i18next.init(this.options.i18n, err => {
                        this.options.language = i18next.language.split(';')[0];
                        if (err) {
                            return reject(err);
                        }
                        resolve(i18next);
                    });
                } catch (err) {
                    return reject(err);
                }
            });
        }
        keyboardCatchableElement(element) {
            if (element.nodeName === 'TEXTAREA') {
                return false;
            }
            if (element.nodeName === 'INPUT') {
                return [
                    'text',
                    'email',
                    'password'
                ].indexOf(element.type) === -1;
            }
            return true;
        }
        executeShortcuts(event) {
            const {target} = event;
            if (!this.keyboardCatchableElement(target)) {
                return;
            }
            const ctrl = event.ctrlKey || event.metaKey;
            const keyCode = event.keyCode;
            let char = '';
            if (65 <= keyCode && keyCode <= 90) {
                char = String.fromCharCode(keyCode);
            } else if (keyCode === 13) {
                char = 'Enter';
            } else if (keyCode === 27) {
                char = 'Esc';
            }
            _.each(this.shortcuts, shortcut => {
                if (shortcut.ctrl && !ctrl) {
                    return;
                }
                if (shortcut.shortcut === char) {
                    shortcut.element.click();
                    event.preventDefault();
                }
            });
        }
        addShortcut(element, shortcut) {
            if (!shortcut || !/^([A-Z]|Enter|Esc)$/i.test(shortcut)) {
                return;
            }
            shortcut = _.capitalize(shortcut);
            if (shortcut === 'Enter' || shortcut === 'Esc') {
                if (element.tagName !== 'BUTTON') {
                    return;
                }
                this.shortcuts.push({
                    shortcut,
                    element
                });
            } else {
                this.shortcuts.push({
                    ctrl: true,
                    shortcut,
                    element
                });
            }
        }
        removeShortcut(element, shortcut) {
            if (!shortcut || !/^([A-Z]|Enter|Esc)$/i.test(shortcut)) {
                return;
            }
            _.remove(this.shortcuts, {
                shortcut,
                element
            });
        }
        get src() {
            return this._src;
        }
        loadSubmission() {
            this.loadingSubmission = true;
            if (this.formio.submissionId) {
                this.onSubmission = this.formio.loadSubmission().then(submission => this.setSubmission(submission), err => this.submissionReadyReject(err)).catch(err => this.submissionReadyReject(err));
            } else {
                this.submissionReadyResolve();
            }
            return this.submissionReady;
        }
        setSrc(value, options) {
            if (this.setUrl(value, options)) {
                this.nosubmit = false;
                return this.formio.loadForm({ params: { live: 1 } }).then(form => {
                    const setForm = this.setForm(form);
                    this.loadSubmission();
                    return setForm;
                }).catch(err => {
                    console.warn(err);
                    this.formReadyReject(err);
                });
            }
            return NativePromise.resolve();
        }
        set src(value) {
            this.setSrc(value);
        }
        get url() {
            return this._src;
        }
        setUrl(value, options) {
            if (!value || typeof value !== 'string' || value === this._src) {
                return false;
            }
            this._src = value;
            this.nosubmit = true;
            this.formio = this.options.formio = new Formio(value, options);
            if (this.type === 'form') {
                this.options.src = value;
            }
            return true;
        }
        set url(value) {
            this.setUrl(value);
        }
        get ready() {
            return this.formReady.then(() => {
                return super.ready.then(() => {
                    return this.loadingSubmission ? this.submissionReady : true;
                });
            });
        }
        get loading() {
            return this._loading;
        }
        set loading(loading) {
            if (this._loading !== loading) {
                this._loading = loading;
                if (!this.loader && loading) {
                    this.loader = this.ce('div', { class: 'loader-wrapper' });
                    const spinner = this.ce('div', { class: 'loader text-center' });
                    this.loader.appendChild(spinner);
                }
                if (this.loader) {
                    try {
                        if (loading) {
                            this.prependTo(this.loader, this.wrapper);
                        } else {
                            this.removeChildFrom(this.loader, this.wrapper);
                        }
                    } catch (err) {
                    }
                }
            }
        }
        setForm(form) {
            this._form = form;
            if (form && form.settings && form.settings.components) {
                this.options.components = form.settings.components;
            }
            if (form && form.module) {
                let formModule = null;
                if (typeof form.module === 'string') {
                    try {
                        formModule = this.evaluate(`return ${ form.module }`);
                    } catch (err) {
                        console.warn(err);
                    }
                } else {
                    formModule = form.module;
                }
                if (formModule) {
                    Formio.use(formModule);
                    if (formModule.options && formModule.options.form) {
                        this.options = Object.assign(this.options, formModule.options.form);
                    }
                }
            }
            this.initialized = false;
            const rebuild = this.rebuild() || NativePromise.resolve();
            return rebuild.then(() => {
                this.emit('formLoad', form);
                this.triggerRecaptcha();
                setTimeout(() => {
                    this.onChange();
                    this.formReadyResolve();
                }, 0);
                return this.formReady;
            });
        }
        get form() {
            if (!this._form) {
                this._form = { components: [] };
            }
            return this._form;
        }
        set form(form) {
            this.setForm(form);
        }
        get submission() {
            return this.getValue();
        }
        set submission(submission) {
            this.setSubmission(submission);
        }
        setSubmission(submission, flags = {}) {
            flags = {
                ...flags,
                fromSubmission: true
            };
            return this.onSubmission = this.formReady.then(() => {
                this.submissionSet = true;
                this.triggerChange(flags);
                this.setValue(submission, flags);
                return this.submissionReadyResolve(submission);
            }, err => this.submissionReadyReject(err)).catch(err => this.submissionReadyReject(err));
        }
        saveDraft() {
            if (!this.draftEnabled) {
                return;
            }
            if (!this.formio) {
                console.warn('Cannot save draft because there is no formio instance.');
                return;
            }
            if (!Formio.getUser()) {
                console.warn('Cannot save draft unless a user is authenticated.');
                return;
            }
            const draft = this.submission;
            draft.state = 'draft';
            if (!this.savingDraft) {
                this.savingDraft = true;
                this.formio.saveSubmission(draft).then(sub => {
                    const currentSubmission = _.merge(sub, draft);
                    this.emit('saveDraft', sub);
                    if (!draft._id) {
                        this.setSubmission(currentSubmission).then(() => {
                            this.savingDraft = false;
                        });
                    } else {
                        this.savingDraft = false;
                    }
                });
            }
        }
        restoreDraft(userId) {
            if (!this.formio) {
                console.warn('Cannot restore draft because there is no formio instance.');
                return;
            }
            this.savingDraft = true;
            this.formio.loadSubmissions({
                params: {
                    state: 'draft',
                    owner: userId
                }
            }).then(submissions => {
                if (submissions.length > 0 && !this.options.skipDraftRestore) {
                    const draft = utils.fastCloneDeep(submissions[0]);
                    return this.setSubmission(draft).then(() => {
                        this.draftEnabled = true;
                        this.savingDraft = false;
                        this.emit('restoreDraft', draft);
                    });
                }
                this.draftEnabled = true;
                this.savingDraft = false;
                this.emit('restoreDraft', null);
            });
        }
        get schema() {
            const schema = utils.fastCloneDeep(_.omit(this._form, ['components']));
            schema.components = [];
            this.undefined(component => schema.components.push(component.schema));
            return schema;
        }
        mergeData(_this, _that) {
            _.mergeWith(_this, _that, (thisValue, thatValue) => {
                if (Array.isArray(thisValue) && Array.isArray(thatValue) && thisValue.length !== thatValue.length) {
                    return thatValue;
                }
            });
        }
        setValue(submission, flags = {}) {
            if (!submission || !submission.data) {
                submission = { data: {} };
            }
            this._submission.metadata = submission.metadata || {};
            this.editing = !!submission._id;
            if (!this.options.submissionTimezone && submission.metadata && submission.metadata.timezone) {
                this.options.submissionTimezone = submission.metadata.timezone;
            }
            const changed = super.setValue(submission.data, flags);
            if (!flags.sanitize) {
                this.mergeData(this.data, submission.data);
            }
            submission.data = this.data;
            this._submission = submission;
            return changed;
        }
        getValue() {
            if (!this._submission.data) {
                this._submission.data = {};
            }
            if (this.viewOnly) {
                return this._submission;
            }
            const submission = this._submission;
            submission.data = this.data;
            return this._submission;
        }
        init() {
            this._submission = this._submission || { data: {} };
            if (this.components && this.components.length) {
                this.destroyComponents();
                this.components = [];
            }
            if (this.component) {
                this.component.components = this.form ? this.form.components : [];
            } else {
                this.component = this.form;
            }
            this.component.type = 'form';
            this.component.input = false;
            this.addComponents();
            this.on('submitButton', options => {
                this.submit(false, options).catch(e => e !== false && console.log(e));
            }, true);
            this.on('checkValidity', data => this.checkValidity(data, true, data), true);
            this.on('requestUrl', args => this.submitUrl(args.url, args.headers), true);
            this.on('resetForm', () => this.resetValue(), true);
            this.on('deleteSubmission', () => this.deleteSubmission(), true);
            this.on('refreshData', () => this.updateValue(), true);
            this.executeFormController();
            return this.formReady;
        }
        executeFormController() {
            if (!this.form || !this.form.controller || (!this.visible || this.component.hidden) && this.component.clearOnHide && !this.rootPristine) {
                return false;
            }
            this.formReady.then(() => {
                this.evaluate(this.form.controller, { components: this.components });
            });
        }
        destroy() {
            this.off('submitButton');
            this.off('checkValidity');
            this.off('requestUrl');
            this.off('resetForm');
            this.off('deleteSubmission');
            this.off('refreshData');
            return super.destroy();
        }
        build(element) {
            if (element || this.element) {
                return this.ready.then(() => {
                    element = element || this.element;
                    super.build(element);
                });
            }
            return this.ready;
        }
        getClassName() {
            return 'formio-form';
        }
        render() {
            return super.render(this.renderTemplate('webform', {
                classes: this.getClassName(),
                children: this.renderComponents()
            }), this.builderMode ? 'builder' : 'form', true);
        }
        redraw() {
            if (!this.element) {
                return NativePromise.resolve();
            }
            this.clear();
            this.setContent(this.element, this.render());
            return this.attach(this.element);
        }
        attach(element) {
            this.element = element;
            this.loadRefs(element, { webform: 'single' });
            const childPromise = this.attachComponents(this.refs.webform);
            this.addEventListener(this.element, 'keydown', this.executeShortcuts);
            this.currentForm = this;
            return childPromise.then(() => {
                this.emit('render');
                return this.setValue(this._submission, { noUpdateEvent: true });
            });
        }
        hasRequiredFields() {
            let result = false;
            formUtils.eachComponent(this.form.components, component => {
                if (component.validate.required) {
                    result = true;
                    return true;
                }
            }, true);
            return result;
        }
        resetValue() {
            _.each(this.getComponents(), comp => comp.resetValue());
            this.setPristine(true);
        }
        setAlert(type, message) {
            if (!type && this.submitted) {
                if (this.alert) {
                    if (this.refs.errorRef && this.refs.errorRef.length) {
                        this.refs.errorRef.forEach(el => {
                            this.removeEventListener(el, 'click');
                            this.removeEventListener(el, 'keypress');
                        });
                    }
                    this.removeChild(this.alert);
                    this.alert = null;
                }
                return;
            }
            if (this.options.noAlerts) {
                if (!message) {
                    this.emit('error', false);
                }
                return;
            }
            if (this.alert) {
                try {
                    if (this.refs.errorRef && this.refs.errorRef.length) {
                        this.refs.errorRef.forEach(el => {
                            this.removeEventListener(el, 'click');
                            this.removeEventListener(el, 'keypress');
                        });
                    }
                    this.removeChild(this.alert);
                    this.alert = null;
                } catch (err) {
                }
            }
            if (message) {
                this.alert = this.ce('div', {
                    id: `error-list-${ this.id }`,
                    class: `alert alert-${ type }`,
                    role: 'alert'
                });
                if (message instanceof HTMLElement) {
                    this.appendTo(message, this.alert);
                } else {
                    this.setContent(this.alert, message);
                }
            }
            if (!this.alert) {
                return;
            }
            this.loadRefs(this.alert, { errorRef: 'multiple' });
            if (this.refs.errorRef && this.refs.errorRef.length) {
                this.refs.errorRef.forEach(el => {
                    this.addEventListener(el, 'click', e => {
                        const key = e.currentTarget.dataset.componentKey;
                        this.focusOnComponent(key);
                    });
                    this.addEventListener(el, 'keypress', e => {
                        if (e.keyCode === 13) {
                            const key = e.currentTarget.dataset.componentKey;
                            this.focusOnComponent(key);
                        }
                    });
                });
            }
            this.prepend(this.alert);
        }
        focusOnComponent(key) {
            if (key) {
                const component = this.getComponent(key);
                if (component) {
                    component.focus();
                }
            }
        }
        showErrors(error, triggerEvent) {
            this.loading = false;
            let errors = this.errors;
            if (error) {
                if (Array.isArray(error)) {
                    errors = errors.concat(error);
                } else {
                    errors.push(error);
                }
            } else {
                errors = super.errors;
            }
            errors = errors.concat(this.customErrors);
            if (!errors.length) {
                this.setAlert(false);
                return;
            }
            errors.forEach(err => {
                const {
                    components = []
                } = err;
                if (err.component) {
                    components.push(err.component);
                }
                if (err.path) {
                    components.push(err.path);
                }
                components.forEach(path => {
                    const component = this.getComponent(path, _.identity);
                    const components = _.compact(Array.isArray(component) ? component : [component]);
                    components.forEach(component => component.setCustomValidity(err.message, true));
                });
            });
            const message = document.createDocumentFragment();
            const p = this.ce('p');
            this.setContent(p, this.t('error'));
            const ul = this.ce('ul');
            errors.forEach(err => {
                if (err) {
                    const createListItem = message => {
                        const params = {
                            ref: 'errorRef',
                            tabIndex: 0,
                            'aria-label': `${ message }. Click to navigate to the field with following error.`
                        };
                        const li = this.ce('li', params);
                        this.setContent(li, message);
                        if (err.component && err.component.key) {
                            li.dataset.componentKey = err.component.key;
                        }
                        this.appendTo(li, ul);
                    };
                    if (err.messages && err.messages.length) {
                        err.messages.forEach(({message}) => createListItem(`${ this.t(err.component.label) }. ${ message }`));
                    } else if (err) {
                        const message = _.isObject(err) ? err.message || '' : err;
                        createListItem(message);
                    }
                }
            });
            p.appendChild(ul);
            message.appendChild(p);
            this.setAlert('danger', message);
            if (triggerEvent) {
                this.emit('error', errors);
            }
            return errors;
        }
        onSubmit(submission, saved) {
            this.loading = false;
            this.submitting = false;
            this.setPristine(true);
            this.setValue(utils.fastCloneDeep(submission), {
                noValidate: true,
                noCheck: true
            });
            this.setAlert('success', `<p>${ this.t('complete') }</p>`);
            this.emit('submit', submission);
            if (saved) {
                this.emit('submitDone', submission);
            }
            return submission;
        }
        onSubmissionError(error) {
            if (error) {
                if (typeof error === 'string') {
                    error = { message: error };
                }
                if ('details' in error) {
                    error = error.details;
                }
            }
            this.submitting = false;
            this.setPristine(false);
            this.emit('submitError', error);
            if (error && error.silent) {
                this.emit('change', { isValid: true });
                return false;
            }
            return this.showErrors(error, true);
        }
        onChange(flags, changed, modified) {
            flags = flags || {};
            let isChangeEventEmitted = false;
            if (changed && changed.component) {
                this.customErrors = this.customErrors.filter(err => err.component && err.component !== changed.component.key);
            }
            super.onChange(flags, true);
            const value = _.clone(this.submission);
            flags.changed = value.changed = changed;
            if (modified && this.pristine) {
                this.pristine = false;
            }
            value.isValid = this.checkData(value.data, flags);
            this.loading = false;
            if (this.submitted) {
                this.showErrors();
            }
            if (modified && this.options.saveDraft) {
                this.triggerSaveDraft();
            }
            if (!flags || !flags.noEmit) {
                this.emit('change', value, flags);
                isChangeEventEmitted = true;
            }
            if (isChangeEventEmitted && !this.initialized) {
                this.emit('initialized');
                this.initialized = true;
            }
        }
        checkData(data, flags = {}) {
            const valid = super.checkData(data, flags);
            if ((_.isEmpty(flags) || flags.noValidate) && this.submitted) {
                this.showErrors();
            }
            return valid;
        }
        deleteSubmission() {
            return this.formio.deleteSubmission().then(() => {
                this.emit('submissionDeleted', this.submission);
                this.resetValue();
            });
        }
        cancel(noconfirm) {
            const shouldReset = this.hook('beforeCancel', true);
            if (shouldReset && (noconfirm || confirm('Are you sure you want to cancel?'))) {
                this.resetValue();
                return true;
            } else {
                return false;
            }
        }
        submitForm(options = {}) {
            return new NativePromise((resolve, reject) => {
                if (this.options.readOnly) {
                    return resolve({
                        submission: this.submission,
                        saved: false
                    });
                }
                const submission = utils.fastCloneDeep(this.submission || {});
                submission.metadata = submission.metadata || {};
                _.defaults(submission.metadata, {
                    timezone: _.get(this, '_submission.metadata.timezone', utils.currentTimezone()),
                    offset: parseInt(_.get(this, '_submission.metadata.offset', moment().utcOffset()), 10),
                    referrer: document.referrer,
                    browserName: navigator.appName,
                    userAgent: navigator.userAgent,
                    pathName: window.location.pathname,
                    onLine: navigator.onLine
                });
                submission.state = options.state || 'submitted';
                const isDraft = submission.state === 'draft';
                this.hook('beforeSubmit', {
                    ...submission,
                    component: options.component
                }, err => {
                    if (err) {
                        return reject(err);
                    }
                    if (!isDraft && !submission.data) {
                        return reject('Invalid Submission');
                    }
                    if (!isDraft && !this.checkValidity(submission.data, true, submission.data)) {
                        return reject();
                    }
                    this.everyComponent(comp => {
                        const {persistent} = comp.component;
                        if (persistent === 'client-only') {
                            _.unset(submission.data, comp.path);
                        }
                    });
                    this.hook('customValidation', {
                        ...submission,
                        component: options.component
                    }, err => {
                        if (err) {
                            if (typeof err === 'string') {
                                err = { message: err };
                            }
                            err = Array.isArray(err) ? err : [err];
                            this.customErrors = err;
                            return reject();
                        }
                        this.loading = true;
                        if (this._form && this._form.action) {
                            const method = submission.data._id && this._form.action.includes(submission.data._id) ? 'PUT' : 'POST';
                            return Formio.makeStaticRequest(this._form.action, method, submission, this.formio ? this.formio.options : {}).then(result => resolve({
                                submission: result,
                                saved: true
                            })).catch(reject);
                        }
                        const submitFormio = this.formio;
                        if (this.nosubmit || !submitFormio) {
                            return resolve({
                                submission,
                                saved: false
                            });
                        }
                        const submitMethod = submitFormio.actionUrl ? 'saveAction' : 'saveSubmission';
                        submitFormio[submitMethod](submission).then(result => resolve({
                            submission: result,
                            saved: true
                        })).catch(reject);
                    });
                });
            });
        }
        executeSubmit(options) {
            this.submitted = true;
            this.submitting = true;
            return this.submitForm(options).then(({submission, saved}) => this.onSubmit(submission, saved)).catch(err => NativePromise.reject(this.onSubmissionError(err)));
        }
        submit(before, options) {
            if (!before) {
                return this.beforeSubmit(options).then(() => this.executeSubmit(options));
            } else {
                return this.executeSubmit(options);
            }
        }
        submitUrl(URL, headers) {
            if (!URL) {
                return console.warn('Missing URL argument');
            }
            const submission = this.submission || {};
            const API_URL = URL;
            const settings = {
                method: 'POST',
                headers: {}
            };
            if (headers && headers.length > 0) {
                headers.map(e => {
                    if (e.header !== '' && e.value !== '') {
                        settings.headers[e.header] = this.interpolate(e.value, submission);
                    }
                });
            }
            if (API_URL && settings) {
                try {
                    Formio.makeStaticRequest(API_URL, settings.method, submission, { headers: settings.headers }).then(() => {
                        this.emit('requestDone');
                        this.setAlert('success', '<p> Success </p>');
                    });
                } catch (e) {
                    this.showErrors(`${ e.statusText } ${ e.status }`);
                    this.emit('error', `${ e.statusText } ${ e.status }`);
                    console.error(`${ e.statusText } ${ e.status }`);
                }
            } else {
                this.emit('error', 'You should add a URL to this button.');
                this.setAlert('warning', 'You should add a URL to this button.');
                return console.warn('You should add a URL to this button.');
            }
        }
        triggerRecaptcha() {
            if (!this || !this.components) {
                return;
            }
            const recaptchaComponent = this.components.find(component => {
                return component.component.type === 'recaptcha' && component.component.eventType === 'formLoad';
            });
            if (recaptchaComponent) {
                recaptchaComponent.verify(`${ this.form.name ? this.form.name : 'form' }Load`);
            }
        }
        set nosubmit(value) {
            this._nosubmit = !!value;
            this.emit('nosubmit', this._nosubmit);
        }
        get nosubmit() {
            return this._nosubmit || false;
        }
    };
    Webform.setBaseUrl = Formio.setBaseUrl;
    Webform.setApiUrl = Formio.setApiUrl;
    Webform.setAppUrl = Formio.setAppUrl;


    return Webform;
});