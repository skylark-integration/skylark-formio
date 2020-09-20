define([
    'skylark-lodash',
    './vendors/getify/npo',
    './vendors/fetch-ponyfill/fetch',
    './Formio',
    './WebformBuilder',
    './utils/utils',
    './utils/builder',
    './PDF'
], function (_, NativePromise, fetchPonyfill, Formio, WebformBuilder, a, BuilderUtils, PDF) {
    'use strict';
    const {fetch, Headers} = fetchPonyfill({ Promise: NativePromise });
    return class PDFBuilder extends WebformBuilder {
        constructor() {
            let element, options;
            if (arguments[0] instanceof HTMLElement || arguments[1]) {
                element = arguments[0];
                options = arguments[1];
            } else {
                options = arguments[0];
            }
            options.skipInit = true;
            if (element) {
                super(element, options);
            } else {
                super(options);
            }
            this.dragDropEnabled = false;
        }
        get defaultGroups() {
            return {
                pdf: {
                    title: 'PDF Fields',
                    weight: 0,
                    default: true,
                    components: {
                        textfield: true,
                        number: true,
                        password: true,
                        email: true,
                        phoneNumber: true,
                        currency: true,
                        checkbox: true,
                        signature: true,
                        select: true,
                        textarea: true,
                        datetime: true,
                        file: true
                    }
                },
                basic: false,
                advanced: false,
                layout: false,
                data: false,
                premium: false,
                resource: false
            };
        }
        get hasPDF() {
            return _.has(this.webform.form, 'settings.pdf');
        }
        get projectUrl() {
            return this.options.projectUrl || Formio.getProjectUrl();
        }
        init() {
            this.options.attachMode = 'builder';
            this.webform = this.webform || this.createForm(this.options);
            this.webform.init();
        }
        render() {
            const result = this.renderTemplate('pdfBuilder', {
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
                            groupId: `builder-sidebar-${ groupKey }`,
                            subgroups: []
                        }))
                    }))
                }),
                form: this.hasPDF ? this.webform.render() : this.renderTemplate('pdfBuilderUpload', {})
            });
            return result;
        }
        attach(element) {
            if (!this.hasPDF) {
                this.loadRefs(element, {
                    'fileDrop': 'single',
                    'fileBrowse': 'single',
                    'hiddenFileInputElement': 'single',
                    'uploadError': 'single'
                });
                this.addEventListener(this.refs['pdf-upload-button'], 'click', event => {
                    event.preventDefault();
                });
                if (!this.projectUrl) {
                    this.setUploadError('Form options.projectUrl not set. Please set the "projectUrl" property of the options for this form or use Formio.setProjectUrl(). This setting is necessary to upload a pdf background.');
                } else {
                    this.setUploadError();
                }
                if (this.refs.fileDrop) {
                    const element = this;
                    this.addEventListener(this.refs.fileDrop, 'dragover', function (event) {
                        this.className = 'fileSelector fileDragOver';
                        event.preventDefault();
                    });
                    this.addEventListener(this.refs.fileDrop, 'dragleave', function (event) {
                        this.className = 'fileSelector';
                        event.preventDefault();
                    });
                    this.addEventListener(this.refs.fileDrop, 'drop', function (event) {
                        this.className = 'fileSelector';
                        event.preventDefault();
                        element.upload(event.dataTransfer.files[0]);
                        return false;
                    });
                }
                if (this.refs.fileBrowse && this.refs.hiddenFileInputElement) {
                    this.addEventListener(this.refs.fileBrowse, 'click', event => {
                        event.preventDefault();
                        if (typeof this.refs.hiddenFileInputElement.trigger === 'function') {
                            this.refs.hiddenFileInputElement.trigger('click');
                        } else {
                            this.refs.hiddenFileInputElement.click();
                        }
                    });
                    this.addEventListener(this.refs.hiddenFileInputElement, 'change', () => {
                        this.upload(this.refs.hiddenFileInputElement.files[0]);
                        this.refs.hiddenFileInputElement.value = '';
                    });
                }
                return NativePromise.resolve();
            }
            return super.attach(element).then(() => {
                this.loadRefs(this.element, {
                    iframeDropzone: 'single',
                    'sidebar-container': 'multiple'
                });
                this.afterAttach();
                return this.element;
            });
        }
        afterAttach() {
            this.initIframeEvents();
            this.updateDropzoneDimensions();
            this.initDropzoneEvents();
            this.prepSidebarComponentsForDrag();
        }
        upload(file) {
            const headers = new Headers({
                'Accept': 'application/json, text/plain, */*',
                'x-jwt-token': Formio.getToken()
            });
            const formData = new FormData();
            formData.append('file', file);
            fetch(`${ this.projectUrl }/upload`, {
                method: 'POST',
                headers,
                body: formData
            }).then(response => {
                if (response.status !== 201) {
                    response.text().then(info => {
                        this.setUploadError(`${ response.statusText } - ${ info }`);
                    });
                } else {
                    response.json().then(data => {
                        _.set(this.webform.form, 'settings.pdf', {
                            id: data.file,
                            src: `${ data.filesServer }${ data.path }`
                        });
                        this.emit('pdfUploaded', data);
                        this.redraw();
                    });
                }
            }).catch(() => {
                this.setUploadError('Upload failed.');
            });
        }
        setUploadError(message) {
            if (!this.refs.uploadError) {
                return;
            }
            this.refs.uploadError.style.display = message ? '' : 'none';
            this.refs.uploadError.innerHTML = message;
        }
        createForm(options) {
            options.skipInit = false;
            this.webform = new PDF(this.element, options);
            this.webform.on('attach', () => {
                if (this.refs.iframeDropzone && ![...this.refs.form.children].includes(this.refs.iframeDropzone)) {
                    this.prependTo(this.refs.iframeDropzone, this.refs.form);
                }
            });
            return this.webform;
        }
        setForm(form) {
            return super.setForm(form).then(() => {
                return this.ready.then(() => {
                    if (this.webform) {
                        this.webform.postMessage({
                            name: 'form',
                            data: form
                        });
                        return this.webform.setForm(form);
                    }
                    return form;
                });
            });
        }
        saveComponent(...args) {
            return super.saveComponent(...args).then(() => this.afterAttach());
        }
        destroy() {
            super.destroy();
            this.webform.destroy();
        }
        initIframeEvents() {
            if (!this.webform.iframeElement) {
                return;
            }
            this.webform.off('iframe-elementUpdate');
            this.webform.off('iframe-componentUpdate');
            this.webform.off('iframe-componentClick');
            this.webform.on('iframe-elementUpdate', schema => {
                const component = this.webform.getComponentById(schema.id);
                if (component && component.component) {
                    component.component.overlay = {
                        page: schema.page,
                        left: schema.left,
                        top: schema.top,
                        height: schema.height,
                        width: schema.width
                    };
                    this.editComponent(component.component, this.webform.iframeElement);
                    this.emit('updateComponent', component);
                }
                return component;
            });
            this.webform.on('iframe-componentUpdate', schema => {
                const component = this.webform.getComponentById(schema.id);
                if (component && component.component) {
                    component.component.overlay = {
                        page: schema.overlay.page,
                        left: schema.overlay.left,
                        top: schema.overlay.top,
                        height: schema.overlay.height,
                        width: schema.overlay.width
                    };
                    this.emit('updateComponent', component);
                    const localComponent = _.find(this.form.components, { id: schema.id });
                    if (localComponent) {
                        localComponent.overlay = _.clone(component.component.overlay);
                    }
                    this.emit('change', this.form);
                }
                return component;
            });
            this.webform.on('iframe-componentClick', schema => {
                const component = this.webform.getComponentById(schema.id);
                if (component) {
                    this.editComponent(component.component, this.webform.iframeElement);
                }
            }, true);
        }
        initDropzoneEvents() {
            if (!this.refs.iframeDropzone) {
                return;
            }
            this.removeEventListener(this.refs.iframeDropzone, 'dragover');
            this.removeEventListener(this.refs.iframeDropzone, 'drop');
            this.addEventListener(this.refs.iframeDropzone, 'dragover', e => {
                e.preventDefault();
                return false;
            });
            this.addEventListener(this.refs.iframeDropzone, 'drop', this.onDropzoneDrop.bind(this));
        }
        prepSidebarComponentsForDrag() {
            if (!this.refs['sidebar-container']) {
                return;
            }
            this.refs['sidebar-container'].forEach(container => {
                [...container.children].forEach(el => {
                    el.draggable = true;
                    el.setAttribute('draggable', true);
                    this.removeEventListener(el, 'dragstart');
                    this.removeEventListener(el, 'dragend');
                    this.addEventListener(el, 'dragstart', this.onDragStart.bind(this), true);
                    this.addEventListener(el, 'dragend', this.onDragEnd.bind(this), true);
                });
            });
        }
        updateDropzoneDimensions() {
            if (!this.refs.iframeDropzone) {
                return;
            }
            const iframeRect = a.getElementRect(this.webform.refs.iframeContainer);
            this.refs.iframeDropzone.style.height = iframeRect && iframeRect.height ? `${ iframeRect.height }px` : '1000px';
            this.refs.iframeDropzone.style.width = iframeRect && iframeRect.width ? `${ iframeRect.width }px` : '100%';
        }
        tryUpdateCustomComponentSchema(schema, key) {
            const comp = _.get(this, `groups.custom.components[${ key }]`);
            if (!comp) {
                return false;
            }
            schema.key = comp.schema && comp.schema.key || schema.key;
            schema.label = comp.schema && comp.schema.label || schema.label;
            schema.keyForShow = schema.key;
            schema.customField = true;
            return true;
        }
        onDragStart(e) {
            e.dataTransfer.setData('text/html', null);
            this.updateDropzoneDimensions();
            this.addClass(this.refs.iframeDropzone, 'enabled');
        }
        onDropzoneDrop(e) {
            this.dropEvent = e;
            e.preventDefault();
            return false;
        }
        onDragEnd(e) {
            const offsetX = this.dropEvent ? this.dropEvent.offsetX : null;
            const offsetY = this.dropEvent ? this.dropEvent.offsetY : null;
            this.removeClass(this.refs.iframeDropzone, 'enabled');
            if (!this.dropEvent) {
                return;
            }
            const element = e.target;
            const type = element.getAttribute('data-type');
            const group = element.getAttribute('data-group');
            const key = element.getAttribute('data-key');
            const schema = a.fastCloneDeep(this.schemas[type]);
            if (!(group === 'custom' && key && this.tryUpdateCustomComponentSchema(schema, key))) {
                schema.key = _.camelCase(schema.label || schema.placeholder || schema.type);
            }
            BuilderUtils.uniquify([this.webform.component], schema);
            this.webform.component.components.push(schema);
            this.emit('addComponent', schema);
            schema.overlay = {
                top: offsetY,
                left: offsetX,
                width: 100,
                height: 20
            };
            this.webform.addComponent(schema, {}, null, true);
            this.webform.postMessage({
                name: 'addElement',
                data: schema
            });
            this.dropEvent = null;
        }
    };
});