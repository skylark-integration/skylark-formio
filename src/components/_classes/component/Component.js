define([
    "skylark-langx",
    '../../../vendors/vanilla-text-mask/conformToMask',
    '../../../vendors/getify/npo',
    '../../../vendors/tooltip-js/Tooltip',
    'skylark-lodash',
    '../../../vendors/ismobilejs/isMobile',
    '../../../Formio',
    '../../../utils/utils',
    '../../../validator/Validator',
    '../../../templates/Templates',
    '../../../utils/utils',
    '../../../Element',
    '../componentModal/ComponentModal'
], function (langx,conformToMask, NativePromise, Tooltip, _, isMobile, Formio, FormioUtils, Validator, Templates, utils, Element, ComponentModal) {
    'use strict';
    const CKEDITOR = 'https://cdn.form.io/ckeditor/16.0.0/ckeditor.js';
    const QUILL_URL = 'https://cdn.form.io/quill/1.3.7';
    const ACE_URL = 'https://cdn.form.io/ace/1.4.8/ace.js';
    const TINYMCE_URL = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js';
    return class Component extends Element {
        static schema(...sources) {
            return langx.mixin({  //_.merge 
                input: true,
                key: '',
                placeholder: '',
                prefix: '',
                customClass: '',
                suffix: '',
                multiple: false,
                defaultValue: null,
                protected: false,
                unique: false,
                persistent: true,
                hidden: false,
                clearOnHide: true,
                refreshOn: '',
                redrawOn: '',
                tableView: false,
                modalEdit: false,
                label: '',
                labelPosition: 'top',
                description: '',
                errorLabel: '',
                tooltip: '',
                hideLabel: false,
                tabindex: '',
                disabled: false,
                autofocus: false,
                dbIndex: false,
                customDefaultValue: '',
                calculateValue: '',
                widget: null,
                attributes: {},
                validateOn: 'change',
                validate: {
                    required: false,
                    custom: '',
                    customPrivate: false,
                    strictDateValidation: false,
                    multiple: false,
                    unique: false
                },
                conditional: {
                    show: null,
                    when: null,
                    eq: ''
                },
                overlay: {
                    style: '',
                    left: '',
                    top: '',
                    width: '',
                    height: ''
                },
                allowCalculateOverride: false,
                encrypted: false,
                showCharCount: false,
                showWordCount: false,
                properties: {},
                allowMultipleMasks: false
            }, ...sources);
        }
        static tableView(value, options) {
        }
        constructor(component, options, data) {
            super(Object.assign({
                renderMode: 'form',
                attachMode: 'full'
            }, options || {}));
            this._hasCondition = null;
            this.refs = {};
            if (component && this.options.components && this.options.components[component.type]) {
                langx.mixin(component, this.options.components[component.type]); //_.merge
            }
            this.validator = Validator;
            this.path = '';
            this.component = this.mergeSchema(component || {});
            this.originalComponent = utils.fastCloneDeep(this.component);
            this.attached = false;
            this.rendered = false;
            this._data = data || {};
            this.component.id = this.id;
            this.error = '';
            this.tooltip = '';
            this.row = this.options.row;
            this._disabled = utils.boolValue(this.component.disabled) ? this.component.disabled : false;
            this.root = this.options.root;
            this.pristine = true;
            this.parent = this.options.parent;
            this.options.name = this.options.name || 'data';
            this.validators = [
                'required',
                'minLength',
                'maxLength',
                'minWords',
                'maxWords',
                'custom',
                'pattern',
                'json',
                'mask'
            ];
            this._path = '';
            this._parentVisible = this.options.hasOwnProperty('parentVisible') ? this.options.parentVisible : true;
            this._visible = this._parentVisible && this.conditionallyVisible(null, data);
            this._parentDisabled = false;
            let lastChanged = null;
            let triggerArgs = [];
            const _triggerChange = langx.debounce((...args) => {
                if (this.root) {
                    this.root.changing = false;
                }
                triggerArgs = [];
                if (!args[1] && lastChanged) {
                    args[1] = lastChanged;
                }
                if (langx.isEmpty(args[0]) && lastChanged) {
                    args[0] = lastChanged.flags;
                }
                lastChanged = null;
                return this.onChange(...args);
            }, 100);
            this.triggerChange = (...args) => {
                if (args[1]) {
                    lastChanged = args[1];
                }
                if (this.root) {
                    this.root.changing = true;
                }
                if (args.length) {
                    triggerArgs = args;
                }
                return _triggerChange(...triggerArgs);
            };
            this.triggerRedraw = langx.debounce(this.redraw.bind(this), 100);
            this.tooltips = [];
            this.invalid = false;
            if (this.component) {
                this.type = this.component.type;
                if (this.allowData && this.key) {
                    this.options.name += `[${ this.key }]`;
                    if (this.visible || !this.component.clearOnHide) {
                        if (!this.hasValue()) {
                            this.dataValue = this.defaultValue;
                        } else {
                            this.dataValue = this.dataValue;
                        }
                    }
                }
                this.info = this.elementInfo();
            }
            this.hook('component');
            if (!this.options.skipInit) {
                this.init();
            }
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
        }
        mergeSchema(component = {}) {
            return _.defaultsDeep(component, this.defaultSchema);
        }
        get ready() {
            return NativePromise.resolve(this);
        }
        get labelInfo() {
            const label = {};
            label.hidden = this.labelIsHidden();
            label.className = '';
            label.labelPosition = this.component.labelPosition;
            label.tooltipClass = `${ this.iconClass('question-sign') } text-muted`;
            if (this.hasInput && this.component.validate && utils.boolValue(this.component.validate.required)) {
                label.className += ' field-required';
            }
            if (label.hidden) {
                label.className += ' control-label--hidden';
            }
            if (this.info.attr.id) {
                label.for = this.info.attr.id;
            }
            return label;
        }
        init() {
            this.disabled = this.shouldDisabled;
        }
        destroy() {
            super.destroy();
            this.detach();
        }
        get shouldDisabled() {
            return this.options.readOnly || this.component.disabled || this.options.hasOwnProperty('disabled') && this.options.disabled[this.key];
        }
        get isInputComponent() {
            return !this.component.hasOwnProperty('input') || this.component.input;
        }
        get allowData() {
            return this.hasInput;
        }
        get hasInput() {
            return this.isInputComponent || this.refs.input && this.refs.input.length;
        }
        get defaultSchema() {
            return Component.schema();
        }
        get key() {
            return langx.get(this.component, 'key', '');
        }
        set parentVisible(value) {
            if (this._parentVisible !== value) {
                this._parentVisible = value;
                this.clearOnHide();
                this.redraw();
            }
        }
        get parentVisible() {
            return this._parentVisible;
        }
        set parentDisabled(value) {
            if (this._parentDisabled !== value) {
                this._parentDisabled = value;
                this.clearOnHide();
                this.redraw();
            }
        }
        get parentDisabled() {
            return this._parentDisabled;
        }
        set visible(value) {
            if (this._visible !== value) {
                this._visible = value;
                this.clearOnHide();
                this.redraw();
            }
        }
        get visible() {
            if (this.builderMode || this.options.showHiddenFields) {
                return true;
            }
            if (this.options.hide && this.options.hide[this.component.key]) {
                return false;
            }
            if (this.options.show && this.options.show[this.component.key]) {
                return true;
            }
            return this._visible && this._parentVisible;
        }
        get currentForm() {
            return this._currentForm;
        }
        set currentForm(instance) {
            this._currentForm = instance;
        }
        get fullMode() {
            return this.options.attachMode === 'full';
        }
        get builderMode() {
            return this.options.attachMode === 'builder';
        }
        get calculatedPath() {
            if (this._path) {
                return this._path;
            }
            this._path = this.key;
            if (!this.root) {
                return this._path;
            }
            let parent = this.parent;
            while (parent && parent.id !== this.root.id) {
                if ([
                        'datagrid',
                        'container',
                        'editgrid'
                    ].includes(parent.type) || parent.tree) {
                    this._path = `${ parent.key }.${ this._path }`;
                }
                parent = parent.parent;
            }
            return this._path;
        }
        get labelPosition() {
            return this.component.labelPosition;
        }
        get labelWidth() {
            return this.component.labelWidth || 30;
        }
        get labelMargin() {
            return this.component.labelMargin || 3;
        }
        get isAdvancedLabel() {
            return [
                'left-left',
                'left-right',
                'right-left',
                'right-right'
            ].includes(this.labelPosition);
        }
        get labelPositions() {
            return this.labelPosition.split('-');
        }
        rightDirection(direction) {
            return direction === 'right';
        }
        getLabelInfo() {
            const isRightPosition = this.rightDirection(this.labelPositions[0]);
            const isRightAlign = this.rightDirection(this.labelPositions[1]);
            const labelStyles = `
      flex: ${ this.labelWidth };
      ${ isRightPosition ? 'margin-left' : 'margin-right' }:${ this.labelMargin }%;
    `;
            const contentStyles = `
      flex: ${ 100 - this.labelWidth - this.labelMargin };
    `;
            return {
                isRightPosition,
                isRightAlign,
                labelStyles,
                contentStyles
            };
        }
        getModifiedSchema(schema, defaultSchema, recursion) {
            const modified = {};
            if (!defaultSchema) {
                return schema;
            }
            langx.forEach(schema, (val, key) => { //_.each
                if (!langx.isArray(val) && langx.isObject(val) && defaultSchema.hasOwnProperty(key)) {
                    const subModified = this.getModifiedSchema(val, defaultSchema[key], true);
                    if (!langx.isEmpty(subModified)) {
                        modified[key] = subModified;
                    }
                } else if (langx.isArray(val)) {
                    if (val.length !== 0) {
                        modified[key] = val;
                    }
                } else if (!recursion && key === 'type' || !recursion && key === 'key' || !recursion && key === 'label' || !recursion && key === 'input' || !recursion && key === 'tableView' || val !== '' && !defaultSchema.hasOwnProperty(key) || val !== '' && val !== defaultSchema[key]) {
                    modified[key] = val;
                }
            });
            return modified;
        }
        get schema() {
            return utils.fastCloneDeep(this.getModifiedSchema(_.omit(this.component, 'id'), this.defaultSchema));
        }
        t(text, params) {
            if (!text) {
                return '';
            }
            params = params || {};
            params.data = this.rootValue;
            params.row = this.data;
            params.component = this.component;
            params.nsSeparator = '::';
            params.keySeparator = '.|.';
            params.pluralSeparator = '._.';
            params.contextSeparator = '._.';
            const translated = this.i18next.t(text, params);
            return translated || text;
        }
        labelIsHidden() {
            return !this.component.label || !this.inDataGrid && this.component.hideLabel || this.inDataGrid && !this.component.dataGridLabel || this.options.inputsOnly;
        }
        get transform() {
            return Templates.current.hasOwnProperty('transform') ? Templates.current.transform.bind(Templates.current) : (type, value) => value;
        }
        getTemplate(names, modes) {
            modes = Array.isArray(modes) ? modes : [modes];
            names = Array.isArray(names) ? names : [names];
            if (!modes.includes('form')) {
                modes.push('form');
            }
            let result = null;
            if (this.options.templates) {
                result = this.checkTemplate(this.options.templates, names, modes);
                if (result) {
                    return result;
                }
            }
            const frameworkTemplates = this.options.template ? Templates.templates[this.options.template] : Templates.current;
            result = this.checkTemplate(frameworkTemplates, names, modes);
            if (result) {
                return result;
            }
            const name = names[names.length - 1];
            const templatesByName = Templates.defaultTemplates[name];
            if (!templatesByName) {
                return `Unknown template: ${ name }`;
            }
            const templateByMode = this.checkTemplateMode(templatesByName, modes);
            if (templateByMode) {
                return templateByMode;
            }
            return templatesByName.form;
        }
        checkTemplate(templates, names, modes) {
            for (const name of names) {
                const templatesByName = templates[name];
                if (templatesByName) {
                    const templateByMode = this.checkTemplateMode(templatesByName, modes);
                    if (templateByMode) {
                        return templateByMode;
                    }
                }
            }
            return null;
        }
        checkTemplateMode(templatesByName, modes) {
            for (const mode of modes) {
                const templateByMode = templatesByName[mode];
                if (templateByMode) {
                    return templateByMode;
                }
            }
            return null;
        }
        renderTemplate(name, data = {}, modeOption) {
            const mode = modeOption || this.options.renderMode || 'form';
            data.component = this.component;
            data.self = this;
            data.options = this.options;
            data.readOnly = this.options.readOnly;
            data.iconClass = this.iconClass.bind(this);
            data.t = this.t.bind(this);
            data.transform = this.transform;
            data.id = data.id || this.id;
            data.key = data.key || this.key;
            data.value = data.value || this.dataValue;
            data.disabled = this.disabled;
            data.builder = this.builderMode;
            data.render = (...args) => {
                console.warn(`Form.io 'render' template function is deprecated.
      If you need to render template (template A) inside of another template (template B),
      pass pre-compiled template A (use this.renderTemplate('template_A_name') as template context variable for template B`);
                return this.renderTemplate(...args);
            };
            data.label = this.labelInfo;
            data.tooltip = this.interpolate(this.component.tooltip || '').replace(/(?:\r\n|\r|\n)/g, '<br />');
            const names = [
                `${ name }-${ this.component.type }-${ this.key }`,
                `${ name }-${ this.component.type }`,
                `${ name }-${ this.key }`,
                `${ name }`
            ];
            return this.hook(`render${ name.charAt(0).toUpperCase() + name.substring(1, name.length) }`, this.interpolate(this.getTemplate(names, mode), data), data, mode);
        }
        sanitize(dirty) {
            return FormioUtils.sanitize(dirty, this.options);
        }
        renderString(template, data) {
            if (!template) {
                return '';
            }
            return this.interpolate(template, data);
        }
        performInputMapping(input) {
            return input;
        }
        getBrowserLanguage() {
            const nav = window.navigator;
            const browserLanguagePropertyKeys = [
                'language',
                'browserLanguage',
                'systemLanguage',
                'userLanguage'
            ];
            let language;
            if (Array.isArray(nav.languages)) {
                for (let i = 0; i < nav.languages.length; i++) {
                    language = nav.languages[i];
                    if (language && language.length) {
                        return language.split(';')[0];
                    }
                }
            }
            for (let i = 0; i < browserLanguagePropertyKeys.length; i++) {
                language = nav[browserLanguagePropertyKeys[i]];
                if (language && language.length) {
                    return language.split(';')[0];
                }
            }
            return null;
        }
        beforePage() {
            return NativePromise.resolve(true);
        }
        beforeNext() {
            return this.beforePage(true);
        }
        beforeSubmit() {
            return NativePromise.resolve(true);
        }
        get submissionTimezone() {
            this.options.submissionTimezone = this.options.submissionTimezone || langx.get(this.root, 'options.submissionTimezone');
            return this.options.submissionTimezone;
        }
        loadRefs(element, refs) {
            for (const ref in refs) {
                if (refs[ref] === 'single') {
                    this.refs[ref] = element.querySelector(`[ref="${ ref }"]`);
                } else {
                    this.refs[ref] = element.querySelectorAll(`[ref="${ ref }"]`);
                }
            }
        }
        setOpenModalElement() {
            const template = `
      <label class="control-label">${ this.component.label }</label><br>
      <button lang='en' class='btn btn-light btn-md open-modal-button' ref='openModal'>Click to set value</button>
    `;
            this.componentModal.setOpenModalElement(template);
        }
        getModalPreviewTemplate() {
            return `
      <label class="control-label">${ this.component.label }</label><br>
      <button lang='en' class='btn btn-light btn-md open-modal-button' ref='openModal'>${ this.getValueAsString(this.dataValue) }</button>`;
        }
        build(element) {
            element = element || this.element;
            this.empty(element);
            this.setContent(element, this.render());
            return this.attach(element);
        }
        render(children = `Unknown component: ${ this.component.type }`, topLevel = false) {
            const isVisible = this.visible;
            this.rendered = true;
            if (!this.builderMode && this.component.modalEdit) {
                return ComponentModal.render(this, {
                    visible: isVisible,
                    id: this.id,
                    classes: this.className,
                    styles: this.customStyle,
                    children
                }, topLevel);
            } else {
                return this.renderTemplate('component', {
                    visible: isVisible,
                    id: this.id,
                    classes: this.className,
                    styles: this.customStyle,
                    children
                }, topLevel);
            }
        }
        attach(element) {
            if (!this.builderMode && this.component.modalEdit) {
                this.componentModal = new ComponentModal(this, element);
                this.setOpenModalElement();
            }
            this.attached = true;
            this.element = element;
            element.component = this;
            if (this.element.id) {
                this.id = this.element.id;
            }
            this.loadRefs(element, {
                messageContainer: 'single',
                tooltip: 'multiple'
            });
            this.refs.tooltip.forEach((tooltip, index) => {
                const title = this.interpolate(tooltip.getAttribute('data-title') || this.t(this.component.tooltip)).replace(/(?:\r\n|\r|\n)/g, '<br />');
                this.tooltips[index] = new Tooltip(tooltip, {
                    trigger: 'hover click focus',
                    placement: 'right',
                    html: true,
                    title: title,
                    template: `
          <div class="tooltip" style="opacity: 1;" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner"></div>
          </div>`
                });
            });
            this.attachLogic();
            this.autofocus();
            this.hook('attachComponent', element, this);
            const type = this.component.type;
            if (type) {
                this.hook(`attach${ type.charAt(0).toUpperCase() + type.substring(1, type.length) }`, element, this);
            }
            return NativePromise.resolve();
        }
        addShortcut(element, shortcut) {
            if (!element || !this.root || this.root === this) {
                return;
            }
            if (!shortcut) {
                shortcut = this.component.shortcut;
            }
            this.root.addShortcut(element, shortcut);
        }
        removeShortcut(element, shortcut) {
            if (!element || this.root === this) {
                return;
            }
            if (!shortcut) {
                shortcut = this.component.shortcut;
            }
            this.root.removeShortcut(element, shortcut);
        }
        detach() {
            this.refs = {};
            this.removeEventListeners();
            this.detachLogic();
            if (this.tooltip) {
                this.tooltip.dispose();
            }
        }
        checkRefresh(refreshData, changed) {
            const changePath = langx.get(changed, 'instance.calculatedPath', false);
            if (changePath && this.calculatedPath === changePath) {
                return;
            }
            if (refreshData === 'data') {
                this.refresh(this.data);
            } else if (changePath && changePath === refreshData && changed && changed.instance && this.inContext(changed.instance)) {
                this.refresh(changed.value);
            }
        }
        checkRefreshOn(changed) {
            const refreshOn = this.component.refreshOn || this.component.redrawOn;
            if (refreshOn) {
                if (Array.isArray(refreshOn)) {
                    refreshOn.forEach(refreshData => {
                        this.checkRefresh(refreshData, changed);
                    });
                } else {
                    this.checkRefresh(refreshOn, changed);
                }
            }
        }
        refresh(value) {
            if (this.hasOwnProperty('refreshOnValue')) {
                this.refreshOnChanged = !langx.isEqual(value, this.refreshOnValue);
            } else {
                this.refreshOnChanged = true;
            }
            this.refreshOnValue = utils.fastCloneDeep(value);
            if (this.refreshOnChanged) {
                if (this.component.clearOnRefresh) {
                    this.setValue(null);
                }
                this.triggerRedraw();
            }
        }
        inContext(component) {
            if (component.data === this.data) {
                return true;
            }
            let parent = this.parent;
            while (parent) {
                if (parent.data === component.data) {
                    return true;
                }
                parent = parent.parent;
            }
            return false;
        }
        get viewOnly() {
            return this.options.readOnly && this.options.viewAsHtml;
        }
        createViewOnlyElement() {
            this.element = this.ce('dl', { id: this.id });
            if (this.element) {
                this.element.component = this;
            }
            return this.element;
        }
        get defaultViewOnlyValue() {
            return '-';
        }
        getWidgetValueAsString(value) {
            const noInputWidget = !this.refs.input || !this.refs.input[0] || !this.refs.input[0].widget;
            if (!value || noInputWidget) {
                return value;
            }
            if (Array.isArray(value)) {
                const values = [];
                value.forEach((val, index) => {
                    const widget = this.refs.input[index] && this.refs.input[index].widge;
                    if (widget) {
                        values.push(widget.getValueAsString(val));
                    }
                });
                return values;
            }
            const widget = this.refs.input[0].widget;
            return widget.getValueAsString(value);
        }
        getValueAsString(value) {
            if (!value) {
                return '';
            }
            value = this.getWidgetValueAsString(value);
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            if (langx.isPlainObject(value)) {
                return JSON.stringify(value);
            }
            if (value === null || value === undefined) {
                return '';
            }
            return value.toString();
        }
        getView(value) {
            if (this.component.protected) {
                return '--- PROTECTED ---';
            }
            return this.getValueAsString(value);
        }
        updateItems(...args) {
            this.restoreValue();
            this.onChange(...args);
        }
        itemValue(data, forceUseValue = false) {
            if (langx.isObject(data)) {
                if (this.valueProperty) {
                    return langx.get(data, this.valueProperty);
                }
                if (forceUseValue) {
                    return data.value;
                }
            }
            return data;
        }
        itemValueForHTMLMode(value) {
            if (Array.isArray(value)) {
                const values = value.map(item => Array.isArray(item) ? this.itemValueForHTMLMode(item) : this.itemValue(item));
                return values.join(', ');
            }
            return this.itemValue(value);
        }
        createModal(element, attr) {
            const dialog = this.ce('div', attr || {});
            this.setContent(dialog, this.renderTemplate('dialog'));
            dialog.refs = {};
            this.loadRefs.call(dialog, dialog, {
                dialogOverlay: 'single',
                dialogContents: 'single',
                dialogClose: 'single'
            });
            dialog.refs.dialogContents.appendChild(element);
            document.body.appendChild(dialog);
            document.body.classList.add('modal-open');
            dialog.close = () => {
                document.body.classList.remove('modal-open');
                dialog.dispatchEvent(new CustomEvent('close'));
            };
            this.addEventListener(dialog, 'close', () => this.removeChildFrom(dialog, document.body));
            const close = event => {
                event.preventDefault();
                dialog.close();
            };
            this.addEventListener(dialog.refs.dialogOverlay, 'click', close);
            this.addEventListener(dialog.refs.dialogClose, 'click', close);
            return dialog;
        }
        get className() {
            let className = this.hasInput ? 'form-group has-feedback ' : '';
            className += `formio-component formio-component-${ this.component.type } `;
            if (this.key) {
                className += `formio-component-${ this.key } `;
            }
            if (this.component.multiple) {
                className += 'formio-component-multiple ';
            }
            if (this.component.customClass) {
                className += this.component.customClass;
            }
            if (this.hasInput && this.component.validate && utils.boolValue(this.component.validate.required)) {
                className += ' required';
            }
            if (this.labelIsHidden()) {
                className += ' formio-component-label-hidden';
            }
            if (!this.visible) {
                className += ' formio-hidden';
            }
            return className;
        }
        get customStyle() {
            let customCSS = '';
            langx.forEach(this.component.style, (value, key) => { //_.each
                if (value !== '') {
                    customCSS += `${ key }:${ value };`;
                }
            });
            return customCSS;
        }
        get isMobile() {
            return isMobile();
        }
        getElement() {
            return this.element;
        }
        evalContext(additional) {
            return super.evalContext(Object.assign({
                component: this.component,
                row: this.data,
                rowIndex: this.rowIndex,
                data: this.rootValue,
                iconClass: this.iconClass.bind(this),
                submission: this.root ? this.root._submission : {},
                form: this.root ? this.root._form : {}
            }, additional));
        }
        setPristine(pristine) {
            this.pristine = pristine;
        }
        removeValue(index) {
            this.splice(index);
            this.redraw();
            this.restoreValue();
            this.triggerRootChange();
        }
        iconClass(name, spinning) {
            const iconset = this.options.iconset || Templates.current.defaultIconset || 'fa';
            return Templates.current.hasOwnProperty('iconClass') ? Templates.current.iconClass(iconset, name, spinning) : this.options.iconset === 'fa' ? Templates.defaultTemplates.iconClass(iconset, name, spinning) : name;
        }
        get name() {
            return this.t(this.component.label || this.component.placeholder || this.key);
        }
        get errorLabel() {
            return this.t(this.component.errorLabel || this.component.label || this.component.placeholder || this.key);
        }
        errorMessage(type) {
            return this.component.errors && this.component.errors[type] ? this.component.errors[type] : type;
        }
        setContent(element, content) {
            if (element instanceof HTMLElement) {
                element.innerHTML = this.sanitize(content);
                return true;
            }
            return false;
        }
        redraw() {
            if (!this.element || !this.element.parentNode) {
                return NativePromise.resolve();
            }
            this.clear();
            const parent = this.element.parentNode;
            const index = Array.prototype.indexOf.call(parent.children, this.element);
            this.element.outerHTML = this.sanitize(this.render());
            this.element = parent.children[index];
            return this.attach(this.element);
        }
        rebuild() {
            this.destroy();
            this.init();
            return this.redraw();
        }
        removeEventListeners() {
            super.removeEventListeners();
            this.tooltips.forEach(tooltip => tooltip.dispose());
            this.tooltips = [];
            this.refs.input = [];
        }
        hasClass(element, className) {
            if (!element) {
                return;
            }
            return super.hasClass(element, this.transform('class', className));
        }
        addClass(element, className) {
            if (!element) {
                return;
            }
            return super.addClass(element, this.transform('class', className));
        }
        removeClass(element, className) {
            if (!element) {
                return;
            }
            return super.removeClass(element, this.transform('class', className));
        }
        hasCondition() {
            if (this._hasCondition !== null) {
                return this._hasCondition;
            }
            this._hasCondition = FormioUtils.hasCondition(this.component);
            return this._hasCondition;
        }
        conditionallyVisible(data, row) {
            data = data || this.rootValue;
            row = row || this.data;
            if (this.builderMode || !this.hasCondition()) {
                return !this.component.hidden;
            }
            data = data || (this.root ? this.root.data : {});
            return this.checkCondition(row, data);
        }
        checkCondition(row, data) {
            return FormioUtils.checkCondition(this.component, row || this.data, data || this.rootValue, this.root ? this.root._form : {}, this);
        }
        checkComponentConditions(data, flags, row) {
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            if (!this.builderMode && this.fieldLogic(data, row)) {
                this.redraw();
            }
            const visible = this.conditionallyVisible(data, row);
            if (this.visible !== visible) {
                this.visible = visible;
            }
            return visible;
        }
        checkConditions(data, flags, row) {
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            return this.checkComponentConditions(data, flags, row);
        }
        get logic() {
            return this.component.logic || [];
        }
        fieldLogic(data, row) {
            data = data || this.rootValue;
            row = row || this.data;
            const logics = this.logic;
            if (logics.length === 0) {
                return;
            }
            const newComponent = utils.fastCloneDeep(this.originalComponent);
            let changed = logics.reduce((changed, logic) => {
                const result = FormioUtils.checkTrigger(newComponent, logic.trigger, row, data, this.root ? this.root._form : {}, this);
                return (result ? this.applyActions(newComponent, logic.actions, result, row, data) : false) || changed;
            }, false);
            if (!langx.isEqual(this.component, newComponent)) {
                this.component = newComponent;
                this.disabled = this.shouldDisabled;
                changed = true;
            }
            return changed;
        }
        isIE() {
            const userAgent = window.navigator.userAgent;
            const msie = userAgent.indexOf('MSIE ');
            if (msie > 0) {
                return parseInt(userAgent.substring(msie + 5, userAgent.indexOf('.', msie)), 10);
            }
            const trident = userAgent.indexOf('Trident/');
            if (trident > 0) {
                const rv = userAgent.indexOf('rv:');
                return parseInt(userAgent.substring(rv + 3, userAgent.indexOf('.', rv)), 10);
            }
            const edge = userAgent.indexOf('Edge/');
            if (edge > 0) {
                return parseInt(userAgent.substring(edge + 5, userAgent.indexOf('.', edge)), 10);
            }
            return false;
        }
        applyActions(newComponent, actions, result, row, data) {
            data = data || this.rootValue;
            row = row || this.data;
            return actions.reduce((changed, action) => {
                switch (action.type) {
                case 'property': {
                        FormioUtils.setActionProperty(newComponent, action, result, row, data, this);
                        const property = action.property.value;
                        if (!langx.isEqual(langx.get(this.component, property), langx.get(newComponent, property))) {
                            changed = true;
                        }
                        break;
                    }
                case 'value': {
                        const oldValue = this.getValue();
                        const newValue = this.evaluate(action.value, {
                            value: langx.clone(oldValue),
                            data,
                            row,
                            component: newComponent,
                            result
                        }, 'value');
                        if (!langx.isEqual(oldValue, newValue)) {
                            this.setValue(newValue);
                            if (this.viewOnly) {
                                this.dataValue = newValue;
                            }
                            changed = true;
                        }
                        break;
                    }
                case 'mergeComponentSchema': {
                        const schema = this.evaluate(action.schemaDefinition, {
                            value: langx.clone(this.getValue()),
                            data,
                            row,
                            component: newComponent,
                            result
                        }, 'schema');
                        langx.mixin(newComponent, schema); //_.assign
                        if (!langx.isEqual(this.component, newComponent)) {
                            changed = true;
                        }
                        break;
                    }
                }
                return changed;
            }, false);
        }
        addInputError(message, dirty, elements) {
            this.addMessages(message);
            this.setErrorClasses(elements, dirty, !!message);
        }
        removeInputError(elements) {
            this.setErrorClasses(elements, true, false);
        }
        addMessages(messages) {
            if (!messages) {
                return;
            }
            if (typeof messages === 'string') {
                messages = {
                    messages,
                    level: 'error'
                };
            }
            if (!Array.isArray(messages)) {
                messages = [messages];
            }
            if (this.refs.messageContainer) {
                this.setContent(this.refs.messageContainer, messages.map(message => this.renderTemplate('message', message)).join(''));
            }
        }
        setErrorClasses(elements, dirty, hasErrors, hasMessages) {
            this.clearErrorClasses();
            elements.forEach(element => this.removeClass(this.performInputMapping(element), 'is-invalid'));
            if (hasErrors) {
                elements.forEach(input => this.addClass(this.performInputMapping(input), 'is-invalid'));
                if (dirty && this.options.highlightErrors) {
                    this.addClass(this.element, this.options.componentErrorClass);
                } else {
                    this.addClass(this.element, 'has-error');
                }
            }
            if (hasMessages) {
                this.addClass(this.element, 'has-message');
            }
        }
        clearOnHide() {
            if (!this.rootPristine && this.component.clearOnHide !== false && !this.options.readOnly && !this.options.showHiddenFields) {
                if (!this.visible) {
                    this.deleteValue();
                } else if (!this.hasValue()) {
                    this.setValue(this.defaultValue, { noUpdateEvent: true });
                }
            }
        }
        triggerRootChange(...args) {
            if (this.options.onChange) {
                this.options.onChange(...args);
            } else if (this.root) {
                this.root.triggerChange(...args);
            }
        }
        onChange(flags, fromRoot) {
            flags = flags || {};
            if (flags.modified) {
                this.pristine = false;
                this.addClass(this.getElement(), 'formio-modified');
            }
            if (this.component.validateOn === 'blur' && !this.errors.length) {
                flags.noValidate = true;
            }
            if (this.component.onChange) {
                this.evaluate(this.component.onChange, { flags });
            }
            const changed = {
                instance: this,
                component: this.component,
                value: this.dataValue,
                flags: flags
            };
            this.emit('componentChange', changed);
            let modified = false;
            if (flags.modified) {
                modified = true;
                delete flags.modified;
            }
            if (!fromRoot) {
                this.triggerRootChange(flags, changed, modified);
            }
            return changed;
        }
        get wysiwygDefault() {
            return {
                quill: {
                    theme: 'snow',
                    placeholder: this.t(this.component.placeholder),
                    modules: {
                        toolbar: [
                            [{
                                    'size': [
                                        'small',
                                        false,
                                        'large',
                                        'huge'
                                    ]
                                }],
                            [{
                                    'header': [
                                        1,
                                        2,
                                        3,
                                        4,
                                        5,
                                        6,
                                        false
                                    ]
                                }],
                            [{ 'font': [] }],
                            [
                                'bold',
                                'italic',
                                'underline',
                                'strike',
                                { 'script': 'sub' },
                                { 'script': 'super' },
                                'clean'
                            ],
                            [
                                { 'color': [] },
                                { 'background': [] }
                            ],
                            [
                                { 'list': 'ordered' },
                                { 'list': 'bullet' },
                                { 'indent': '-1' },
                                { 'indent': '+1' },
                                { 'align': [] }
                            ],
                            [
                                'blockquote',
                                'code-block'
                            ],
                            [
                                'link',
                                'image',
                                'video',
                                'formula',
                                'source'
                            ]
                        ]
                    }
                },
                ace: {
                    theme: 'ace/theme/xcode',
                    maxLines: 12,
                    minLines: 12,
                    tabSize: 2,
                    mode: 'javascript',
                    placeholder: this.t(this.component.placeholder)
                },
                ckeditor: {
                    image: {
                        toolbar: [
                            'imageTextAlternative',
                            '|',
                            'imageStyle:full',
                            'imageStyle:alignLeft',
                            'imageStyle:alignCenter',
                            'imageStyle:alignRight'
                        ],
                        styles: [
                            'full',
                            'alignLeft',
                            'alignCenter',
                            'alignRight'
                        ]
                    }
                },
                tiny: { theme: 'silver' },
                default: {}
            };
        }
        addCKE(element, settings, onChange) {
            settings = langx.isEmpty(settings) ? {} : settings;
            settings.base64Upload = true;
            settings.mediaEmbed = { previewsInData: true };
            settings = langx.mixin(this.wysiwygDefault.ckeditor, langx.get(this.options, 'editors.ckeditor.settings', {}), settings); //_.merge
            return Formio.requireLibrary('ckeditor', 'ClassicEditor', langx.get(this.options, 'editors.ckeditor.src', CKEDITOR), true).then(() => {
                if (!element.parentNode) {
                    return NativePromise.reject();
                }
                return ClassicEditor.create(element, settings).then(editor => {
                    editor.model.document.on('change', () => onChange(editor.data.get()));
                    return editor;
                });
            });
        }
        addQuill(element, settings, onChange) {
            settings = _.isEmpty(settings) ? this.wysiwygDefault.quill : settings;
            settings = _.merge(this.wysiwygDefault.quill, _.get(this.options, 'editors.quill.settings', {}), settings);
            Formio.requireLibrary(`quill-css-${ settings.theme }`, 'Quill', [{
                    type: 'styles',
                    src: `${ QUILL_URL }/quill.${ settings.theme }.css`
                }], true);
            return Formio.requireLibrary('quill', 'Quill', _.get(this.options, 'editors.quill.src', `${ QUILL_URL }/quill.min.js`), true).then(() => {
                if (!element.parentNode) {
                    return NativePromise.reject();
                }
                this.quill = new Quill(element, settings);
                const txtArea = document.createElement('textarea');
                txtArea.setAttribute('class', 'quill-source-code');
                this.quill.addContainer('ql-custom').appendChild(txtArea);
                const qlSource = element.parentNode.querySelector('.ql-source');
                if (qlSource) {
                    this.addEventListener(qlSource, 'click', event => {
                        event.preventDefault();
                        if (txtArea.style.display === 'inherit') {
                            this.quill.setContents(this.quill.clipboard.convert(txtArea.value));
                        }
                        txtArea.style.display = txtArea.style.display === 'none' ? 'inherit' : 'none';
                    });
                }
                this.addEventListener(element, 'click', () => this.quill.focus());
                const elm = document.querySelectorAll('.ql-formats > button');
                for (let i = 0; i < elm.length; i++) {
                    elm[i].setAttribute('tabindex', '-1');
                }
                this.quill.on('text-change', () => {
                    txtArea.value = this.quill.root.innerHTML;
                    onChange(txtArea);
                });
                return this.quill;
            });
        }
        addAce(element, settings, onChange) {
            settings = langx.mixin(this.wysiwygDefault.ace, langx.get(this.options, 'editors.ace.settings', {}), settings || {}); //_.merge
            //return Formio.requireLibrary('ace', 'ace', langx.get(this.options, 'editors.ace.src', ACE_URL), true).then(editor => { // modified by lwf
            var d = new langx.Deferred();
            require(["skylark-ace"],function(ace){    
                let editor = ace.edit(element);
                editor.removeAllListeners('change');
                editor.setOptions(settings);
                editor.getSession().setMode(`ace/mode/${ settings.mode }`);
                editor.on('change', () => onChange(editor.getValue()));
                //return editor;
                d.resolve(editor)
            },function(e){
                d.reject(e);
            });

            return d.promise;
        }
        addTiny(element, settings, onChange) {
            return Formio.requireLibrary('tinymce', 'tinymce', TINYMCE_URL.replace('no-api-key', settings.tinyApiKey), true).then(editor => {
                return editor.init({
                    ...settings,
                    target: element,
                    init_instance_callback: editor => {
                        editor.on('Change', () => onChange(editor.getContent()));
                    }
                });
            });
        }
        get tree() {
            return this.component.tree || false;
        }
        get emptyValue() {
            return null;
        }
        hasValue(data) {
            return _.has(data || this.data, this.key);
        }
        get rootValue() {
            return this.root ? this.root.data : this.data;
        }
        get rootPristine() {
            return langx.get(this, 'root.pristine', false);
        }
        get dataValue() {
            if (!this.key || !this.visible && this.component.clearOnHide && !this.rootPristine) {
                return this.emptyValue;
            }
            if (!this.hasValue()) {
                const empty = this.component.multiple ? [] : this.emptyValue;
                if (!this.rootPristine) {
                    this.dataValue = empty;
                }
                return empty;
            }
            return langx.get(this._data, this.key);
        }
        set dataValue(value) {
            if (!this.allowData || !this.key || !this.visible && this.component.clearOnHide && !this.rootPristine) {
                return value;
            }
            if (value !== null && value !== undefined) {
                value = this.hook('setDataValue', value, this.key, this._data);
            }
            if (value === null || value === undefined) {
                this.unset();
                return value;
            }
            _.set(this._data, this.key, value);
            return value;
        }
        splice(index) {
            if (this.hasValue()) {
                const dataValue = this.dataValue || [];
                if (langx.isArray(dataValue) && dataValue.hasOwnProperty(index)) {
                    dataValue.splice(index, 1);
                    this.dataValue = dataValue;
                    this.triggerChange();
                }
            }
        }
        unset() {
            _.unset(this._data, this.key);
        }
        deleteValue() {
            this.setValue(null, {
                noUpdateEvent: true,
                noDefault: true
            });
            this.unset();
        }
        get defaultValue() {
            let defaultValue = this.emptyValue;
            if (this.component.defaultValue) {
                defaultValue = this.component.defaultValue;
            }
            if (this.component.customDefaultValue && !this.options.preview) {
                defaultValue = this.evaluate(this.component.customDefaultValue, { value: '' }, 'value');
            }
            if (this.defaultMask) {
                if (typeof defaultValue === 'string') {
                    defaultValue = conformToMask(defaultValue, this.defaultMask).conformedValue;
                    if (!FormioUtils.matchInputMask(defaultValue, this.defaultMask)) {
                        defaultValue = '';
                    }
                } else {
                    defaultValue = '';
                }
            }
            return langx.clone(defaultValue); //_.cloneDeep
        }
        getValue() {
            if (!this.hasInput || this.viewOnly || !this.refs.input || !this.refs.input.length) {
                return this.dataValue;
            }
            const values = [];
            for (const i in this.refs.input) {
                if (this.refs.input.hasOwnProperty(i)) {
                    if (!this.component.multiple) {
                        return this.getValueAt(i);
                    }
                    values.push(this.getValueAt(i));
                }
            }
            if (values.length === 0 && !this.component.multiple) {
                return '';
            }
            return values;
        }
        getValueAt(index) {
            const input = this.performInputMapping(this.refs.input[index]);
            return input ? input.value : undefined;
        }
        setValue(value, flags = {}) {
            const changed = this.updateValue(value, flags);
            if (this.componentModal && flags && flags.fromSubmission) {
                this.componentModal.setValue(value);
            }
            value = this.dataValue;
            if (!this.hasInput) {
                return changed;
            }
            const isArray = Array.isArray(value);
            if (isArray && Array.isArray(this.defaultValue) && this.refs.hasOwnProperty('input') && this.refs.input && this.refs.input.length !== value.length) {
                this.redraw();
            }
            for (const i in this.refs.input) {
                if (this.refs.input.hasOwnProperty(i)) {
                    this.setValueAt(i, isArray ? value[i] : value, flags);
                }
            }
            return changed;
        }
        setValueAt(index, value, flags = {}) {
            if (!flags.noDefault && (value === null || value === undefined) && !this.component.multiple) {
                value = this.defaultValue;
            }
            const input = this.performInputMapping(this.refs.input[index]);
            if (input.mask) {
                input.mask.textMaskInputElement.update(value);
            } else if (input.widget && input.widget.setValue) {
                input.widget.setValue(value);
            } else {
                input.value = value;
            }
        }
        get hasSetValue() {
            return this.hasValue() && !this.isEmpty(this.dataValue);
        }
        restoreValue() {
            if (this.hasSetValue) {
                this.setValue(this.dataValue, { noUpdateEvent: true });
            } else {
                if (this.defaultValue) {
                    const defaultValue = this.component.multiple && !this.dataValue.length ? [] : this.defaultValue;
                    this.setValue(defaultValue, { noUpdateEvent: true });
                }
            }
        }
        normalizeValue(value) {
            if (this.component.multiple && !Array.isArray(value)) {
                value = value ? [value] : [];
            }
            return value;
        }
        updateComponentValue(value, flags = {}) {
            let newValue = !flags.resetValue && (value === undefined || value === null) ? this.getValue() : value;
            newValue = this.normalizeValue(newValue, flags);
            const changed = newValue !== undefined ? this.hasChanged(newValue, this.dataValue) : false;
            if (changed) {
                this.dataValue = newValue;
                this.updateOnChange(flags, changed);
            }
            return changed;
        }
        updateValue(...args) {
            return this.updateComponentValue(...args);
        }
        getIcon(name, content, styles, ref = 'icon') {
            return this.renderTemplate('icon', {
                className: this.iconClass(name),
                ref,
                styles,
                content
            });
        }
        resetValue() {
            this.setValue(this.emptyValue, {
                noUpdateEvent: true,
                noValidate: true,
                resetValue: true
            });
            this.unset();
        }
        hasChanged(newValue, oldValue) {
            if ((newValue === undefined || newValue === null) && (oldValue === undefined || oldValue === null || this.isEmpty(oldValue))) {
                return false;
            }
            if (newValue !== undefined && newValue !== null && !this.hasValue()) {
                return true;
            }
            return !langx.isEqual(newValue, oldValue);
        }
        updateOnChange(flags = {}, changed = false) {
            if (!flags.noUpdateEvent && changed) {
                this.triggerChange(flags);
                return true;
            }
            return false;
        }
        convertNumberOrBoolToString(value) {
            if (typeof value === 'number' || typeof value === 'boolean') {
                return value.toString();
            }
            return value;
        }
        calculateComponentValue(data, flags, row) {
            if (!this.component.calculateValue || (!this.visible || this.component.hidden) && this.component.clearOnHide && !this.rootPristine) {
                return false;
            }
            const allowOverride = this.component.allowCalculateOverride;
            let firstPass = false;
            const dataValue = this.dataValue;
            if (this.calculatedValue === undefined) {
                firstPass = true;
                this.calculatedValue = null;
            }
            if (allowOverride && this.calculatedValue && !langx.isEqual(dataValue, this.convertNumberOrBoolToString(this.calculatedValue))) {
                return false;
            }
            const calculatedValue = this.evaluate(this.component.calculateValue, {
                value: dataValue,
                data,
                row: row || this.data
            }, 'value');
            if (allowOverride && firstPass && !this.isEmpty(dataValue) && !langx.isEqual(dataValue, this.convertNumberOrBoolToString(calculatedValue))) {
                this.calculatedValue = calculatedValue;
                return true;
            }
            const changed = this.setValue(calculatedValue, flags);
            this.calculatedValue = this.dataValue;
            return changed;
        }
        calculateValue(data, flags, row) {
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            return this.calculateComponentValue(data, flags, row);
        }
        get label() {
            return this.component.label;
        }
        set label(value) {
            this.component.label = value;
            if (this.labelElement) {
                this.labelElement.innerText = value;
            }
        }
        getRoot() {
            return this.root;
        }
        invalidMessage(data, dirty, ignoreCondition, row) {
            if (!ignoreCondition && !this.checkCondition(row, data)) {
                return '';
            }
            if (this.invalid) {
                return this.invalid;
            }
            if (!this.hasInput || !dirty && this.pristine) {
                return '';
            }
            return langx.map(Validator.checkComponent(this, data), 'message').join('\n\n');
        }
        isValid(data, dirty) {
            return !this.invalidMessage(data, dirty);
        }
        setComponentValidity(messages, dirty) {
            const hasErrors = !!messages.filter(message => message.level === 'error').length;
            if (messages.length && (dirty || !this.pristine)) {
                this.setCustomValidity(messages, dirty);
            } else {
                this.setCustomValidity('');
            }
            return !hasErrors;
        }
        checkComponentValidity(data, dirty, row, async = false) {
            data = data || this.rootValue;
            row = row || this.data;
            if (this.shouldSkipValidation(data, dirty, row)) {
                this.setCustomValidity('');
                return async ? NativePromise.resolve(true) : true;
            }
            const check = Validator.checkComponent(this, data, row, true, async);
            return async ? check.then(messages => this.setComponentValidity(messages, dirty)) : this.setComponentValidity(check, dirty);
        }
        checkValidity(data, dirty, row) {
            data = data || this.rootValue;
            row = row || this.data;
            return this.checkComponentValidity(data, dirty, row);
        }
        checkAsyncValidity(data, dirty, row) {
            return NativePromise.resolve(this.checkComponentValidity(data, dirty, row, true));
        }
        checkData(data, flags, row) {
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            this.checkRefreshOn(flags.changed);
            if (flags.noCheck) {
                return true;
            }
            this.calculateComponentValue(data, flags, row);
            this.checkComponentConditions(data, flags, row);
            if (flags.noValidate) {
                return true;
            }
            let isDirty = !this.builderMode && !this.options.preview && !this.isEmpty(this.defaultValue) && this.isEqual(this.defaultValue, this.dataValue);
            if (this.options.alwaysDirty || flags.dirty) {
                isDirty = true;
            }
            if (flags.fromSubmission && this.hasValue(data)) {
                isDirty = true;
            }
            return this.checkComponentValidity(data, isDirty, row);
        }
        get validationValue() {
            return this.dataValue;
        }
        isEmpty(value = this.dataValue) {
            const isEmptyArray = langx.isArray(value) && value.length === 1 ? langx.isEqual(value[0], this.emptyValue) : false;
            return value == null || value.length === 0 || langx.isEqual(value, this.emptyValue) || isEmptyArray;
        }
        isEqual(valueA, valueB = this.dataValue) {
            return this.isEmpty(valueA) && this.isEmpty(valueB) || langx.isEqual(valueA, valueB);
        }
        validateMultiple() {
            return true;
        }
        get errors() {
            return this.error ? [this.error] : [];
        }
        clearErrorClasses() {
            this.removeClass(this.element, this.options.componentErrorClass);
            this.removeClass(this.element, 'alert alert-danger');
            this.removeClass(this.element, 'has-error');
            this.removeClass(this.element, 'has-message');
        }
        setCustomValidity(messages, dirty, external) {
            if (typeof messages === 'string' && messages) {
                messages = {
                    level: 'error',
                    message: messages
                };
            }
            if (!Array.isArray(messages)) {
                if (messages) {
                    messages = [messages];
                } else {
                    messages = [];
                }
            }
            const hasErrors = !!messages.filter(message => message.level === 'error').length;
            if (messages.length) {
                if (this.refs.messageContainer) {
                    this.empty(this.refs.messageContainer);
                }
                this.error = {
                    component: this.component,
                    message: messages[0].message,
                    messages,
                    external: !!external
                };
                this.emit('componentError', this.error);
                this.addMessages(messages, dirty, this.refs.input);
                if (this.refs.input) {
                    this.setErrorClasses(this.refs.input, dirty, hasErrors, !!messages.length);
                }
            } else if (this.error && this.error.external === !!external) {
                if (this.refs.messageContainer) {
                    this.empty(this.refs.messageContainer);
                }
                this.error = null;
                if (this.refs.input) {
                    this.setErrorClasses(this.refs.input, dirty, hasErrors, !!messages.length);
                }
                this.clearErrorClasses();
            }
        }
        isValueHidden() {
            if (!this.root || !this.root.hasOwnProperty('editing')) {
                return false;
            }
            if (!this.root || !this.root.editing) {
                return false;
            }
            return this.component.protected || !this.component.persistent || this.component.persistent === 'client-only';
        }
        shouldSkipValidation(data, dirty, row) {
            const rules = [
                () => this.shouldDisabled,
                () => this.isValueHidden(),
                () => !this.visible,
                () => !this.checkCondition(row, data)
            ];
            return rules.some(pred => pred());
        }
        whenReady() {
            console.warn('The whenReady() method has been deprecated. Please use the dataReady property instead.');
            return this.dataReady;
        }
        get dataReady() {
            return NativePromise.resolve();
        }
        asString(value) {
            value = value || this.getValue();
            return (Array.isArray(value) ? value : [value]).map(_.toString).join(', ');
        }
        get disabled() {
            return this._disabled || this.parentDisabled;
        }
        set disabled(disabled) {
            this._disabled = disabled;
        }
        setDisabled(element, disabled) {
            if (!element) {
                return;
            }
            element.disabled = disabled;
            if (disabled) {
                element.setAttribute('disabled', 'disabled');
            } else {
                element.removeAttribute('disabled');
            }
        }
        setLoading(element, loading) {
            if (!element || element.loading === loading) {
                return;
            }
            element.loading = loading;
            if (!element.loader && loading) {
                element.loader = this.ce('i', { class: `${ this.iconClass('refresh', true) } button-icon-right` });
            }
            if (element.loader) {
                if (loading) {
                    this.appendTo(element.loader, element);
                } else {
                    this.removeChildFrom(element.loader, element);
                }
            }
        }
        selectOptions(select, tag, options, defaultValue) {
            langx.forEach(options, option => {  //_.each
                const attrs = { value: option.value };
                if (defaultValue !== undefined && option.value === defaultValue) {
                    attrs.selected = 'selected';
                }
                const optionElement = this.ce('option', attrs);
                optionElement.appendChild(this.text(option.label));
                select.appendChild(optionElement);
            });
        }
        setSelectValue(select, value) {
            const options = select.querySelectorAll('option');
            langx.forEach(options, option => { //_.each
                if (option.value === value) {
                    option.setAttribute('selected', 'selected');
                } else {
                    option.removeAttribute('selected');
                }
            });
            if (select.onchange) {
                select.onchange();
            }
            if (select.onselect) {
                select.onselect();
            }
        }
        clear() {
            this.detach();
            this.empty(this.getElement());
        }
        append(element) {
            this.appendTo(element, this.element);
        }
        prepend(element) {
            this.prependTo(element, this.element);
        }
        removeChild(element) {
            this.removeChildFrom(element, this.element);
        }
        detachLogic() {
            this.logic.forEach(logic => {
                if (logic.trigger.type === 'event') {
                    const event = this.interpolate(logic.trigger.event);
                    this.off(event);
                }
            });
        }
        attachLogic() {
            if (this.builderMode) {
                return;
            }
            this.logic.forEach(logic => {
                if (logic.trigger.type === 'event') {
                    const event = this.interpolate(logic.trigger.event);
                    this.on(event, (...args) => {
                        const newComponent = utils.fastCloneDeep(this.originalComponent);
                        if (this.applyActions(newComponent, logic.actions, args)) {
                            if (!langx.isEqual(this.component, newComponent)) {
                                this.component = newComponent;
                            }
                            this.redraw();
                        }
                    }, true);
                }
            });
        }
        elementInfo() {
            const attributes = {
                name: this.options.name,
                type: this.component.inputType || 'text',
                class: 'form-control',
                lang: this.options.language
            };
            if (this.component.placeholder) {
                attributes.placeholder = this.t(this.component.placeholder);
            }
            if (this.component.tabindex) {
                attributes.tabindex = this.component.tabindex;
            }
            if (this.disabled) {
                attributes.disabled = 'disabled';
            }
            _.defaults(attributes, this.component.attributes);
            return {
                type: 'input',
                component: this.component,
                changeEvent: 'change',
                attr: attributes
            };
        }
        autofocus() {
            if (this.component.autofocus && !this.builderMode) {
                this.on('render', () => this.focus(), true);
            }
        }
        focus() {
            if (this.refs.input && this.refs.input[0]) {
                this.refs.input[0].focus();
            }
        }
    };
    Component.externalLibraries = {};
    Component.requireLibrary = function (name, property, src, polling) {
        if (!Component.externalLibraries.hasOwnProperty(name)) {
            Component.externalLibraries[name] = {};
            Component.externalLibraries[name].ready = new NativePromise((resolve, reject) => {
                Component.externalLibraries[name].resolve = resolve;
                Component.externalLibraries[name].reject = reject;
            });
            const callbackName = `${ name }Callback`;
            if (!polling && !window[callbackName]) {
                window[callbackName] = function () {
                    this.resolve();
                }.bind(Component.externalLibraries[name]);
            }
            const plugin = langx.get(window, property);
            if (plugin) {
                Component.externalLibraries[name].resolve(plugin);
            } else {
                src = Array.isArray(src) ? src : [src];
                src.forEach(lib => {
                    let attrs = {};
                    let elementType = '';
                    if (typeof lib === 'string') {
                        lib = {
                            type: 'script',
                            src: lib
                        };
                    }
                    switch (lib.type) {
                    case 'script':
                        elementType = 'script';
                        attrs = {
                            src: lib.src,
                            type: 'text/javascript',
                            defer: true,
                            async: true
                        };
                        break;
                    case 'styles':
                        elementType = 'link';
                        attrs = {
                            href: lib.src,
                            rel: 'stylesheet'
                        };
                        break;
                    }
                    const script = document.createElement(elementType);
                    for (const attr in attrs) {
                        script.setAttribute(attr, attrs[attr]);
                    }
                    document.getElementsByTagName('head')[0].appendChild(script);
                });
                if (polling) {
                    setTimeout(function checkLibrary() {
                        const plugin = langx.get(window, property);
                        if (plugin) {
                            Component.externalLibraries[name].resolve(plugin);
                        } else {
                            setTimeout(checkLibrary, 200);
                        }
                    }, 200);
                }
            }
        }
        return Component.externalLibraries[name].ready;
    };
    Component.libraryReady = function (name) {
        if (Component.externalLibraries.hasOwnProperty(name) && Component.externalLibraries[name].ready) {
            return Component.externalLibraries[name].ready;
        }
        return NativePromise.reject(`${ name } library was not required.`);
    };
});