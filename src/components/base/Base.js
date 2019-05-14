define([
    'vanilla-text-mask',
    'native-promise-only',
    'lodash',
    'tooltip.js',
    '../../utils/utils',
    '../../Formio',
    '../Validator',
    '../../widgets',
    '../../Component',
    'dragula'
], function (a, Promise, _, Tooltip, FormioUtils, Formio, Validator, Widgets, Component, dragula) {
    'use strict';
    const CKEDITOR = 'https://cdn.staticaly.com/gh/formio/ckeditor5-build-classic/master/build/ckeditor.js';
    return class BaseComponent extends Component {
        static schema(...sources) {
            return _.merge({
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
                tableView: true,
                dataGridLabel: false,
                label: '',
                labelPosition: 'top',
                labelWidth: 30,
                labelMargin: 3,
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
                allowCalculateOverride: false,
                widget: null,
                refreshOn: '',
                clearOnRefresh: false,
                validateOn: 'change',
                validate: {
                    required: false,
                    custom: '',
                    customPrivate: false
                },
                conditional: {
                    show: null,
                    when: null,
                    eq: ''
                }
            }, ...sources);
        }
        static tableView(value, options) {
        }
        constructor(component, options, data) {
            super(options, component && component.id ? component.id : null);
            this.originalComponent = _.cloneDeep(component);
            this.inDataGrid = this.options.inDataGrid;
            this.options.inDataGrid = false;
            this._hasCondition = null;
            this.data = data || {};
            if (this.options.components && this.options.components[component.type]) {
                _.merge(component, this.options.components[component.type]);
            }
            this.component = _.defaultsDeep(component || {}, this.defaultSchema);
            this.component.id = this.id;
            this.element = null;
            this.tbody = null;
            this.labelElement = null;
            this.errorElement = null;
            this.error = '';
            this.inputs = [];
            this.info = null;
            this.row = this.options.row;
            this._disabled = false;
            this._visible = true;
            this._parentVisible = true;
            this.pristine = true;
            this.parent = null;
            this.root = this;
            this.options.name = this.options.name || 'data';
            this.validators = [
                'required',
                'minLength',
                'maxLength',
                'custom',
                'pattern',
                'json',
                'mask'
            ];
            let lastChanged = null;
            const _triggerChange = _.debounce((...args) => {
                if (this.root) {
                    this.root.changing = false;
                }
                if (!args[1] && lastChanged) {
                    args[1] = lastChanged;
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
                return _triggerChange(...args);
            };
            this.triggerRedraw = _.debounce(this.redraw.bind(this), 100);
            this.invalid = false;
            this.isBuilt = false;
            if (this.component) {
                this.type = this.component.type;
                if (this.hasInput && this.key) {
                    this.options.name += `[${ this.key }]`;
                }
                this.info = this.elementInfo();
            }
            this.hook('component');
        }
        get hasInput() {
            return this.component.input || this.inputs.length;
        }
        get defaultSchema() {
            return BaseComponent.schema();
        }
        get key() {
            return _.get(this.component, 'key', '');
        }
        get currentForm() {
            return this._currentForm;
        }
        set currentForm(instance) {
            this._currentForm = instance;
        }
        getModifiedSchema(schema, defaultSchema) {
            const modified = {};
            if (!defaultSchema) {
                return schema;
            }
            _.each(schema, (val, key) => {
                if (!_.isArray(val) && _.isObject(val) && defaultSchema.hasOwnProperty(key)) {
                    const subModified = this.getModifiedSchema(val, defaultSchema[key]);
                    if (!_.isEmpty(subModified)) {
                        modified[key] = subModified;
                    }
                } else if (key === 'type' || key === 'key' || key === 'label' || key === 'input' || key === 'tableView' || !defaultSchema.hasOwnProperty(key) || _.isArray(val) || val !== defaultSchema[key]) {
                    modified[key] = val;
                }
            });
            return modified;
        }
        get schema() {
            return this.getModifiedSchema(_.omit(this.component, 'id'), this.defaultSchema);
        }
        t(text, params) {
            params = params || {};
            params.data = this.rootValue;
            params.row = this.data;
            params.component = this.component;
            return super.t(text, params);
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
        beforeNext() {
            return Promise.resolve(true);
        }
        beforeSubmit() {
            return Promise.resolve(true);
        }
        get submissionTimezone() {
            this.options.submissionTimezone = this.options.submissionTimezone || _.get(this.root, 'options.submissionTimezone');
            return this.options.submissionTimezone;
        }
        get shouldDisable() {
            return (this.options.readOnly || this.component.disabled) && !this.component.alwaysEnabled;
        }
        build(state) {
            state = state || {};
            this.calculatedValue = state.calculatedValue;
            if (this.viewOnly) {
                this.viewOnlyBuild();
            } else {
                this.createElement();
                const labelAtTheBottom = this.component.labelPosition === 'bottom';
                if (!labelAtTheBottom) {
                    this.createLabel(this.element);
                }
                if (!this.createWrapper()) {
                    this.createInput(this.element);
                }
                if (labelAtTheBottom) {
                    this.createLabel(this.element);
                }
                this.createDescription(this.element);
                if (this.shouldDisable) {
                    this.disabled = true;
                }
                this.restoreValue();
                this.attachRefreshOn();
                this.autofocus();
            }
            this.attachLogic();
        }
        attachRefreshEvent(refreshData) {
            this.on('change', event => {
                if (refreshData === 'data') {
                    this.refresh(this.data);
                } else if (event.changed && event.changed.component && event.changed.component.key === refreshData & this.inContext(event.changed.instance)) {
                    this.refresh(event.changed.value);
                }
            }, true);
        }
        attachRefreshOn() {
            if (this.component.refreshOn) {
                if (Array.isArray(this.component.refreshOn)) {
                    this.component.refreshOn.forEach(refreshData => {
                        this.attachRefreshEvent(refreshData);
                    });
                } else {
                    this.attachRefreshEvent(this.component.refreshOn);
                }
            }
        }
        get viewOnly() {
            return this.options.readOnly && this.options.viewAsHtml;
        }
        viewOnlyBuild() {
            this.createViewOnlyElement();
            this.createViewOnlyLabel(this.element);
            this.createViewOnlyValue(this.element);
        }
        createViewOnlyElement() {
            this.element = this.ce('dl', { id: this.id });
            if (this.element) {
                this.element.component = this;
            }
            return this.element;
        }
        createViewOnlyLabel(container) {
            if (this.labelIsHidden()) {
                return;
            }
            this.labelElement = this.ce('dt');
            this.labelElement.appendChild(this.text(this.component.label));
            this.createTooltip(this.labelElement);
            container.appendChild(this.labelElement);
        }
        createViewOnlyValue(container) {
            this.valueElement = this.ce('dd');
            this.setupValueElement(this.valueElement);
            container.appendChild(this.valueElement);
        }
        setupValueElement(element) {
            let value = this.getValue();
            value = this.isEmpty(value) ? this.defaultViewOnlyValue : this.getView(value);
            element.innerHTML = value;
        }
        get defaultViewOnlyValue() {
            return '-';
        }
        getView(value) {
            if (!value) {
                return '';
            }
            const widget = this.widget;
            if (widget && widget.getView) {
                return widget.getView(value);
            }
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            return value.toString();
        }
        updateItems(...args) {
            this.restoreValue();
            this.onChange(...args);
        }
        updateViewOnlyValue() {
            if (!this.valueElement) {
                return;
            }
            this.setupValueElement(this.valueElement);
        }
        createModal() {
            const modalBody = this.ce('div');
            const modalOverlay = this.ce('div', { class: 'formio-dialog-overlay' });
            const closeDialog = this.ce('button', {
                class: 'formio-dialog-close pull-right btn btn-default btn-xs',
                'aria-label': 'close'
            });
            const dialog = this.ce('div', { class: 'formio-dialog formio-dialog-theme-default component-settings' }, [
                modalOverlay,
                this.ce('div', { class: 'formio-dialog-content' }, [
                    modalBody,
                    closeDialog
                ])
            ]);
            this.addEventListener(modalOverlay, 'click', event => {
                event.preventDefault();
                dialog.close();
            });
            this.addEventListener(closeDialog, 'click', event => {
                event.preventDefault();
                dialog.close();
            });
            this.addEventListener(dialog, 'close', () => {
                this.removeChildFrom(dialog, document.body);
            });
            document.body.appendChild(dialog);
            dialog.body = modalBody;
            dialog.close = () => {
                dialog.dispatchEvent(new CustomEvent('close'));
                this.removeChildFrom(dialog, document.body);
            };
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
            if (this.hasInput && this.component.validate && this.component.validate.required) {
                className += ' required';
            }
            return className;
        }
        get customStyle() {
            let customCSS = '';
            _.each(this.component.style, (value, key) => {
                if (value !== '') {
                    customCSS += `${ key }:${ value };`;
                }
            });
            return customCSS;
        }
        getElement() {
            return this.element;
        }
        createElement() {
            if (this.element) {
                this.element.className = this.className;
                return this.element;
            }
            this.element = this.ce('div', {
                id: this.id,
                class: this.className,
                style: this.customStyle
            });
            this.element.component = this;
            this.hook('element', this.element);
            return this.element;
        }
        createWrapper() {
            if (!this.component.multiple) {
                return false;
            } else {
                const table = this.ce('table', { class: 'table table-bordered' });
                this.tbody = this.ce('tbody');
                table.appendChild(this.tbody);
                const dataValue = this.dataValue;
                if (!dataValue || !dataValue.length) {
                    this.addNewValue(this.defaultValue);
                }
                this.buildRows();
                this.setInputStyles(table);
                this.append(table);
                return true;
            }
        }
        evalContext(additional) {
            return super.evalContext(Object.assign({
                instance: this,
                component: this.component,
                row: this.data,
                rowIndex: this.rowIndex,
                data: this.rootValue,
                submission: this.root ? this.root._submission : {},
                form: this.root ? this.root._form : {}
            }, additional));
        }
        get defaultValue() {
            let defaultValue = this.emptyValue;
            if (this.component.defaultValue) {
                defaultValue = this.component.defaultValue;
            }
            if (this.component.customDefaultValue && !this.options.preview) {
                defaultValue = this.evaluate(this.component.customDefaultValue, { value: '' }, 'value');
            }
            if (this._inputMask) {
                defaultValue = a.conformToMask(defaultValue, this._inputMask).conformedValue;
                if (!FormioUtils.matchInputMask(defaultValue, this._inputMask)) {
                    defaultValue = '';
                }
            }
            if (!defaultValue) {
                const widget = this.widget;
                if (widget) {
                    defaultValue = widget.defaultValue;
                }
            }
            return _.clone(defaultValue);
        }
        setPristine(pristine) {
            this.pristine = pristine;
        }
        addNewValue(value) {
            if (value === undefined) {
                value = this.emptyValue;
            }
            let dataValue = this.dataValue || [];
            if (!Array.isArray(dataValue)) {
                dataValue = [dataValue];
            }
            if (Array.isArray(value)) {
                dataValue = dataValue.concat(value);
            } else {
                dataValue.push(value);
            }
            this.dataValue = dataValue;
        }
        addValue() {
            this.addNewValue();
            this.buildRows();
            this.checkConditions();
            this.restoreValue();
            if (this.root) {
                this.root.onChange();
            }
        }
        removeValue(index) {
            this.splice(index);
            this.buildRows();
            this.restoreValue();
            if (this.root) {
                this.root.onChange();
            }
        }
        buildRows(values) {
            if (!this.tbody) {
                return;
            }
            const allowReorder = this.allowReorder;
            this.inputs = [];
            this.tbody.innerHTML = '';
            values = values || this.dataValue;
            _.each(values, (value, index) => {
                const tr = this.ce('tr');
                if (allowReorder) {
                    tr.appendChild(this.ce('td', { class: 'formio-drag-column' }, this.dragButton()));
                }
                const td = this.ce('td');
                this.buildInput(td, value, index);
                tr.appendChild(td);
                if (!this.shouldDisable) {
                    const tdAdd = this.ce('td', { class: 'formio-remove-column' });
                    tdAdd.appendChild(this.removeButton(index));
                    tr.appendChild(tdAdd);
                }
                if (allowReorder) {
                    tr.dragInfo = { index: index };
                }
                this.tbody.appendChild(tr);
            });
            if (!this.shouldDisable) {
                const tr = this.ce('tr');
                const td = this.ce('td', { colspan: allowReorder ? '3' : '2' });
                td.appendChild(this.addButton());
                tr.appendChild(td);
                this.tbody.appendChild(tr);
            }
            if (this.shouldDisable) {
                this.disabled = true;
            }
            if (allowReorder) {
                this.addDraggable([this.tbody]);
            }
        }
        get allowReorder() {
            return this.component.reorder && !this.options.readOnly;
        }
        addDraggable(containers) {
            this.dragula = dragula(containers, this.getRowDragulaOptions()).on('drop', this.onRowDrop.bind(this));
        }
        getRowDragulaOptions() {
            return {
                moves: function (draggedElement, oldParent, clickedElement) {
                    return clickedElement.classList.contains('formio-drag-button');
                }
            };
        }
        onRowDrop(droppedElement, newParent, oldParent, nextSibling) {
            if (!droppedElement.dragInfo || nextSibling && !nextSibling.dragInfo) {
                console.warn('There is no Drag Info available for either dragged or sibling element');
                return;
            }
            const oldPosition = droppedElement.dragInfo.index;
            const newPosition = nextSibling ? nextSibling.dragInfo.index : this.dataValue.length;
            const movedBelow = newPosition > oldPosition;
            const dataValue = _.cloneDeep(this.dataValue);
            const draggedRowData = dataValue[oldPosition];
            dataValue.splice(newPosition, 0, draggedRowData);
            dataValue.splice(movedBelow ? oldPosition : oldPosition + 1, 1);
            this.setValue(dataValue);
        }
        buildInput(container, value) {
            const input = this.createInput(container);
            input.value = value;
        }
        addButton(justIcon) {
            const addButton = this.ce('button', { class: 'btn btn-primary formio-button-add-row' });
            this.addEventListener(addButton, 'click', event => {
                event.preventDefault();
                this.addValue();
            });
            const addIcon = this.ce('i', { class: this.iconClass('plus') });
            if (justIcon) {
                addButton.appendChild(addIcon);
                return addButton;
            } else {
                addButton.appendChild(addIcon);
                addButton.appendChild(this.text(' '));
                addButton.appendChild(this.text(this.component.addAnother || 'Add Another'));
                return addButton;
            }
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
        removeButton(index) {
            const removeButton = this.ce('button', {
                type: 'button',
                class: 'btn btn-default btn-secondary formio-button-remove-row'
            });
            this.addEventListener(removeButton, 'click', event => {
                event.preventDefault();
                this.removeValue(index);
            });
            const removeIcon = this.ce('i', { class: this.iconClass('remove-circle') });
            removeButton.appendChild(removeIcon);
            return removeButton;
        }
        dragButton() {
            return this.ce('button', { class: `formio-drag-button btn btn-default btn-small ${ this.iconClass('menu-hamburger') }` });
        }
        labelOnTheLeft(position) {
            return [
                'left-left',
                'left-right'
            ].includes(position);
        }
        labelOnTheRight(position) {
            return [
                'right-left',
                'right-right'
            ].includes(position);
        }
        rightAlignedLabel(position) {
            return [
                'left-right',
                'right-right'
            ].includes(position);
        }
        labelOnTheLeftOrRight(position) {
            return this.labelOnTheLeft(position) || this.labelOnTheRight(position);
        }
        getLabelWidth() {
            if (!this.component.labelWidth) {
                this.component.labelWidth = 30;
            }
            return this.component.labelWidth;
        }
        getLabelMargin() {
            if (!this.component.labelMargin) {
                this.component.labelMargin = 3;
            }
            return this.component.labelMargin;
        }
        setInputStyles(input) {
            if (this.labelIsHidden()) {
                return;
            }
            if (this.labelOnTheLeftOrRight(this.component.labelPosition)) {
                const totalLabelWidth = this.getLabelWidth() + this.getLabelMargin();
                input.style.width = `${ 100 - totalLabelWidth }%`;
                if (this.labelOnTheLeft(this.component.labelPosition)) {
                    input.style.marginLeft = `${ totalLabelWidth }%`;
                } else {
                    input.style.marginRight = `${ totalLabelWidth }%`;
                }
            }
        }
        labelIsHidden() {
            return !this.component.label || this.component.hideLabel || this.options.inputsOnly || this.inDataGrid && !this.component.dataGridLabel;
        }
        createLabel(container) {
            const isLabelHidden = this.labelIsHidden();
            let className = 'control-label';
            let style = '';
            if (!isLabelHidden) {
                const {labelPosition} = this.component;
                if (labelPosition === 'bottom') {
                    className += ' control-label--bottom';
                } else if (labelPosition && labelPosition !== 'top') {
                    const labelWidth = this.getLabelWidth();
                    const labelMargin = this.getLabelMargin();
                    if (this.labelOnTheLeft(labelPosition)) {
                        style += `float: left; width: ${ labelWidth }%; margin-right: ${ labelMargin }%; `;
                    } else if (this.labelOnTheRight(labelPosition)) {
                        style += `float: right; width: ${ labelWidth }%; margin-left: ${ labelMargin }%; `;
                    }
                    if (this.rightAlignedLabel(labelPosition)) {
                        style += 'text-align: right; ';
                    }
                }
            } else {
                this.addClass(container, 'formio-component-label-hidden');
                className += ' control-label--hidden';
            }
            if (this.hasInput && this.component.validate && this.component.validate.required) {
                className += ' field-required';
            }
            this.labelElement = this.ce('label', {
                class: className,
                style
            });
            if (!isLabelHidden) {
                if (this.info.attr.id) {
                    this.labelElement.setAttribute('for', this.info.attr.id);
                }
                this.labelElement.appendChild(this.text(this.component.label));
                this.createTooltip(this.labelElement);
            }
            container.appendChild(this.labelElement);
        }
        addShortcutToLabel(label, shortcut) {
            if (!label) {
                label = this.component.label;
            }
            if (!shortcut) {
                shortcut = this.component.shortcut;
            }
            if (!shortcut || !/^[A-Za-z]$/.test(shortcut)) {
                return label;
            }
            const match = label.match(new RegExp(shortcut, 'i'));
            if (!match) {
                return label;
            }
            const index = match.index + 1;
            const lowLineCombinator = '̲';
            return label.substring(0, index) + lowLineCombinator + label.substring(index);
        }
        addShortcut(element, shortcut) {
            if (this.root === this) {
                return;
            }
            if (!element) {
                element = this.labelElement;
            }
            if (!shortcut) {
                shortcut = this.component.shortcut;
            }
            this.root.addShortcut(element, shortcut);
        }
        removeShortcut(element, shortcut) {
            if (this.root === this) {
                return;
            }
            if (!element) {
                element = this.labelElement;
            }
            if (!shortcut) {
                shortcut = this.component.shortcut;
            }
            this.root.removeShortcut(element, shortcut);
        }
        createTooltip(container, component, classes) {
            if (this.tooltip) {
                return;
            }
            component = component || this.component;
            classes = classes || `${ this.iconClass('question-sign') } text-muted`;
            if (!component.tooltip) {
                return;
            }
            const ttElement = this.ce('i', { class: classes });
            container.appendChild(this.text(' '));
            container.appendChild(ttElement);
            this.tooltip = new Tooltip(ttElement, {
                trigger: 'hover click',
                placement: 'right',
                html: true,
                title: this.interpolate(component.tooltip).replace(/(?:\r\n|\r|\n)/g, '<br />')
            });
        }
        createDescription(container) {
            if (!this.component.description) {
                return;
            }
            this.description = this.ce('div', { class: 'help-block' });
            this.description.innerHTML = this.t(this.component.description);
            container.appendChild(this.description);
        }
        createErrorElement() {
            if (!this.errorContainer) {
                return;
            }
            this.errorElement = this.ce('div', { class: 'formio-errors invalid-feedback' });
            this.errorContainer.appendChild(this.errorElement);
        }
        addPrefix(input, inputGroup) {
            let prefix = null;
            if (input.widget) {
                return input.widget.addPrefix(inputGroup);
            }
            if (this.component.prefix && typeof this.component.prefix === 'string') {
                prefix = this.ce('div', { class: 'input-group-addon input-group-prepend' });
                prefix.appendChild(this.ce('span', { class: 'input-group-text' }, this.text(this.component.prefix)));
                inputGroup.appendChild(prefix);
            }
            return prefix;
        }
        addSuffix(input, inputGroup) {
            let suffix = null;
            if (input.widget) {
                return input.widget.addSuffix(inputGroup);
            }
            if (this.component.suffix && typeof this.component.suffix === 'string') {
                suffix = this.ce('div', { class: 'input-group-addon input-group-append' });
                suffix.appendChild(this.ce('span', { class: 'input-group-text' }, this.text(this.component.suffix)));
                inputGroup.appendChild(suffix);
            }
            return suffix;
        }
        addInputGroup(input, container) {
            let inputGroup = null;
            if (this.component.prefix || this.component.suffix) {
                inputGroup = this.ce('div', { class: 'input-group' });
                container.appendChild(inputGroup);
            }
            return inputGroup;
        }
        setInputMask(input, inputMask) {
            return super.setInputMask(input, inputMask || this.component.inputMask, !this.component.placeholder);
        }
        createInput(container) {
            const input = this.ce(this.info.type, this.info.attr);
            this.setInputMask(input);
            input.widget = this.createWidget();
            const inputGroup = this.addInputGroup(input, container);
            this.addPrefix(input, inputGroup);
            this.addInput(input, inputGroup || container);
            this.addSuffix(input, inputGroup);
            this.errorContainer = container;
            this.setInputStyles(inputGroup || input);
            if (input.widget) {
                input.widget.attach(input);
            }
            return inputGroup || input;
        }
        get widget() {
            if (this._widget) {
                return this._widget;
            }
            return this.createWidget();
        }
        createWidget() {
            if (!this.component.widget) {
                return null;
            }
            const settings = typeof this.component.widget === 'string' ? { type: this.component.widget } : this.component.widget;
            if (!Widgets.hasOwnProperty(settings.type)) {
                return null;
            }
            const widget = new Widgets[settings.type](settings, this.component);
            widget.on('update', () => this.updateValue(), true);
            widget.on('redraw', () => this.redraw(), true);
            this._widget = widget;
            return widget;
        }
        redraw() {
            if (!this.isBuilt) {
                return;
            }
            this.build(this.clear());
        }
        destroyInputs() {
            _.each(this.inputs, input => {
                input = this.performInputMapping(input);
                if (input.mask && input.mask.destroy) {
                    input.mask.destroy();
                }
                if (input.widget) {
                    input.widget.destroy();
                }
            });
            if (this.tooltip) {
                this.tooltip.dispose();
                this.tooltip = null;
            }
            this.inputs = [];
        }
        destroy() {
            const state = super.destroy() || {};
            this.destroyInputs();
            state.calculatedValue = this.calculatedValue;
            return state;
        }
        renderTemplate(template, data, actions = []) {
            return this.renderTemplateToElement(this.ce('div'), template, data, actions);
        }
        renderElement(template, data, actions = []) {
            return this.renderTemplate(template, data, actions).firstChild;
        }
        renderTemplateToElement(element, template, data, actions = []) {
            element.innerHTML = this.interpolate(template, data).trim();
            this.attachActions(element, actions);
            return element;
        }
        attachActions(element, actions) {
            actions.forEach(action => {
                const elements = element.getElementsByClassName(action.class);
                Array.prototype.forEach.call(elements, element => {
                    element.addEventListener(action.event, action.action);
                });
            });
        }
        hasCondition() {
            if (this._hasCondition !== null) {
                return this._hasCondition;
            }
            this._hasCondition = FormioUtils.hasCondition(this.component);
            return this._hasCondition;
        }
        conditionallyVisible(data) {
            data = data || this.rootValue;
            if (this.options.builder || !this.hasCondition()) {
                return true;
            }
            return this.checkCondition(null, data);
        }
        checkCondition(row, data) {
            return FormioUtils.checkCondition(this.component, row || this.data, data || this.rootValue, this.root ? this.root._form : {}, this);
        }
        checkConditions(data) {
            data = data || this.rootValue;
            const result = this.show(this.conditionallyVisible(data));
            if (!this.options.builder && this.fieldLogic(data)) {
                this.redraw();
            }
            return result;
        }
        get logic() {
            return this.component.logic || [];
        }
        fieldLogic(data) {
            data = data || this.rootValue;
            const logics = this.logic;
            if (logics.length === 0) {
                return;
            }
            const newComponent = _.cloneDeep(this.originalComponent);
            let changed = logics.reduce((changed, logic) => {
                const result = FormioUtils.checkTrigger(newComponent, logic.trigger, this.data, data, this.root ? this.root._form : {}, this);
                if (result) {
                    changed |= this.applyActions(logic.actions, result, data, newComponent);
                }
                return changed;
            }, false);
            if (!_.isEqual(this.component, newComponent)) {
                this.component = newComponent;
                changed = true;
            }
            return changed;
        }
        applyActions(actions, result, data, newComponent) {
            return actions.reduce((changed, action) => {
                switch (action.type) {
                case 'property':
                    FormioUtils.setActionProperty(newComponent, action, this.data, data, newComponent, result, this);
                    break;
                case 'value': {
                        const oldValue = this.getValue();
                        const newValue = this.evaluate(action.value, {
                            value: _.clone(oldValue),
                            data,
                            component: newComponent,
                            result
                        }, 'value');
                        if (!_.isEqual(oldValue, newValue)) {
                            this.setValue(newValue);
                            changed = true;
                        }
                        break;
                    }
                case 'validation':
                    break;
                }
                return changed;
            }, false);
        }
        addInputError(message, dirty) {
            if (!message) {
                return;
            }
            if (this.errorElement) {
                const errorMessage = this.ce('p', { class: 'help-block' });
                errorMessage.appendChild(this.text(message));
                this.errorElement.appendChild(errorMessage);
            }
            this.addClass(this.element, 'has-error');
            this.inputs.forEach(input => this.addClass(this.performInputMapping(input), 'is-invalid'));
            if (dirty && this.options.highlightErrors) {
                this.addClass(this.element, 'alert alert-danger');
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
        show(show, noClear) {
            if (!this.options.builder && this.options.hide && this.options.hide[this.component.key]) {
                show = false;
            } else if (this.options.builder || this.options.show && this.options.show[this.component.key]) {
                show = true;
            }
            if (!show === !this._visible || this.options.builder || this.options.showHiddenFields) {
                if (!show) {
                    this.clearOnHide(false);
                }
                return show;
            }
            this.visible = show;
            this.showElement(show && !this.component.hidden);
            if (!noClear) {
                this.clearOnHide(show);
            }
            return show;
        }
        showElement(element, show) {
            if (typeof element === 'boolean') {
                show = element;
                element = this.getElement();
            }
            if (element) {
                if (show) {
                    element.removeAttribute('hidden');
                    element.style.visibility = 'visible';
                    element.style.position = 'relative';
                } else {
                    element.setAttribute('hidden', true);
                    element.style.visibility = 'hidden';
                    element.style.position = 'absolute';
                }
            }
            return show;
        }
        clearOnHide(show) {
            if (this.component.clearOnHide !== false && !this.options.readOnly) {
                if (!show) {
                    this.deleteValue();
                } else if (!this.hasValue()) {
                    this.setValue(this.defaultValue, { noUpdateEvent: true });
                }
            }
        }
        set visible(visible) {
            this._visible = visible;
        }
        get visible() {
            return this._visible && this._parentVisible;
        }
        set parentVisible(value) {
            if (this._parentVisible !== value) {
                this._parentVisible = value;
            }
        }
        get parentVisible() {
            return this._parentVisible;
        }
        onChange(flags, fromRoot) {
            flags = flags || {};
            if (!flags.noValidate) {
                this.pristine = false;
            }
            if (flags.modified) {
                this.addClass(this.getElement(), 'formio-modified');
            }
            if (this.component.validateOn === 'blur' && !this.errors.length) {
                flags.noValidate = true;
            }
            if (this.component.onChange) {
                this.evaluate(this.component.onChange);
            }
            const changed = {
                instance: this,
                component: this.component,
                value: this.dataValue,
                flags: flags
            };
            this.emit('componentChange', changed);
            if (this.root && !fromRoot) {
                this.root.triggerChange(flags, changed);
            }
        }
        addInputSubmitListener(input) {
            if (!this.options.submitOnEnter) {
                return;
            }
            this.addEventListener(input, 'keypress', event => {
                const key = event.keyCode || event.which;
                if (key === 13) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.emit('submitButton');
                }
            });
        }
        addInputEventListener(input) {
            this.addEventListener(input, this.info.changeEvent, () => this.updateValue({ modified: true }));
        }
        addInput(input, container) {
            if (!input) {
                return;
            }
            if (input && container) {
                input = container.appendChild(input);
            }
            this.inputs.push(input);
            this.hook('input', input, container);
            this.addFocusBlurEvents(input);
            this.addInputEventListener(input);
            this.addInputSubmitListener(input);
            return input;
        }
        addFocusBlurEvents(element) {
            this.addEventListener(element, 'focus', () => {
                if (this.root.focusedComponent !== this) {
                    if (this.root.pendingBlur) {
                        this.root.pendingBlur();
                    }
                    this.root.focusedComponent = this;
                    this.emit('focus', this);
                } else if (this.root.focusedComponent === this && this.root.pendingBlur) {
                    this.root.pendingBlur.cancel();
                    this.root.pendingBlur = null;
                }
            });
            this.addEventListener(element, 'blur', () => {
                this.root.pendingBlur = FormioUtils.delay(() => {
                    this.emit('blur', this);
                    if (this.component.validateOn === 'blur') {
                        this.root.triggerChange({}, {
                            instance: this,
                            component: this.component,
                            value: this.dataValue,
                            flags: {}
                        });
                    }
                    this.root.focusedComponent = null;
                    this.root.pendingBlur = null;
                });
            });
        }
        get wysiwygDefault() {
            return {
                theme: 'snow',
                placeholder: this.t(this.component.placeholder),
                modules: {
                    clipboard: { matchVisual: false },
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
            };
        }
        addCKE(element, settings, onChange) {
            settings = _.isEmpty(settings) ? null : settings;
            return Formio.requireLibrary('ckeditor', 'ClassicEditor', CKEDITOR, true).then(() => {
                if (!element.parentNode) {
                    return Promise.reject();
                }
                return ClassicEditor.create(element, settings).then(editor => {
                    editor.model.document.on('change', () => onChange(editor.data.get()));
                    return editor;
                });
            });
        }
        addQuill(element, settings, onChange) {
            settings = _.isEmpty(settings) ? this.wysiwygDefault : settings;
            Formio.requireLibrary(`quill-css-${ settings.theme }`, 'Quill', [{
                    type: 'styles',
                    src: `https://cdn.quilljs.com/1.3.6/quill.${ settings.theme }.css`
                }], true);
            return Formio.requireLibrary('quill', 'Quill', 'https://cdn.quilljs.com/1.3.6/quill.min.js', true).then(() => {
                if (!element.parentNode) {
                    return Promise.reject();
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
        get emptyValue() {
            return null;
        }
        hasValue(data) {
            return _.has(data || this.data, this.key);
        }
        get value() {
            return this.dataValue;
        }
        get rootValue() {
            return this.root ? this.root.data : this.data;
        }
        get dataValue() {
            if (!this.key) {
                return this.emptyValue;
            }
            if (!this.hasValue()) {
                this.dataValue = this.component.multiple ? [] : this.emptyValue;
            }
            return _.get(this.data, this.key);
        }
        set dataValue(value) {
            if (!this.key) {
                return value;
            }
            if (value === null || value === undefined) {
                _.unset(this.data, this.key);
                return value;
            }
            _.set(this.data, this.key, value);
            return value;
        }
        splice(index) {
            if (this.hasValue()) {
                const dataValue = this.dataValue || [];
                if (_.isArray(dataValue) && dataValue.hasOwnProperty(index)) {
                    dataValue.splice(index, 1);
                    this.dataValue = dataValue;
                    this.triggerChange();
                }
            }
        }
        deleteValue() {
            this.setValue(null, {
                noUpdateEvent: true,
                noDefault: true
            });
            _.unset(this.data, this.key);
        }
        getValueAt(index) {
            const input = this.performInputMapping(this.inputs[index]);
            if (input.widget) {
                return input.widget.getValue();
            }
            return input ? input.value : undefined;
        }
        getValue() {
            if (!this.hasInput) {
                return;
            }
            if (this.viewOnly) {
                return this.dataValue;
            }
            const values = [];
            for (const i in this.inputs) {
                if (this.inputs.hasOwnProperty(i)) {
                    if (!this.component.multiple) {
                        return this.getValueAt(i);
                    }
                    values.push(this.getValueAt(i));
                }
            }
            return values;
        }
        hasChanged(before, after) {
            if ((before === undefined || before === null) && (after === undefined || after === null)) {
                return false;
            }
            return !_.isEqual(before, after);
        }
        updateOnChange(flags, changed) {
            if (!flags.noUpdateEvent && changed) {
                this.triggerChange(flags);
                return true;
            }
            return false;
        }
        updateValue(flags, value) {
            if (!this.hasInput) {
                return false;
            }
            flags = flags || {};
            let newValue = value;
            if (!this.visible && this.component.clearOnHide) {
                newValue = this.dataValue;
            } else if (value === undefined || value === null) {
                newValue = this.getValue(flags);
            }
            const changed = newValue !== undefined ? this.hasChanged(newValue, this.dataValue) : false;
            this.dataValue = newValue;
            if (this.viewOnly) {
                this.updateViewOnlyValue(newValue);
            }
            this.updateOnChange(flags, changed);
            return changed;
        }
        get hasSetValue() {
            return this.hasValue() && !this.isEmpty(this.dataValue);
        }
        restoreValue() {
            if (this.hasSetValue) {
                this.setValue(this.dataValue, { noUpdateEvent: true });
            } else {
                const defaultValue = this.defaultValue;
                if (!_.isNil(defaultValue)) {
                    this.setValue(defaultValue, { noUpdateEvent: true });
                }
            }
        }
        calculateValue(data, flags) {
            if (!this.component.calculateValue || (!this.visible || this.component.hidden) && this.component.clearOnHide) {
                return false;
            }
            let firstPass = false;
            let dataValue = null;
            const allowOverride = this.component.allowCalculateOverride;
            if (allowOverride) {
                dataValue = this.dataValue;
            }
            if (this.calculatedValue === undefined) {
                firstPass = true;
                this.calculatedValue = null;
            }
            if (allowOverride && this.calculatedValue !== null && !_.isEqual(dataValue, this.calculatedValue)) {
                return false;
            }
            const calculatedValue = this.evaluate(this.component.calculateValue, {
                value: this.defaultValue,
                data
            }, 'value');
            if (allowOverride && firstPass && !this.isEmpty(dataValue) && !_.isEqual(dataValue, calculatedValue)) {
                this.calculatedValue = calculatedValue;
                return true;
            }
            flags = flags || {};
            flags.noCheck = true;
            const changed = this.setValue(calculatedValue, flags);
            this.calculatedValue = this.dataValue;
            return changed;
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
        invalidMessage(data, dirty, ignoreCondition) {
            if (!ignoreCondition && !this.checkCondition(null, data)) {
                return '';
            }
            if (this.invalid) {
                return this.invalid;
            }
            if (!this.hasInput || !dirty && this.pristine) {
                return '';
            }
            return Validator.check(this, data);
        }
        isValid(data, dirty) {
            return !this.invalidMessage(data, dirty);
        }
        checkValidity(data, dirty, rowData) {
            if (this.shouldSkipValidation(data, dirty, rowData)) {
                this.setCustomValidity('');
                return true;
            }
            const message = this.invalidMessage(data, dirty, true);
            this.setCustomValidity(message, dirty);
            return message ? false : true;
        }
        getRawValue() {
            console.warn('component.getRawValue() has been deprecated. Use component.validationValue or component.dataValue instead.');
            return this.validationValue;
        }
        get validationValue() {
            const widget = this.widget;
            if (widget && widget.validationValue) {
                return widget.validationValue(this.dataValue);
            }
            return this.dataValue;
        }
        isEmpty(value) {
            return value == null || value.length === 0 || _.isEqual(value, this.emptyValue);
        }
        validateMultiple(value) {
            return this.component.multiple && Array.isArray(value);
        }
        get errors() {
            return this.error ? [this.error] : [];
        }
        setCustomValidity(message, dirty) {
            if (this.errorElement && this.errorContainer) {
                this.errorElement.innerHTML = '';
                this.removeChildFrom(this.errorElement, this.errorContainer);
            }
            if (message) {
                this.error = {
                    component: this.component,
                    message: message
                };
                this.emit('componentError', this.error);
                this.createErrorElement();
                this.addInputError(message, dirty);
            } else {
                this.inputs.forEach(input => this.removeClass(this.performInputMapping(input), 'is-invalid'));
                if (this.options.highlightErrors) {
                    this.removeClass(this.element, 'alert alert-danger');
                }
                this.removeClass(this.element, 'has-error');
                this.error = null;
            }
            this.inputs.forEach(input => {
                input = this.performInputMapping(input);
                if (typeof input.setCustomValidity === 'function') {
                    input.setCustomValidity(message, dirty);
                }
            });
        }
        shouldSkipValidation(data, dirty, rowData) {
            const rules = [
                () => !this.visible,
                () => !this.checkCondition(rowData, data)
            ];
            return rules.some(pred => pred());
        }
        setValueAt(index, value, flags) {
            flags = flags || {};
            if (!flags.noDefault && (value === null || value === undefined)) {
                value = this.defaultValue;
            }
            const input = this.performInputMapping(this.inputs[index]);
            if (input.mask) {
                input.mask.textMaskInputElement.update(value);
            } else {
                input.value = value;
            }
            if (input.widget) {
                input.widget.setValue(value);
            }
        }
        getFlags() {
            return typeof arguments[1] === 'boolean' ? {
                noUpdateEvent: arguments[1],
                noValidate: arguments[2]
            } : arguments[1] || {};
        }
        whenReady() {
            console.warn('The whenReady() method has been deprecated. Please use the dataReady property instead.');
            return this.dataReady;
        }
        get dataReady() {
            return Promise.resolve();
        }
        refresh(value) {
            if (this.hasOwnProperty('refreshOnValue')) {
                this.refreshOnChanged = !_.isEqual(value, this.refreshOnValue);
            } else {
                this.refreshOnChanged = true;
            }
            this.refreshOnValue = value;
            if (this.refreshOnChanged) {
                if (this.component.clearOnRefresh) {
                    this.setValue(null);
                }
                this.triggerRedraw();
            }
        }
        setValue(value, flags) {
            flags = this.getFlags.apply(this, arguments);
            if (!this.hasInput) {
                return false;
            }
            if (this.component.multiple && !Array.isArray(value)) {
                value = value ? [value] : [];
            }
            this.buildRows(value);
            const isArray = Array.isArray(value);
            for (const i in this.inputs) {
                if (this.inputs.hasOwnProperty(i)) {
                    this.setValueAt(i, isArray ? value[i] : value, flags);
                }
            }
            return this.updateValue(flags);
        }
        resetValue() {
            this.setValue(this.emptyValue, {
                noUpdateEvent: true,
                noValidate: true
            });
            _.unset(this.data, this.key);
        }
        asString(value) {
            value = value || this.getValue();
            return Array.isArray(value) ? value.join(', ') : value.toString();
        }
        get disabled() {
            return this._disabled;
        }
        set disabled(disabled) {
            if (!disabled && this.shouldDisable || disabled && !this.shouldDisable) {
                return;
            }
            this._disabled = disabled;
            if (disabled) {
                this.addClass(this.getElement(), 'formio-disabled-input');
            } else {
                this.removeClass(this.getElement(), 'formio-disabled-input');
            }
            _.each(this.inputs, input => this.setDisabled(this.performInputMapping(input), disabled));
        }
        setDisabled(element, disabled) {
            element.disabled = disabled;
            if (element.widget) {
                element.widget.disabled = disabled;
            }
            if (disabled) {
                element.setAttribute('disabled', 'disabled');
            } else {
                element.removeAttribute('disabled');
            }
        }
        setLoading(element, loading) {
            if (element.loading === loading) {
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
            _.each(options, option => {
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
            _.each(options, option => {
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
                select.onchange();
            }
        }
        clear() {
            const state = this.destroy() || {};
            this.empty(this.getElement());
            return state;
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
            return {
                type: 'input',
                component: this.component,
                changeEvent: 'change',
                attr: attributes
            };
        }
        autofocus() {
            if (this.component.autofocus) {
                this.on('render', () => this.focus(), true);
            }
        }
        focus() {
            if (this.options.readOnly) {
                return;
            }
            const input = this.performInputMapping(this.inputs[0]);
            if (input) {
                if (input.widget) {
                    input.widget.input.focus();
                } else {
                    input.focus();
                }
            }
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
        attachLogic() {
            this.logic.forEach(logic => {
                if (logic.trigger.type === 'event') {
                    const event = this.interpolate(logic.trigger.event);
                    this.on(event, (...args) => {
                        const newComponent = _.cloneDeep(this.originalComponent);
                        if (this.applyActions(logic.actions, args, this.data, newComponent)) {
                            if (!_.isEqual(this.component, newComponent)) {
                                this.component = newComponent;
                            }
                            this.redraw();
                        }
                    }, true);
                }
            });
        }
    };
});