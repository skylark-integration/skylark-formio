define([
    '../../utils/ChoicesWrapper',
    'skylark-lodash',
    '../../Formio',
    '../_classes/field/Field',
    '../../Form',
    '../../vendors/getify/npo'
], function (
    Choices, 
    _, 
    Formio, 
    Field, 
    Form, 
    NativePromise
) {
    'use strict';
    return class SelectComponent extends Field {
        static schema(...extend) {
            return Field.schema({
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
                clearOnRefresh: false,
                limit: 100,
                dataSrc: 'values',
                valueProperty: '',
                lazyLoad: true,
                filter: '',
                searchEnabled: true,
                searchField: '',
                minSearch: 0,
                readOnlyValue: false,
                authenticate: false,
                template: '<span>{{ item.label }}</span>',
                selectFields: '',
                searchThreshold: 0.3,
                tableView: true,
                fuseOptions: {
                    include: 'score',
                    threshold: 0.3
                },
                customOptions: {}
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'Select',
                group: 'basic',
                icon: 'th-list',
                weight: 70,
                documentation: 'http://help.form.io/userguide/#select',
                schema: SelectComponent.schema()
            };
        }
        init() {
            super.init();
            this.validators = this.validators.concat(['select']);
            let updateArgs = [];
            const triggerUpdate = _.debounce((...args) => {
                updateArgs = [];
                return this.updateItems.apply(this, args);
            }, 100);
            this.triggerUpdate = (...args) => {
                if (args.length) {
                    updateArgs = args;
                }
                return triggerUpdate(...updateArgs);
            };
            this.selectOptions = [];
            if (this.isInfiniteScrollProvided) {
                this.isFromSearch = false;
                this.searchServerCount = null;
                this.defaultServerCount = null;
                this.isScrollLoading = false;
                this.searchDownloadedResources = [];
                this.defaultDownloadedResources = [];
            }
            this.activated = false;
            this.itemsLoaded = new NativePromise(resolve => {
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
            if (this.valueProperty) {
                return '';
            }
            return {};
        }
        get valueProperty() {
            if (this.component.valueProperty) {
                return this.component.valueProperty;
            }
            if (this.component.dataSrc === 'values') {
                return 'value';
            }
            return '';
        }
        get inputInfo() {
            const info = super.elementInfo();
            info.type = 'select';
            info.changeEvent = 'change';
            return info;
        }
        get isSelectResource() {
            return this.component.dataSrc === 'resource';
        }
        get isSelectURL() {
            return this.component.dataSrc === 'url';
        }
        get isInfiniteScrollProvided() {
            return this.isSelectResource || this.isSelectURL;
        }
        get shouldDisabled() {
            return super.shouldDisabled || this.parentDisabled;
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
        addOption(value, label, attrs = {}, id) {
            const option = {
                value: _.isObject(value) ? value : _.isNull(value) ? this.emptyValue : String(this.normalizeSingleValue(value)),
                label: label
            };
            if (value) {
                this.selectOptions.push(option);
            }
            if (this.refs.selectContainer && this.component.widget === 'html5') {
                const div = document.createElement('div');
                div.innerHTML = this.sanitize(this.renderTemplate('selectOption', {
                    selected: _.isEqual(this.dataValue, option.value),
                    option,
                    attrs,
                    id,
                    useId: this.valueProperty === '' && _.isObject(value) && id
                })).trim();
                option.element = div.firstChild;
                this.refs.selectContainer.appendChild(option.element);
            }
        }
        addValueOptions(items) {
            items = items || [];
            if (!this.selectOptions.length) {
                if (this.choices) {
                    const currentChoices = Array.isArray(this.dataValue) ? this.dataValue : [this.dataValue];
                    return this.addCurrentChoices(currentChoices, items);
                } else if (!this.component.multiple) {
                    this.addPlaceholder();
                }
            }
            return false;
        }
        disableInfiniteScroll() {
            if (!this.downloadedResources) {
                return;
            }
            this.downloadedResources.serverCount = this.downloadedResources.length;
            this.serverCount = this.downloadedResources.length;
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
            if (!this.choices && this.refs.selectContainer) {
                if (this.loading) {
                }
                this.empty(this.refs.selectContainer);
            }
            if (this.component.selectValues) {
                items = _.get(items, this.component.selectValues, items) || [];
            }
            let areItemsEqual;
            if (this.isInfiniteScrollProvided) {
                areItemsEqual = this.isSelectURL ? _.isEqual(items, this.downloadedResources) : false;
                const areItemsEnded = this.component.limit > items.length;
                const areItemsDownloaded = areItemsEqual && this.downloadedResources && this.downloadedResources.length === items.length;
                if (areItemsEnded) {
                    this.disableInfiniteScroll();
                } else if (areItemsDownloaded) {
                    this.selectOptions = [];
                } else {
                    this.serverCount = items.serverCount;
                }
            }
            if (this.isScrollLoading && items) {
                if (!areItemsEqual) {
                    this.downloadedResources = this.downloadedResources ? this.downloadedResources.concat(items) : items;
                }
                this.downloadedResources.serverCount = items.serverCount || this.downloadedResources.serverCount;
            } else {
                this.downloadedResources = items || [];
                this.selectOptions = [];
            }
            if (!fromSearch) {
                this.addValueOptions(items);
            }
            if (this.component.widget === 'html5' && !this.component.placeholder) {
                this.addOption(null, '');
            }
            _.each(items, (item, index) => {
                this.addOption(this.itemValue(item), this.itemTemplate(item), {}, String(index));
            });
            if (this.choices) {
                this.choices.setChoices(this.selectOptions, 'value', 'label', true);
            } else if (this.loading) {
            }
            this.isScrollLoading = false;
            this.loading = false;
            if (this.dataValue) {
                this.setValue(this.dataValue, { noUpdateEvent: true });
            } else {
                const defaultValue = this.multiple ? this.defaultValue || [] : this.defaultValue;
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
            const skip = this.isScrollLoading ? this.selectOptions.length : 0;
            const query = this.component.dataSrc === 'url' ? {} : {
                limit,
                skip
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
                    query[`${ this.component.searchField }`] = search.join(',');
                } else {
                    query[`${ this.component.searchField }`] = search;
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
                this.loading = false;
                this.setItems(response, !!search);
            }).catch(err => {
                if (this.isInfiniteScrollProvided) {
                    this.setItems([]);
                    this.disableInfiniteScroll();
                }
                this.isScrollLoading = false;
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
        refresh() {
            if (this.component.clearOnRefresh) {
                this.setValue(this.emptyValue);
            }
            if (this.component.lazyLoad) {
                this.activated = false;
                this.loading = true;
                this.setItems([]);
            }
            this.updateItems(null, true);
        }
        get additionalResourcesAvailable() {
            return _.isNil(this.serverCount) || this.serverCount > this.downloadedResources.length;
        }
        get serverCount() {
            if (this.isFromSearch) {
                return this.searchServerCount;
            }
            return this.defaultServerCount;
        }
        set serverCount(value) {
            if (this.isFromSearch) {
                this.searchServerCount = value;
            } else {
                this.defaultServerCount = value;
            }
        }
        get downloadedResources() {
            if (this.isFromSearch) {
                return this.searchDownloadedResources;
            }
            return this.defaultDownloadedResources;
        }
        set downloadedResources(value) {
            if (this.isFromSearch) {
                this.searchDownloadedResources = value;
            } else {
                this.defaultDownloadedResources = value;
            }
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
                    if (forceUpdate || this.additionalResourcesAvailable) {
                        try {
                            this.loadItems(resourceUrl, searchInput, this.requestHeaders);
                        } catch (err) {
                            console.warn(`Unable to load resources for ${ this.key }`);
                        }
                    } else {
                        this.setItems(this.downloadedResources);
                    }
                    break;
                }
            case 'url': {
                    if (!forceUpdate && !this.active) {
                        return;
                    }
                    let {url} = this.component.data;
                    let method;
                    let body;
                    if (url.startsWith('/')) {
                        const baseUrl = url.startsWith('/project') ? Formio.getBaseUrl() : Formio.getProjectUrl() || Formio.getBaseUrl();
                        url = baseUrl + url;
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
            case 'indexeddb': {
                    if (!window.indexedDB) {
                        window.alert("Your browser doesn't support current version of indexedDB");
                    }
                    if (this.component.indexeddb && this.component.indexeddb.database && this.component.indexeddb.table) {
                        const request = window.indexedDB.open(this.component.indexeddb.database);
                        request.onupgradeneeded = event => {
                            if (this.component.customOptions) {
                                const db = event.target.result;
                                const objectStore = db.createObjectStore(this.component.indexeddb.table, {
                                    keyPath: 'myKey',
                                    autoIncrement: true
                                });
                                objectStore.transaction.oncomplete = () => {
                                    const transaction = db.transaction(this.component.indexeddb.table, 'readwrite');
                                    this.component.customOptions.forEach(item => {
                                        transaction.objectStore(this.component.indexeddb.table).put(item);
                                    });
                                };
                            }
                        };
                        request.onerror = () => {
                            window.alert(request.errorCode);
                        };
                        request.onsuccess = event => {
                            const db = event.target.result;
                            const transaction = db.transaction(this.component.indexeddb.table, 'readwrite');
                            const objectStore = transaction.objectStore(this.component.indexeddb.table);
                            new NativePromise(resolve => {
                                const responseItems = [];
                                objectStore.getAll().onsuccess = event => {
                                    event.target.result.forEach(item => {
                                        responseItems.push(item);
                                    });
                                    resolve(responseItems);
                                };
                            }).then(items => {
                                if (!_.isEmpty(this.component.indexeddb.filter)) {
                                    items = _.filter(items, this.component.indexeddb.filter);
                                }
                                this.setItems(items);
                            });
                        };
                    }
                }
            }
        }
        addPlaceholder() {
            if (!this.component.placeholder) {
                return;
            }
            this.addOption('', this.component.placeholder, { placeholder: true });
        }
        activate() {
            if (this.active) {
                return;
            }
            this.activated = true;
            if (this.choices) {
                this.choices.setChoices([{
                        value: '',
                        label: `<i class="${ this.iconClass('refresh') }" style="font-size:1.3em;"></i>`,
                        disabled: true
                    }], 'value', 'label', true);
            } else if (this.component.dataSrc === 'url' || this.component.dataSrc === 'resource') {
                this.addOption('', this.t('loading...'));
            }
            this.triggerUpdate();
        }
        get active() {
            return !this.component.lazyLoad || this.activated || this.options.readOnly;
        }
        render() {
            const info = this.inputInfo;
            info.attr = info.attr || {};
            info.multiple = this.component.multiple;
            return super.render(this.wrapElement(this.renderTemplate('select', {
                input: info,
                selectOptions: '',
                index: null
            })));
        }
        wrapElement(element) {
            return this.component.addResource ? this.renderTemplate('resourceAdd', { element }) : element;
        }
        choicesOptions() {
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
            return {
                removeItemButton: this.component.disabled ? false : _.get(this.component, 'removeItemButton', true),
                itemSelectText: '',
                classNames: {
                    containerOuter: 'choices form-group formio-choices',
                    containerInner: this.transform('class', 'form-control ui fluid selection dropdown')
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
                fuseOptions: Object.assign({}, _.get(this, 'component.fuseOptions', {}), {
                    include: 'score',
                    threshold: _.get(this, 'component.searchThreshold', 0.3)
                }),
                valueComparer: _.isEqual,
                resetScrollPosition: false,
                ...customOptions
            };
        }
        attach(element) {
            const superAttach = super.attach(element);
            this.loadRefs(element, {
                selectContainer: 'single',
                addResource: 'single',
                autocompleteInput: 'single'
            });
            const autocompleteInput = this.refs.autocompleteInput;
            if (autocompleteInput) {
                this.addEventListener(autocompleteInput, 'change', event => {
                    this.setValue(event.target.value);
                });
            }
            const input = this.refs.selectContainer;
            if (!input) {
                return;
            }
            this.addEventListener(input, this.inputInfo.changeEvent, () => this.updateValue(null, { modified: true }));
            if (this.component.widget === 'html5') {
                this.triggerUpdate();
                this.focusableElement = input;
                this.addEventListener(input, 'focus', () => this.update());
                this.addEventListener(input, 'keydown', event => {
                    const {key} = event;
                    if ([
                            'Backspace',
                            'Delete'
                        ].includes(key)) {
                        this.setValue(this.emptyValue);
                    }
                });
                return;
            }
            const tabIndex = input.tabIndex;
            this.addPlaceholder();
            input.setAttribute('dir', this.i18next.dir());
            if (this.choices) {
                this.choices.destroy();
            }
            const choicesOptions = this.choicesOptions();
            this.choices = new Choices(input, choicesOptions);
            this.addEventListener(input, 'hideDropdown', () => {
                this.choices.input.element.value = '';
                this.updateItems(null, true);
            });
            if (this.selectOptions && this.selectOptions.length) {
                this.choices.setChoices(this.selectOptions, 'value', 'label', true);
            }
            if (this.component.multiple) {
                this.focusableElement = this.choices.input.element;
            } else {
                this.focusableElement = this.choices.containerInner.element;
                this.choices.containerOuter.element.setAttribute('tabIndex', '-1');
                if (choicesOptions.searchEnabled) {
                    this.addEventListener(this.choices.containerOuter.element, 'focus', () => this.focusableElement.focus());
                }
            }
            if (this.isInfiniteScrollProvided) {
                this.scrollList = this.choices.choiceList.element;
                this.onScroll = () => {
                    const isLoadingAvailable = !this.isScrollLoading && this.additionalResourcesAvailable && this.scrollList.scrollTop + this.scrollList.clientHeight >= this.scrollList.scrollHeight;
                    if (isLoadingAvailable) {
                        this.isScrollLoading = true;
                        this.choices.setChoices([{
                                value: `${ this.id }-loading`,
                                label: 'Loading...',
                                disabled: true
                            }], 'value', 'label');
                        this.triggerUpdate(this.choices.input.element.value);
                    }
                };
                this.addEventListener(this.scrollList, 'scroll', this.onScroll);
            }
            this.focusableElement.setAttribute('tabIndex', tabIndex);
            if (this.component.searchField) {
                if (this.choices && this.choices.input && this.choices.input.element) {
                    this.addEventListener(this.choices.input.element, 'input', event => {
                        this.isFromSearch = !!event.target.value;
                        if (!event.target.value) {
                            this.triggerUpdate();
                        } else {
                            this.serverCount = null;
                            this.downloadedResources = [];
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
            if (choicesOptions.placeholderValue && this.choices._isSelectOneElement) {
                this.addPlaceholderItem(choicesOptions.placeholderValue);
                this.addEventListener(input, 'removeItem', () => {
                    this.addPlaceholderItem(choicesOptions.placeholderValue);
                });
            }
            this.addValueOptions();
            this.setChoicesValue(this.dataValue);
            if (this.isSelectResource && this.refs.addResource) {
                this.addEventListener(this.refs.addResource, 'click', event => {
                    event.preventDefault();
                    const formioForm = this.ce('div');
                    const dialog = this.createModal(formioForm);
                    const projectUrl = _.get(this.root, 'formio.projectUrl', Formio.getBaseUrl());
                    const formUrl = `${ projectUrl }/form/${ this.component.data.resource }`;
                    new Form(formioForm, formUrl, {}).ready.then(form => {
                        form.on('submit', submission => {
                            if (this.component.multiple) {
                                submission = [
                                    ...this.dataValue,
                                    submission
                                ];
                            }
                            this.setValue(submission);
                            dialog.close();
                        });
                    });
                });
            }
            this.disabled = this.shouldDisabled;
            this.triggerUpdate();
            return superAttach;
        }
        addPlaceholderItem(placeholderValue) {
            const items = this.choices._store.activeItems;
            if (!items.length) {
                this.choices._addItem({
                    value: placeholderValue,
                    label: placeholderValue,
                    choiceId: 0,
                    groupId: -1,
                    customProperties: null,
                    placeholder: true,
                    keyCode: null
                });
            }
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
        get disabled() {
            return super.disabled;
        }
        set visible(value) {
            if (value && !this._visible !== !value) {
                this.triggerUpdate();
            }
            super.visible = value;
        }
        get visible() {
            return super.visible;
        }
        addCurrentChoices(values, items, keyValue) {
            if (!values) {
                return false;
            }
            const notFoundValuesToAdd = [];
            const added = values.reduce((defaultAdded, value) => {
                if (!value || _.isEmpty(value)) {
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
                        const itemValue = keyValue ? choice.value : this.itemValue(choice, isSelectOptions);
                        found |= _.isEqual(itemValue, value);
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
        getValueAsString(data) {
            return this.component.multiple && Array.isArray(data) ? data.map(this.asString.bind(this)).join(', ') : this.asString(data);
        }
        getValue() {
            if (this.viewOnly || this.loading || !this.component.lazyLoad && !this.selectOptions.length || !this.element) {
                return this.dataValue;
            }
            let value = this.emptyValue;
            if (this.choices) {
                value = this.choices.getValue(true);
                if (!this.component.multiple && this.component.placeholder && value === this.t(this.component.placeholder)) {
                    value = this.emptyValue;
                }
            } else if (this.refs.selectContainer) {
                value = this.refs.selectContainer.value;
                if (this.valueProperty === '') {
                    if (value === '') {
                        return {};
                    }
                    const option = this.selectOptions[value];
                    if (option && _.isObject(option.value)) {
                        value = option.value;
                    }
                }
            } else {
                value = this.dataValue;
            }
            if (value === undefined || value === null) {
                value = '';
            }
            return value;
        }
        redraw() {
            const done = super.redraw();
            this.triggerUpdate();
            return done;
        }
        normalizeSingleValue(value) {
            if (!value) {
                return;
            }
            const dataType = this.component['dataType'] || 'auto';
            const denormalizedValue = typeof value === 'string' ? value.toLowerCase() : value;
            const normalize = {
                value: denormalizedValue,
                toNumber() {
                    try {
                        const numberValue = parseFloat(this.value);
                        if (!Number.isNaN(numberValue) && isFinite(numberValue)) {
                            this.value = numberValue;
                            return this;
                        }
                        return this;
                    } catch (e) {
                        return this;
                    }
                },
                toBoolean() {
                    try {
                        const booleanValue = this.value === 'true' || this.value === 'false';
                        if (booleanValue) {
                            this.value = this.value === 'true';
                            return this;
                        }
                        return this;
                    } catch (e) {
                        return this;
                    }
                },
                toString() {
                    try {
                        const stringValue = typeof this.value === 'object' ? JSON.stringify(this.value) : this.value.toString();
                        if (stringValue) {
                            this.value = stringValue;
                            return this;
                        }
                        return this;
                    } catch (e) {
                        return this;
                    }
                },
                auto() {
                    try {
                        const autoValue = this.toString().toNumber().toBoolean();
                        if (autoValue && !_.isObject(autoValue)) {
                            this.value = autoValue;
                        }
                        return this;
                    } catch (e) {
                        return this;
                    }
                }
            };
            switch (dataType) {
            case 'auto': {
                    return normalize.auto().value;
                }
            case 'number': {
                    return normalize.toNumber().value;
                }
            case 'string': {
                    return normalize.toString().value;
                }
            case 'boolean':
                return normalize.toBoolean().value;
            }
        }
        normalizeValue(value) {
            if (this.component.multiple && Array.isArray(value)) {
                return value.map(singleValue => this.normalizeSingleValue(singleValue));
            }
            return super.normalizeValue(this.normalizeSingleValue(value));
        }
        setValue(value, flags = {}) {
            const previousValue = this.dataValue;
            const changed = this.updateValue(value, flags);
            value = this.dataValue;
            const hasPreviousValue = Array.isArray(previousValue) ? previousValue.length : previousValue;
            const hasValue = Array.isArray(value) ? value.length : value;
            if (this.component.multiple && Array.isArray(value)) {
                value = value.map(value => {
                    if (typeof value === 'boolean' || typeof value === 'number') {
                        return value.toString();
                    }
                    return value;
                });
            } else {
                if (typeof value === 'boolean' || typeof value === 'number') {
                    value = value.toString();
                }
            }
            if (this.loading) {
                return changed;
            }
            if (this.isInitApiCallNeeded(hasValue)) {
                this.loading = true;
                this.lazyLoadInit = true;
                const searchProperty = this.component.searchField || this.component.valueProperty;
                this.triggerUpdate(_.get(value.data || value, searchProperty, value), true);
                return changed;
            }
            this.addValueOptions();
            this.setChoicesValue(value, hasPreviousValue);
            return changed;
        }
        isInitApiCallNeeded(hasValue) {
            return this.component.lazyLoad && !this.lazyLoadInit && !this.active && !this.selectOptions.length && hasValue && this.visible && (this.component.searchField || this.component.valueProperty);
        }
        setChoicesValue(value, hasPreviousValue) {
            const hasValue = Array.isArray(value) ? value.length : value;
            hasPreviousValue = hasPreviousValue === undefined ? true : hasPreviousValue;
            if (this.choices) {
                if (hasValue) {
                    this.choices.removeActiveItems();
                    const currentChoices = Array.isArray(value) ? value : [value];
                    if (!this.addCurrentChoices(currentChoices, this.selectOptions, true)) {
                        this.choices.setChoices(this.selectOptions, 'value', 'label', true);
                    }
                    this.choices.setChoiceByValue(value);
                } else if (hasPreviousValue) {
                    this.choices.removeActiveItems();
                }
            } else {
                if (hasValue) {
                    const values = Array.isArray(value) ? value : [value];
                    _.each(this.selectOptions, selectOption => {
                        _.each(values, val => {
                            if (_.isEqual(val, selectOption.value) && selectOption.element) {
                                selectOption.element.selected = true;
                                selectOption.element.setAttribute('selected', 'selected');
                                return false;
                            }
                        });
                    });
                } else {
                    _.each(this.selectOptions, selectOption => {
                        if (selectOption.element) {
                            selectOption.element.selected = false;
                            selectOption.element.removeAttribute('selected');
                        }
                    });
                }
            }
        }
        deleteValue() {
            this.setValue('', { noUpdateEvent: true });
            this.unset();
        }
        validateMultiple() {
            return false;
        }
        isBooleanOrNumber(value) {
            return typeof value === 'number' || typeof value === 'boolean';
        }
        asString(value) {
            value = value || this.getValue();
            if (this.isBooleanOrNumber(value)) {
                value = value.toString();
            }
            if (Array.isArray(value) && value.some(item => this.isBooleanOrNumber(item))) {
                value = value.map(item => {
                    if (this.isBooleanOrNumber(item)) {
                        item = item.toString();
                    }
                });
            }
            if ([
                    'values',
                    'custom'
                ].includes(this.component.dataSrc)) {
                const {items, valueProperty} = this.component.dataSrc === 'values' ? {
                    items: this.component.data.values,
                    valueProperty: 'value'
                } : {
                    items: this.getCustomItems(),
                    valueProperty: this.valueProperty
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
        detach() {
            super.detach();
            if (this.choices) {
                this.choices.destroy();
                this.choices = null;
            }
        }
        focus() {
            if (this.focusableElement) {
                this.focusableElement.focus();
            }
        }
        setErrorClasses(elements, dirty, hasError) {
            super.setErrorClasses(elements, dirty, hasError);
            if (this.choices) {
                super.setErrorClasses([this.choices.containerInner.element], dirty, hasError);
            } else {
                super.setErrorClasses([this.refs.selectContainer], dirty, hasError);
            }
        }
    };
});