define([
    './EventEmitter',
    './Formio',
    './utils/utils',
    'i18next',
    'lodash',
    'moment',
    'vanilla-text-mask'
], function (EventEmitter, Formio, FormioUtils, i18next, _, moment, maskInput) {
    'use strict';
    return class Component {
        constructor(options, id) {
            this.options = _.assign({
                language: 'en',
                highlightErrors: true,
                row: '',
                namespace: 'formio'
            }, options || {});
            this.id = id || FormioUtils.getRandomComponentId();
            this.eventHandlers = [];
            this.i18next = this.options.i18next || i18next;
            this.events = options && options.events ? options.events : new EventEmitter({
                wildcard: false,
                maxListeners: 0
            });
            this.inputMasks = [];
        }
        on(event, cb, internal) {
            if (!this.events) {
                return;
            }
            const type = `${ this.options.namespace }.${ event }`;
            cb.id = this.id;
            cb.internal = internal;
            return this.events.on(type, cb);
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
        removeEventListener(obj, type) {
            const indexes = [];
            _.each(this.eventHandlers, (handler, index) => {
                if (handler.id === this.id && obj.removeEventListener && handler.type === type) {
                    obj.removeEventListener(type, handler.func);
                    indexes.push(index);
                }
            });
            if (indexes.length) {
                _.pullAt(this.eventHandlers, indexes);
            }
            return this;
        }
        destroy() {
            _.each(this.events._events, (events, type) => {
                _.each(events, listener => {
                    if (listener && this.id === listener.id && listener.internal) {
                        this.events.off(type, listener);
                    }
                });
            });
            _.each(this.eventHandlers, handler => {
                if (this.id === handler.id && handler.type && handler.obj && handler.obj.removeEventListener) {
                    handler.obj.removeEventListener(handler.type, handler.func);
                }
            });
            this.inputMasks.forEach(mask => mask.destroy());
            this.inputMasks = [];
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
                this._inputMask = mask;
                try {
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
                if (input.mask) {
                    this.inputMasks.push(input.mask);
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
                return;
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
            if (!element) {
                return this;
            }
            const classes = element.getAttribute('class');
            if (classes) {
                element.setAttribute('class', classes.replace(new RegExp(` ${ className }`, 'g'), ''));
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
        iconClass(name, spinning) {
            if (!this.options.icons || this.options.icons === 'glyphicon') {
                return spinning ? `glyphicon glyphicon-${ name } glyphicon-spin` : `glyphicon glyphicon-${ name }`;
            }
            switch (name) {
            case 'save':
                return 'fa fa-download';
            case 'zoom-in':
                return 'fa fa-search-plus';
            case 'zoom-out':
                return 'fa fa-search-minus';
            case 'question-sign':
                return 'fa fa-question-circle';
            case 'remove-circle':
                return 'fa fa-times-circle-o';
            case 'new-window':
                return 'fa fa-window-restore';
            case 'menu-hamburger':
                return 'fa fa-bars';
            default:
                return spinning ? `fa fa-${ name } fa-spin` : `fa fa-${ name }`;
            }
        }
        getIcon(name) {
            return this.ce('i', { class: this.iconClass(name) });
        }
        evalContext(additional) {
            return Object.assign({
                _,
                utils: FormioUtils,
                util: FormioUtils,
                user: Formio.getUser(),
                moment,
                instance: this
            }, additional);
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