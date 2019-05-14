define([
    'lodash',
    'moment',
    './EventEmitter',
    'i18next',
    './Formio',
    'native-promise-only',
    './components/Components',
    './components/nested/NestedComponent',
    './utils/utils'
], function (_, moment, EventEmitter, i18next, Formio, Promise, Components, NestedComponent, a) {
    'use strict';
    Formio.forms = {};
    Formio.registerComponent = Components.setComponent;
    function getOptions(options) {
        options = _.defaults(options, {
            submitOnEnter: false,
            icons: Formio.icons || '',
            i18next,
            saveDraft: false,
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
    return class Webform extends NestedComponent {
        constructor(element, options) {
            super(null, getOptions(options));
            Formio.forms[this.id] = this;
            if (this.options.baseUrl) {
                Formio.setBaseUrl(this.options.baseUrl);
            }
            let i18n = require('./i18n').default;
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
            this._submission = {};
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
            this.onFormBuild = null;
            this.submissionSet = false;
            this.formReady = new Promise((resolve, reject) => {
                this.formReadyResolve = resolve;
                this.formReadyReject = reject;
            });
            this.submissionReady = new Promise((resolve, reject) => {
                this.submissionReadyResolve = resolve;
                this.submissionReadyReject = reject;
            });
            this.onElement = new Promise(resolve => {
                this.elementResolve = resolve;
                this.setElement(element);
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
        }
        set language(lang) {
            return new Promise((resolve, reject) => {
                this.options.language = lang;
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
                return Promise.resolve(i18next);
            }
            i18next.initialized = true;
            return new Promise((resolve, reject) => {
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
        setElement(element) {
            if (!element) {
                return;
            }
            if (this.element) {
                this.element.removeEventListener('keydown', this.executeShortcuts.bind(this));
            }
            this.wrapper = element;
            this.element = this.ce('div');
            this.wrapper.appendChild(this.element);
            this.showElement(false);
            this.element.addEventListener('keydown', this.executeShortcuts.bind(this));
            let classNames = this.element.getAttribute('class');
            classNames += ' formio-form';
            this.addClass(this.wrapper, classNames);
            this.loading = true;
            this.elementResolve(element);
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
                this.formio.loadForm({ params: { live: 1 } }).then(form => {
                    const setForm = this.setForm(form);
                    this.loadSubmission();
                    return setForm;
                }).catch(err => {
                    console.warn(err);
                    this.formReadyReject(err);
                });
            }
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
                return this.loadingSubmission ? this.submissionReady : true;
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
            if (form.display === 'wizard') {
                console.warn('You need to instantiate the FormioWizard class to use this form as a wizard.');
            }
            if (this.onFormBuild) {
                return this.onFormBuild.then(() => this.createForm(form), err => this.formReadyReject(err)).catch(err => this.formReadyReject(err));
            }
            this._form = form;
            if (form && form.settings && form.settings.components) {
                this.options.components = form.settings.components;
            }
            this.initialized = false;
            return this.createForm(form).then(() => {
                this.emit('formLoad', form);
                this.triggerRecaptcha();
                return form;
            });
        }
        get form() {
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
        setSubmission(submission, flags) {
            return this.onSubmission = this.formReady.then(() => {
                this.submissionSet = true;
                if (!this.setValue(submission, flags)) {
                    if (this.hasChanged(submission, this.getValue())) {
                        this.triggerChange({ noValidate: true });
                    }
                }
                return this.dataReady.then(() => this.submissionReadyResolve(submission));
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
            const draft = _.cloneDeep(this.submission);
            draft.state = 'draft';
            if (!this.savingDraft) {
                this.savingDraft = true;
                this.formio.saveSubmission(draft).then(sub => {
                    this.savingDraft = false;
                    this.emit('saveDraft', sub);
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
                if (submissions.length > 0) {
                    const draft = _.cloneDeep(submissions[0]);
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
            const schema = this._form;
            schema.components = [];
            this.eachComponent(component => schema.components.push(component.schema));
            return schema;
        }
        mergeData(_this, _that) {
            _.mergeWith(_this, _that, (thisValue, thatValue) => {
                if (Array.isArray(thisValue) && Array.isArray(thatValue) && thisValue.length !== thatValue.length) {
                    return thatValue;
                }
            });
        }
        setValue(submission, flags) {
            if (!submission || !submission.data) {
                submission = { data: {} };
            }
            this._submission.metadata = submission.metadata || {};
            if (!this.options.submissionTimezone && submission.metadata && submission.metadata.timezone) {
                this.options.submissionTimezone = submission.metadata.timezone;
            }
            const changed = super.setValue(submission.data, flags);
            this.mergeData(this.data, submission.data);
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
        createForm(form) {
            if (this.component) {
                this.component.components = form.components;
            } else {
                this.component = form;
            }
            return this.onFormBuild = this.render().then(() => {
                this.formReadyResolve();
                this.onFormBuild = null;
                this.setValue(this.submission);
                if (!this.changing) {
                    this.triggerChange();
                }
                return form;
            }).catch(err => {
                console.warn(err);
                this.formReadyReject(err);
            });
        }
        render() {
            return this.onElement.then(() => {
                const state = this.clear();
                this.showElement(false);
                clearTimeout(this.build(state));
                this.isBuilt = true;
                this.on('resetForm', () => this.resetValue(), true);
                this.on('deleteSubmission', () => this.deleteSubmission(), true);
                this.on('refreshData', () => this.updateValue(), true);
                setTimeout(() => this.emit('render'), 1);
            });
        }
        resetValue() {
            _.each(this.getComponents(), comp => comp.resetValue());
            this.setPristine(true);
        }
        setAlert(type, message) {
            if (this.options.noAlerts) {
                if (!message) {
                    this.emit('error', false);
                }
                return;
            }
            if (this.alert) {
                try {
                    this.removeChild(this.alert);
                    this.alert = null;
                } catch (err) {
                }
            }
            if (message) {
                this.alert = this.ce('div', {
                    class: `alert alert-${ type }`,
                    role: 'alert'
                });
                this.alert.innerHTML = message;
            }
            if (!this.alert) {
                return;
            }
            this.prepend(this.alert);
        }
        build(state) {
            this.on('submitButton', options => this.submit(false, options), true);
            this.on('checkValidity', data => this.checkValidity(null, true, data), true);
            this.addComponents(null, null, null, state);
            this.currentForm = this;
            this.on('requestUrl', args => this.submitUrl(args.url, args.headers), true);
            return setTimeout(() => {
                this.onChange({ noEmit: true });
            }, 1);
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
            const message = `
      <p>${ this.t('error') }</p>
      <ul>
        ${ errors.map(err => err ? `<li><strong>${ err.message || err }</strong></li>` : '').join('') }
      </ul>
    `;
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
            this.setValue(submission, {
                noValidate: true,
                noCheck: true
            });
            this.setAlert('success', `<p>${ this.t('complete') }</p>`);
            if (!submission.hasOwnProperty('saved')) {
                submission.saved = saved;
            }
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
            return this.showErrors(error, true);
        }
        onChange(flags, changed) {
            let isChangeEventEmitted = false;
            if (changed && changed.component) {
                this.customErrors = this.customErrors.filter(err => err.component && err.component !== changed.component.key);
            }
            super.onChange(flags, true);
            const value = _.clone(this._submission);
            value.changed = changed;
            value.isValid = this.checkData(value.data, flags, changed ? changed.instance : null);
            this.showElement(true);
            this.loading = false;
            if (this.submitted) {
                this.showErrors();
            }
            if (flags && flags.modified && this.options.saveDraft) {
                this.triggerSaveDraft();
            }
            if (!flags || !flags.noEmit) {
                this.emit('change', value);
                isChangeEventEmitted = true;
            }
            if (isChangeEventEmitted && !this.initialized) {
                this.emit('initialized');
                this.initialized = true;
            }
        }
        checkData(data, flags, source) {
            const valid = super.checkData(data, flags, source);
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
            if (noconfirm || confirm('Are you sure you want to cancel?')) {
                this.emit('resetForm');
                this.resetValue();
                return true;
            } else {
                return false;
            }
        }
        submitForm(options = {}) {
            return new Promise((resolve, reject) => {
                if (this.options.readOnly) {
                    return resolve({
                        submission: this.submission,
                        saved: false
                    });
                }
                this.submission.metadata = this.submission.metadata || {};
                _.defaults(this.submission.metadata, {
                    timezone: _.get(this, '_submission.metadata.timezone', a.currentTimezone()),
                    offset: parseInt(_.get(this, '_submission.metadata.offset', moment().utcOffset()), 10),
                    referrer: document.referrer,
                    browserName: navigator.appName,
                    userAgent: navigator.userAgent,
                    pathName: window.location.pathname,
                    onLine: navigator.onLine
                });
                const submission = _.cloneDeep(this.submission || {});
                submission.state = options.state || 'submitted';
                const isDraft = submission.state === 'draft';
                this.hook('beforeSubmit', submission, err => {
                    if (err) {
                        return reject(err);
                    }
                    if (!isDraft && !submission.data) {
                        return reject('Invalid Submission');
                    }
                    if (!isDraft && !this.checkValidity(submission.data, true)) {
                        return reject();
                    }
                    this.getAllComponents().forEach(comp => {
                        const {persistent, key} = comp.component;
                        if (persistent === 'client-only') {
                            delete submission.data[key];
                        }
                    });
                    this.hook('customValidation', submission, err => {
                        if (err) {
                            if (typeof err === 'string') {
                                err = { message: err };
                            }
                            err = Array.isArray(err) ? err : [err];
                            this.customErrors = err;
                            return reject();
                        }
                        this.loading = true;
                        let submitFormio = this.formio;
                        if (this._form && this._form.action) {
                            submitFormio = new Formio(this._form.action, this.formio ? this.formio.options : {});
                        }
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
            return this.submitForm(options).then(({submission, saved}) => this.onSubmit(submission, saved)).catch(err => Promise.reject(this.onSubmissionError(err)));
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
        set nosubmit(value) {
            this._nosubmit = !!value;
            this.emit('nosubmit', this._nosubmit);
        }
        get nosubmit() {
            return this._nosubmit || false;
        }
        triggerRecaptcha() {
            let recaptchaComponent;
            this.root.everyComponent(component => {
                if (component.component.type === 'recaptcha' && component.component.eventType === 'formLoad') {
                    recaptchaComponent = component;
                    return false;
                }
            });
            if (recaptchaComponent) {
                recaptchaComponent.verify(`${ this.form.name ? this.form.name : 'form' }Load`);
            }
        }
    };
    Webform.setBaseUrl = Formio.setBaseUrl;
    Webform.setApiUrl = Formio.setApiUrl;
    Webform.setAppUrl = Formio.setAppUrl;
});