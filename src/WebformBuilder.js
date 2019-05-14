define([
    './Webform',
    'dragula',
    'tooltip.js',
    './components/Components',
    './utils/builder',
    './utils/utils',
    './EventEmitter',
    'native-promise-only',
    'lodash'
], function (Webform, dragula, Tooltip, Components, BuilderUtils, a, EventEmitter, Promise, _) {
    'use strict';
    require('./components/builder');
    return class WebformBuilder extends Webform {
        constructor(element, options) {
            super(element, options);
            this.builderHeight = 0;
            this.dragContainers = [];
            this.sidebarContainers = [];
            this.updateDraggable = _.debounce(this.refreshDraggable.bind(this), 200);
            this.options.builder = _.defaultsDeep({}, this.options.builder, this.defaultComponents);
            _.each(this.defaultComponents, (config, key) => {
                if (config === false) {
                    this.options.builder[key] = false;
                }
            });
            this.builderReady = new Promise(resolve => {
                this.builderReadyResolve = resolve;
            });
            this.groups = {};
            this.options.sideBarScroll = _.get(this.options, 'sideBarScroll', true);
            this.options.sideBarScrollOffset = _.get(this.options, 'sideBarScrollOffset', 0);
            this.options.hooks = this.options.hooks || {};
            this.options.hooks.addComponents = (components, parent) => {
                if (!components || !components.length && !components.nodrop) {
                    return [{
                            type: 'htmlelement',
                            internal: true,
                            tag: 'div',
                            className: 'drag-and-drop-alert alert alert-info',
                            attrs: [
                                {
                                    attr: 'id',
                                    value: `${ parent.id }-placeholder`
                                },
                                {
                                    attr: 'style',
                                    value: 'text-align:center;'
                                },
                                {
                                    attr: 'role',
                                    value: 'alert'
                                }
                            ],
                            content: 'Drag and Drop a form component'
                        }];
                }
                return components;
            };
            this.options.hooks.addComponent = (container, comp, parent) => {
                if (!comp || !comp.component) {
                    return container;
                }
                if (!comp.noEdit && !comp.component.internal) {
                    comp.getElement().style.position = 'relative';
                    const removeButton = this.ce('div', { class: 'btn btn-xxs btn-danger component-settings-button component-settings-button-remove' }, this.getIcon('remove'));
                    this.addEventListener(removeButton, 'click', () => this.deleteComponent(comp));
                    new Tooltip(removeButton, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Remove')
                    });
                    const editButton = this.ce('div', { class: 'btn btn-xxs btn-default component-settings-button component-settings-button-edit' }, this.getIcon('cog'));
                    this.addEventListener(editButton, 'click', () => this.editComponent(comp));
                    new Tooltip(editButton, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Edit')
                    });
                    const copyButton = this.ce('div', { class: 'btn btn-xxs btn-default component-settings-button component-settings-button-copy' }, this.getIcon('copy'));
                    this.addEventListener(copyButton, 'click', () => this.copyComponent(comp));
                    new Tooltip(copyButton, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Copy')
                    });
                    const pasteButton = this.ce('div', { class: 'btn btn-xxs btn-default component-settings-button component-settings-button-paste' }, this.getIcon('save'));
                    const pasteTooltip = new Tooltip(pasteButton, {
                        trigger: 'hover',
                        placement: 'top',
                        title: this.t('Paste below')
                    });
                    this.addEventListener(pasteButton, 'click', () => {
                        pasteTooltip.hide();
                        this.pasteComponent(comp);
                    });
                    if (window.sessionStorage) {
                        const data = window.sessionStorage.getItem('formio.clipboard');
                        if (data) {
                            this.addClass(this.element, 'builder-paste-mode');
                        }
                    }
                    comp.prepend(this.ce('div', { class: 'component-btn-group' }, [
                        removeButton,
                        copyButton,
                        pasteButton,
                        editButton
                    ]));
                }
                if (!container.noDrop) {
                    this.addDragContainer(container, parent);
                }
                return container;
            };
            this.setBuilderElement();
        }
        get defaultComponents() {
            return {
                basic: {
                    title: 'Basic Components',
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
                }
            };
        }
        scrollSidebar() {
            const newTop = window.scrollY - this.sideBarTop + this.options.sideBarScrollOffset;
            const shouldScroll = newTop > 0;
            if (shouldScroll && newTop + this.sideBarElement.offsetHeight < this.builderHeight) {
                this.sideBarElement.style.marginTop = `${ newTop }px`;
            } else if (shouldScroll && this.sideBarElement.offsetHeight < this.builderHeight) {
                this.sideBarElement.style.marginTop = `${ this.builderHeight - this.sideBarElement.offsetHeight }px`;
            } else {
                this.sideBarElement.style.marginTop = '0px';
            }
        }
        setBuilderElement() {
            return this.onElement.then(() => {
                this.addClass(this.wrapper, 'row formbuilder');
                this.builderSidebar = this.ce('div', { class: 'col-xs-4 col-sm-3 col-md-2 formcomponents' });
                this.prependTo(this.builderSidebar, this.wrapper);
                this.addClass(this.element, 'col-xs-8 col-sm-9 col-md-10 formarea');
                this.element.component = this;
            });
        }
        get ready() {
            return this.builderReady;
        }
        setForm(form) {
            var isRecaptchaEnabled = false;
            if (form.components) {
                a.eachComponent(form.components, component => {
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
            this.emit('change', form);
            return super.setForm(form).then(retVal => {
                setTimeout(() => this.builderHeight = this.element.offsetHeight, 200);
                return retVal;
            });
        }
        deleteComponent(component) {
            if (!component.parent) {
                return;
            }
            let remove = true;
            if (component.type === 'components' && component.getComponents().length > 0) {
                const message = 'Removing this component will also remove all of its children. Are you sure you want to do this?';
                remove = window.confirm(this.t(message));
            }
            if (remove) {
                component.parent.removeComponentById(component.id);
                this.form = this.schema;
                this.emit('deleteComponent', component);
            }
            return remove;
        }
        updateComponent(component) {
            if (this.componentPreview) {
                if (this.preview) {
                    this.preview.destroy();
                }
                this.preview = Components.create(component.component, {
                    preview: true,
                    events: new EventEmitter({
                        wildcard: false,
                        maxListeners: 0
                    })
                }, {}, true);
                this.preview.on('componentEdit', comp => {
                    _.merge(component.component, comp.component);
                    this.editForm.redraw();
                });
                this.preview.build();
                this.preview.isBuilt = true;
                this.componentPreview.innerHTML = '';
                this.componentPreview.appendChild(this.preview.getElement());
            }
            if (component.isNew) {
                if (!component.keyModified) {
                    component.component.key = _.camelCase(component.component.label || component.component.placeholder || component.component.type);
                }
                BuilderUtils.uniquify(this._form, component.component);
            }
            if (this.defaultValueComponent) {
                _.assign(this.defaultValueComponent, _.omit(component.component, [
                    'key',
                    'label',
                    'placeholder',
                    'tooltip',
                    'validate',
                    'disabled'
                ]));
            }
            this.emit('updateComponent', component);
        }
        editComponent(component) {
            const componentCopy = _.cloneDeep(component);
            let componentClass = Components.components[componentCopy.component.type];
            const isCustom = componentClass === undefined;
            componentClass = isCustom ? Components.components.unknown : componentClass;
            if (this.dialog) {
                this.dialog.close();
            }
            this.dialog = this.createModal(componentCopy.name);
            const formioForm = this.ce('div');
            this.componentPreview = this.ce('div', { class: 'component-preview' });
            const componentInfo = componentClass ? componentClass.builderInfo : {};
            const saveButton = this.ce('button', {
                class: 'btn btn-success',
                style: 'margin-right: 10px;'
            }, this.t('Save'));
            const cancelButton = this.ce('button', {
                class: 'btn btn-default',
                style: 'margin-right: 10px;'
            }, this.t('Cancel'));
            const removeButton = this.ce('button', { class: 'btn btn-danger' }, this.t('Remove'));
            const componentEdit = this.ce('div', {}, [
                this.ce('div', { class: 'row' }, [
                    this.ce('div', { class: 'col col-sm-6' }, this.ce('p', { class: 'lead' }, `${ componentInfo.title } Component`)),
                    this.ce('div', { class: 'col col-sm-6' }, [this.ce('div', {
                            class: 'pull-right',
                            style: 'margin-right: 20px; margin-top: 10px'
                        }, this.ce('a', {
                            href: componentInfo.documentation || '#',
                            target: '_blank'
                        }, this.ce('i', { class: this.iconClass('new-window') }, ` ${ this.t('Help') }`)))])
                ]),
                this.ce('div', { class: 'row' }, [
                    this.ce('div', { class: 'col col-sm-6' }, formioForm),
                    this.ce('div', { class: 'col col-sm-6' }, [
                        this.ce('div', { class: 'card panel panel-default preview-panel' }, [
                            this.ce('div', { class: 'card-header panel-heading' }, this.ce('h4', { class: 'card-title panel-title mb-0' }, this.t('Preview'))),
                            this.ce('div', { class: 'card-body panel-body' }, this.componentPreview)
                        ]),
                        this.ce('div', { style: 'margin-top: 10px;' }, [
                            saveButton,
                            cancelButton,
                            removeButton
                        ])
                    ])
                ])
            ]);
            this.dialog.body.appendChild(componentEdit);
            const overrides = _.get(this.options, `editForm.${ componentCopy.component.type }`, {});
            const editForm = componentClass.editForm(_.cloneDeep(overrides));
            this.defaultValueComponent = a.getComponent(editForm.components, 'defaultValue');
            _.assign(this.defaultValueComponent, _.omit(componentCopy.component, [
                'key',
                'label',
                'placeholder',
                'tooltip',
                'validate',
                'disabled'
            ]));
            const editFormOptions = _.get(this, 'options.editForm', {});
            this.editForm = new Webform(formioForm, {
                language: this.options.language,
                ...editFormOptions
            });
            this.editForm.form = editForm;
            this.editForm.editForm = this._form;
            this.editForm.editComponent = component;
            this.updateComponent(componentCopy);
            this.editForm.on('change', event => {
                if (event.changed) {
                    if (event.changed.component && event.changed.component.key === 'key' || isCustom) {
                        componentCopy.keyModified = true;
                    }
                    var editFormData = this.editForm.getValue().data;
                    if (editFormData.type === 'custom' && editFormData.componentJson) {
                        componentCopy.component = editFormData.componentJson;
                    } else {
                        componentCopy.component = editFormData;
                    }
                    this.updateComponent(componentCopy);
                }
            });
            this.editForm.formReady.then(() => {
                if (isCustom) {
                    this.editForm.setValue({ data: { componentJson: _.cloneDeep(componentCopy.component) } });
                } else {
                    this.editForm.setValue({ data: componentCopy.component });
                }
            });
            this.addEventListener(cancelButton, 'click', event => {
                event.preventDefault();
                this.emit('cancelComponent', component);
                this.dialog.close();
            });
            this.addEventListener(removeButton, 'click', event => {
                event.preventDefault();
                this.deleteComponent(component);
                this.dialog.close();
            });
            this.addEventListener(saveButton, 'click', event => {
                if (!this.editForm.checkValidity(this.editForm.data, true)) {
                    return;
                }
                event.preventDefault();
                const originalComponent = component.component;
                component.isNew = false;
                if (isCustom) {
                    component.component = this.editForm.data.componentJson;
                } else {
                    component.component = componentCopy.component;
                }
                if (component.dragEvents && component.dragEvents.onSave) {
                    component.dragEvents.onSave(component);
                }
                this.form = this.schema;
                this.emit('saveComponent', component, originalComponent);
                this.dialog.close();
            });
            this.addEventListener(this.dialog, 'close', () => {
                this.editForm.destroy();
                this.preview.destroy();
                if (component.isNew) {
                    this.deleteComponent(component);
                }
            });
            this.emit('editComponent', component);
        }
        copyComponent(component) {
            if (!window.sessionStorage) {
                return console.log('Session storage is not supported in this browser.');
            }
            this.addClass(this.element, 'builder-paste-mode');
            const copy = _.cloneDeep(component.schema);
            window.sessionStorage.setItem('formio.clipboard', JSON.stringify(copy));
        }
        pasteComponent(component) {
            if (!window.sessionStorage) {
                return console.log('Session storage is not supported in this browser.');
            }
            this.removeClass(this.element, 'builder-paste-mode');
            const data = window.sessionStorage.getItem('formio.clipboard');
            if (data) {
                const schema = JSON.parse(data);
                window.sessionStorage.removeItem('formio.clipboard');
                BuilderUtils.uniquify(this._form, schema);
                component.parent.addComponent(schema, false, false, component.element.nextSibling);
                this.form = this.schema;
            }
        }
        destroy() {
            const state = super.destroy();
            if (this.dragula) {
                this.dragula.destroy();
            }
            return state;
        }
        insertInOrder(info, items, element, container) {
            let beforeWeight = 0;
            let before = null;
            _.each(items, itemInfo => {
                if (info.key !== itemInfo.key && info.weight < itemInfo.weight && (!beforeWeight || itemInfo.weight < beforeWeight)) {
                    before = itemInfo.element;
                    beforeWeight = itemInfo.weight;
                }
            });
            if (before) {
                try {
                    container.insertBefore(element, before);
                } catch (err) {
                    container.appendChild(element);
                }
            } else {
                container.appendChild(element);
            }
        }
        addBuilderGroup(info, container) {
            if (!info || !info.key) {
                console.warn('Invalid Group Provided.');
                return;
            }
            info = _.clone(info);
            const groupAnchor = this.ce('button', {
                class: 'btn btn-block builder-group-button',
                'type': 'button',
                'data-toggle': 'collapse',
                'data-parent': `#${ container.id }`,
                'data-target': `#group-${ info.key }`
            }, this.text(info.title));
            if (!a.bootstrapVersion(this.options)) {
                this.addEventListener(groupAnchor, 'click', event => {
                    event.preventDefault();
                    const clickedGroupId = event.target.getAttribute('data-target').replace('#group-', '');
                    if (this.groups[clickedGroupId]) {
                        const clickedGroup = this.groups[clickedGroupId];
                        const wasIn = this.hasClass(clickedGroup.panel, 'in');
                        _.each(this.groups, (group, groupId) => {
                            this.removeClass(group.panel, 'in');
                            this.removeClass(group.panel, 'show');
                            if (groupId === clickedGroupId && !wasIn) {
                                this.addClass(group.panel, 'in');
                                this.addClass(group.panel, 'show');
                                let parent = group.parent;
                                while (parent) {
                                    this.addClass(parent.panel, 'in');
                                    this.addClass(parent.panel, 'show');
                                    parent = parent.parent;
                                }
                            }
                        });
                        this.element.style.minHeight = `${ this.builderSidebar.offsetHeight }px`;
                        this.scrollSidebar();
                    }
                }, true);
            }
            info.element = this.ce('div', {
                class: 'card panel panel-default form-builder-panel',
                id: `group-panel-${ info.key }`
            }, [this.ce('div', { class: 'card-header panel-heading form-builder-group-header' }, [this.ce('h5', { class: 'mb-0 panel-title' }, groupAnchor)])]);
            info.body = this.ce('div', {
                id: `group-container-${ info.key }`,
                class: 'card-body panel-body no-drop'
            });
            this.sidebarContainers.push(info.body);
            let groupBodyClass = 'panel-collapse collapse';
            if (info.default) {
                switch (a.bootstrapVersion(this.options)) {
                case 4:
                    groupBodyClass += ' show';
                    break;
                case 3:
                    groupBodyClass += ' in';
                    break;
                default:
                    groupBodyClass += ' in show';
                    break;
                }
            }
            info.panel = this.ce('div', {
                class: groupBodyClass,
                'data-parent': `#${ container.id }`,
                id: `group-${ info.key }`
            }, info.body);
            info.element.appendChild(info.panel);
            this.groups[info.key] = info;
            this.insertInOrder(info, this.groups, info.element, container);
            if (info.groups) {
                _.each(info.groups, (subInfo, subGroup) => {
                    subInfo.key = subGroup;
                    subInfo.parent = info;
                    this.addBuilderGroup(subInfo, info.body);
                });
            }
        }
        addBuilderComponentInfo(component) {
            if (!component || !component.group || !this.groups[component.group]) {
                return;
            }
            component = _.clone(component);
            const groupInfo = this.groups[component.group];
            if (!groupInfo.components) {
                groupInfo.components = {};
            }
            if (!groupInfo.components.hasOwnProperty(component.key)) {
                groupInfo.components[component.key] = component;
            }
            return component;
        }
        addBuilderComponent(component, group) {
            if (!component) {
                return;
            }
            if (!group && component.group && this.groups[component.group]) {
                group = this.groups[component.group];
            }
            if (!group) {
                return;
            }
            component.element = this.ce('span', {
                id: `builder-${ component.key }`,
                class: 'btn btn-primary btn-xs btn-block formcomponent drag-copy'
            });
            if (component.icon) {
                component.element.appendChild(this.ce('i', {
                    class: component.icon,
                    style: 'margin-right: 5px;'
                }));
            }
            component.element.builderInfo = component;
            component.element.appendChild(this.text(component.title));
            this.insertInOrder(component, group.components, component.element, group.body);
            return component;
        }
        addBuilderButton(info, container) {
            let button;
            info.element = this.ce('div', { style: 'margin: 5px 0;' }, button = this.ce('span', { class: `btn btn-block ${ info.style || 'btn-default' }` }, info.title));
            this.addEventListener(button, 'click', () => this.emit(info.event), true);
            this.groups[info.key] = info;
            this.insertInOrder(info, this.groups, info.element, container);
        }
        buildSidebar() {
            if (this.sideBarElement) {
                return;
            }
            this.groups = {};
            this.sidebarContainers = [];
            this.sideBarElement = this.ce('div', {
                id: `builder-sidebar-${ this.id }`,
                class: 'accordion panel-group'
            });
            _.each(this.options.builder, (info, group) => {
                if (info) {
                    info.key = group;
                    if (info.type === 'button') {
                        this.addBuilderButton(info, this.sideBarElement);
                    } else {
                        this.addBuilderGroup(info, this.sideBarElement);
                    }
                }
            });
            const components = {};
            const allComponents = _.filter(_.map(Components.components, (component, type) => {
                if (!component.builderInfo) {
                    return null;
                }
                component.type = type;
                return component;
            }));
            _.map(_.sortBy(allComponents, component => {
                return component.builderInfo.weight;
            }), component => {
                const builderInfo = component.builderInfo;
                builderInfo.key = component.type;
                components[builderInfo.key] = builderInfo;
                this.addBuilderComponentInfo(builderInfo);
            });
            _.each(this.groups, info => _.each(info.components, (comp, key) => {
                if (comp) {
                    this.addBuilderComponent(comp === true ? components[key] : comp, info);
                }
            }));
            this.builderSidebar.appendChild(this.sideBarElement);
            this.updateDraggable();
            this.sideBarTop = this.sideBarElement.getBoundingClientRect().top + window.scrollY;
            if (this.options.sideBarScroll) {
                this.addEventListener(window, 'scroll', _.throttle(this.scrollSidebar.bind(this), 10), true);
            }
        }
        getParentElement(element) {
            let containerComponent = element;
            do {
                containerComponent = containerComponent.parentNode;
            } while (containerComponent && !containerComponent.component);
            return containerComponent;
        }
        addDragContainer(element, component, dragEvents) {
            _.remove(this.dragContainers, container => element.id && element.id === container.id);
            element.component = component;
            if (dragEvents) {
                element.dragEvents = dragEvents;
            }
            this.addClass(element, 'drag-container');
            if (!element.id) {
                element.id = `builder-element-${ component.id }`;
            }
            this.dragContainers.push(element);
            this.updateDraggable();
        }
        clear() {
            this.dragContainers = [];
            return super.clear();
        }
        addComponentTo(parent, schema, element, sibling) {
            return parent.addComponent(schema, element, parent.data, sibling);
        }
        onDrop(element, target, source, sibling) {
            if (!element || !element.id) {
                console.warn('No element.id defined for dropping');
                return;
            }
            const builderElement = source.querySelector(`#${ element.id }`);
            const newParent = this.getParentElement(element);
            if (!newParent || !newParent.component) {
                return console.warn('Could not find parent component.');
            }
            let placeholder = document.getElementById(`${ newParent.component.id }-placeholder`);
            if (placeholder) {
                placeholder = placeholder.parentNode;
                placeholder.parentNode.removeChild(placeholder);
            }
            if (sibling === placeholder) {
                sibling = null;
            }
            if (!sibling && this.submitButton && newParent.contains(this.submitButton.element)) {
                sibling = this.submitButton.element;
            }
            if (builderElement && builderElement.builderInfo && builderElement.builderInfo.schema) {
                const componentSchema = _.clone(builderElement.builderInfo.schema);
                if (target.dragEvents && target.dragEvents.onDrop) {
                    target.dragEvents.onDrop(element, target, source, sibling, componentSchema);
                }
                const component = this.addComponentTo(newParent.component, componentSchema, newParent, sibling);
                component.isNew = true;
                if (target.dragEvents) {
                    component.dragEvents = target.dragEvents;
                }
                let path = 'components';
                switch (component.parent.type) {
                case 'table':
                    path = `rows[${ component.tableRow }][${ component.tableColumn }].components`;
                    break;
                case 'columns':
                    path = `columns[${ component.column }].components`;
                    break;
                case 'tabs':
                    path = `components[${ component.tab }].components`;
                    break;
                }
                const index = _.findIndex(_.get(component.parent.schema, path), { key: component.component.key }) || 0;
                this.emit('addComponent', component, path, index);
                this.editComponent(component);
                target.removeChild(element);
            } else if (element.component) {
                const componentSchema = element.component.schema;
                if (target.dragEvents && target.dragEvents.onDrop) {
                    target.dragEvents.onDrop(element, target, source, sibling, componentSchema);
                }
                if (element.component.parent) {
                    element.component.parent.removeComponent(element.component);
                }
                const component = newParent.component.addComponent(componentSchema, newParent, newParent.component.data, sibling);
                if (target.dragEvents && target.dragEvents.onSave) {
                    target.dragEvents.onSave(component);
                }
                this.form = this.schema;
            }
        }
        addSubmitButton() {
            if (!this.getComponents().length) {
                this.submitButton = this.addComponent({
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
        }
        refreshDraggable() {
            if (this.dragula) {
                this.dragula.destroy();
            }
            this.dragula = dragula(this.sidebarContainers.concat(this.dragContainers), {
                moves(el) {
                    return !el.classList.contains('no-drag');
                },
                copy(el) {
                    return el.classList.contains('drag-copy');
                },
                accepts(el, target) {
                    return !target.classList.contains('no-drop');
                }
            }).on('drop', (element, target, source, sibling) => this.onDrop(element, target, source, sibling));
            this.addSubmitButton();
            this.builderReadyResolve();
        }
        build(state) {
            this.buildSidebar();
            super.build(state);
            this.updateDraggable();
            this.formReadyResolve();
        }
    };
});