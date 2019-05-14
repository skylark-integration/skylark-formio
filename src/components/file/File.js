define([
    '../base/Base',
    '../../utils/utils',
    'downloadjs',
    'lodash',
    '../../Formio'
], function (BaseComponent, a, download, _, Formio) {
    'use strict';
    if (!HTMLCanvasElement.prototype.toBlob) {
        Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
            value: function (callback, type, quality) {
                var canvas = this;
                setTimeout(function () {
                    var binStr = atob(canvas.toDataURL(type, quality).split(',')[1]), len = binStr.length, arr = new Uint8Array(len);
                    for (var i = 0; i < len; i++) {
                        arr[i] = binStr.charCodeAt(i);
                    }
                    callback(new Blob([arr], { type: type || 'image/png' }));
                });
            }
        });
    }
    return class FileComponent extends BaseComponent {
        static schema(...extend) {
            return BaseComponent.schema({
                type: 'file',
                label: 'Upload',
                key: 'file',
                image: false,
                privateDownload: false,
                imageSize: '200',
                filePattern: '*',
                fileMinSize: '0KB',
                fileMaxSize: '1GB',
                uploadOnly: false
            }, ...extend);
        }
        static get builderInfo() {
            return {
                title: 'File',
                group: 'advanced',
                icon: 'fa fa-file',
                documentation: 'http://help.form.io/userguide/#file',
                weight: 100,
                schema: FileComponent.schema()
            };
        }
        constructor(component, options, data) {
            super(component, options, data);
            this.filesReady = new Promise((resolve, reject) => {
                this.filesReadyResolve = resolve;
                this.filesReadyReject = reject;
            });
            this.loadingImages = [];
            this.support = {
                filereader: typeof FileReader != 'undefined',
                dnd: 'draggable' in document.createElement('span'),
                formdata: !!window.FormData,
                progress: 'upload' in new XMLHttpRequest()
            };
        }
        get dataReady() {
            return this.filesReady;
        }
        get defaultSchema() {
            return FileComponent.schema();
        }
        get emptyValue() {
            return [];
        }
        getValue() {
            return this.dataValue;
        }
        loadImage(fileInfo) {
            return this.fileService.downloadFile(fileInfo).then(result => {
                return result.url;
            });
        }
        setValue(value) {
            const newValue = value || [];
            this.dataValue = newValue;
            if (this.component.image) {
                this.loadingImages = [];
                const images = Array.isArray(newValue) ? newValue : [newValue];
                images.map(fileInfo => {
                    if (fileInfo && Object.keys(fileInfo).length) {
                        this.loadingImages.push(this.loadImage(fileInfo));
                    }
                });
                if (this.loadingImages.length) {
                    Promise.all(this.loadingImages).then(() => {
                        this.refreshDOM();
                        setTimeout(() => this.filesReadyResolve(), 100);
                    }).catch(() => this.filesReadyReject());
                }
            } else {
                this.refreshDOM();
                this.filesReadyResolve();
            }
        }
        get defaultValue() {
            const value = super.defaultValue;
            if (_.isEqual(value, []) && this.options.flatten) {
                return [{
                        storage: '',
                        name: '',
                        size: 0,
                        type: '',
                        originalName: ''
                    }];
            }
            return Array.isArray(value) ? value : [];
        }
        get hasTypes() {
            return this.component.fileTypes && Array.isArray(this.component.fileTypes) && this.component.fileTypes.length !== 0 && (this.component.fileTypes[0].label !== '' || this.component.fileTypes[0].value !== '');
        }
        validateMultiple() {
            return false;
        }
        build() {
            this.restoreValue();
            const labelAtTheBottom = this.component.labelPosition === 'bottom';
            this.createElement();
            if (!labelAtTheBottom) {
                this.createLabel(this.element);
            }
            this.inputsContainer = this.ce('div');
            this.errorContainer = this.inputsContainer;
            this.createErrorElement();
            this.listContainer = this.buildList();
            this.inputsContainer.appendChild(this.listContainer);
            this.uploadContainer = this.buildUpload();
            this.hiddenFileInputElement = this.buildHiddenFileInput();
            this.hook('input', this.hiddenFileInputElement, this.inputsContainer);
            this.inputsContainer.appendChild(this.hiddenFileInputElement);
            this.inputsContainer.appendChild(this.uploadContainer);
            this.addWarnings(this.inputsContainer);
            this.buildUploadStatusList(this.inputsContainer);
            this.setInputStyles(this.inputsContainer);
            this.element.appendChild(this.inputsContainer);
            if (labelAtTheBottom) {
                this.createLabel(this.element);
            }
            this.createDescription(this.element);
            this.autofocus();
            if (this.shouldDisable) {
                this.disabled = true;
            }
            this.attachLogic();
        }
        refreshDOM() {
            if (this.listContainer && this.uploadContainer) {
                const newList = this.buildList();
                this.inputsContainer.replaceChild(newList, this.listContainer);
                this.listContainer = newList;
                const newUpload = this.buildUpload();
                this.inputsContainer.replaceChild(newUpload, this.uploadContainer);
                this.uploadContainer = newUpload;
            }
        }
        buildList() {
            if (this.component.image) {
                return this.buildImageList();
            } else {
                return this.buildFileList();
            }
        }
        buildFileList() {
            const value = this.dataValue;
            return this.ce('ul', { class: 'list-group list-group-striped' }, [
                this.ce('li', { class: 'list-group-item list-group-header hidden-xs hidden-sm' }, this.ce('div', { class: 'row' }, [
                    this.ce('div', { class: 'col-md-1' }),
                    this.ce('div', { class: `col-md-${ this.hasTypes ? '7' : '9' }` }, this.ce('strong', {}, this.text('File Name'))),
                    this.ce('div', { class: 'col-md-2' }, this.ce('strong', {}, this.text('Size'))),
                    this.hasTypes ? this.ce('div', { class: 'col-md-2' }, this.ce('strong', {}, this.text('Type'))) : null
                ])),
                Array.isArray(value) ? value.map((fileInfo, index) => this.createFileListItem(fileInfo, index)) : null
            ]);
        }
        buildHiddenFileInput() {
            return this.ce('input', {
                type: 'file',
                style: 'opacity: 0; position: absolute;',
                tabindex: -1,
                onChange: () => {
                    this.upload(this.hiddenFileInputElement.files);
                    this.hiddenFileInputElement.value = '';
                }
            });
        }
        createFileListItem(fileInfo, index) {
            const fileService = this.fileService;
            return this.ce('li', { class: 'list-group-item' }, this.ce('div', { class: 'row' }, [
                this.ce('div', { class: 'col-md-1' }, !this.disabled && !this.shouldDisable ? this.ce('i', {
                    class: this.iconClass('remove'),
                    onClick: event => {
                        if (fileInfo && this.component.storage === 'url') {
                            fileService.makeRequest('', fileInfo.url, 'delete');
                        }
                        event.preventDefault();
                        this.splice(index);
                        this.refreshDOM();
                    }
                }) : null),
                this.ce('div', { class: `col-md-${ this.hasTypes ? '7' : '9' }` }, this.createFileLink(fileInfo)),
                this.ce('div', { class: 'col-md-2' }, this.fileSize(fileInfo.size)),
                this.hasTypes ? this.ce('div', { class: 'col-md-2' }, this.createTypeSelect(fileInfo)) : null
            ]));
        }
        createFileLink(file) {
            if (this.options.uploadOnly) {
                return file.originalName || file.name;
            }
            return this.ce('a', {
                href: file.url,
                target: '_blank',
                onClick: this.getFile.bind(this, file)
            }, file.originalName || file.name);
        }
        createTypeSelect(file) {
            return this.ce('select', {
                class: 'file-type',
                onChange: event => {
                    file.fileType = event.target.value;
                    this.triggerChange();
                }
            }, this.component.fileTypes.map(type => this.ce('option', {
                value: type.value,
                class: 'test',
                selected: type.value === file.fileType ? 'selected' : undefined
            }, type.label)));
        }
        buildImageList() {
            const value = this.dataValue;
            return this.ce('div', {}, Array.isArray(value) ? value.map((fileInfo, index) => this.createImageListItem(fileInfo, index)) : null);
        }
        get fileService() {
            if (this.options.fileService) {
                return this.options.fileService;
            }
            if (this.options.formio) {
                return this.options.formio;
            }
            if (this.root && this.root.formio) {
                return this.root.formio;
            }
            const formio = new Formio();
            if (this.root && this.root._form && this.root._form._id) {
                formio.formUrl = `${ formio.projectUrl }/form/${ this.root._form._id }`;
            }
            return formio;
        }
        createImageListItem(fileInfo, index) {
            const image = this.ce('img', {
                alt: fileInfo.originalName || fileInfo.name,
                style: `width:${ this.component.imageSize }px`
            });
            if (this.loadingImages[index]) {
                this.loadingImages[index].then(url => {
                    image.src = url;
                });
            }
            return this.ce('div', {}, this.ce('span', {}, [
                image,
                !this.disabled ? this.ce('i', {
                    class: this.iconClass('remove'),
                    onClick: event => {
                        if (fileInfo && this.component.storage === 'url') {
                            this.fileService.makeRequest('', fileInfo.url, 'delete');
                        }
                        event.preventDefault();
                        this.splice(index);
                        this.refreshDOM();
                    }
                }) : null
            ]));
        }
        startVideo() {
            navigator.getMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
            navigator.getMedia({
                video: {
                    width: {
                        min: 640,
                        ideal: 1920
                    },
                    height: {
                        min: 400,
                        ideal: 1080
                    },
                    aspectRatio: { ideal: 1.7777777778 }
                },
                audio: false
            }, stream => {
                if (navigator.mozGetUserMedia) {
                    this.video.mozSrcObject = stream;
                } else {
                    this.video.srcObject = stream;
                }
                const width = parseInt(this.component.webcamSize) || 320;
                this.video.setAttribute('width', width);
                this.video.play();
            }, err => {
                console.log(err);
            });
        }
        takePicture() {
            this.canvas.setAttribute('width', this.video.videoWidth);
            this.canvas.setAttribute('height', this.video.videoHeight);
            this.canvas.getContext('2d').drawImage(this.video, 0, 0);
            this.canvas.toBlob(blob => {
                blob.name = `photo-${ Date.now() }.png`;
                this.upload([blob]);
            });
        }
        buildUpload() {
            const element = this;
            let Camera;
            if (this.component.image && (navigator.camera || Camera)) {
                const camera = navigator.camera || Camera;
                return this.ce('div', {}, !this.disabled && (this.component.multiple || this.dataValue.length === 0) ? this.ce('div', { class: 'fileSelector' }, [
                    this.ce('button', {
                        class: 'btn btn-primary',
                        onClick: event => {
                            event.preventDefault();
                            camera.getPicture(success => {
                                window.resolveLocalFileSystemURL(success, fileEntry => {
                                    fileEntry.file(file => {
                                        this.upload([file]);
                                    });
                                });
                            }, null, { sourceType: camera.PictureSourceType.PHOTOLIBRARY });
                        }
                    }, [
                        this.ce('i', { class: this.iconClass('book') }),
                        this.text('Gallery')
                    ]),
                    this.ce('button', {
                        class: 'btn btn-primary',
                        onClick: event => {
                            event.preventDefault();
                            camera.getPicture(success => {
                                window.resolveLocalFileSystemURL(success, fileEntry => {
                                    fileEntry.file(file => {
                                        this.upload([file]);
                                    });
                                });
                            }, null, {
                                sourceType: camera.PictureSourceType.CAMERA,
                                encodingType: camera.EncodingType.PNG,
                                mediaType: camera.MediaType.PICTURE,
                                saveToPhotoAlbum: true,
                                correctOrientation: false
                            });
                        }
                    }, [
                        this.ce('i', { class: this.iconClass('camera') }),
                        this.text('Camera')
                    ])
                ]) : this.ce('div'));
            }
            const render = this.ce('div', {}, !this.disabled && (this.component.multiple || this.dataValue.length === 0) ? !this.cameraMode ? [this.ce('div', {
                    class: 'fileSelector',
                    onDragover(event) {
                        this.className = 'fileSelector fileDragOver';
                        event.preventDefault();
                    },
                    onDragleave(event) {
                        this.className = 'fileSelector';
                        event.preventDefault();
                    },
                    onDrop(event) {
                        this.className = 'fileSelector';
                        event.preventDefault();
                        element.upload(event.dataTransfer.files);
                        return false;
                    }
                }, [
                    this.ce('i', { class: this.iconClass('cloud-upload') }),
                    this.text(' '),
                    this.text('Drop files to attach, or'),
                    this.text(' '),
                    this.buildBrowseLink(),
                    this.component.webcam ? [
                        this.text(', or'),
                        this.text(' '),
                        this.ce('a', {
                            href: '#',
                            title: 'Use Web Camera',
                            onClick: event => {
                                event.preventDefault();
                                this.cameraMode = !this.cameraMode;
                                this.refreshDOM();
                            }
                        }, this.ce('i', { class: this.iconClass('camera') }))
                    ] : null
                ])] : [
                this.ce('div', {}, [
                    this.video = this.ce('video', {
                        class: 'video',
                        autoplay: true
                    }),
                    this.canvas = this.ce('canvas', { style: 'display: none;' }),
                    this.photo = this.ce('img')
                ]),
                this.ce('div', {
                    class: 'btn btn-primary',
                    onClick: () => {
                        this.takePicture();
                    }
                }, 'Take Photo'),
                this.ce('div', {
                    class: 'btn btn-default',
                    onClick: () => {
                        this.cameraMode = !this.cameraMode;
                        this.refreshDOM();
                    }
                }, 'Switch to file upload')
            ] : this.ce('div'));
            if (this.cameraMode) {
                this.startVideo();
            }
            return render;
        }
        buildBrowseLink() {
            this.browseLink = this.ce('a', {
                href: '#',
                onClick: event => {
                    event.preventDefault();
                    if (typeof this.hiddenFileInputElement.trigger === 'function') {
                        this.hiddenFileInputElement.trigger('click');
                    } else {
                        this.hiddenFileInputElement.click();
                    }
                },
                class: 'browse'
            }, this.text('browse'));
            this.addFocusBlurEvents(this.browseLink);
            return this.browseLink;
        }
        buildUploadStatusList(container) {
            const list = this.ce('div');
            this.uploadStatusList = list;
            container.appendChild(list);
        }
        addWarnings(container) {
            let hasWarnings = false;
            const warnings = this.ce('div', { class: 'alert alert-warning' });
            if (!this.component.storage) {
                hasWarnings = true;
                warnings.appendChild(this.ce('p').appendChild(this.text('No storage has been set for this field. File uploads are disabled until storage is set up.')));
            }
            if (!this.support.dnd) {
                hasWarnings = true;
                warnings.appendChild(this.ce('p').appendChild(this.text('File Drag/Drop is not supported for this browser.')));
            }
            if (!this.support.filereader) {
                hasWarnings = true;
                warnings.appendChild(this.ce('p').appendChild(this.text('File API & FileReader API not supported.')));
            }
            if (!this.support.formdata) {
                hasWarnings = true;
                warnings.appendChild(this.ce('p').appendChild(this.text("XHR2's FormData is not supported.")));
            }
            if (!this.support.progress) {
                hasWarnings = true;
                warnings.appendChild(this.ce('p').appendChild(this.text("XHR2's upload progress isn't supported.")));
            }
            if (hasWarnings) {
                container.appendChild(warnings);
            }
        }
        fileSize(a, b, c, d, e) {
            return `${ (b = Math, c = b.log, d = 1024, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2) } ${ e ? `${ 'kMGTPEZY'[--e] }B` : 'Bytes' }`;
        }
        createUploadStatus(fileUpload) {
            let container;
            return container = this.ce('div', { class: `file${ fileUpload.status === 'error' ? ' has-error' : '' }` }, [
                this.ce('div', { class: 'row' }, [
                    this.ce('div', { class: 'fileName control-label col-sm-10' }, [
                        fileUpload.originalName,
                        this.ce('i', {
                            class: this.iconClass('remove'),
                            onClick: () => this.removeChildFrom(container, this.uploadStatusList)
                        })
                    ]),
                    this.ce('div', { class: 'fileSize control-label col-sm-2 text-right' }, this.fileSize(fileUpload.size))
                ]),
                this.ce('div', { class: 'row' }, [this.ce('div', { class: 'col-sm-12' }, [fileUpload.status === 'progress' ? this.ce('div', { class: 'progress' }, this.ce('div', {
                            class: 'progress-bar',
                            role: 'progressbar',
                            'aria-valuenow': fileUpload.progress,
                            'aria-valuemin': 0,
                            'aria-valuemax': 100,
                            style: `width:${ fileUpload.progress }%`
                        }, this.ce('span', { class: 'sr-only' }, `${ fileUpload.progress }% Complete`))) : this.ce('div', { class: `bg-${ fileUpload.status }` }, fileUpload.message)])])
            ]);
        }
        globStringToRegex(str) {
            let regexp = '', excludes = [];
            if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
                regexp = str.substring(1, str.length - 1);
            } else {
                const split = str.split(',');
                if (split.length > 1) {
                    for (let i = 0; i < split.length; i++) {
                        const r = this.globStringToRegex(split[i]);
                        if (r.regexp) {
                            regexp += `(${ r.regexp })`;
                            if (i < split.length - 1) {
                                regexp += '|';
                            }
                        } else {
                            excludes = excludes.concat(r.excludes);
                        }
                    }
                } else {
                    if (str.indexOf('!') === 0) {
                        excludes.push(`^((?!${ this.globStringToRegex(str.substring(1)).regexp }).)*$`);
                    } else {
                        if (str.indexOf('.') === 0) {
                            str = `*${ str }`;
                        }
                        regexp = `^${ str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&') }$`;
                        regexp = regexp.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
                    }
                }
            }
            return {
                regexp: regexp,
                excludes: excludes
            };
        }
        translateScalars(str) {
            if (typeof str === 'string') {
                if (str.search(/kb/i) === str.length - 2) {
                    return parseFloat(str.substring(0, str.length - 2) * 1024);
                } else if (str.search(/mb/i) === str.length - 2) {
                    return parseFloat(str.substring(0, str.length - 2) * 1048576);
                } else if (str.search(/gb/i) === str.length - 2) {
                    return parseFloat(str.substring(0, str.length - 2) * 1073741824);
                } else if (str.search(/b/i) === str.length - 1) {
                    return parseFloat(str.substring(0, str.length - 1));
                } else if (str.search(/s/i) === str.length - 1) {
                    return parseFloat(str.substring(0, str.length - 1));
                } else if (str.search(/m/i) === str.length - 1) {
                    return parseFloat(str.substring(0, str.length - 1) * 60);
                } else if (str.search(/h/i) === str.length - 1) {
                    return parseFloat(str.substring(0, str.length - 1) * 3600);
                }
            }
            return str;
        }
        validatePattern(file, val) {
            if (!val) {
                return true;
            }
            const pattern = this.globStringToRegex(val);
            let valid = true;
            if (pattern.regexp && pattern.regexp.length) {
                const regexp = new RegExp(pattern.regexp, 'i');
                valid = file.type != null && regexp.test(file.type) || file.name != null && regexp.test(file.name);
            }
            let len = pattern.excludes.length;
            while (len--) {
                const exclude = new RegExp(pattern.excludes[len], 'i');
                valid = valid && (file.type == null || exclude.test(file.type)) && (file.name == null || exclude.test(file.name));
            }
            return valid;
        }
        validateMinSize(file, val) {
            return file.size + 0.1 >= this.translateScalars(val);
        }
        validateMaxSize(file, val) {
            return file.size - 0.1 <= this.translateScalars(val);
        }
        upload(files) {
            if (!this.component.multiple) {
                files = Array.prototype.slice.call(files, 0, 1);
            }
            if (this.component.storage && files && files.length) {
                Array.prototype.forEach.call(files, file => {
                    const fileName = a.uniqueName(file.name);
                    const fileUpload = {
                        originalName: file.name,
                        name: fileName,
                        size: file.size,
                        status: 'info',
                        message: 'Starting upload'
                    };
                    if (this.component.filePattern && !this.validatePattern(file, this.component.filePattern)) {
                        fileUpload.status = 'error';
                        fileUpload.message = `File is the wrong type; it must be ${ this.component.filePattern }`;
                    }
                    if (this.component.fileMinSize && !this.validateMinSize(file, this.component.fileMinSize)) {
                        fileUpload.status = 'error';
                        fileUpload.message = `File is too small; it must be at least ${ this.component.fileMinSize }`;
                    }
                    if (this.component.fileMaxSize && !this.validateMaxSize(file, this.component.fileMaxSize)) {
                        fileUpload.status = 'error';
                        fileUpload.message = `File is too big; it must be at most ${ this.component.fileMaxSize }`;
                    }
                    const dir = this.interpolate(this.component.dir || '');
                    const fileService = this.fileService;
                    if (!fileService) {
                        fileUpload.status = 'error';
                        fileUpload.message = 'File Service not provided.';
                    }
                    let uploadStatus = this.createUploadStatus(fileUpload);
                    this.uploadStatusList.appendChild(uploadStatus);
                    if (fileUpload.status !== 'error') {
                        if (this.component.privateDownload) {
                            file.private = true;
                        }
                        const {storage, url, options} = this.component;
                        fileService.uploadFile(storage, file, fileName, dir, evt => {
                            fileUpload.status = 'progress';
                            fileUpload.progress = parseInt(100 * evt.loaded / evt.total);
                            delete fileUpload.message;
                            const originalStatus = uploadStatus;
                            uploadStatus = this.createUploadStatus(fileUpload);
                            this.uploadStatusList.replaceChild(uploadStatus, originalStatus);
                        }, url, options).then(fileInfo => {
                            this.removeChildFrom(uploadStatus, this.uploadStatusList);
                            if (this.hasTypes) {
                                fileInfo.fileType = this.component.fileTypes[0].value;
                            }
                            fileInfo.originalName = file.name;
                            let files = this.dataValue;
                            if (!files || !Array.isArray(files)) {
                                files = [];
                            }
                            files.push(fileInfo);
                            this.setValue(this.dataValue);
                            this.triggerChange();
                        }).catch(response => {
                            fileUpload.status = 'error';
                            fileUpload.message = response;
                            delete fileUpload.progress;
                            const originalStatus = uploadStatus;
                            uploadStatus = this.createUploadStatus(fileUpload);
                            this.uploadStatusList.replaceChild(uploadStatus, originalStatus);
                        });
                    }
                });
            }
        }
        getFile(fileInfo, event) {
            const fileService = this.fileService;
            if (!fileService) {
                return alert('File Service not provided');
            }
            if (this.component.privateDownload) {
                fileInfo.private = true;
            }
            fileService.downloadFile(fileInfo).then(file => {
                if (file) {
                    if (file.storage === 'base64') {
                        download(file.url, file.originalName, file.type);
                    } else {
                        window.open(file.url, '_blank');
                    }
                }
            }).catch(response => {
                alert(response);
            });
            event.preventDefault();
        }
        focus() {
            this.browseLink.focus();
        }
    };
});