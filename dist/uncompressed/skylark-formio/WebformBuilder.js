define([
    './Webform',
    './components/_classes/component/Component',
    'skylark-dragula',
    './vendors/tooltip-js/tooltip',
    './vendors/getify/npo',
    './components/Components',
    './Formio',
    './utils/utils',
    './utils/formUtils',
    './utils/builder',
    'skylark-lodash',
    './templates/Templates'
], function (Webform, Component, dragula, Tooltip, NativePromise, Components, Formio, a, b, BuilderUtils, _, Templates) {
    'use strict';
    require('./components/builder');
    return class WebformBuilder extends Component {
        constructor() {
            let element, options;
            if (arguments[0] instanceof HTMLElement || arguments[1]) {
                element = arguments[0];
                options = arguments[1];
            } else {
                options = arguments[0];
            }
            options.skipInit = false;
            super(null, options);
            this.element = element;
            this.builderHeight = 0;
            this.schemas = {};
            this.sideBarScroll = _.get(this.options, 'sideBarScroll', true);
            this.sideBarScrollOffset = _.get(this.options, 'sideBarScrollOffset', 0);
            const componentInfo = {};
            for (const type in Components.components) {
                const component = Components.components[type];
                if (component.builderInfo) {
                    component.type = type;
                    componentInfo[type] = component.builderInfo;
                }
            }
            this.dragDropEnabled = true;
            this.builder = _.defaultsDeep({}, this.options.builder, this.defaultGroups);
            _.each(this.defaultGroups, (config, key) => {
                if (config === false) {
                    this.builder[key] = false;
                }
            });
            this.groups = {};
            this.groupOrder = [];
            for (const group in this.builder) {
                if (this.builder[group]) {
                    this.builder[group].key = group;
                    this.groups[group] = this.builder[group];
                    this.groups[group].components = this.groups[group].components || {};
                    this.groups[group].componentOrder = this.groups[group].componentOrder || [];
                    this.groups[group].subgroups = Object.keys(this.groups[group].groups || {}).map(groupKey => {
                        this.groups[group].groups[groupKey].componentOrder = Object.keys(this.groups[group].groups[groupKey].components).map(key => key);
                        return this.groups[group].groups[groupKey];
                    });
                    this.groupOrder.push(this.groups[group]);
                }
            }
            this.groupOrder = this.groupOrder.filter(group => group && !group.ignore).sort((a, b) => a.weight - b.weight).map(group => group.key);
            for (const type in Components.components) {
                const component = Components.components[type];
                if (component.builderInfo) {
                    this.schemas[type] = component.builderInfo.schema;
                    component.type = type;
                    const builderInfo = component.builderInfo;
                    builderInfo.key = component.type;
                    this.addBuilderComponentInfo(builderInfo);
                }
            }
            for (const group in this.groups) {
                const info = this.groups[group];
                for (const key in info.components) {
                    const comp = info.components[key];
                    if (comp) {
                        if (comp.schema) {
                            this.schemas[key] = comp.schema;
                        }
                        info.components[key] = comp === true ? componentInfo[key] : comp;
                        info.components[key].key = key;
                    }
                }
            }
            for (const group in this.groups) {
                if (this.groups[group] && this.groups[group].components) {
                    this.groups[group].componentOrder = Object.keys(this.groups[group].components).map(key => this.groups[group].components[key]).filter(component => component && !component.ignore).sort((a, b) => a.weight - b.weight).map(component => component.key);
                }
            }
            this.options.hooks = this.options.hooks || {};
            this.options.hooks.renderComponent = (html, {self}) => {
                if (self.type === 'form' && !self.key) {
                    return html.replace('formio-component-form', '');
                }
                if (this.options.disabled && this.options.disabled.includes(self.key) || self.parent.noDragDrop) {
                    return html;
                }
                return this.renderTemplate('builderComponent', { html });
            };
            this.options.hooks.renderComponents = (html, {components, self}) => {
                if (self.type === 'datagrid' && components.length > 0 || self.noDragDrop) {
                    return html;
                }
                if (!components || !components.length && !components.nodrop || self.type === 'form' && components.length <= 1 && (components.length === 0 || components[0].type === 'button')) {
                    html = this.renderTemplate('builderPlaceholder', { position: 0 }) + html;
                }
                return this.renderTemplate('builderComponents', {
                    key: self.key,
                    type: self.type,
                    html
                });
            };
            this.options.hooks.renderInput = (html, {self}) => {
                if (self.type === 'hidden') {
                    return html + self.name;
                }
                return html;
            };
            this.options.hooks.renderLoading = (html, {self}) => {
                if (self.type === 'form' && self.key) {
                    return self.name;
                }
                return html;
            };
            this.options.hooks.attachComponents = (element, components, container, component) => {
                if (!element) {
                    return;
                }
                if (component.noDragDrop) {
                    return element;
                }
                const containerElement = element.querySelector(`[ref="${ component.component.key }-container"]`) || element;
                containerElement.formioContainer = container;
                containerElement.formioComponent = component;
                if (this.dragula && this.allowDrop(element)) {
                    this.dragula.containers.push(containerElement);
                }
                if ((component.type === 'datagrid' || component.type === 'datamap') && components.length > 0) {
                    return element;
                }
                return element.children[0];
            };
            this.options.hooks.attachDatagrid = (element, component) => {
                component.loadRefs(element, { [`${ component.key }-container`]: 'single' });
                component.attachComponents(component.refs[`${ component.key }-container`].parentNode, [], component.component.components);
            };
            this.options.hooks.attachComponent = (element, component) => {
                element.formioComponent = component;
                component.loadRefs(element, {
                    removeComponent: 'single',
                    editComponent: 'single',
                    moveComponent: 'single',
                    copyComponent: 'single',
                    pasteComponent: 'single',
                    editJson: 'single'
                });
                if (component.refs.copyComponent) {
                    new Tooltip(component.refs.copyComponent, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Copy')
                    });
                    component.addEventListener(component.refs.copyComponent, 'click', () => this.copyComponent(component));
                }
                if (component.refs.pasteComponent) {
                    const pasteToolTip = new Tooltip(component.refs.pasteComponent, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Paste below')
                    });
                    component.addEventListener(component.refs.pasteComponent, 'click', () => {
                        pasteToolTip.hide();
                        this.pasteComponent(component);
                    });
                }
                if (component.refs.moveComponent) {
                    new Tooltip(component.refs.moveComponent, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Move')
                    });
                }
                const parent = this.getParentElement(element);
                if (component.refs.editComponent) {
                    new Tooltip(component.refs.editComponent, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Edit')
                    });
                    component.addEventListener(component.refs.editComponent, 'click', () => this.editComponent(component.schema, parent, false, false, component.component));
                }
                if (component.refs.editJson) {
                    new Tooltip(component.refs.editJson, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Edit JSON')
                    });
                    component.addEventListener(component.refs.editJson, 'click', () => this.editComponent(component.schema, parent, false, true, component.component));
                }
                if (component.refs.removeComponent) {
                    new Tooltip(component.refs.removeComponent, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Remove')
                    });
                    component.addEventListener(component.refs.removeComponent, 'click', () => this.removeComponent(component.schema, parent, component.component));
                }
                return element;
            };
            const query = {
                params: {
                    type: 'resource',
                    limit: 4294967295,
                    select: '_id,title,name,components'
                }
            };
            if (this.options && this.options.resourceTag) {
                query.params.tags = [this.options.resourceTag];
            } else if (!this.options || !this.options.hasOwnProperty('resourceTag')) {
                query.params.tags = ['builder'];
            }
            const formio = new Formio(Formio.projectUrl);
            const isResourcesDisabled = this.options.builder && this.options.builder.resource === false;
            if (!formio.noProject && !isResourcesDisabled) {
                const resourceOptions = this.options.builder && this.options.builder.resource;
                formio.loadForms(query).then(resources => {
                    if (resources.length) {
                        this.builder.resource = {
                            title: resourceOptions ? resourceOptions.title : 'Existing Resource Fields',
                            key: 'resource',
                            weight: resourceOptions ? resourceOptions.weight : 50,
                            subgroups: [],
                            components: [],
                            componentOrder: []
                        };
                        this.groups.resource = {
                            title: resourceOptions ? resourceOptions.title : 'Existing Resource Fields',
                            key: 'resource',
                            weight: resourceOptions ? resourceOptions.weight : 50,
                            subgroups: [],
                            components: [],
                            componentOrder: []
                        };
                        if (!this.groupOrder.includes('resource')) {
                            this.groupOrder.push('resource');
                        }
                        this.addExistingResourceFields(resources);
                    }
                });
            }
            this.options.attachMode = 'builder';
            this.webform = this.webform || this.createForm(this.options);
        }
        allowDrop() {
            return true;
        }
        addExistingResourceFields(resources) {
            _.each(resources, (resource, index) => {
                const resourceKey = `resource-${ resource.name }`;
                const subgroup = {
                    key: resourceKey,
                    title: resource.title,
                    components: [],
                    componentOrder: [],
                    default: index === 0
                };
                b.eachComponent(resource.components, component => {
                    if (component.type === 'button')
                        return;
                    if (this.options && this.options.resourceFilter && (!component.tags || component.tags.indexOf(this.options.resourceFilter) === -1))
                        return;
                    let componentName = component.label;
                    if (!componentName && component.key) {
                        componentName = _.upperFirst(component.key);
                    }
                    subgroup.componentOrder.push(component.key);
                    subgroup.components[component.key] = _.merge(a.fastCloneDeep(Components.components[component.type].builderInfo), {
                        key: component.key,
                        title: componentName,
                        group: 'resource',
                        subgroup: resourceKey
                    }, {
                        schema: {
                            ...component,
                            label: component.label,
                            key: component.key,
                            lockKey: true,
                            source: !this.options.noSource ? resource._id : undefined,
                            isNew: true
                        }
                    });
                }, true);
                this.groups.resource.subgroups.push(subgroup);
            });
            this.triggerRedraw();
        }
        createForm(options) {
            this.webform = new Webform(this.element, options);
            if (this.element) {
                this.loadRefs(this.element, { form: 'single' });
                if (this.refs.form) {
                    this.webform.element = this.refs.form;
                }
            }
            return this.webform;
        }
        get ready() {
            return this.webform.ready;
        }
        get defaultGroups() {
            return {
                basic: {
                    title: 'Basic',
                    weight: 0,
                    default: true
                },
                advanced: {
                    title: 'Advanced',
                    weight: 10
                },
                layout: {
                    title: 'Layout',
                    weight: 20
                },
                data: {
                    title: 'Data',
                    weight: 30
                },
                premium: {
                    title: 'Premium',
                    weight: 40
                }
            };
        }
        redraw() {
            return Webform.prototype.redraw.call(this);
        }
        get form() {
            return this.webform.form;
        }
        get schema() {
            return this.webform.schema;
        }
        set form(value) {
            if (!value.components) {
                value.components = [];
            }
            const isShowSubmitButton = !this.options.noDefaultSubmitButton && !value.components.length;
            if (isShowSubmitButton) {
                value.components.push({
                    type: 'button',
                    label: 'Submit',
                    key: 'submit',
                    size: 'md',
                    block: false,
                    action: 'submit',
                    disableOnInvalid: true,
                    theme: 'primary'
                });
            }
            this.webform.form = value;
            this.rebuild();
        }
        get container() {
            return this.webform.form.components;
        }
        findNamespaceRoot(component) {
            const comp = b.getComponent(this.webform.form.components, component.key, true);
            const namespaceKey = this.recurseNamespace(comp);
            if (!namespaceKey || this.form.key === namespaceKey) {
                return this.form.components;
            }
            if (namespaceKey === component.key) {
                return [
                    ...component.components,
                    component
                ];
            }
            const namespaceComponent = b.getComponent(this.form.components, namespaceKey, true);
            return namespaceComponent.components;
        }
        recurseNamespace(component) {
            if (!component) {
                return null;
            }
            if ([
                    'container',
                    'datagrid',
                    'editgrid',
                    'tree'
                ].includes(component.type) || component.tree || component.arrayTree) {
                return component.key;
            }
            return this.recurseNamespace(component.parent);
        }
        render() {
            return this.renderTemplate('builder', {
                sidebar: this.renderTemplate('builderSidebar', {
                    scrollEnabled: this.sideBarScroll,
                    groupOrder: this.groupOrder,
                    groupId: `builder-sidebar-${ this.id }`,
                    groups: this.groupOrder.map(groupKey => this.renderTemplate('builderSidebarGroup', {
                        group: this.groups[groupKey],
                        groupKey,
                        groupId: `builder-sidebar-${ this.id }`,
                        subgroups: this.groups[groupKey].subgroups.map(group => this.renderTemplate('builderSidebarGroup', {
                            group,
                            groupKey: group.key,
                            groupId: `group-container-${ groupKey }`,
                            subgroups: []
                        }))
                    }))
                }),
                form: this.webform.render()
            });
        }
        attach(element) {
            this.on('change', form => {
                this.populateRecaptchaSettings(form);
            });
            return super.attach(element).then(() => {
                this.loadRefs(element, {
                    form: 'single',
                    sidebar: 'single',
                    'container': 'multiple',
                    'sidebar-anchor': 'multiple',
                    'sidebar-group': 'multiple',
                    'sidebar-container': 'multiple'
                });
                if (this.sideBarScroll && Templates.current.handleBuilderSidebarScroll) {
                    Templates.current.handleBuilderSidebarScroll.call(this, this);
                }
                if (window.sessionStorage) {
                    const data = window.sessionStorage.getItem('formio.clipboard');
                    if (data) {
                        this.addClass(this.refs.form, 'builder-paste-mode');
                    }
                }
                if (!a.bootstrapVersion(this.options)) {
                    this.refs['sidebar-group'].forEach(group => {
                        group.style.display = group.getAttribute('data-default') === 'true' ? 'inherit' : 'none';
                    });
                    this.refs['sidebar-anchor'].forEach((anchor, index) => {
                        this.addEventListener(anchor, 'click', () => {
                            const clickedParentId = anchor.getAttribute('data-parent').slice('#builder-sidebar-'.length);
                            const clickedId = anchor.getAttribute('data-target').slice('#group-'.length);
                            this.refs['sidebar-group'].forEach((group, groupIndex) => {
                                const openByDefault = group.getAttribute('data-default') === 'true';
                                const groupId = group.getAttribute('id').slice('group-'.length);
                                const groupParent = group.getAttribute('data-parent').slice('#builder-sidebar-'.length);
                                group.style.display = openByDefault && groupParent === clickedId || groupId === clickedParentId || groupIndex === index ? 'inherit' : 'none';
                            });
                        }, true);
                    });
                }
                if (this.dragDropEnabled) {
                    this.initDragula();
                }
                if (this.refs.form) {
                    return this.webform.attach(this.refs.form);
                }
            });
        }
        initDragula() {
            const options = this.options;
            if (this.dragula) {
                this.dragula.destroy();
            }
            const containersArray = Array.prototype.slice.call(this.refs['sidebar-container']).filter(item => {
                return item.id !== 'group-container-resource';
            });
            this.dragula = dragula(containersArray, {
                moves(el) {
                    let moves = true;
                    const list = Array.from(el.classList).filter(item => item.indexOf('formio-component-') === 0);
                    list.forEach(item => {
                        const key = item.slice('formio-component-'.length);
                        if (options.disabled && options.disabled.includes(key)) {
                            moves = false;
                        }
                    });
                    if (el.classList.contains('no-drag')) {
                        moves = false;
                    }
                    return moves;
                },
                copy(el) {
                    return el.classList.contains('drag-copy');
                },
                accepts(el, target) {
                    return !el.contains(target) && !target.classList.contains('no-drop');
                }
            }).on('drop', (element, target, source, sibling) => this.onDrop(element, target, source, sibling));
        }
        detach() {
            if (this.dragula) {
                this.dragula.destroy();
            }
            this.dragula = null;
            if (this.sideBarScroll && Templates.current.clearBuilderSidebarScroll) {
                Templates.current.clearBuilderSidebarScroll.call(this, this);
            }
            super.detach();
        }
        getComponentInfo(key, group) {
            let info;
            if (this.schemas.hasOwnProperty(key)) {
                info = a.fastCloneDeep(this.schemas[key]);
            } else if (this.groups.hasOwnProperty(group)) {
                const groupComponents = this.groups[group].components;
                if (groupComponents.hasOwnProperty(key)) {
                    info = a.fastCloneDeep(groupComponents[key].schema);
                }
            }
            if (group.slice(0, group.indexOf('-')) === 'resource') {
                const resourceGroups = this.groups.resource.subgroups;
                const resourceGroup = _.find(resourceGroups, { key: group });
                if (resourceGroup && resourceGroup.components.hasOwnProperty(key)) {
                    info = a.fastCloneDeep(resourceGroup.components[key].schema);
                }
            }
            if (info) {
                info.key = _.camelCase(info.title || info.label || info.placeholder || info.type);
            }
            return info;
        }
        getComponentsPath(component, parent) {
            let path = 'components';
            let columnIndex = 0;
            let tableRowIndex = 0;
            let tableColumnIndex = 0;
            let tabIndex = 0;
            switch (parent.type) {
            case 'table':
                tableRowIndex = _.findIndex(parent.rows, row => row.some(column => column.components.some(comp => comp.key === component.key)));
                tableColumnIndex = _.findIndex(parent.rows[tableRowIndex], column => column.components.some(comp => comp.key === component.key));
                path = `rows[${ tableRowIndex }][${ tableColumnIndex }].components`;
                break;
            case 'columns':
                columnIndex = _.findIndex(parent.columns, column => column.components.some(comp => comp.key === component.key));
                path = `columns[${ columnIndex }].components`;
                break;
            case 'tabs':
                tabIndex = _.findIndex(parent.components, tab => tab.components.some(comp => comp.key === component.key));
                path = `components[${ tabIndex }].components`;
                break;
            }
            return path;
        }
        onDrop(element, target, source, sibling) {
            if (!target) {
                return;
            }
            if (element.contains(target)) {
                return;
            }
            const key = element.getAttribute('data-key');
            const type = element.getAttribute('data-type');
            const group = element.getAttribute('data-group');
            let info, isNew, path, index;
            if (key) {
                info = this.getComponentInfo(key, group);
                if (!info && type) {
                    info = this.getComponentInfo(type, group);
                }
                isNew = true;
            } else if (source.formioContainer) {
                index = _.findIndex(source.formioContainer, { key: element.formioComponent.component.key });
                if (index !== -1) {
                    info = source.formioContainer.splice(_.findIndex(source.formioContainer, { key: element.formioComponent.component.key }), 1);
                    info = info[0];
                }
            }
            if (!info) {
                return;
            }
            if (target !== source) {
                BuilderUtils.uniquify(this.findNamespaceRoot(target.formioComponent.component), info);
            }
            const parent = target.formioComponent;
            if (target.formioContainer) {
                if (sibling) {
                    if (!sibling.getAttribute('data-noattach')) {
                        index = _.findIndex(target.formioContainer, { key: _.get(sibling, 'formioComponent.component.key') });
                        index = index === -1 ? 0 : index;
                    } else {
                        index = sibling.getAttribute('data-position');
                    }
                    if (index !== -1) {
                        target.formioContainer.splice(index, 0, info);
                    }
                } else {
                    target.formioContainer.push(info);
                }
                path = this.getComponentsPath(info, parent.component);
                index = _.findIndex(_.get(parent.schema, path), { key: info.key });
                if (index === -1) {
                    index = 0;
                }
            }
            if (parent && parent.addChildComponent) {
                parent.addChildComponent(info, element, target, source, sibling);
            }
            if (isNew && !this.options.noNewEdit) {
                this.editComponent(info, target, isNew);
            }
            let rebuild;
            if (target !== source) {
                if (source.formioContainer && source.contains(target)) {
                    rebuild = source.formioComponent.rebuild();
                } else if (target.contains(source)) {
                    rebuild = target.formioComponent.rebuild();
                } else {
                    if (source.formioContainer) {
                        rebuild = source.formioComponent.rebuild();
                    }
                    rebuild = target.formioComponent.rebuild();
                }
            } else {
                rebuild = target.formioComponent.rebuild();
            }
            if (!rebuild) {
                rebuild = NativePromise.resolve();
            }
            return rebuild.then(() => {
                this.emit('addComponent', info, parent, path, index, isNew);
            });
        }
        setForm(form) {
            this.emit('change', form);
            return super.setForm(form).then(retVal => {
                setTimeout(() => this.builderHeight = this.refs.form.offsetHeight, 200);
                return retVal;
            });
        }
        populateRecaptchaSettings(form) {
            var isRecaptchaEnabled = false;
            if (this.form.components) {
                b.eachComponent(form.components, component => {
                    if (isRecaptchaEnabled) {
                        return;
                    }
                    if (component.type === 'recaptcha') {
                        isRecaptchaEnabled = true;
                        return false;
                    }
                });
                if (isRecaptchaEnabled) {
                    _.set(form, 'settings.recaptcha.isEnabled', true);
                } else if (_.get(form, 'settings.recaptcha.isEnabled')) {
                    _.set(form, 'settings.recaptcha.isEnabled', false);
                }
            }
        }
        removeComponent(component, parent, original) {
            if (!parent) {
                return;
            }
            let remove = true;
            if (!component.skipRemoveConfirm && (Array.isArray(component.components) && component.components.length || Array.isArray(component.rows) && component.rows.length || Array.isArray(component.columns) && component.columns.length)) {
                const message = 'Removing this component will also remove all of its children. Are you sure you want to do this?';
                remove = window.confirm(this.t(message));
            }
            if (!original) {
                original = parent.formioContainer.find(comp => comp.key === component.key);
            }
            const index = parent.formioContainer ? parent.formioContainer.indexOf(original) : 0;
            if (remove && index !== -1) {
                const path = this.getComponentsPath(component, parent.formioComponent.component);
                if (parent.formioContainer) {
                    parent.formioContainer.splice(index, 1);
                } else if (parent.formioComponent && parent.formioComponent.removeChildComponent) {
                    parent.formioComponent.removeChildComponent(component);
                }
                const rebuild = parent.formioComponent.rebuild() || NativePromise.resolve();
                rebuild.then(() => {
                    this.emit('removeComponent', component, parent.formioComponent.schema, path, index);
                    this.emit('change', this.form);
                });
            }
            return remove;
        }
        updateComponent(component, changed) {
            if (this.preview) {
                this.preview.form = {
                    components: [_.omit(component, [
                            'hidden',
                            'conditional',
                            'calculateValue',
                            'logic',
                            'autofocus',
                            'customConditional'
                        ])]
                };
                const previewElement = this.componentEdit.querySelector('[ref="preview"]');
                if (previewElement) {
                    this.setContent(previewElement, this.preview.render());
                    this.preview.attach(previewElement);
                }
            }
            const defaultValueComponent = b.getComponent(this.editForm.components, 'defaultValue');
            if (defaultValueComponent) {
                const defaultChanged = changed && (changed.component && changed.component.key === 'defaultValue' || changed.instance && defaultValueComponent.hasComponent && defaultValueComponent.hasComponent(changed.instance));
                if (!defaultChanged) {
                    _.assign(defaultValueComponent.component, _.omit(component, [
                        'key',
                        'label',
                        'placeholder',
                        'tooltip',
                        'hidden',
                        'autofocus',
                        'validate',
                        'disabled',
                        'defaultValue',
                        'customDefaultValue',
                        'calculateValue',
                        'conditional',
                        'customConditional'
                    ]));
                    const parentComponent = defaultValueComponent.parent;
                    let tabIndex = -1;
                    let index = -1;
                    parentComponent.tabs.some((tab, tIndex) => {
                        tab.some((comp, compIndex) => {
                            if (comp.id === defaultValueComponent.id) {
                                tabIndex = tIndex;
                                index = compIndex;
                                return true;
                            }
                            return false;
                        });
                    });
                    if (tabIndex !== -1 && index !== -1) {
                        const sibling = parentComponent.tabs[tabIndex][index + 1];
                        parentComponent.removeComponent(defaultValueComponent);
                        const newComp = parentComponent.addComponent(defaultValueComponent.component, defaultValueComponent.data, sibling);
                        _.pull(newComp.validators, 'required');
                        parentComponent.tabs[tabIndex].splice(index, 1, newComp);
                        newComp.checkValidity = () => true;
                        newComp.build(defaultValueComponent.element);
                    }
                }
            }
            this.emit('updateComponent', component);
        }
        highlightInvalidComponents() {
            const repeatablePaths = [];
            const keys = new Map();
            b.eachComponent(this.form.components, (comp, path) => {
                if (!comp.key) {
                    return;
                }
                if (keys.has(comp.key)) {
                    if (keys.get(comp.key).includes(path)) {
                        repeatablePaths.push(path);
                    } else {
                        keys.set(comp.key, [
                            ...keys.get(comp.key),
                            path
                        ]);
                    }
                } else {
                    keys.set(comp.key, [path]);
                }
            });
            b.eachComponent(this.webform.getComponents(), (comp, path) => {
                if (repeatablePaths.includes(path)) {
                    comp.setCustomValidity(`API Key is not unique: ${ comp.key }`);
                }
            });
        }
        saveComponent(component, parent, isNew, original) {
            this.editForm.detach();
            const parentContainer = parent ? parent.formioContainer : this.container;
            const parentComponent = parent ? parent.formioComponent : this;
            this.dialog.close();
            const path = parentContainer ? this.getComponentsPath(component, parentComponent.component) : '';
            if (!original) {
                original = parent.formioContainer.find(comp => comp.key === component.key);
            }
            const index = parentContainer ? parentContainer.indexOf(original) : 0;
            if (index !== -1) {
                let submissionData = this.editForm.submission.data;
                submissionData = submissionData.componentJson || submissionData;
                if (parentContainer) {
                    parentContainer[index] = submissionData;
                } else if (parentComponent && parentComponent.saveChildComponent) {
                    parentComponent.saveChildComponent(submissionData);
                }
                const rebuild = parentComponent.rebuild() || NativePromise.resolve();
                return rebuild.then(() => {
                    let schema = parentContainer ? parentContainer[index] : [];
                    parentComponent.getComponents().forEach(component => {
                        if (component.key === schema.key) {
                            schema = component.schema;
                        }
                    });
                    this.emit('saveComponent', schema, component, parentComponent.schema, path, index, isNew);
                    this.emit('change', this.form);
                    this.highlightInvalidComponents();
                });
            }
            this.highlightInvalidComponents();
            return NativePromise.resolve();
        }
        editComponent(component, parent, isNew, isJsonEdit, original) {
            if (!component.key) {
                return;
            }
            let saved = false;
            const componentCopy = a.fastCloneDeep(component);
            let ComponentClass = Components.components[componentCopy.type];
            const isCustom = ComponentClass === undefined;
            isJsonEdit = isJsonEdit || isCustom;
            ComponentClass = isCustom ? Components.components.unknown : ComponentClass;
            if (this.dialog) {
                this.dialog.close();
                this.highlightInvalidComponents();
            }
            const editFormOptions = _.clone(_.get(this, 'options.editForm', {}));
            if (this.editForm) {
                this.editForm.destroy();
            }
            const overrides = _.get(this.options, `editForm.${ componentCopy.type }`, {});
            editFormOptions.editForm = this.form;
            editFormOptions.editComponent = component;
            this.editForm = new Webform({
                ..._.omit(this.options, [
                    'hooks',
                    'builder',
                    'events',
                    'attachMode',
                    'skipInit'
                ]),
                language: this.options.language,
                ...editFormOptions
            });
            this.editForm.form = isJsonEdit && !isCustom ? {
                components: [{
                        type: 'textarea',
                        as: 'json',
                        editor: 'ace',
                        weight: 10,
                        input: true,
                        key: 'componentJson',
                        label: 'Component JSON',
                        tooltip: 'Edit the JSON for this component.'
                    }]
            } : ComponentClass.editForm(_.cloneDeep(overrides));
            const instance = new ComponentClass(componentCopy);
            this.editForm.submission = isJsonEdit ? { data: { componentJson: instance.component } } : { data: instance.component };
            if (this.preview) {
                this.preview.destroy();
            }
            if (!ComponentClass.builderInfo.hasOwnProperty('preview') || ComponentClass.builderInfo.preview) {
                this.preview = new Webform(_.omit({
                    ...this.options,
                    preview: true
                }, [
                    'hooks',
                    'builder',
                    'events',
                    'attachMode',
                    'calculateValue'
                ]));
            }
            this.componentEdit = this.ce('div', { 'class': 'component-edit-container' });
            this.setContent(this.componentEdit, this.renderTemplate('builderEditForm', {
                componentInfo: ComponentClass.builderInfo,
                editForm: this.editForm.render(),
                preview: this.preview ? this.preview.render() : false
            }));
            this.dialog = this.createModal(this.componentEdit, _.get(this.options, 'dialogAttr', {}));
            this.editForm.attach(this.componentEdit.querySelector('[ref="editForm"]'));
            this.updateComponent(componentCopy);
            this.editForm.on('change', event => {
                if (event.changed) {
                    if (event.changed.component && event.changed.component.key === 'key' || isJsonEdit) {
                        componentCopy.keyModified = true;
                    }
                    if (event.changed.component && [
                            'label',
                            'title'
                        ].includes(event.changed.component.key)) {
                        if (isNew) {
                            if (!event.data.keyModified) {
                                this.editForm.everyComponent(component => {
                                    if (component.key === 'key' && component.parent.component.key === 'tabs') {
                                        component.setValue(_.camelCase(event.data.title || event.data.label || event.data.placeholder || event.data.type));
                                        return false;
                                    }
                                });
                            }
                            if (this.form) {
                                BuilderUtils.uniquify(this.findNamespaceRoot(parent.formioComponent.component), event.data);
                            }
                        }
                    }
                    this.updateComponent(event.data.componentJson || event.data, event.changed);
                }
            });
            this.addEventListener(this.componentEdit.querySelector('[ref="cancelButton"]'), 'click', event => {
                event.preventDefault();
                this.editForm.detach();
                this.emit('cancelComponent', component);
                this.dialog.close();
                this.highlightInvalidComponents();
            });
            this.addEventListener(this.componentEdit.querySelector('[ref="removeButton"]'), 'click', event => {
                event.preventDefault();
                saved = true;
                this.editForm.detach();
                this.removeComponent(component, parent, original);
                this.dialog.close();
                this.highlightInvalidComponents();
            });
            this.addEventListener(this.componentEdit.querySelector('[ref="saveButton"]'), 'click', event => {
                event.preventDefault();
                if (!this.editForm.checkValidity(this.editForm.data, true, this.editForm.data)) {
                    this.editForm.setPristine(false);
                    this.editForm.showErrors();
                    return false;
                }
                saved = true;
                this.saveComponent(component, parent, isNew, original);
            });
            const dialogClose = () => {
                this.editForm.destroy();
                if (this.preview) {
                    this.preview.destroy();
                    this.preview = null;
                }
                if (isNew && !saved) {
                    this.removeComponent(component, parent, original);
                    this.highlightInvalidComponents();
                }
                this.removeEventListener(this.dialog, 'close', dialogClose);
                this.dialog = null;
            };
            this.addEventListener(this.dialog, 'close', dialogClose);
            this.emit('editComponent', component);
        }
        copyComponent(component) {
            if (!window.sessionStorage) {
                return console.warn('Session storage is not supported in this browser.');
            }
            this.addClass(this.refs.form, 'builder-paste-mode');
            window.sessionStorage.setItem('formio.clipboard', JSON.stringify(component.schema));
        }
        pasteComponent(component) {
            if (!window.sessionStorage) {
                return console.warn('Session storage is not supported in this browser.');
            }
            this.removeClass(this.refs.form, 'builder-paste-mode');
            if (window.sessionStorage) {
                const data = window.sessionStorage.getItem('formio.clipboard');
                if (data) {
                    const schema = JSON.parse(data);
                    const parent = this.getParentElement(component.element);
                    BuilderUtils.uniquify(this.findNamespaceRoot(parent.formioComponent.component), schema);
                    let path = '';
                    let index = 0;
                    if (parent.formioContainer) {
                        index = parent.formioContainer.indexOf(component.component);
                        path = this.getComponentsPath(schema, parent.formioComponent.component);
                        parent.formioContainer.splice(index + 1, 0, schema);
                    } else if (parent.formioComponent && parent.formioComponent.saveChildComponent) {
                        parent.formioComponent.saveChildComponent(schema, false);
                    }
                    parent.formioComponent.rebuild();
                    this.emit('saveComponent', schema, schema, parent.formioComponent.components, path, index + 1, true);
                    this.emit('change', this.form);
                }
            }
        }
        getParentElement(element) {
            let container = element;
            do {
                container = container.parentNode;
            } while (container && !container.formioComponent);
            return container;
        }
        addBuilderComponentInfo(component) {
            if (!component || !component.group || !this.groups[component.group]) {
                return;
            }
            component = _.clone(component);
            const groupInfo = this.groups[component.group];
            if (!groupInfo.components.hasOwnProperty(component.key)) {
                groupInfo.components[component.key] = component;
            }
            return component;
        }
        destroy() {
            if (this.webform.initialized) {
                this.webform.destroy();
            }
            super.destroy();
        }
        addBuilderGroup(name, group) {
            if (!this.groups[name]) {
                this.groups[name] = group;
                this.groupOrder.push(name);
                this.triggerRedraw();
            } else {
                this.updateBuilderGroup(name, group);
            }
        }
        updateBuilderGroup(name, group) {
            if (this.groups[name]) {
                this.groups[name] = group;
                this.triggerRedraw();
            }
        }
    };
});