define([
    'choices.js/public/assets/scripts/choices.js',
    'lodash',
    '../base/Base',
    '../../Formio'
], function (Choices, _, BaseComponent, Formio) {
    'use strict';
    return class SelectComponent extends BaseComponent {
        static schema(...extend) {
            return BaseComponent.schema({
                type: 'select',
                label: 'Select',
                key: 'select',
                data: {
                    values: [],
                    json: '',
                    url: '',
                    resource: '',
                    custom: ''
                },
                limit: 100,
                dataSrc: 'values',
                valueProperty: '',
                filter: '',
                searchEnabled: true,
                searchField: '',
                minSearch: 0,
                readOnlyValue: false,
                authenticate: false,
                template: '<span>{{ item.label }}</span>',
                selectFields: '',
                searchThreshold: 0.3,
                fuseOptions: {},
                customOptions: {}
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Select',
                group: 'basic',
                icon: 'fa fa-th-list',
                weight: 70,
                documentation: 'http://help.form.io/userguide/#select',
                schema: SelectComponent.schema()
            };
        }
        constructor(component, options, data) {
            super(component, options, data);
            this.triggerUpdate = _.debounce(this.updateItems.bind(this), 100);
            this.selectOptions = [];
            this.currentItems = [];
            this.loadedItems = 0;
            this.isScrollLoading = false;
            this.scrollTop = 0;
            this.activated = false;
            this.itemsLoaded = new Promise(resolve => {
                this.itemsLoadedResolve = resolve;
            });
        }
        get dataReady() {
            return this.itemsLoaded;
        }
        get defaultSchema() {
            return SelectComponent.schema();
        }
        get emptyValue() {
            return '';
        }
        elementInfo() {
            const info = super.elementInfo();
            info.type = 'select';
            info.changeEvent = 'change';
            return info;
        }
        createWrapper() {
            return false;
        }
        itemTemplate(data) {
            if (!data) {
                return '';
            }
            if (this.options.readOnly && this.component.readOnlyValue) {
                return this.itemValue(data);
            }
            if (data && !this.component.template) {
                const itemLabel = data.label || data;
                return typeof itemLabel === 'string' ? this.t(itemLabel) : itemLabel;
            }
            if (typeof data === 'string') {
                return this.t(data);
            }
            const template = this.component.template ? this.interpolate(this.component.template, { item: data }) : data.label;
            if (template) {
                const label = template.replace(/<\/?[^>]+(>|$)/g, '');
                return template.replace(label, this.t(label));
            } else {
                return JSON.stringify(data);
            }
        }
        itemValue(data, forceUseValue = false) {
            if (_.isObject(data)) {
                if (this.component.valueProperty) {
                    return _.get(data, this.component.valueProperty);
                }
                if (forceUseValue) {
                    return data.value;
                }
            }
            return data;
        }
        createInput(container) {
            this.selectContainer = container;
            this.selectInput = super.createInput(container);
        }
        addOption(value, label, attr) {
            const option = {
                value: value,
                label: label
            };
            if (value) {
                this.selectOptions.push(option);
            }
            if (this.choices) {
                return;
            }
            option.element = document.createElement('option');
            if (this.dataValue === option.value) {
                option.element.setAttribute('selected', 'selected');
                option.element.selected = 'selected';
            }
            option.element.innerHTML = label;
            if (attr) {
                _.each(attr, (value, key) => {
                    option.element.setAttribute(key, value);
                });
            }
            this.selectInput.appendChild(option.element);
        }
        addValueOptions(items) {
            items = items || [];
            if (!this.selectOptions.length) {
                if (this.choices) {
                    const currentChoices = Array.isArray(this.dataValue) ? this.dataValue : [this.dataValue];
                    return this.addCurrentChoices(currentChoices, items);
                } else if (!this.component.multiple) {
                    this.addPlaceholder(this.selectInput);
                }
            }
            return false;
        }
        get scrollLoading() {
            return this.isScrollLoading;
        }
        set scrollLoading(isScrolling) {
            if (this.isScrollLoading === isScrolling) {
                return;
            }
            if (isScrolling) {
                this.choices.setChoices([
                    ...this.selectOptions,
                    {
                        value: '',
                        label: 'Loading...',
                        disabled: true
                    }
                ], 'value', 'label', true);
            } else {
                const loadingItem = this.scrollList.querySelector('.choices__item--disabled');
                if (loadingItem) {
                    this.scrollList.removeChild(loadingItem);
                }
            }
            this.scrollList.scrollTo(0, this.scrollTop);
            this.isScrollLoading = isScrolling;
            return isScrolling;
        }
        stopInfiniteScroll() {
            this.scrollLoading = false;
            this.scrollList.removeEventListener('scroll', this.onScroll);
        }
        setItems(items, fromSearch) {
            if (typeof items == 'string') {
                try {
                    items = JSON.parse(items);
                } catch (err) {
                    console.warn(err.message);
                    items = [];
                }
            }
            if (this.component.onSetItems && typeof this.component.onSetItems === 'function') {
                const newItems = this.component.onSetItems(this, items);
                if (newItems) {
                    items = newItems;
                }
            }
            if (!this.choices && this.selectInput) {
                if (this.loading) {
                    this.removeChildFrom(this.selectInput, this.selectContainer);
                }
                this.selectInput.innerHTML = '';
            }
            if (this.component.selectValues) {
                items = _.get(items, this.component.selectValues);
            }
            if (this.scrollLoading) {
                if (this.currentItems.length && items.length && _.isEqual(this.currentItems[0], items[0]) && _.isEqual(this.currentItems[1], items[1])) {
                    this.stopInfiniteScroll();
                    return;
                }
                if (items.limit && items.length < items.limit) {
                    this.stopInfiniteScroll();
                }
                this.loadedItems += items.length;
            } else {
                this.selectOptions = [];
                this.loadedItems = items.length;
            }
            this.currentItems = items;
            if (!fromSearch) {
                this.addValueOptions(items);
            }
            if (this.component.widget === 'html5' && !this.component.placeholder) {
                this.addOption(null, '');
            }
            _.each(items, item => {
                this.addOption(this.itemValue(item), this.itemTemplate(item));
            });
            if (this.choices) {
                this.choices.setChoices(this.selectOptions, 'value', 'label', true);
            } else if (this.loading) {
                this.appendTo(this.selectInput, this.selectContainer);
            }
            this.scrollLoading = false;
            this.loading = false;
            if (this.dataValue) {
                this.setValue(this.dataValue, true);
            } else {
                const defaultValue = this.defaultValue;
                if (defaultValue) {
                    this.setValue(defaultValue);
                }
            }
            this.itemsLoadedResolve();
        }
        loadItems(url, search, headers, options, method, body) {
            options = options || {};
            const minSearch = parseInt(this.component.minSearch, 10);
            if (this.component.searchField && minSearch > 0 && (!search || search.length < minSearch)) {
                return this.setItems([]);
            }
            method = method || 'GET';
            if (method.toUpperCase() === 'GET') {
                body = null;
            }
            const limit = this.component.limit || 100;
            const skip = this.loadedItems || 0;
            const query = this.component.dataSrc === 'url' ? {} : {
                limit: limit,
                skip: skip
            };
            url = this.interpolate(url, {
                formioBase: Formio.getBaseUrl(),
                search,
                limit,
                skip,
                page: Math.abs(Math.floor(skip / limit))
            });
            if (this.component.searchField && search) {
                if (Array.isArray(search)) {
                    query[`${ this.component.searchField }__in`] = search.join(',');
                } else {
                    query[`${ this.component.searchField }__regex`] = search;
                }
            }
            if (this.component.selectFields) {
                query.select = this.component.selectFields;
            }
            if (this.component.sort) {
                query.sort = this.component.sort;
            }
            if (!_.isEmpty(query)) {
                url += (!url.includes('?') ? '?' : '&') + Formio.serialize(query, item => this.interpolate(item));
            }
            if (this.component.filter) {
                url += (!url.includes('?') ? '?' : '&') + this.interpolate(this.component.filter);
            }
            options.header = headers;
            this.loading = true;
            Formio.makeRequest(this.options.formio, 'select', url, method, body, options).then(response => {
                const scrollTop = !this.scrollLoading && this.currentItems.length === 0;
                this.setItems(response, !!search);
                if (scrollTop) {
                    this.choices.choiceList.scrollToTop();
                }
            }).catch(err => {
                this.stopInfiniteScroll();
                this.loading = false;
                this.itemsLoadedResolve();
                this.emit('componentError', {
                    component: this.component,
                    message: err.toString()
                });
                console.warn(`Unable to load resources for ${ this.key }`);
            });
        }
        get requestHeaders() {
            const headers = new Formio.Headers();
            if (this.component.data && this.component.data.headers) {
                try {
                    _.each(this.component.data.headers, header => {
                        if (header.key) {
                            headers.set(header.key, this.interpolate(header.value));
                        }
                    });
                } catch (err) {
                    console.warn(err.message);
                }
            }
            return headers;
        }
        getCustomItems() {
            return this.evaluate(this.component.data.custom, { values: [] }, 'values');
        }
        updateCustomItems() {
            this.setItems(this.getCustomItems() || []);
        }
        updateItems(searchInput, forceUpdate) {
            if (!this.component.data) {
                console.warn(`Select component ${ this.key } does not have data configuration.`);
                this.itemsLoadedResolve();
                return;
            }
            if (!this.checkConditions()) {
                this.itemsLoadedResolve();
                return;
            }
            switch (this.component.dataSrc) {
            case 'values':
                this.component.valueProperty = 'value';
                this.setItems(this.component.data.values);
                break;
            case 'json':
                this.setItems(this.component.data.json);
                break;
            case 'custom':
                this.updateCustomItems();
                break;
            case 'resource': {
                    if (!this.component.data.resource || !forceUpdate && !this.active) {
                        return;
                    }
                    let resourceUrl = this.options.formio ? this.options.formio.formsUrl : `${ Formio.getProjectUrl() }/form`;
                    resourceUrl += `/${ this.component.data.resource }/submission`;
                    try {
                        this.loadItems(resourceUrl, searchInput, this.requestHeaders);
                    } catch (err) {
                        console.warn(`Unable to load resources for ${ this.key }`);
                    }
                    break;
                }
            case 'url': {
                    if (!forceUpdate && !this.active) {
                        return;
                    }
                    let url = this.component.data.url;
                    let method;
                    let body;
                    if (url.substr(0, 1) === '/') {
                        let baseUrl = Formio.getProjectUrl();
                        if (!baseUrl) {
                            baseUrl = Formio.getBaseUrl();
                        }
                        url = baseUrl + this.component.data.url;
                    }
                    if (!this.component.data.method) {
                        method = 'GET';
                    } else {
                        method = this.component.data.method;
                        if (method.toUpperCase() === 'POST') {
                            body = this.component.data.body;
                        } else {
                            body = null;
                        }
                    }
                    const options = this.component.authenticate ? {} : { noToken: true };
                    this.loadItems(url, searchInput, this.requestHeaders, options, method, body);
                    break;
                }
            }
        }
        addPlaceholder(input) {
            if (!this.component.placeholder || !input) {
                return;
            }
            const placeholder = document.createElement('option');
            placeholder.setAttribute('placeholder', true);
            placeholder.appendChild(this.text(this.component.placeholder));
            input.appendChild(placeholder);
        }
        activate() {
            if (this.active) {
                return;
            }
            this.activated = true;
            if (this.choices) {
                this.choices.setChoices([{
                        value: '',
                        label: `<i class="${ this.iconClass('refresh') }" style="font-size:1.3em;"></i>`
                    }], 'value', 'label', true);
            } else {
                this.addOption('', this.t('loading...'));
            }
            this.triggerUpdate();
        }
        get active() {
            return !this.component.lazyLoad || this.activated;
        }
        addInput(input, container) {
            super.addInput(input, container);
            if (this.component.multiple) {
                input.setAttribute('multiple', true);
            }
            if (this.component.widget === 'html5') {
                this.triggerUpdate();
                this.focusableElement = input;
                this.addEventListener(input, 'focus', () => this.update());
                this.addEventListener(input, 'keydown', event => {
                    const {keyCode} = event;
                    if ([
                            8,
                            46
                        ].includes(keyCode)) {
                        this.setValue(null);
                    }
                });
                return;
            }
            const useSearch = this.component.hasOwnProperty('searchEnabled') ? this.component.searchEnabled : true;
            const placeholderValue = this.t(this.component.placeholder);
            let customOptions = this.component.customOptions || {};
            if (typeof customOptions == 'string') {
                try {
                    customOptions = JSON.parse(customOptions);
                } catch (err) {
                    console.warn(err.message);
                    customOptions = {};
                }
            }
            const choicesOptions = {
                removeItemButton: this.component.disabled ? false : _.get(this.component, 'removeItemButton', true),
                itemSelectText: '',
                classNames: {
                    containerOuter: 'choices form-group formio-choices',
                    containerInner: 'form-control'
                },
                addItemText: false,
                placeholder: !!this.component.placeholder,
                placeholderValue: placeholderValue,
                noResultsText: this.t('No results found'),
                noChoicesText: this.t('No choices to choose from'),
                searchPlaceholderValue: this.t('Type to search'),
                shouldSort: false,
                position: this.component.dropdown || 'auto',
                searchEnabled: useSearch,
                searchChoices: !this.component.searchField,
                searchFields: _.get(this, 'component.searchFields', ['label']),
                fuseOptions: Object.assign({
                    include: 'score',
                    threshold: _.get(this, 'component.searchThreshold', 0.3)
                }, _.get(this, 'component.fuseOptions', {})),
                itemComparer: _.isEqual,
                ...customOptions
            };
            const tabIndex = input.tabIndex;
            this.addPlaceholder(input);
            input.setAttribute('dir', this.i18next.dir());
            this.choices = new Choices(input, choicesOptions);
            if (this.component.multiple) {
                this.focusableElement = this.choices.input.element;
            } else {
                this.focusableElement = this.choices.containerInner.element;
                this.choices.containerOuter.element.setAttribute('tabIndex', '-1');
                if (useSearch) {
                    this.addEventListener(this.choices.containerOuter.element, 'focus', () => this.focusableElement.focus());
                }
            }
            this.scrollList = this.choices.choiceList.element;
            this.onScroll = () => {
                if (!this.scrollLoading && this.scrollList.scrollTop + this.scrollList.clientHeight >= this.scrollList.scrollHeight) {
                    this.scrollTop = this.scrollList.scrollTop;
                    this.scrollLoading = true;
                    this.triggerUpdate(this.choices.input.element.value);
                }
            };
            this.scrollList.addEventListener('scroll', this.onScroll);
            this.addFocusBlurEvents(this.focusableElement);
            this.focusableElement.setAttribute('tabIndex', tabIndex);
            this.setInputStyles(this.choices.containerOuter.element);
            if (this.component.searchField) {
                if (this.choices && this.choices.input && this.choices.input.element) {
                    this.addEventListener(this.choices.input.element, 'input', event => {
                        if (!event.target.value) {
                            this.triggerUpdate();
                        }
                    });
                }
                this.addEventListener(input, 'search', event => this.triggerUpdate(event.detail.value));
                this.addEventListener(input, 'stopSearch', () => this.triggerUpdate());
            }
            this.addEventListener(input, 'showDropdown', () => {
                if (this.dataValue) {
                    this.triggerUpdate();
                }
                this.update();
            });
            if (placeholderValue && this.choices._isSelectOneElement) {
                this.addEventListener(input, 'removeItem', () => {
                    const items = this.choices._store.activeItems;
                    if (!items.length) {
                        this.choices._addItem(placeholderValue, placeholderValue, 0, -1, null, true, null);
                    }
                });
            }
            if (this.addValueOptions()) {
                this.restoreValue();
            }
            this.disabled = this.disabled;
            this.triggerUpdate();
        }
        update() {
            if (this.component.dataSrc === 'custom') {
                this.updateCustomItems();
            }
            this.activate();
        }
        set disabled(disabled) {
            super.disabled = disabled;
            if (!this.choices) {
                return;
            }
            if (disabled) {
                this.setDisabled(this.choices.containerInner.element, true);
                this.focusableElement.removeAttribute('tabIndex');
                this.choices.disable();
            } else {
                this.setDisabled(this.choices.containerInner.element, false);
                this.focusableElement.setAttribute('tabIndex', this.component.tabindex || 0);
                this.choices.enable();
            }
        }
        show(show) {
            const triggerUpdate = show && this._visible !== show;
            show = super.show(show);
            if (triggerUpdate) {
                this.triggerUpdate();
            }
            return show;
        }
        addCurrentChoices(values, items) {
            if (!values) {
                return false;
            }
            const notFoundValuesToAdd = [];
            const added = values.reduce((defaultAdded, value) => {
                if (!value) {
                    return defaultAdded;
                }
                let found = false;
                const isSelectOptions = items === this.selectOptions;
                if (items && items.length) {
                    _.each(items, choice => {
                        if (choice._id && value._id && choice._id === value._id) {
                            found = true;
                            return false;
                        }
                        found |= _.isEqual(this.itemValue(choice, isSelectOptions), value);
                        return found ? false : true;
                    });
                }
                if (!found) {
                    notFoundValuesToAdd.push({
                        value: this.itemValue(value),
                        label: this.itemTemplate(value)
                    });
                    return true;
                }
                return found || defaultAdded;
            }, false);
            if (notFoundValuesToAdd.length) {
                if (this.choices) {
                    this.choices.setChoices(notFoundValuesToAdd, 'value', 'label', true);
                } else {
                    notFoundValuesToAdd.map(notFoundValue => {
                        this.addOption(notFoundValue.value, notFoundValue.label);
                    });
                }
            }
            return added;
        }
        getView(data) {
            return this.component.multiple && Array.isArray(data) ? data.map(this.asString.bind(this)).join(', ') : this.asString(data);
        }
        getValue() {
            if (this.viewOnly || this.loading || !this.selectOptions.length) {
                return this.dataValue;
            }
            let value = '';
            if (this.choices) {
                value = this.choices.getValue(true);
                if (!this.component.multiple && this.component.placeholder && value === this.t(this.component.placeholder)) {
                    value = '';
                }
            } else {
                const values = [];
                _.each(this.selectOptions, selectOption => {
                    if (selectOption.element && selectOption.element.selected) {
                        values.push(selectOption.value);
                    }
                });
                value = this.component.multiple ? values : values.shift();
            }
            if (value === undefined || value === null) {
                value = '';
            }
            return value;
        }
        redraw() {
            super.redraw();
            this.triggerUpdate();
        }
        setValue(value, flags) {
            flags = this.getFlags.apply(this, arguments);
            const previousValue = this.dataValue;
            if (this.component.multiple && !Array.isArray(value)) {
                value = value ? [value] : [];
            }
            const hasPreviousValue = Array.isArray(previousValue) ? previousValue.length : previousValue;
            const hasValue = Array.isArray(value) ? value.length : value;
            const changed = this.hasChanged(value, previousValue);
            this.dataValue = value;
            if (this.loading) {
                return changed;
            }
            if (this.component.searchField && this.component.lazyLoad && !this.lazyLoadInit && !this.active && !this.selectOptions.length && hasValue) {
                this.loading = true;
                this.lazyLoadInit = true;
                this.triggerUpdate(this.dataValue, true);
                return changed;
            }
            this.addValueOptions();
            if (this.choices) {
                if (hasValue) {
                    this.choices.removeActiveItems();
                    const currentChoices = Array.isArray(this.dataValue) ? this.dataValue : [this.dataValue];
                    this.addCurrentChoices(currentChoices, this.selectOptions);
                    this.choices.setChoices(this.selectOptions, 'value', 'label', true).setChoiceByValue(value);
                } else if (hasPreviousValue) {
                    this.choices.removeActiveItems();
                }
            } else {
                if (hasValue) {
                    const values = Array.isArray(value) ? value : [value];
                    _.each(this.selectOptions, selectOption => {
                        _.each(values, val => {
                            if (_.isEqual(val, selectOption.value)) {
                                selectOption.element.selected = true;
                                selectOption.element.setAttribute('selected', 'selected');
                                return false;
                            }
                        });
                    });
                } else {
                    _.each(this.selectOptions, selectOption => {
                        selectOption.element.selected = false;
                        selectOption.element.removeAttribute('selected');
                    });
                }
            }
            this.updateOnChange(flags, changed);
            return changed;
        }
        deleteValue() {
            this.setValue('', { noUpdateEvent: true });
            _.unset(this.data, this.key);
        }
        validateMultiple() {
            return false;
        }
        asString(value) {
            value = value || this.getValue();
            if ([
                    'values',
                    'custom'
                ].includes(this.component.dataSrc)) {
                const {items, valueProperty} = this.component.dataSrc === 'values' ? {
                    items: this.component.data.values,
                    valueProperty: 'value'
                } : {
                    items: this.getCustomItems(),
                    valueProperty: this.component.valueProperty
                };
                value = this.component.multiple && Array.isArray(value) ? _.filter(items, item => value.includes(item.value)) : valueProperty ? _.find(items, [
                    valueProperty,
                    value
                ]) : value;
            }
            if (_.isString(value)) {
                return value;
            }
            if (Array.isArray(value)) {
                const items = [];
                value.forEach(item => items.push(this.itemTemplate(item)));
                return items.length > 0 ? items.join('<br />') : '-';
            }
            return !_.isNil(value) ? this.itemTemplate(value) : '-';
        }
        setupValueElement(element) {
            element.innerHTML = this.asString();
        }
        destroy() {
            super.destroy();
            if (this.choices) {
                this.choices.destroyed = true;
                this.choices.destroy();
                this.choices = null;
            }
        }
        focus() {
            this.focusableElement.focus();
        }
    };
});