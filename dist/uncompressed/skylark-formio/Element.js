define([
    './EventEmitter',
    './Formio',
    './utils/utils',
    'skylark-i18next',
    'skylark-lodash',
    'skylark-moment',
    './vendors/vanilla-text-mask/maskInput'
], function (EventEmitter, Formio, FormioUtils, i18next, _, moment, maskInput) {
    'use strict';
    return class Element {
        constructor(options) {
            this.options = Object.assign({
                language: 'en',
                highlightErrors: true,
                componentErrorClass: 'formio-error-wrapper',
                componentWarningClass: 'formio-warning-wrapper',
                row: '',
                namespace: 'formio'
            }, options || {});
            this.id = FormioUtils.getRandomComponentId();
            this.eventHandlers = [];
            this.i18next = this.options.i18next || i18next;
            this.events = options && options.events ? options.events : new EventEmitter({
                wildcard: false,
                maxListeners: 0
            });
            this.defaultMask = null;
        }
        on(event, cb, internal, once = false) {
            if (!this.events) {
                return;
            }
            const type = `${ this.options.namespace }.${ event }`;
            cb.id = this.id;
            cb.internal = internal;
            return this.events[once ? 'once' : 'on'](type, cb);
        }
        once(event, cb, internal) {
            return this.on(event, cb, internal, true);
        }
        onAny(cb) {
            if (!this.events) {
                return;
            }
            return this.events.onAny(cb);
        }
        off(event) {
            if (!this.events) {
                return;
            }
            const type = `${ this.options.namespace }.${ event }`;
            _.each(this.events.listeners(type), listener => {
                if (listener && listener.id === this.id) {
                    this.events.off(type, listener);
                }
            });
        }
        emit(event, ...data) {
            if (this.events) {
                this.events.emit(`${ this.options.namespace }.${ event }`, ...data);
            }
        }
        addEventListener(obj, type, func, persistent) {
            if (!obj) {
                return;
            }
            if (!persistent) {
                this.eventHandlers.push({
                    id: this.id,
                    obj,
                    type,
                    func
                });
            }
            if ('addEventListener' in obj) {
                obj.addEventListener(type, func, false);
            } else if ('attachEvent' in obj) {
                obj.attachEvent(`on${ type }`, func);
            }
            return this;
        }
        removeEventListener(obj, type, func = null) {
            const indexes = [];
            this.eventHandlers.forEach((handler, index) => {
                if (handler.id === this.id && obj.removeEventListener && handler.type === type && (!func || handler.func === func)) {
                    obj.removeEventListener(type, handler.func);
                    indexes.push(index);
                }
            });
            if (indexes.length) {
                _.pullAt(this.eventHandlers, indexes);
            }
            return this;
        }
        removeEventListeners() {
            this.eventHandlers.forEach(handler => {
                if (this.id === handler.id && handler.type && handler.obj && handler.obj.removeEventListener) {
                    handler.obj.removeEventListener(handler.type, handler.func);
                }
            });
            this.eventHandlers = [];
        }
        removeAllEvents(includeExternal) {
            _.each(this.events._events, (events, type) => {
                _.each(events, listener => {
                    if (listener && this.id === listener.id && (includeExternal || listener.internal)) {
                        this.events.off(type, listener);
                    }
                });
            });
        }
        destroy() {
            this.removeEventListeners();
            this.removeAllEvents();
        }
        appendTo(element, container) {
            container.appendChild(element);
            return this;
        }
        prependTo(element, container) {
            if (container) {
                if (container.firstChild) {
                    try {
                        container.insertBefore(element, container.firstChild);
                    } catch (err) {
                        console.warn(err);
                        container.appendChild(element);
                    }
                } else {
                    container.appendChild(element);
                }
            }
            return this;
        }
        removeChildFrom(element, container) {
            if (container && container.contains(element)) {
                try {
                    container.removeChild(element);
                } catch (err) {
                    console.warn(err);
                }
            }
            return this;
        }
        ce(type, attr, children = null) {
            const element = document.createElement(type);
            if (attr) {
                this.attr(element, attr);
            }
            this.appendChild(element, children);
            return element;
        }
        appendChild(element, child) {
            if (Array.isArray(child)) {
                child.forEach(oneChild => this.appendChild(element, oneChild));
            } else if (child instanceof HTMLElement || child instanceof Text) {
                element.appendChild(child);
            } else if (child) {
                element.appendChild(this.text(child.toString()));
            }
            return this;
        }
        maskPlaceholder(mask) {
            return mask.map(char => char instanceof RegExp ? '_' : char).join('');
        }
        setInputMask(input, inputMask, placeholder) {
            if (input && inputMask) {
                const mask = FormioUtils.getInputMask(inputMask);
                this.defaultMask = mask;
                try {
                    if (input.mask) {
                        input.mask.destroy();
                    }
                    input.mask = maskInput({
                        inputElement: input,
                        mask
                    });
                } catch (e) {
                    console.warn(e);
                }
                if (mask.numeric) {
                    input.setAttribute('pattern', '\\d*');
                }
                if (placeholder) {
                    input.setAttribute('placeholder', this.maskPlaceholder(mask));
                }
            }
        }
        t(text, params) {
            params = params || {};
            params.nsSeparator = '::';
            params.keySeparator = '.|.';
            params.pluralSeparator = '._.';
            params.contextSeparator = '._.';
            const translated = this.i18next.t(text, params);
            return translated || text;
        }
        text(text) {
            return document.createTextNode(this.t(text));
        }
        attr(element, attr) {
            if (!element) {
                return;
            }
            _.each(attr, (value, key) => {
                if (typeof value !== 'undefined') {
                    if (key.indexOf('on') === 0) {
                        this.addEventListener(element, key.substr(2).toLowerCase(), value);
                    } else {
                        element.setAttribute(key, value);
                    }
                }
            });
        }
        hasClass(element, className) {
            if (!element) {
                return false;
            }
            className = ` ${ className } `;
            return ` ${ element.className } `.replace(/[\n\t\r]/g, ' ').indexOf(className) > -1;
        }
        addClass(element, className) {
            if (!element) {
                return this;
            }
            const classes = element.getAttribute('class');
            if (!classes.includes(className)) {
                element.setAttribute('class', `${ classes } ${ className }`);
            }
            return this;
        }
        removeClass(element, className) {
            if (!element || !className) {
                return this;
            }
            let cls = element.getAttribute('class');
            if (cls) {
                cls = cls.replace(new RegExp(` ${ className }`, 'g'), '');
                element.setAttribute('class', cls);
            }
            return this;
        }
        empty(element) {
            if (element) {
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
            }
        }
        evalContext(additional) {
            return Object.assign({
                _,
                utils: FormioUtils,
                util: FormioUtils,
                user: Formio.getUser(),
                moment,
                instance: this,
                self: this,
                token: Formio.getToken({ decode: true }),
                config: this.root && this.root.form && this.root.form.config ? this.root.form.config : {}
            }, additional, _.get(this.root, 'options.evalContext', {}));
        }
        interpolate(string, data) {
            return FormioUtils.interpolate(string, this.evalContext(data));
        }
        evaluate(func, args, ret, tokenize) {
            return FormioUtils.evaluate(func, this.evalContext(args), ret, tokenize);
        }
        hook() {
            const name = arguments[0];
            if (this.options && this.options.hooks && this.options.hooks[name]) {
                return this.options.hooks[name].apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                const fn = typeof arguments[arguments.length - 1] === 'function' ? arguments[arguments.length - 1] : null;
                if (fn) {
                    return fn(null, arguments[1]);
                } else {
                    return arguments[1];
                }
            }
        }
    };
});