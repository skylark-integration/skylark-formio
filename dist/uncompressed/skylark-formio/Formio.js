define([
    './vendors/getify/npo',
    './vendors/fetch-ponyfill/fetch',
    './EventEmitter',
    '../vendors/browser-cookies/cookies',
    './providers/index',
    "skylark-lodash",
    './utils/utils',
    '../vendors/jwt-decode/decode',
    './polyfills/index'
], function (NativePromise, fetchPonyfill, EventEmitter, cookies, Providers, _ , utils, jwtDecode) {
    'use strict';

    const  _intersection = _.intersection, 
           _get = _.get, 
           _cloneDeep = _.cloneDeep, 
           _defaults = _.defaults;


    const {fetch, Headers} = fetchPonyfill({ Promise: NativePromise });
    const isBoolean = val => typeof val === typeof true;
    const isNil = val => val === null || val === undefined;
    const isObject = val => val && typeof val === 'object';
    function cloneResponse(response) {
        const copy = _cloneDeep(response);
        if (Array.isArray(response)) {
            copy.skip = response.skip;
            copy.limit = response.limit;
            copy.serverCount = response.serverCount;
        }
        return copy;
    }
    class Formio {
        constructor(path, options = {}) {
            if (!(this instanceof Formio)) {
                return new Formio(path);
            }
            this.base = '';
            this.projectsUrl = '';
            this.projectUrl = '';
            this.projectId = '';
            this.roleUrl = '';
            this.rolesUrl = '';
            this.roleId = '';
            this.formUrl = '';
            this.formsUrl = '';
            this.formId = '';
            this.submissionsUrl = '';
            this.submissionUrl = '';
            this.submissionId = '';
            this.actionsUrl = '';
            this.actionId = '';
            this.actionUrl = '';
            this.vsUrl = '';
            this.vId = '';
            this.vUrl = '';
            this.query = '';
            this.path = path;
            this.options = options;
            if (options.hasOwnProperty('base')) {
                this.base = options.base;
            } else if (Formio.baseUrl) {
                this.base = Formio.baseUrl;
            } else {
                this.base = window.location.href.match(/http[s]?:\/\/api./)[0];
            }
            if (!path) {
                this.projectUrl = Formio.projectUrl || `${ this.base }/project`;
                this.projectsUrl = `${ this.base }/project`;
                this.projectId = false;
                this.query = '';
                return;
            }
            if (options.hasOwnProperty('project')) {
                this.projectUrl = options.project;
            }
            const project = this.projectUrl || Formio.projectUrl;
            const projectRegEx = /(^|\/)(project)($|\/[^/]+)/;
            const isProjectUrl = path.search(projectRegEx) !== -1;
            if (project && this.base === project && !isProjectUrl) {
                this.noProject = true;
                this.projectUrl = this.base;
            }
            if (path.indexOf('http') !== 0 && path.indexOf('//') !== 0) {
                path = this.base + path;
            }
            const hostparts = this.getUrlParts(path);
            let parts = [];
            const hostName = hostparts[1] + hostparts[2];
            path = hostparts.length > 3 ? hostparts[3] : '';
            const queryparts = path.split('?');
            if (queryparts.length > 1) {
                path = queryparts[0];
                this.query = `?${ queryparts[1] }`;
            }
            const registerPath = (name, base) => {
                this[`${ name }sUrl`] = `${ base }/${ name }`;
                const regex = new RegExp(`/${ name }/([^/]+)`);
                if (path.search(regex) !== -1) {
                    parts = path.match(regex);
                    this[`${ name }Url`] = parts ? base + parts[0] : '';
                    this[`${ name }Id`] = parts.length > 1 ? parts[1] : '';
                    base += parts[0];
                }
                return base;
            };
            const registerItems = (items, base, staticBase) => {
                for (const i in items) {
                    if (items.hasOwnProperty(i)) {
                        const item = items[i];
                        if (Array.isArray(item)) {
                            registerItems(item, base, true);
                        } else {
                            const newBase = registerPath(item, base);
                            base = staticBase ? base : newBase;
                        }
                    }
                }
            };
            if (!this.projectUrl || this.projectUrl === this.base) {
                this.projectUrl = hostName;
            }
            if (!this.noProject) {
                if (isProjectUrl) {
                    registerItems(['project'], hostName);
                    path = path.replace(projectRegEx, '');
                } else if (hostName === this.base) {
                    if (hostparts.length > 3 && path.split('/').length > 1) {
                        const pathParts = path.split('/');
                        pathParts.shift();
                        this.projectId = pathParts.shift();
                        path = `/${ pathParts.join('/') }`;
                        this.projectUrl = `${ hostName }/${ this.projectId }`;
                    }
                } else {
                    if (hostparts.length > 2 && (hostparts[2].split('.').length > 2 || hostName.includes('localhost'))) {
                        this.projectUrl = hostName;
                        this.projectId = hostparts[2].split('.')[0];
                    }
                }
                this.projectsUrl = this.projectsUrl || `${ this.base }/project`;
            }
            registerItems(['role'], this.projectUrl);
            if (/(^|\/)(form)($|\/)/.test(path)) {
                registerItems([
                    'form',
                    [
                        'submission',
                        'action',
                        'v'
                    ]
                ], this.projectUrl);
            } else {
                const subRegEx = new RegExp('/(submission|action|v)($|/.*)');
                const subs = path.match(subRegEx);
                this.pathType = subs && subs.length > 1 ? subs[1] : '';
                path = path.replace(subRegEx, '');
                path = path.replace(/\/$/, '');
                this.formsUrl = `${ this.projectUrl }/form`;
                this.formUrl = path ? this.projectUrl + path : '';
                this.formId = path.replace(/^\/+|\/+$/g, '');
                const items = [
                    'submission',
                    'action',
                    'v'
                ];
                for (const i in items) {
                    if (items.hasOwnProperty(i)) {
                        const item = items[i];
                        this[`${ item }sUrl`] = `${ this.projectUrl + path }/${ item }`;
                        if (this.pathType === item && subs.length > 2 && subs[2]) {
                            this[`${ item }Id`] = subs[2].replace(/^\/+|\/+$/g, '');
                            this[`${ item }Url`] = this.projectUrl + path + subs[0];
                        }
                    }
                }
            }
            if (!Formio.projectUrlSet) {
                Formio.projectUrl = this.projectUrl;
            }
        }
        delete(type, opts) {
            const _id = `${ type }Id`;
            const _url = `${ type }Url`;
            if (!this[_id]) {
                NativePromise.reject('Nothing to delete');
            }
            Formio.cache = {};
            return this.makeRequest(type, this[_url], 'delete', null, opts);
        }
        index(type, query, opts) {
            const _url = `${ type }Url`;
            query = query || '';
            if (query && isObject(query)) {
                query = `?${ Formio.serialize(query.params) }`;
            }
            return this.makeRequest(type, this[_url] + query, 'get', null, opts);
        }
        save(type, data, opts) {
            const _id = `${ type }Id`;
            const _url = `${ type }Url`;
            const method = this[_id] || data._id ? 'put' : 'post';
            let reqUrl = this[_id] ? this[_url] : this[`${ type }sUrl`];
            if (!this[_id] && data._id && method === 'put' && !reqUrl.includes(data._id)) {
                reqUrl += `/${ data._id }`;
            }
            Formio.cache = {};
            return this.makeRequest(type, reqUrl + this.query, method, data, opts);
        }
        load(type, query, opts) {
            const _id = `${ type }Id`;
            const _url = `${ type }Url`;
            if (query && isObject(query)) {
                query = Formio.serialize(query.params);
            }
            if (query) {
                query = this.query ? `${ this.query }&${ query }` : `?${ query }`;
            } else {
                query = this.query;
            }
            if (!this[_id]) {
                return NativePromise.reject(`Missing ${ _id }`);
            }
            return this.makeRequest(type, this[_url] + query, 'get', null, opts);
        }
        makeRequest(...args) {
            return Formio.makeRequest(this, ...args);
        }
        loadProject(query, opts) {
            return this.load('project', query, opts);
        }
        saveProject(data, opts) {
            return this.save('project', data, opts);
        }
        deleteProject(opts) {
            return this.delete('project', opts);
        }
        static loadProjects(query, opts) {
            query = query || '';
            if (isObject(query)) {
                query = `?${ Formio.serialize(query.params) }`;
            }
            return Formio.makeStaticRequest(`${ Formio.baseUrl }/project${ query }`, 'GET', null, opts);
        }
        loadRole(opts) {
            return this.load('role', null, opts);
        }
        saveRole(data, opts) {
            return this.save('role', data, opts);
        }
        deleteRole(opts) {
            return this.delete('role', opts);
        }
        loadRoles(opts) {
            return this.index('roles', null, opts);
        }
        loadForm(query, opts) {
            return this.load('form', query, opts).then(currentForm => {
                if (!currentForm.revisions || isNaN(parseInt(this.vId))) {
                    return currentForm;
                }
                if (currentForm.revisions === 'current' && this.submissionId) {
                    return currentForm;
                }
                if (query && isObject(query)) {
                    query = Formio.serialize(query.params);
                }
                if (query) {
                    query = this.query ? `${ this.query }&${ query }` : `?${ query }`;
                } else {
                    query = this.query;
                }
                return this.makeRequest('form', this.vUrl + query, 'get', null, opts).then(revisionForm => {
                    currentForm.components = revisionForm.components;
                    currentForm.settings = revisionForm.settings;
                    return Object.assign({}, currentForm);
                }).catch(() => Object.assign({}, currentForm));
            });
        }
        saveForm(data, opts) {
            return this.save('form', data, opts);
        }
        deleteForm(opts) {
            return this.delete('form', opts);
        }
        loadForms(query, opts) {
            return this.index('forms', query, opts);
        }
        loadSubmission(query, opts) {
            return this.load('submission', query, opts).then(submission => {
                this.vId = submission._fvid;
                this.vUrl = `${ this.formUrl }/v/${ this.vId }`;
                return submission;
            });
        }
        saveSubmission(data, opts) {
            if (!isNaN(parseInt(this.vId))) {
                data._fvid = this.vId;
            }
            return this.save('submission', data, opts);
        }
        deleteSubmission(opts) {
            return this.delete('submission', opts);
        }
        loadSubmissions(query, opts) {
            return this.index('submissions', query, opts);
        }
        loadAction(query, opts) {
            return this.load('action', query, opts);
        }
        saveAction(data, opts) {
            return this.save('action', data, opts);
        }
        deleteAction(opts) {
            return this.delete('action', opts);
        }
        loadActions(query, opts) {
            return this.index('actions', query, opts);
        }
        availableActions() {
            return this.makeRequest('availableActions', `${ this.formUrl }/actions`);
        }
        actionInfo(name) {
            return this.makeRequest('actionInfo', `${ this.formUrl }/actions/${ name }`);
        }
        isObjectId(id) {
            const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');
            return checkForHexRegExp.test(id);
        }
        getProjectId() {
            if (!this.projectId) {
                return NativePromise.resolve('');
            }
            if (this.isObjectId(this.projectId)) {
                return NativePromise.resolve(this.projectId);
            } else {
                return this.loadProject().then(project => {
                    return project._id;
                });
            }
        }
        getFormId() {
            if (!this.formId) {
                return NativePromise.resolve('');
            }
            if (this.isObjectId(this.formId)) {
                return NativePromise.resolve(this.formId);
            } else {
                return this.loadForm().then(form => {
                    return form._id;
                });
            }
        }
        currentUser(options) {
            return Formio.currentUser(this, options);
        }
        accessInfo() {
            return Formio.accessInfo(this);
        }
        getToken(options) {
            return Formio.getToken(Object.assign({ formio: this }, this.options, options));
        }
        setToken(token, options) {
            return Formio.setToken(token, Object.assign({ formio: this }, this.options, options));
        }
        getTempToken(expire, allowed, options) {
            const token = Formio.getToken(options);
            if (!token) {
                return NativePromise.reject('You must be authenticated to generate a temporary auth token.');
            }
            const authUrl = Formio.authUrl || this.projectUrl;
            return this.makeRequest('tempToken', `${ authUrl }/token`, 'GET', null, {
                ignoreCache: true,
                header: new Headers({
                    'x-expire': expire,
                    'x-allow': allowed
                })
            });
        }
        getDownloadUrl(form) {
            if (!this.submissionId) {
                return NativePromise.resolve('');
            }
            if (!form) {
                return this.loadForm().then(_form => {
                    if (!_form) {
                        return '';
                    }
                    return this.getDownloadUrl(_form);
                });
            }
            let apiUrl = `/project/${ form.project }`;
            apiUrl += `/form/${ form._id }`;
            apiUrl += `/submission/${ this.submissionId }`;
            apiUrl += '/download';
            let download = this.base + apiUrl;
            return new NativePromise((resolve, reject) => {
                this.getTempToken(3600, `GET:${ apiUrl }`).then(tempToken => {
                    download += `?token=${ tempToken.key }`;
                    resolve(download);
                }, () => {
                    resolve(download);
                }).catch(reject);
            });
        }
        uploadFile(storage, file, fileName, dir, progressCallback, url, options, fileKey) {
            const requestArgs = {
                provider: storage,
                method: 'upload',
                file: file,
                fileName: fileName,
                dir: dir
            };
            fileKey = fileKey || 'file';
            const request = Formio.pluginWait('preRequest', requestArgs).then(() => {
                return Formio.pluginGet('fileRequest', requestArgs).then(result => {
                    if (storage && isNil(result)) {
                        const Provider = Providers.getProvider('storage', storage);
                        if (Provider) {
                            const provider = new Provider(this);
                            return provider.uploadFile(file, fileName, dir, progressCallback, url, options, fileKey);
                        } else {
                            throw 'Storage provider not found';
                        }
                    }
                    return result || { url: '' };
                });
            });
            return Formio.pluginAlter('wrapFileRequestPromise', request, requestArgs);
        }
        downloadFile(file, options) {
            const requestArgs = {
                method: 'download',
                file: file
            };
            const request = Formio.pluginWait('preRequest', requestArgs).then(() => {
                return Formio.pluginGet('fileRequest', requestArgs).then(result => {
                    if (file.storage && isNil(result)) {
                        const Provider = Providers.getProvider('storage', file.storage);
                        if (Provider) {
                            const provider = new Provider(this);
                            return provider.downloadFile(file, options);
                        } else {
                            throw 'Storage provider not found';
                        }
                    }
                    return result || { url: '' };
                });
            });
            return Formio.pluginAlter('wrapFileRequestPromise', request, requestArgs);
        }
        userPermissions(user, form, submission) {
            return NativePromise.all([
                form !== undefined ? NativePromise.resolve(form) : this.loadForm(),
                user !== undefined ? NativePromise.resolve(user) : this.currentUser(),
                submission !== undefined || !this.submissionId ? NativePromise.resolve(submission) : this.loadSubmission(),
                this.accessInfo()
            ]).then(results => {
                const form = results.shift();
                const user = results.shift() || {
                    _id: false,
                    roles: []
                };
                const submission = results.shift();
                const access = results.shift();
                const permMap = {
                    create: 'create',
                    read: 'read',
                    update: 'edit',
                    delete: 'delete'
                };
                const perms = {
                    user: user,
                    form: form,
                    access: access,
                    create: false,
                    read: false,
                    edit: false,
                    delete: false
                };
                for (const roleName in access.roles) {
                    if (access.roles.hasOwnProperty(roleName)) {
                        const role = access.roles[roleName];
                        if (role.default && user._id === false) {
                            user.roles.push(role._id);
                        } else if (role.admin && user.roles.indexOf(role._id) !== -1) {
                            perms.create = true;
                            perms.read = true;
                            perms.delete = true;
                            perms.edit = true;
                            return perms;
                        }
                    }
                }
                if (form && form.submissionAccess) {
                    for (let i = 0; i < form.submissionAccess.length; i++) {
                        const permission = form.submissionAccess[i];
                        const [perm, scope] = permission.type.split('_');
                        if ([
                                'create',
                                'read',
                                'update',
                                'delete'
                            ].includes(perm)) {
                            if (_intersection(permission.roles, user.roles).length) {
                                perms[permMap[perm]] = scope === 'all' || (!submission || user._id === submission.owner);
                            }
                        }
                    }
                }
                if (submission) {
                    utils.eachComponent(form.components, (component, path) => {
                        if (component && component.defaultPermission) {
                            const value = _get(submission.data, path);
                            const groups = Array.isArray(value) ? value : [value];
                            groups.forEach(group => {
                                if (group && group._id && user.roles.indexOf(group._id) > -1) {
                                    if (component.defaultPermission === 'read') {
                                        perms[permMap.read] = true;
                                    }
                                    if (component.defaultPermission === 'create') {
                                        perms[permMap.create] = true;
                                        perms[permMap.read] = true;
                                    }
                                    if (component.defaultPermission === 'write') {
                                        perms[permMap.create] = true;
                                        perms[permMap.read] = true;
                                        perms[permMap.update] = true;
                                    }
                                    if (component.defaultPermission === 'admin') {
                                        perms[permMap.create] = true;
                                        perms[permMap.read] = true;
                                        perms[permMap.update] = true;
                                        perms[permMap.delete] = true;
                                    }
                                }
                            });
                        }
                    });
                }
                return perms;
            });
        }
        canSubmit() {
            return this.userPermissions().then(perms => {
                if (!perms.create && Formio.getUser()) {
                    return this.userPermissions(null).then(anonPerms => {
                        if (anonPerms.create) {
                            Formio.setUser(null);
                            return true;
                        }
                        return false;
                    });
                }
                return perms.create;
            });
        }
        getUrlParts(url) {
            return Formio.getUrlParts(url, this);
        }
        static getUrlParts(url, formio) {
            const base = formio && formio.base ? formio.base : Formio.baseUrl;
            let regex = '^(http[s]?:\\/\\/)';
            if (base && url.indexOf(base) === 0) {
                regex += `(${ base.replace(/^http[s]?:\/\//, '') })`;
            } else {
                regex += '([^/]+)';
            }
            regex += '($|\\/.*)';
            return url.match(new RegExp(regex));
        }
        static serialize(obj, _interpolate) {
            const str = [];
            const interpolate = item => {
                return _interpolate ? _interpolate(item) : item;
            };
            for (const p in obj) {
                if (obj.hasOwnProperty(p)) {
                    str.push(`${ encodeURIComponent(p) }=${ encodeURIComponent(interpolate(obj[p])) }`);
                }
            }
            return str.join('&');
        }
        static getRequestArgs(formio, type, url, method, data, opts) {
            method = (method || 'GET').toUpperCase();
            if (!opts || !isObject(opts)) {
                opts = {};
            }
            const requestArgs = {
                url,
                method,
                data: data || null,
                opts
            };
            if (type) {
                requestArgs.type = type;
            }
            if (formio) {
                requestArgs.formio = formio;
            }
            return requestArgs;
        }
        static makeStaticRequest(url, method, data, opts) {
            const requestArgs = Formio.getRequestArgs(null, '', url, method, data, opts);
            const request = Formio.pluginWait('preRequest', requestArgs).then(() => Formio.pluginGet('staticRequest', requestArgs).then(result => {
                if (isNil(result)) {
                    return Formio.request(url, method, requestArgs.data, requestArgs.opts.header, requestArgs.opts);
                }
                return result;
            }));
            return Formio.pluginAlter('wrapStaticRequestPromise', request, requestArgs);
        }
        static makeRequest(formio, type, url, method, data, opts) {
            if (!formio) {
                return Formio.makeStaticRequest(url, method, data, opts);
            }
            const requestArgs = Formio.getRequestArgs(formio, type, url, method, data, opts);
            requestArgs.opts = requestArgs.opts || {};
            requestArgs.opts.formio = formio;
            if (!requestArgs.opts.headers) {
                requestArgs.opts.headers = {};
            }
            requestArgs.opts.headers = _defaults(requestArgs.opts.headers, {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            });
            const request = Formio.pluginWait('preRequest', requestArgs).then(() => Formio.pluginGet('request', requestArgs).then(result => {
                if (isNil(result)) {
                    return Formio.request(url, method, requestArgs.data, requestArgs.opts.header, requestArgs.opts);
                }
                return result;
            }));
            return Formio.pluginAlter('wrapRequestPromise', request, requestArgs);
        }
        static request(url, method, data, header, opts) {
            if (!url) {
                return NativePromise.reject('No url provided');
            }
            method = (method || 'GET').toUpperCase();
            if (isBoolean(opts)) {
                opts = { ignoreCache: opts };
            }
            if (!opts || !isObject(opts)) {
                opts = {};
            }
            const cacheKey = btoa(url);
            if (!opts.ignoreCache && method === 'GET' && Formio.cache.hasOwnProperty(cacheKey)) {
                return NativePromise.resolve(cloneResponse(Formio.cache[cacheKey]));
            }
            const headers = header || new Headers(opts.headers || {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            });
            const token = Formio.getToken(opts);
            if (token && !opts.noToken) {
                headers.append('x-jwt-token', token);
            }
            const headerObj = {};
            headers.forEach(function (value, name) {
                headerObj[name] = value;
            });
            let options = {
                method: method,
                headers: headerObj,
                mode: 'cors'
            };
            if (data) {
                options.body = JSON.stringify(data);
            }
            options = Formio.pluginAlter('requestOptions', options, url);
            if (options.namespace || Formio.namespace) {
                opts.namespace = options.namespace || Formio.namespace;
            }
            const requestToken = options.headers['x-jwt-token'];
            const result = Formio.pluginAlter('wrapFetchRequestPromise', Formio.fetch(url, options), {
                url,
                method,
                data,
                opts
            }).then(response => {
                response = Formio.pluginAlter('requestResponse', response, Formio, data);
                if (!response.ok) {
                    if (response.status === 440) {
                        Formio.setToken(null, opts);
                        Formio.events.emit('formio.sessionExpired', response.body);
                    } else if (response.status === 401) {
                        Formio.events.emit('formio.unauthorized', response.body);
                    }
                    return (response.headers.get('content-type').includes('application/json') ? response.json() : response.text()).then(error => {
                        return NativePromise.reject(error);
                    });
                }
                const token = response.headers.get('x-jwt-token');
                let tokenIntroduced = false;
                if (method === 'GET' && !requestToken && token && !opts.external && !url.includes('token=') && !url.includes('x-jwt-token=')) {
                    console.warn('Token was introduced in request.');
                    tokenIntroduced = true;
                }
                if (response.status >= 200 && response.status < 300 && token && token !== '' && !tokenIntroduced) {
                    Formio.setToken(token, opts);
                }
                if (response.status === 204) {
                    return {};
                }
                const getResult = response.headers.get('content-type').includes('application/json') ? response.json() : response.text();
                return getResult.then(result => {
                    let range = response.headers.get('content-range');
                    if (range && isObject(result)) {
                        range = range.split('/');
                        if (range[0] !== '*') {
                            const skipLimit = range[0].split('-');
                            result.skip = Number(skipLimit[0]);
                            result.limit = skipLimit[1] - skipLimit[0] + 1;
                        }
                        result.serverCount = range[1] === '*' ? range[1] : Number(range[1]);
                    }
                    if (!opts.getHeaders) {
                        return result;
                    }
                    const headers = {};
                    response.headers.forEach((item, key) => {
                        headers[key] = item;
                    });
                    return {
                        result,
                        headers
                    };
                });
            }).then(result => {
                if (opts.getHeaders) {
                    return result;
                }
                if (method === 'GET') {
                    Formio.cache[cacheKey] = result;
                }
                return cloneResponse(result);
            }).catch(err => {
                if (err === 'Bad Token') {
                    Formio.setToken(null, opts);
                    Formio.events.emit('formio.badToken', err);
                }
                if (err.message) {
                    err.message = `Could not connect to API server (${ err.message })`;
                    err.networkError = true;
                }
                if (method === 'GET') {
                    delete Formio.cache[cacheKey];
                }
                return NativePromise.reject(err);
            });
            return result;
        }
        static get token() {
            if (!Formio.tokens) {
                Formio.tokens = {};
            }
            return Formio.tokens.formioToken ? Formio.tokens.formioToken : '';
        }
        static set token(token) {
            if (!Formio.tokens) {
                Formio.tokens = {};
            }
            return Formio.tokens.formioToken = token || '';
        }
        static setToken(token = '', opts) {
            token = token || '';
            opts = typeof opts === 'string' ? { namespace: opts } : opts || {};
            var tokenName = `${ opts.namespace || Formio.namespace || 'formio' }Token`;
            if (!Formio.tokens) {
                Formio.tokens = {};
            }
            if (Formio.tokens[tokenName] && Formio.tokens[tokenName] === token) {
                return;
            }
            Formio.tokens[tokenName] = token;
            if (!token) {
                if (!opts.fromUser) {
                    opts.fromToken = true;
                    Formio.setUser(null, opts);
                }
                try {
                    return localStorage.removeItem(tokenName);
                } catch (err) {
                    return cookies.erase(tokenName, { path: '/' });
                }
            }
            try {
                localStorage.setItem(tokenName, token);
            } catch (err) {
                cookies.set(tokenName, token, { path: '/' });
            }
            return Formio.currentUser(opts.formio, opts);
        }
        static getToken(options) {
            options = typeof options === 'string' ? { namespace: options } : options || {};
            const tokenName = `${ options.namespace || Formio.namespace || 'formio' }Token`;
            const decodedTokenName = options.decode ? `${ tokenName }Decoded` : tokenName;
            if (!Formio.tokens) {
                Formio.tokens = {};
            }
            if (Formio.tokens[decodedTokenName]) {
                return Formio.tokens[decodedTokenName];
            }
            try {
                Formio.tokens[tokenName] = localStorage.getItem(tokenName) || '';
                if (options.decode) {
                    Formio.tokens[decodedTokenName] = Formio.tokens[tokenName] ? jwtDecode(Formio.tokens[tokenName]) : {};
                    return Formio.tokens[decodedTokenName];
                }
                return Formio.tokens[tokenName];
            } catch (e) {
                Formio.tokens[tokenName] = cookies.get(tokenName);
                return Formio.tokens[tokenName];
            }
        }
        static setUser(user, opts = {}) {
            var userName = `${ opts.namespace || Formio.namespace || 'formio' }User`;
            if (!user) {
                if (!opts.fromToken) {
                    opts.fromUser = true;
                    Formio.setToken(null, opts);
                }
                Formio.events.emit('formio.user', null);
                try {
                    return localStorage.removeItem(userName);
                } catch (err) {
                    return cookies.erase(userName, { path: '/' });
                }
            }
            try {
                localStorage.setItem(userName, JSON.stringify(user));
            } catch (err) {
                cookies.set(userName, JSON.stringify(user), { path: '/' });
            }
            Formio.events.emit('formio.user', user);
        }
        static getUser(options) {
            options = options || {};
            var userName = `${ options.namespace || Formio.namespace || 'formio' }User`;
            try {
                return JSON.parse(localStorage.getItem(userName) || null);
            } catch (e) {
                return JSON.parse(cookies.get(userName));
            }
        }
        static setBaseUrl(url) {
            Formio.baseUrl = url;
            if (!Formio.projectUrlSet) {
                Formio.projectUrl = url;
            }
        }
        static getBaseUrl() {
            return Formio.baseUrl;
        }
        static setApiUrl(url) {
            return Formio.setBaseUrl(url);
        }
        static getApiUrl() {
            return Formio.getBaseUrl();
        }
        static setAppUrl(url) {
            console.warn('Formio.setAppUrl() is deprecated. Use Formio.setProjectUrl instead.');
            Formio.projectUrl = url;
            Formio.projectUrlSet = true;
        }
        static setProjectUrl(url) {
            Formio.projectUrl = url;
            Formio.projectUrlSet = true;
        }
        static setAuthUrl(url) {
            Formio.authUrl = url;
        }
        static getAppUrl() {
            console.warn('Formio.getAppUrl() is deprecated. Use Formio.getProjectUrl instead.');
            return Formio.projectUrl;
        }
        static getProjectUrl() {
            return Formio.projectUrl;
        }
        static clearCache() {
            Formio.cache = {};
        }
        static noop() {
        }
        static identity(value) {
            return value;
        }
        static deregisterPlugin(plugin) {
            const beforeLength = Formio.plugins.length;
            Formio.plugins = Formio.plugins.filter(p => {
                if (p !== plugin && p.__name !== plugin) {
                    return true;
                }
                (p.deregister || Formio.noop).call(plugin, Formio);
                return false;
            });
            return beforeLength !== Formio.plugins.length;
        }
        static registerPlugin(plugin, name) {
            Formio.plugins.push(plugin);
            Formio.plugins.sort((a, b) => (b.priority || 0) - (a.priority || 0));
            plugin.__name = name;
            (plugin.init || Formio.noop).call(plugin, Formio);
        }
        static getPlugin(name) {
            for (const plugin of Formio.plugins) {
                if (plugin.__name === name) {
                    return plugin;
                }
            }
            return null;
        }
        static pluginWait(pluginFn, ...args) {
            return NativePromise.all(Formio.plugins.map(plugin => (plugin[pluginFn] || Formio.noop).call(plugin, ...args)));
        }
        static pluginGet(pluginFn, ...args) {
            const callPlugin = index => {
                const plugin = Formio.plugins[index];
                if (!plugin) {
                    return NativePromise.resolve(null);
                }
                return NativePromise.resolve((plugin[pluginFn] || Formio.noop).call(plugin, ...args)).then(result => {
                    if (!isNil(result)) {
                        return result;
                    }
                    return callPlugin(index + 1);
                });
            };
            return callPlugin(0);
        }
        static pluginAlter(pluginFn, value, ...args) {
            return Formio.plugins.reduce((value, plugin) => (plugin[pluginFn] || Formio.identity)(value, ...args), value);
        }
        static accessInfo(formio) {
            const projectUrl = formio ? formio.projectUrl : Formio.projectUrl;
            return Formio.makeRequest(formio, 'accessInfo', `${ projectUrl }/access`);
        }
        static projectRoles(formio) {
            const projectUrl = formio ? formio.projectUrl : Formio.projectUrl;
            return Formio.makeRequest(formio, 'projectRoles', `${ projectUrl }/role`);
        }
        static currentUser(formio, options) {
            let authUrl = Formio.authUrl;
            if (!authUrl) {
                authUrl = formio ? formio.projectUrl : Formio.projectUrl || Formio.baseUrl;
            }
            authUrl += '/current';
            const user = Formio.getUser(options);
            if (user) {
                return Formio.pluginAlter('wrapStaticRequestPromise', NativePromise.resolve(user), {
                    url: authUrl,
                    method: 'GET',
                    options
                });
            }
            const token = Formio.getToken(options);
            if ((!options || !options.external) && !token) {
                return Formio.pluginAlter('wrapStaticRequestPromise', NativePromise.resolve(null), {
                    url: authUrl,
                    method: 'GET',
                    options
                });
            }
            return Formio.makeRequest(formio, 'currentUser', authUrl, 'GET', null, options).then(response => {
                Formio.setUser(response, options);
                return response;
            });
        }
        static logout(formio, options) {
            options = options || {};
            options.formio = formio;
            Formio.setToken(null, options);
            Formio.setUser(null, options);
            Formio.clearCache();
            const projectUrl = Formio.authUrl ? Formio.authUrl : formio ? formio.projectUrl : Formio.baseUrl;
            return Formio.makeRequest(formio, 'logout', `${ projectUrl }/logout`);
        }
        static pageQuery() {
            if (Formio._pageQuery) {
                return Formio._pageQuery;
            }
            Formio._pageQuery = {};
            Formio._pageQuery.paths = [];
            const hashes = location.hash.substr(1).replace(/\?/g, '&').split('&');
            let parts = [];
            location.search.substr(1).split('&').forEach(function (item) {
                parts = item.split('=');
                if (parts.length > 1) {
                    Formio._pageQuery[parts[0]] = parts[1] && decodeURIComponent(parts[1]);
                }
            });
            hashes.forEach(function (item) {
                parts = item.split('=');
                if (parts.length > 1) {
                    Formio._pageQuery[parts[0]] = parts[1] && decodeURIComponent(parts[1]);
                } else if (item.indexOf('/') === 0) {
                    Formio._pageQuery.paths = item.substr(1).split('/');
                }
            });
            return Formio._pageQuery;
        }
        static oAuthCurrentUser(formio, token) {
            return Formio.currentUser(formio, {
                external: true,
                headers: { Authorization: `Bearer ${ token }` }
            });
        }
        static samlInit(options) {
            options = options || {};
            const query = Formio.pageQuery();
            if (query.saml) {
                Formio.setUser(null);
                const retVal = Formio.setToken(query.saml);
                let uri = window.location.toString();
                uri = uri.substring(0, uri.indexOf('?'));
                if (window.location.hash) {
                    uri += window.location.hash;
                }
                window.history.replaceState({}, document.title, uri);
                return retVal;
            }
            if (!options.relay) {
                options.relay = window.location.href;
            }
            const authUrl = Formio.authUrl || Formio.projectUrl;
            window.location.href = `${ authUrl }/saml/sso?relay=${ encodeURI(options.relay) }`;
            return false;
        }
        static oktaInit(options) {
            options = options || {};
            if (typeof OktaAuth !== undefined) {
                options.OktaAuth = OktaAuth;
            }
            if (typeof options.OktaAuth === undefined) {
                const errorMessage = 'Cannot find OktaAuth. Please include the Okta JavaScript SDK within your application. See https://developer.okta.com/code/javascript/okta_auth_sdk for an example.';
                console.warn(errorMessage);
                return NativePromise.reject(errorMessage);
            }
            return new NativePromise((resolve, reject) => {
                const Okta = options.OktaAuth;
                delete options.OktaAuth;
                var authClient = new Okta(options);
                authClient.tokenManager.get('accessToken').then(accessToken => {
                    if (accessToken) {
                        resolve(Formio.oAuthCurrentUser(options.formio, accessToken.accessToken));
                    } else if (location.hash) {
                        authClient.token.parseFromUrl().then(token => {
                            authClient.tokenManager.add('accessToken', token);
                            resolve(Formio.oAuthCurrentUser(options.formio, token.accessToken));
                        }).catch(err => {
                            console.warn(err);
                            reject(err);
                        });
                    } else {
                        authClient.token.getWithRedirect({
                            responseType: 'token',
                            scopes: options.scopes
                        });
                        resolve(false);
                    }
                }).catch(error => {
                    reject(error);
                });
            });
        }
        static ssoInit(type, options) {
            switch (type) {
            case 'saml':
                return Formio.samlInit(options);
            case 'okta':
                return Formio.oktaInit(options);
            default:
                console.warn('Unknown SSO type');
                return NativePromise.reject('Unknown SSO type');
            }
        }
        static requireLibrary(name, property, src, polling) {
            if (!Formio.libraries.hasOwnProperty(name)) {
                Formio.libraries[name] = {};
                Formio.libraries[name].ready = new NativePromise((resolve, reject) => {
                    Formio.libraries[name].resolve = resolve;
                    Formio.libraries[name].reject = reject;
                });
                const callbackName = `${ name }Callback`;
                if (!polling && !window[callbackName]) {
                    window[callbackName] = () => Formio.libraries[name].resolve();
                }
                const plugin = _get(window, property);
                if (plugin) {
                    Formio.libraries[name].resolve(plugin);
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
                                async: true,
                                referrerpolicy: 'origin'
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
                        const element = document.createElement(elementType);
                        if (element.setAttribute) {
                            for (const attr in attrs) {
                                element.setAttribute(attr, attrs[attr]);
                            }
                        }
                        const {head} = document;
                        if (head) {
                            head.appendChild(element);
                        }
                    });
                    if (polling) {
                        const interval = setInterval(() => {
                            const plugin = _get(window, property);
                            if (plugin) {
                                clearInterval(interval);
                                Formio.libraries[name].resolve(plugin);
                            }
                        }, 200);
                    }
                }
            }
            return Formio.libraries[name].ready;
        }
        static libraryReady(name) {
            if (Formio.libraries.hasOwnProperty(name) && Formio.libraries[name].ready) {
                return Formio.libraries[name].ready;
            }
            return NativePromise.reject(`${ name } library was not required.`);
        }
    };
    Formio.libraries = {};
    Formio.Promise = NativePromise;
    Formio.fetch = fetch;
    Formio.Headers = Headers;
    Formio.baseUrl = 'https://api.form.io';
    Formio.projectUrl = Formio.baseUrl;
    Formio.authUrl = '';
    Formio.projectUrlSet = false;
    Formio.plugins = [];
    Formio.cache = {};
    Formio.Providers = Providers;
    Formio.version = '---VERSION---';
    Formio.events = new EventEmitter({
        wildcard: false,
        maxListeners: 0
    });
    if (typeof global === 'object' && !global.Formio) {
        global.Formio = Formio;
    }
    if (typeof window === 'object' && !window.Formio) {
        window.Formio = Formio;
    }


    return Formio;
});