/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-formio/vendors/getify/npo',[],function(){
	return Promise;
});
define('skylark-formio/vendors/fetch-ponyfill/fetch',[],function(){

  var self = window;

  function fetchPonyfill(options) {
    var Promise = options && options.Promise || self.Promise;
    var XMLHttpRequest = options && options.XMLHttpRequest || self.XMLHttpRequest;
    var global = self;

    return (function () {
      var self = Object.create(global, {
        fetch: {
          value: undefined,
          writable: true
        }
      });

      (function(self) {
        'use strict';

        if (self.fetch) {
          return
        }

        var support = {
          searchParams: 'URLSearchParams' in self,
          iterable: 'Symbol' in self && 'iterator' in Symbol,
          blob: 'FileReader' in self && 'Blob' in self && (function() {
            try {
              new Blob()
              return true
            } catch(e) {
              return false
            }
          })(),
          formData: 'FormData' in self,
          arrayBuffer: 'ArrayBuffer' in self
        }

        if (support.arrayBuffer) {
          var viewClasses = [
            '[object Int8Array]',
            '[object Uint8Array]',
            '[object Uint8ClampedArray]',
            '[object Int16Array]',
            '[object Uint16Array]',
            '[object Int32Array]',
            '[object Uint32Array]',
            '[object Float32Array]',
            '[object Float64Array]'
          ]

          var isDataView = function(obj) {
            return obj && DataView.prototype.isPrototypeOf(obj)
          }

          var isArrayBufferView = ArrayBuffer.isView || function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1
          }
        }

        function normalizeName(name) {
          if (typeof name !== 'string') {
            name = String(name)
          }
          if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
            throw new TypeError('Invalid character in header field name')
          }
          return name.toLowerCase()
        }

        function normalizeValue(value) {
          if (typeof value !== 'string') {
            value = String(value)
          }
          return value
        }

        // Build a destructive iterator for the value list
        function iteratorFor(items) {
          var iterator = {
            next: function() {
              var value = items.shift()
              return {done: value === undefined, value: value}
            }
          }

          if (support.iterable) {
            iterator[Symbol.iterator] = function() {
              return iterator
            }
          }

          return iterator
        }

        function Headers(headers) {
          this.map = {}

          if (headers instanceof Headers) {
            headers.forEach(function(value, name) {
              this.append(name, value)
            }, this)
          } else if (Array.isArray(headers)) {
            headers.forEach(function(header) {
              this.append(header[0], header[1])
            }, this)
          } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
              this.append(name, headers[name])
            }, this)
          }
        }

        Headers.prototype.append = function(name, value) {
          name = normalizeName(name)
          value = normalizeValue(value)
          var oldValue = this.map[name]
          this.map[name] = oldValue ? oldValue+','+value : value
        }

        Headers.prototype['delete'] = function(name) {
          delete this.map[normalizeName(name)]
        }

        Headers.prototype.get = function(name) {
          name = normalizeName(name)
          return this.has(name) ? this.map[name] : null
        }

        Headers.prototype.has = function(name) {
          return this.map.hasOwnProperty(normalizeName(name))
        }

        Headers.prototype.set = function(name, value) {
          this.map[normalizeName(name)] = normalizeValue(value)
        }

        Headers.prototype.forEach = function(callback, thisArg) {
          for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
              callback.call(thisArg, this.map[name], name, this)
            }
          }
        }

        Headers.prototype.keys = function() {
          var items = []
          this.forEach(function(value, name) { items.push(name) })
          return iteratorFor(items)
        }

        Headers.prototype.values = function() {
          var items = []
          this.forEach(function(value) { items.push(value) })
          return iteratorFor(items)
        }

        Headers.prototype.entries = function() {
          var items = []
          this.forEach(function(value, name) { items.push([name, value]) })
          return iteratorFor(items)
        }

        if (support.iterable) {
          Headers.prototype[Symbol.iterator] = Headers.prototype.entries
        }

        function consumed(body) {
          if (body.bodyUsed) {
            return Promise.reject(new TypeError('Already read'))
          }
          body.bodyUsed = true
        }

        function fileReaderReady(reader) {
          return new Promise(function(resolve, reject) {
            reader.onload = function() {
              resolve(reader.result)
            }
            reader.onerror = function() {
              reject(reader.error)
            }
          })
        }

        function readBlobAsArrayBuffer(blob) {
          var reader = new FileReader()
          var promise = fileReaderReady(reader)
          reader.readAsArrayBuffer(blob)
          return promise
        }

        function readBlobAsText(blob) {
          var reader = new FileReader()
          var promise = fileReaderReady(reader)
          reader.readAsText(blob)
          return promise
        }

        function readArrayBufferAsText(buf) {
          var view = new Uint8Array(buf)
          var chars = new Array(view.length)

          for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i])
          }
          return chars.join('')
        }

        function bufferClone(buf) {
          if (buf.slice) {
            return buf.slice(0)
          } else {
            var view = new Uint8Array(buf.byteLength)
            view.set(new Uint8Array(buf))
            return view.buffer
          }
        }

        function Body() {
          this.bodyUsed = false

          this._initBody = function(body) {
            this._bodyInit = body
            if (!body) {
              this._bodyText = ''
            } else if (typeof body === 'string') {
              this._bodyText = body
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
              this._bodyBlob = body
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
              this._bodyFormData = body
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this._bodyText = body.toString()
            } else if (support.arrayBuffer && support.blob && isDataView(body)) {
              this._bodyArrayBuffer = bufferClone(body.buffer)
              // IE 10-11 can't handle a DataView body.
              this._bodyInit = new Blob([this._bodyArrayBuffer])
            } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
              this._bodyArrayBuffer = bufferClone(body)
            } else {
              throw new Error('unsupported BodyInit type')
            }

            if (!this.headers.get('content-type')) {
              if (typeof body === 'string') {
                this.headers.set('content-type', 'text/plain;charset=UTF-8')
              } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set('content-type', this._bodyBlob.type)
              } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
              }
            }
          }

          if (support.blob) {
            this.blob = function() {
              var rejected = consumed(this)
              if (rejected) {
                return rejected
              }

              if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob)
              } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]))
              } else if (this._bodyFormData) {
                throw new Error('could not read FormData body as blob')
              } else {
                return Promise.resolve(new Blob([this._bodyText]))
              }
            }

            this.arrayBuffer = function() {
              if (this._bodyArrayBuffer) {
                return consumed(this) || Promise.resolve(this._bodyArrayBuffer)
              } else {
                return this.blob().then(readBlobAsArrayBuffer)
              }
            }
          }

          this.text = function() {
            var rejected = consumed(this)
            if (rejected) {
              return rejected
            }

            if (this._bodyBlob) {
              return readBlobAsText(this._bodyBlob)
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))
            } else if (this._bodyFormData) {
              throw new Error('could not read FormData body as text')
            } else {
              return Promise.resolve(this._bodyText)
            }
          }

          if (support.formData) {
            this.formData = function() {
              return this.text().then(decode)
            }
          }

          this.json = function() {
            return this.text().then(JSON.parse)
          }

          return this
        }

        // HTTP methods whose capitalization should be normalized
        var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

        function normalizeMethod(method) {
          var upcased = method.toUpperCase()
          return (methods.indexOf(upcased) > -1) ? upcased : method
        }

        function Request(input, options) {
          options = options || {}
          var body = options.body

          if (input instanceof Request) {
            if (input.bodyUsed) {
              throw new TypeError('Already read')
            }
            this.url = input.url
            this.credentials = input.credentials
            if (!options.headers) {
              this.headers = new Headers(input.headers)
            }
            this.method = input.method
            this.mode = input.mode
            if (!body && input._bodyInit != null) {
              body = input._bodyInit
              input.bodyUsed = true
            }
          } else {
            this.url = String(input)
          }

          this.credentials = options.credentials || this.credentials || 'omit'
          if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers)
          }
          this.method = normalizeMethod(options.method || this.method || 'GET')
          this.mode = options.mode || this.mode || null
          this.referrer = null

          if ((this.method === 'GET' || this.method === 'HEAD') && body) {
            throw new TypeError('Body not allowed for GET or HEAD requests')
          }
          this._initBody(body)
        }

        Request.prototype.clone = function() {
          return new Request(this, { body: this._bodyInit })
        }

        function decode(body) {
          var form = new FormData()
          body.trim().split('&').forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split('=')
              var name = split.shift().replace(/\+/g, ' ')
              var value = split.join('=').replace(/\+/g, ' ')
              form.append(decodeURIComponent(name), decodeURIComponent(value))
            }
          })
          return form
        }

        function parseHeaders(rawHeaders) {
          var headers = new Headers()
          rawHeaders.split(/\r?\n/).forEach(function(line) {
            var parts = line.split(':')
            var key = parts.shift().trim()
            if (key) {
              var value = parts.join(':').trim()
              headers.append(key, value)
            }
          })
          return headers
        }

        Body.call(Request.prototype)

        function Response(bodyInit, options) {
          if (!options) {
            options = {}
          }

          this.type = 'default'
          this.status = 'status' in options ? options.status : 200
          this.ok = this.status >= 200 && this.status < 300
          this.statusText = 'statusText' in options ? options.statusText : 'OK'
          this.headers = new Headers(options.headers)
          this.url = options.url || ''
          this._initBody(bodyInit)
        }

        Body.call(Response.prototype)

        Response.prototype.clone = function() {
          return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
          })
        }

        Response.error = function() {
          var response = new Response(null, {status: 0, statusText: ''})
          response.type = 'error'
          return response
        }

        var redirectStatuses = [301, 302, 303, 307, 308]

        Response.redirect = function(url, status) {
          if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError('Invalid status code')
          }

          return new Response(null, {status: status, headers: {location: url}})
        }

        self.Headers = Headers
        self.Request = Request
        self.Response = Response

        self.fetch = function(input, init) {
          return new Promise(function(resolve, reject) {
            var request = new Request(input, init)
            var xhr = new XMLHttpRequest()

            xhr.onload = function() {
              var options = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders() || '')
              }
              options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')
              var body = 'response' in xhr ? xhr.response : xhr.responseText
              resolve(new Response(body, options))
            }

            xhr.onerror = function() {
              reject(new TypeError('Network request failed'))
            }

            xhr.ontimeout = function() {
              reject(new TypeError('Network request failed'))
            }

            xhr.open(request.method, request.url, true)

            if (request.credentials === 'include') {
              xhr.withCredentials = true
            }

            if ('responseType' in xhr && support.blob) {
              xhr.responseType = 'blob'
            }

            request.headers.forEach(function(value, name) {
              xhr.setRequestHeader(name, value)
            })

            xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
          })
        }
        self.fetch.polyfill = true
      })(typeof self !== 'undefined' ? self : this);


      return {
        fetch: self.fetch,
        Headers: self.Headers,
        Request: self.Request,
        Response: self.Response
      };
    }());
  }

  return fetchPonyfill;
});

/*!
 * EventEmitter2
 * https://github.com/hij1nx/EventEmitter2
 *
 * Copyright (c) 2013 hij1nx
 * Licensed under the MIT license.
 */
define('skylark-formio/vendors/eventemitter2/EventEmitter2',[],function() {
  var hasOwnProperty= Object.hasOwnProperty;
  var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  };
  var defaultMaxListeners = 10;
  var nextTickSupported= typeof process=='object' && typeof process.nextTick=='function';
  var symbolsSupported= typeof Symbol==='function';
  var reflectSupported= typeof Reflect === 'object';
  var setImmediateSupported= typeof setImmediate === 'function';
  var _setImmediate= setImmediateSupported ? setImmediate : setTimeout;
  var ownKeys= symbolsSupported? (reflectSupported && typeof Reflect.ownKeys==='function'? Reflect.ownKeys : function(obj){
    var arr= Object.getOwnPropertyNames(obj);
    arr.push.apply(arr, Object.getOwnPropertySymbols(obj));
    return arr;
  }) : Object.keys;

  function init() {
    this._events = {};
    if (this._conf) {
      configure.call(this, this._conf);
    }
  }

  function configure(conf) {
    if (conf) {
      this._conf = conf;

      conf.delimiter && (this.delimiter = conf.delimiter);

      if(conf.maxListeners!==undefined){
          this._maxListeners= conf.maxListeners;
      }

      conf.wildcard && (this.wildcard = conf.wildcard);
      conf.newListener && (this._newListener = conf.newListener);
      conf.removeListener && (this._removeListener = conf.removeListener);
      conf.verboseMemoryLeak && (this.verboseMemoryLeak = conf.verboseMemoryLeak);
      conf.ignoreErrors && (this.ignoreErrors = conf.ignoreErrors);

      if (this.wildcard) {
        this.listenerTree = {};
      }
    }
  }

  function logPossibleMemoryLeak(count, eventName) {
    var errorMsg = '(node) warning: possible EventEmitter memory ' +
        'leak detected. ' + count + ' listeners added. ' +
        'Use emitter.setMaxListeners() to increase limit.';

    if(this.verboseMemoryLeak){
      errorMsg += ' Event name: ' + eventName + '.';
    }

    if(typeof process !== 'undefined' && process.emitWarning){
      var e = new Error(errorMsg);
      e.name = 'MaxListenersExceededWarning';
      e.emitter = this;
      e.count = count;
      process.emitWarning(e);
    } else {
      console.error(errorMsg);

      if (console.trace){
        console.trace();
      }
    }
  }

  var toArray = function (a, b, c) {
    var n = arguments.length;
    switch (n) {
      case 0:
        return [];
      case 1:
        return [a];
      case 2:
        return [a, b];
      case 3:
        return [a, b, c];
      default:
        var arr = new Array(n);
        while (n--) {
          arr[n] = arguments[n];
        }
        return arr;
    }
  };

  function toObject(keys, values) {
    var obj = {};
    var key;
    var len = keys.length;
    var valuesCount = values ? value.length : 0;
    for (var i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = i < valuesCount ? values[i] : undefined;
    }
    return obj;
  }

  function TargetObserver(emitter, target, options) {
    this._emitter = emitter;
    this._target = target;
    this._listeners = {};
    this._listenersCount = 0;

    var on, off;

    if (options.on || options.off) {
      on = options.on;
      off = options.off;
    }

    if (target.addEventListener) {
      on = target.addEventListener;
      off = target.removeEventListener;
    } else if (target.addListener) {
      on = target.addListener;
      off = target.removeListener;
    } else if (target.on) {
      on = target.on;
      off = target.off;
    }

    if (!on && !off) {
      throw Error('target does not implement any known event API');
    }

    if (typeof on !== 'function') {
      throw TypeError('on method must be a function');
    }

    if (typeof off !== 'function') {
      throw TypeError('off method must be a function');
    }

    this._on = on;
    this._off = off;

    var _observers= emitter._observers;
    if(_observers){
      _observers.push(this);
    }else{
      emitter._observers= [this];
    }
  }

  Object.assign(TargetObserver.prototype, {
    subscribe: function(event, localEvent, reducer){
      var observer= this;
      var target= this._target;
      var emitter= this._emitter;
      var listeners= this._listeners;
      var handler= function(){
        var args= toArray.apply(null, arguments);
        var eventObj= {
          data: args,
          name: localEvent,
          original: event
        };
        if(reducer){
          var result= reducer.call(target, eventObj);
          if(result!==false){
            emitter.emit.apply(emitter, [eventObj.name].concat(args))
          }
          return;
        }
        emitter.emit.apply(emitter, [localEvent].concat(args));
      };


      if(listeners[event]){
        throw Error('Event \'' + event + '\' is already listening');
      }

      this._listenersCount++;

      if(emitter._newListener && emitter._removeListener && !observer._onNewListener){

        this._onNewListener = function (_event) {
          if (_event === localEvent && listeners[event] === null) {
            listeners[event] = handler;
            observer._on.call(target, event, handler);
          }
        };

        emitter.on('newListener', this._onNewListener);

        this._onRemoveListener= function(_event){
          if(_event === localEvent && !emitter.hasListeners(_event) && listeners[event]){
            listeners[event]= null;
            observer._off.call(target, event, handler);
          }
        };

        listeners[event]= null;

        emitter.on('removeListener', this._onRemoveListener);
      }else{
        listeners[event]= handler;
        observer._on.call(target, event, handler);
      }
    },

    unsubscribe: function(event){
      var observer= this;
      var listeners= this._listeners;
      var emitter= this._emitter;
      var handler;
      var events;
      var off= this._off;
      var target= this._target;
      var i;

      if(event && typeof event!=='string'){
        throw TypeError('event must be a string');
      }

      function clearRefs(){
        if(observer._onNewListener){
          emitter.off('newListener', observer._onNewListener);
          emitter.off('removeListener', observer._onRemoveListener);
          observer._onNewListener= null;
          observer._onRemoveListener= null;
        }
        var index= findTargetIndex.call(emitter, observer);
        emitter._observers.splice(index, 1);
      }

      if(event){
        handler= listeners[event];
        if(!handler) return;
        off.call(target, event, handler);
        delete listeners[event];
        if(!--this._listenersCount){
          clearRefs();
        }
      }else{
        events= ownKeys(listeners);
        i= events.length;
        while(i-->0){
          event= events[i];
          off.call(target, event, listeners[event]);
        }
        this._listeners= {};
        this._listenersCount= 0;
        clearRefs();
      }
    }
  });

  function resolveOptions(options, schema, reducers, allowUnknown) {
    var computedOptions = Object.assign({}, schema);

    if (!options) return computedOptions;

    if (typeof options !== 'object') {
      throw TypeError('options must be an object')
    }

    var keys = Object.keys(options);
    var length = keys.length;
    var option, value;
    var reducer;

    function reject(reason) {
      throw Error('Invalid "' + option + '" option value' + (reason ? '. Reason: ' + reason : ''))
    }

    for (var i = 0; i < length; i++) {
      option = keys[i];
      if (!allowUnknown && !hasOwnProperty.call(schema, option)) {
        throw Error('Unknown "' + option + '" option');
      }
      value = options[option];
      if (value !== undefined) {
        reducer = reducers[option];
        computedOptions[option] = reducer ? reducer(value, reject) : value;
      }
    }
    return computedOptions;
  }

  function constructorReducer(value, reject) {
    if (typeof value !== 'function' || !value.hasOwnProperty('prototype')) {
      reject('value must be a constructor');
    }
    return value;
  }

  function makeTypeReducer(types) {
    var message= 'value must be type of ' + types.join('|');
    var len= types.length;
    var firstType= types[0];
    var secondType= types[1];

    if (len === 1) {
      return function (v, reject) {
        if (typeof v === firstType) {
          return v;
        }
        reject(message);
      }
    }

    if (len === 2) {
      return function (v, reject) {
        var kind= typeof v;
        if (kind === firstType || kind === secondType) return v;
        reject(message);
      }
    }

    return function (v, reject) {
      var kind = typeof v;
      var i = len;
      while (i-- > 0) {
        if (kind === types[i]) return v;
      }
      reject(message);
    }
  }

  var functionReducer= makeTypeReducer(['function']);

  var objectFunctionReducer= makeTypeReducer(['object', 'function']);

  function makeCancelablePromise(Promise, executor, options) {
    var isCancelable;
    var callbacks;
    var timer= 0;
    var subscriptionClosed;

    var promise = new Promise(function (resolve, reject, onCancel) {
      options= resolveOptions(options, {
        timeout: 0,
        overload: false
      }, {
        timeout: function(value, reject){
          value*= 1;
          if (typeof value !== 'number' || value < 0 || !Number.isFinite(value)) {
            reject('timeout must be a positive number');
          }
          return value;
        }
      });

      isCancelable = !options.overload && typeof Promise.prototype.cancel === 'function' && typeof onCancel === 'function';

      function cleanup() {
        if (callbacks) {
          callbacks = null;
        }
        if (timer) {
          clearTimeout(timer);
          timer = 0;
        }
      }

      var _resolve= function(value){
        cleanup();
        resolve(value);
      };

      var _reject= function(err){
        cleanup();
        reject(err);
      };

      if (isCancelable) {
        executor(_resolve, _reject, onCancel);
      } else {
        callbacks = [function(reason){
          _reject(reason || Error('canceled'));
        }];
        executor(_resolve, _reject, function (cb) {
          if (subscriptionClosed) {
            throw Error('Unable to subscribe on cancel event asynchronously')
          }
          if (typeof cb !== 'function') {
            throw TypeError('onCancel callback must be a function');
          }
          callbacks.push(cb);
        });
        subscriptionClosed= true;
      }

      if (options.timeout > 0) {
        timer= setTimeout(function(){
          var reason= Error('timeout');
          timer= 0;
          promise.cancel(reason);
          reject(reason);
        }, options.timeout);
      }
    });

    if (!isCancelable) {
      promise.cancel = function (reason) {
        if (!callbacks) {
          return;
        }
        var length = callbacks.length;
        for (var i = 1; i < length; i++) {
          callbacks[i](reason);
        }
        // internal callback to reject the promise
        callbacks[0](reason);
        callbacks = null;
      };
    }

    return promise;
  }

  function findTargetIndex(observer) {
    var observers = this._observers;
    if(!observers){
      return -1;
    }
    var len = observers.length;
    for (var i = 0; i < len; i++) {
      if (observers[i]._target === observer) return i;
    }
    return -1;
  }

  // Attention, function return type now is array, always !
  // It has zero elements if no any matches found and one or more
  // elements (leafs) if there are matches
  //
  function searchListenerTree(handlers, type, tree, i, typeLength) {
    if (!tree) {
      return null;
    }

    if (i === 0) {
      var kind = typeof type;
      if (kind === 'string') {
        var ns, n, l = 0, j = 0, delimiter = this.delimiter, dl = delimiter.length;
        if ((n = type.indexOf(delimiter)) !== -1) {
          ns = new Array(5);
          do {
            ns[l++] = type.slice(j, n);
            j = n + dl;
          } while ((n = type.indexOf(delimiter, j)) !== -1);

          ns[l++] = type.slice(j);
          type = ns;
          typeLength = l;
        } else {
          type = [type];
          typeLength = 1;
        }
      } else if (kind === 'object') {
        typeLength = type.length;
      } else {
        type = [type];
        typeLength = 1;
      }
    }

    var listeners= null, branch, xTree, xxTree, isolatedBranch, endReached, currentType = type[i],
        nextType = type[i + 1], branches, _listeners;

    if (i === typeLength && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return [tree];
      } else {
        handlers && handlers.push.apply(handlers, tree._listeners);
        return [tree];
      }
    }

    if (currentType === '*') {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      branches= ownKeys(tree);
      n= branches.length;
      while(n-->0){
        branch= branches[n];
        if (branch !== '_listeners') {
          _listeners = searchListenerTree(handlers, type, tree[branch], i + 1, typeLength);
          if(_listeners){
            if(listeners){
              listeners.push.apply(listeners, _listeners);
            }else{
              listeners = _listeners;
            }
          }
        }
      }
      return listeners;
    } else if (currentType === '**') {
      endReached = (i + 1 === typeLength || (i + 2 === typeLength && nextType === '*'));
      if (endReached && tree._listeners) {
        // The next element has a _listeners, add it to the handlers.
        listeners = searchListenerTree(handlers, type, tree, typeLength, typeLength);
      }

      branches= ownKeys(tree);
      n= branches.length;
      while(n-->0){
        branch= branches[n];
        if (branch !== '_listeners') {
          if (branch === '*' || branch === '**') {
            if (tree[branch]._listeners && !endReached) {
              _listeners = searchListenerTree(handlers, type, tree[branch], typeLength, typeLength);
              if(_listeners){
                if(listeners){
                  listeners.push.apply(listeners, _listeners);
                }else{
                  listeners = _listeners;
                }
              }
            }
            _listeners = searchListenerTree(handlers, type, tree[branch], i, typeLength);
          } else if (branch === nextType) {
            _listeners = searchListenerTree(handlers, type, tree[branch], i + 2, typeLength);
          } else {
            // No match on this one, shift into the tree but not in the type array.
            _listeners = searchListenerTree(handlers, type, tree[branch], i, typeLength);
          }
          if(_listeners){
            if(listeners){
              listeners.push.apply(listeners, _listeners);
            }else{
              listeners = _listeners;
            }
          }
        }
      }
      return listeners;
    }else if (tree[currentType]) {
      listeners= searchListenerTree(handlers, type, tree[currentType], i + 1, typeLength);
    }

      xTree = tree['*'];
    if (xTree) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, xTree, i + 1, typeLength);
    }

    xxTree = tree['**'];
    if (xxTree) {
      if (i < typeLength) {
        if (xxTree._listeners) {
          // If we have a listener on a '**', it will catch all, so add its handler.
          searchListenerTree(handlers, type, xxTree, typeLength, typeLength);
        }

        // Build arrays of matching next branches and others.
        branches= ownKeys(xxTree);
        n= branches.length;
        while(n-->0){
          branch= branches[n];
          if (branch !== '_listeners') {
            if (branch === nextType) {
              // We know the next element will match, so jump twice.
              searchListenerTree(handlers, type, xxTree[branch], i + 2, typeLength);
            } else if (branch === currentType) {
              // Current node matches, move into the tree.
              searchListenerTree(handlers, type, xxTree[branch], i + 1, typeLength);
            } else {
              isolatedBranch = {};
              isolatedBranch[branch] = xxTree[branch];
              searchListenerTree(handlers, type, {'**': isolatedBranch}, i + 1, typeLength);
            }
          }
        }
      } else if (xxTree._listeners) {
        // We have reached the end and still on a '**'
        searchListenerTree(handlers, type, xxTree, typeLength, typeLength);
      } else if (xxTree['*'] && xxTree['*']._listeners) {
        searchListenerTree(handlers, type, xxTree['*'], typeLength, typeLength);
      }
    }

    return listeners;
  }

  function growListenerTree(type, listener) {
    var len = 0, j = 0, i, delimiter = this.delimiter, dl= delimiter.length, ns;

    if(typeof type==='string') {
      if ((i = type.indexOf(delimiter)) !== -1) {
        ns = new Array(5);
        do {
          ns[len++] = type.slice(j, i);
          j = i + dl;
        } while ((i = type.indexOf(delimiter, j)) !== -1);

        ns[len++] = type.slice(j);
      }else{
        ns= [type];
        len= 1;
      }
    }else{
      ns= type;
      len= type.length;
    }

    //
    // Looks for two consecutive '**', if so, don't add the event at all.
    //
    if (len > 1) {
      for (i = 0; i + 1 < len; i++) {
        if (ns[i] === '**' && ns[i + 1] === '**') {
          return;
        }
      }
    }



    var tree = this.listenerTree, name;

    for (i = 0; i < len; i++) {
      name = ns[i];

      tree = tree[name] || (tree[name] = {});

      if (i === len - 1) {
        if (!tree._listeners) {
          tree._listeners = listener;
        } else {
          if (typeof tree._listeners === 'function') {
            tree._listeners = [tree._listeners];
          }

          tree._listeners.push(listener);

          if (
              !tree._listeners.warned &&
              this._maxListeners > 0 &&
              tree._listeners.length > this._maxListeners
          ) {
            tree._listeners.warned = true;
            logPossibleMemoryLeak.call(this, tree._listeners.length, name);
          }
        }
        return true;
      }
    }

    return true;
  }

  function collectTreeEvents(tree, events, root, asArray){
     var branches= ownKeys(tree);
     var i= branches.length;
     var branch, branchName, path;
     var hasListeners= tree['_listeners'];
     var isArrayPath;

     while(i-->0){
         branchName= branches[i];

         branch= tree[branchName];

         if(branchName==='_listeners'){
             path= root;
         }else {
             path = root ? root.concat(branchName) : [branchName];
         }

         isArrayPath= asArray || typeof branchName==='symbol';

         hasListeners && events.push(isArrayPath? path : path.join(this.delimiter));

         if(typeof branch==='object'){
             collectTreeEvents.call(this, branch, events, path, isArrayPath);
         }
     }

     return events;
  }

  function recursivelyGarbageCollect(root) {
    var keys = ownKeys(root);
    var i= keys.length;
    var obj, key, flag;
    while(i-->0){
      key = keys[i];
      obj = root[key];

      if(obj){
          flag= true;
          if(key !== '_listeners' && !recursivelyGarbageCollect(obj)){
             delete root[key];
          }
      }
    }

    return flag;
  }

  function Listener(emitter, event, listener){
    this.emitter= emitter;
    this.event= event;
    this.listener= listener;
  }

  Listener.prototype.off= function(){
    this.emitter.off(this.event, this.listener);
    return this;
  };

  function setupListener(event, listener, options){
      if (options === true) {
        promisify = true;
      } else if (options === false) {
        async = true;
      } else {
        if (!options || typeof options !== 'object') {
          throw TypeError('options should be an object or true');
        }
        var async = options.async;
        var promisify = options.promisify;
        var nextTick = options.nextTick;
        var objectify = options.objectify;
      }

      if (async || nextTick || promisify) {
        var _listener = listener;
        var _origin = listener._origin || listener;

        if (nextTick && !nextTickSupported) {
          throw Error('process.nextTick is not supported');
        }

        if (promisify === undefined) {
          promisify = listener.constructor.name === 'AsyncFunction';
        }

        listener = function () {
          var args = arguments;
          var context = this;
          var event = this.event;

          return promisify ? (nextTick ? Promise.resolve() : new Promise(function (resolve) {
            _setImmediate(resolve);
          }).then(function () {
            context.event = event;
            return _listener.apply(context, args)
          })) : (nextTick ? process.nextTick : _setImmediate)(function () {
            context.event = event;
            _listener.apply(context, args)
          });
        };

        listener._async = true;
        listener._origin = _origin;
      }

    return [listener, objectify? new Listener(this, event, listener): this];
  }

  function EventEmitter(conf) {
    this._events = {};
    this._newListener = false;
    this._removeListener = false;
    this.verboseMemoryLeak = false;
    configure.call(this, conf);
  }

  EventEmitter.EventEmitter2 = EventEmitter; // backwards compatibility for exporting EventEmitter property

  EventEmitter.prototype.listenTo= function(target, events, options){
    if(typeof target!=='object'){
      throw TypeError('target musts be an object');
    }

    var emitter= this;

    options = resolveOptions(options, {
      on: undefined,
      off: undefined,
      reducers: undefined
    }, {
      on: functionReducer,
      off: functionReducer,
      reducers: objectFunctionReducer
    });

    function listen(events){
      if(typeof events!=='object'){
        throw TypeError('events must be an object');
      }

      var reducers= options.reducers;
      var index= findTargetIndex.call(emitter, target);
      var observer;

      if(index===-1){
        observer= new TargetObserver(emitter, target, options);
      }else{
        observer= emitter._observers[index];
      }

      var keys= ownKeys(events);
      var len= keys.length;
      var event;
      var isSingleReducer= typeof reducers==='function';

      for(var i=0; i<len; i++){
        event= keys[i];
        observer.subscribe(
            event,
            events[event] || event,
            isSingleReducer ? reducers : reducers && reducers[event]
        );
      }
    }

    isArray(events)?
        listen(toObject(events)) :
        (typeof events==='string'? listen(toObject(events.split(/\s+/))): listen(events));

    return this;
  };

  EventEmitter.prototype.stopListeningTo = function (target, event) {
    var observers = this._observers;

    if(!observers){
      return false;
    }

    var i = observers.length;
    var observer;
    var matched= false;

    if(target && typeof target!=='object'){
      throw TypeError('target should be an object');
    }

    while (i-- > 0) {
      observer = observers[i];
      if (!target || observer._target === target) {
        observer.unsubscribe(event);
        matched= true;
      }
    }

    return matched;
  };

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.delimiter = '.';

  EventEmitter.prototype.setMaxListeners = function(n) {
    if (n !== undefined) {
      this._maxListeners = n;
      if (!this._conf) this._conf = {};
      this._conf.maxListeners = n;
    }
  };

  EventEmitter.prototype.getMaxListeners = function() {
    return this._maxListeners;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn, options) {
    return this._once(event, fn, false, options);
  };

  EventEmitter.prototype.prependOnceListener = function(event, fn, options) {
    return this._once(event, fn, true, options);
  };

  EventEmitter.prototype._once = function(event, fn, prepend, options) {
    return this._many(event, 1, fn, prepend, options);
  };

  EventEmitter.prototype.many = function(event, ttl, fn, options) {
    return this._many(event, ttl, fn, false, options);
  };

  EventEmitter.prototype.prependMany = function(event, ttl, fn, options) {
    return this._many(event, ttl, fn, true, options);
  };

  EventEmitter.prototype._many = function(event, ttl, fn, prepend, options) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      return fn.apply(this, arguments);
    }

    listener._origin = fn;

    return this._on(event, listener, prepend, options);
  };

  EventEmitter.prototype.emit = function() {
    if (!this._events && !this._all) {
      return false;
    }

    this._events || init.call(this);

    var type = arguments[0], ns, wildcard= this.wildcard;
    var args,l,i,j, containsSymbol;

    if (type === 'newListener' && !this._newListener) {
      if (!this._events.newListener) {
        return false;
      }
    }

    if (wildcard) {
      ns= type;
      if(type!=='newListener' && type!=='removeListener'){
        if (typeof type === 'object') {
          l = type.length;
          if (symbolsSupported) {
            for (i = 0; i < l; i++) {
              if (typeof type[i] === 'symbol') {
                containsSymbol = true;
                break;
              }
            }
          }
          if (!containsSymbol) {
            type = type.join(this.delimiter);
          }
        }
      }
    }

    var al = arguments.length;
    var handler;

    if (this._all && this._all.length) {
      handler = this._all.slice();

      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this, type);
          break;
        case 2:
          handler[i].call(this, type, arguments[1]);
          break;
        case 3:
          handler[i].call(this, type, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, arguments);
        }
      }
    }

    if (wildcard) {
      handler = [];
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0, l);
    } else {
      handler = this._events[type];
      if (typeof handler === 'function') {
        this.event = type;
        switch (al) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          args = new Array(al - 1);
          for (j = 1; j < al; j++) args[j - 1] = arguments[j];
          handler.apply(this, args);
        }
        return true;
      } else if (handler) {
        // need to make copy of handlers because list can change in the middle
        // of emit call
        handler = handler.slice();
      }
    }

    if (handler && handler.length) {
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          handler[i].call(this);
          break;
        case 2:
          handler[i].call(this, arguments[1]);
          break;
        case 3:
          handler[i].call(this, arguments[1], arguments[2]);
          break;
        default:
          handler[i].apply(this, args);
        }
      }
      return true;
    } else if (!this.ignoreErrors && !this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
    }

    return !!this._all;
  };

  EventEmitter.prototype.emitAsync = function() {
    if (!this._events && !this._all) {
      return false;
    }

    this._events || init.call(this);

    var type = arguments[0], wildcard= this.wildcard, ns, containsSymbol;
    var args,l,i,j;

    if (type === 'newListener' && !this._newListener) {
        if (!this._events.newListener) { return Promise.resolve([false]); }
    }

    if (wildcard) {
      ns= type;
      if(type!=='newListener' && type!=='removeListener'){
        if (typeof type === 'object') {
          l = type.length;
          if (symbolsSupported) {
            for (i = 0; i < l; i++) {
              if (typeof type[i] === 'symbol') {
                containsSymbol = true;
                break;
              }
            }
          }
          if (!containsSymbol) {
            type = type.join(this.delimiter);
          }
        }
      }
    }

    var promises= [];

    var al = arguments.length;
    var handler;

    if (this._all) {
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(this._all[i].call(this, type));
          break;
        case 2:
          promises.push(this._all[i].call(this, type, arguments[1]));
          break;
        case 3:
          promises.push(this._all[i].call(this, type, arguments[1], arguments[2]));
          break;
        default:
          promises.push(this._all[i].apply(this, arguments));
        }
      }
    }

    if (wildcard) {
      handler = [];
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    } else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      switch (al) {
      case 1:
        promises.push(handler.call(this));
        break;
      case 2:
        promises.push(handler.call(this, arguments[1]));
        break;
      case 3:
        promises.push(handler.call(this, arguments[1], arguments[2]));
        break;
      default:
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
        promises.push(handler.apply(this, args));
      }
    } else if (handler && handler.length) {
      handler = handler.slice();
      if (al > 3) {
        args = new Array(al - 1);
        for (j = 1; j < al; j++) args[j - 1] = arguments[j];
      }
      for (i = 0, l = handler.length; i < l; i++) {
        this.event = type;
        switch (al) {
        case 1:
          promises.push(handler[i].call(this));
          break;
        case 2:
          promises.push(handler[i].call(this, arguments[1]));
          break;
        case 3:
          promises.push(handler[i].call(this, arguments[1], arguments[2]));
          break;
        default:
          promises.push(handler[i].apply(this, args));
        }
      }
    } else if (!this.ignoreErrors && !this._all && type === 'error') {
      if (arguments[1] instanceof Error) {
        return Promise.reject(arguments[1]); // Unhandled 'error' event
      } else {
        return Promise.reject("Uncaught, unspecified 'error' event.");
      }
    }

    return Promise.all(promises);
  };

  EventEmitter.prototype.on = function(type, listener, options) {
    return this._on(type, listener, false, options);
  };

  EventEmitter.prototype.prependListener = function(type, listener, options) {
    return this._on(type, listener, true, options);
  };

  EventEmitter.prototype.onAny = function(fn) {
    return this._onAny(fn, false);
  };

  EventEmitter.prototype.prependAny = function(fn) {
    return this._onAny(fn, true);
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype._onAny = function(fn, prepend){
    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    if (!this._all) {
      this._all = [];
    }

    // Add the function to the event listener collection.
    if(prepend){
      this._all.unshift(fn);
    }else{
      this._all.push(fn);
    }

    return this;
  };

  EventEmitter.prototype._on = function(type, listener, prepend, options) {
    if (typeof type === 'function') {
      this._onAny(type, listener);
      return this;
    }

    if (typeof listener !== 'function') {
      throw new Error('on only accepts instances of Function');
    }
    this._events || init.call(this);

    var returnValue= this, temp;

    if (options !== undefined) {
      temp = setupListener.call(this, type, listener, options);
      listener = temp[0];
      returnValue = temp[1];
    }

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    if (this._newListener) {
      this.emit('newListener', type, listener);
    }

    if (this.wildcard) {
      growListenerTree.call(this, type, listener);
      return returnValue;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    } else {
      if (typeof this._events[type] === 'function') {
        // Change to array.
        this._events[type] = [this._events[type]];
      }

      // If we've already got an array, just add
      if(prepend){
        this._events[type].unshift(listener);
      }else{
        this._events[type].push(listener);
      }

      // Check for listener leak
      if (
        !this._events[type].warned &&
        this._maxListeners > 0 &&
        this._events[type].length > this._maxListeners
      ) {
        this._events[type].warned = true;
        logPossibleMemoryLeak.call(this, this._events[type].length, type);
      }
    }

    return returnValue;
  };

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers,leafs=[];

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
      if(!leafs) return this;
    } else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
      leafs.push({_listeners:handlers});
    }

    for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
      var leaf = leafs[iLeaf];
      handlers = leaf._listeners;
      if (isArray(handlers)) {

        var position = -1;

        for (var i = 0, length = handlers.length; i < length; i++) {
          if (handlers[i] === listener ||
            (handlers[i].listener && handlers[i].listener === listener) ||
            (handlers[i]._origin && handlers[i]._origin === listener)) {
            position = i;
            break;
          }
        }

        if (position < 0) {
          continue;
        }

        if(this.wildcard) {
          leaf._listeners.splice(position, 1);
        }
        else {
          this._events[type].splice(position, 1);
        }

        if (handlers.length === 0) {
          if(this.wildcard) {
            delete leaf._listeners;
          }
          else {
            delete this._events[type];
          }
        }
        if (this._removeListener)
          this.emit("removeListener", type, listener);

        return this;
      }
      else if (handlers === listener ||
        (handlers.listener && handlers.listener === listener) ||
        (handlers._origin && handlers._origin === listener)) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }
        if (this._removeListener)
          this.emit("removeListener", type, listener);
      }
    }

    this.listenerTree && recursivelyGarbageCollect(this.listenerTree);

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          if (this._removeListener)
            this.emit("removeListenerAny", fn);
          return this;
        }
      }
    } else {
      fns = this._all;
      if (this._removeListener) {
        for(i = 0, l = fns.length; i < l; i++)
          this.emit("removeListenerAny", fns[i]);
      }
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function (type) {
    if (type === undefined) {
      !this._events || init.call(this);
      return this;
    }

    if (this.wildcard) {
      var leafs = searchListenerTree.call(this, null, type, this.listenerTree, 0), leaf, i;
      if (!leafs) return this;
      for (i = 0; i < leafs.length; i++) {
        leaf = leafs[i];
        leaf._listeners = null;
      }
      this.listenerTree && recursivelyGarbageCollect(this.listenerTree);
    } else if (this._events) {
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function (type) {
    var _events = this._events;
    var keys, listeners, allListeners;
    var i;
    var listenerTree;

    if (type === undefined) {
      if (this.wildcard) {
        throw Error('event name required for wildcard emitter');
      }

      if (!_events) {
        return [];
      }

      keys = ownKeys(_events);
      i = keys.length;
      allListeners = [];
      while (i-- > 0) {
        listeners = _events[keys[i]];
        if (typeof listeners === 'function') {
          allListeners.push(listeners);
        } else {
          allListeners.push.apply(allListeners, listeners);
        }
      }
      return allListeners;
    } else {
      if (this.wildcard) {
        listenerTree= this.listenerTree;
        if(!listenerTree) return [];
        var handlers = [];
        var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
        searchListenerTree.call(this, handlers, ns, listenerTree, 0);
        return handlers;
      }

      if (!_events) {
        return [];
      }

      listeners = _events[type];

      if (!listeners) {
        return [];
      }
      return typeof listeners === 'function' ? [listeners] : listeners;
    }
  };

  EventEmitter.prototype.eventNames = function(nsAsArray){
    var _events= this._events;
    return this.wildcard? collectTreeEvents.call(this, this.listenerTree, [], null, nsAsArray) : (_events? ownKeys(_events) : []);
  };

  EventEmitter.prototype.listenerCount = function(type) {
    return this.listeners(type).length;
  };

  EventEmitter.prototype.hasListeners = function (type) {
    if (this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers.length > 0;
    }

    var _events = this._events;
    var _all = this._all;

    return !!(_all && _all.length || _events && (type === undefined ? ownKeys(_events).length : _events[type]));
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  EventEmitter.prototype.waitFor = function (event, options) {
    var self = this;
    var type = typeof options;
    if (type === 'number') {
      options = {timeout: options};
    } else if (type === 'function') {
      options = {filter: options};
    }

    options= resolveOptions(options, {
      timeout: 0,
      filter: undefined,
      handleError: false,
      Promise: Promise,
      overload: false
    }, {
      filter: functionReducer,
      Promise: constructorReducer
    });

    return makeCancelablePromise(options.Promise, function (resolve, reject, onCancel) {
      function listener() {
        var filter= options.filter;
        if (filter && !filter.apply(self, arguments)) {
          return;
        }
        self.off(event, listener);
        if (options.handleError) {
          var err = arguments[0];
          err ? reject(err) : resolve(toArray.apply(null, arguments).slice(1));
        } else {
          resolve(toArray.apply(null, arguments));
        }
      }

      onCancel(function(){
        self.off(event, listener);
      });

      self._on(event, listener, false);
    }, {
      timeout: options.timeout,
      overload: options.overload
    })
  };

  function once(emitter, name, options) {
    options= resolveOptions(options, {
      Promise: Promise,
      timeout: 0,
      overload: false
    }, {
      Promise: constructorReducer
    });

    var _Promise= options.Promise;

    return makeCancelablePromise(_Promise, function(resolve, reject, onCancel){
      var handler;
      if (typeof emitter.addEventListener === 'function') {
        handler=  function () {
          resolve(toArray.apply(null, arguments));
        };

        onCancel(function(){
          emitter.removeEventListener(name, handler);
        });

        emitter.addEventListener(
            name,
            handler,
            {once: true}
        );
        return;
      }

      var eventListener = function(){
        errorListener && emitter.removeListener('error', errorListener);
        resolve(toArray.apply(null, arguments));
      };

      var errorListener;

      if (name !== 'error') {
        errorListener = function (err){
          emitter.removeListener(name, eventListener);
          reject(err);
        };

        emitter.once('error', errorListener);
      }

      onCancel(function(){
        errorListener && emitter.removeListener('error', errorListener);
        emitter.removeListener(name, eventListener);
      });

      emitter.once(name, eventListener);
    }, {
      timeout: options.timeout,
      overload: options.overload
    });
  }

  var prototype= EventEmitter.prototype;

  Object.defineProperties(EventEmitter, {
    defaultMaxListeners: {
      get: function () {
        return prototype._maxListeners;
      },
      set: function (n) {
        if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
          throw TypeError('n must be a non-negative number')
        }
        prototype._maxListeners = n;
      },
      enumerable: true
    },
    once: {
      value: once,
      writable: true,
      configurable: true
    }
  });

  Object.defineProperties(prototype, {
      _maxListeners: {
          value: defaultMaxListeners,
          writable: true,
          configurable: true
      },
      _observers: {value: null, writable: true, configurable: true}
  });

     // AMD. Register as an anonymous module.
  return EventEmitter;
});
/* globals define,module */
/*
Using a Universal Module Loader that should be browser, require, and AMD friendly
http://ricostacruz.com/cheatsheets/umdjs.html
*/
define('skylark-formio/vendors/json-logic-js/logic',[], function() {
  "use strict";
  /* globals console:false */

  if ( ! Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === "[object Array]";
    };
  }

  /**
   * Return an array that contains no duplicates (original not modified)
   * @param  {array} array   Original reference array
   * @return {array}         New array with no duplicates
   */
  function arrayUnique(array) {
    var a = [];
    for (var i=0, l=array.length; i<l; i++) {
      if (a.indexOf(array[i]) === -1) {
        a.push(array[i]);
      }
    }
    return a;
  }

  var jsonLogic = {};
  var operations = {
    "==": function(a, b) {
      return a == b;
    },
    "===": function(a, b) {
      return a === b;
    },
    "!=": function(a, b) {
      return a != b;
    },
    "!==": function(a, b) {
      return a !== b;
    },
    ">": function(a, b) {
      return a > b;
    },
    ">=": function(a, b) {
      return a >= b;
    },
    "<": function(a, b, c) {
      return (c === undefined) ? a < b : (a < b) && (b < c);
    },
    "<=": function(a, b, c) {
      return (c === undefined) ? a <= b : (a <= b) && (b <= c);
    },
    "!!": function(a) {
      return jsonLogic.truthy(a);
    },
    "!": function(a) {
      return !jsonLogic.truthy(a);
    },
    "%": function(a, b) {
      return a % b;
    },
    "log": function(a) {
      console.log(a); return a;
    },
    "in": function(a, b) {
      if(!b || typeof b.indexOf === "undefined") return false;
      return (b.indexOf(a) !== -1);
    },
    "cat": function() {
      return Array.prototype.join.call(arguments, "");
    },
    "substr":function(source, start, end) {
      if(end < 0){
        // JavaScript doesn't support negative end, this emulates PHP behavior
        var temp = String(source).substr(start);
        return temp.substr(0, temp.length + end);
      }
      return String(source).substr(start, end);
    },
    "+": function() {
      return Array.prototype.reduce.call(arguments, function(a, b) {
        return parseFloat(a, 10) + parseFloat(b, 10);
      }, 0);
    },
    "*": function() {
      return Array.prototype.reduce.call(arguments, function(a, b) {
        return parseFloat(a, 10) * parseFloat(b, 10);
      });
    },
    "-": function(a, b) {
      if(b === undefined) {
        return -a;
      }else{
        return a - b;
      }
    },
    "/": function(a, b) {
      return a / b;
    },
    "min": function() {
      return Math.min.apply(this, arguments);
    },
    "max": function() {
      return Math.max.apply(this, arguments);
    },
    "merge": function() {
      return Array.prototype.reduce.call(arguments, function(a, b) {
        return a.concat(b);
      }, []);
    },
    "var": function(a, b) {
      var not_found = (b === undefined) ? null : b;
      var data = this;
      if(typeof a === "undefined" || a==="" || a===null) {
        return data;
      }
      var sub_props = String(a).split(".");
      for(var i = 0; i < sub_props.length; i++) {
        if(data === null) {
          return not_found;
        }
        // Descending into data
        data = data[sub_props[i]];
        if(data === undefined) {
          return not_found;
        }
      }
      return data;
    },
    "missing": function() {
      /*
      Missing can receive many keys as many arguments, like {"missing:[1,2]}
      Missing can also receive *one* argument that is an array of keys,
      which typically happens if it's actually acting on the output of another command
      (like 'if' or 'merge')
      */

      var missing = [];
      var keys = Array.isArray(arguments[0]) ? arguments[0] : arguments;

      for(var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = jsonLogic.apply({"var": key}, this);
        if(value === null || value === "") {
          missing.push(key);
        }
      }

      return missing;
    },
    "missing_some": function(need_count, options) {
      // missing_some takes two arguments, how many (minimum) items must be present, and an array of keys (just like 'missing') to check for presence.
      var are_missing = jsonLogic.apply({"missing": options}, this);

      if(options.length - are_missing.length >= need_count) {
        return [];
      }else{
        return are_missing;
      }
    },
    "method": function(obj, method, args) {
      return obj[method].apply(obj, args);
    },

  };

  jsonLogic.is_logic = function(logic) {
    return (
      typeof logic === "object" && // An object
      logic !== null && // but not null
      ! Array.isArray(logic) && // and not an array
      Object.keys(logic).length === 1 // with exactly one key
    );
  };

  /*
  This helper will defer to the JsonLogic spec as a tie-breaker when different language interpreters define different behavior for the truthiness of primitives.  E.g., PHP considers empty arrays to be falsy, but Javascript considers them to be truthy. JsonLogic, as an ecosystem, needs one consistent answer.

  Spec and rationale here: http://jsonlogic.com/truthy
  */
  jsonLogic.truthy = function(value) {
    if(Array.isArray(value) && value.length === 0) {
      return false;
    }
    return !! value;
  };


  jsonLogic.get_operator = function(logic) {
    return Object.keys(logic)[0];
  };

  jsonLogic.get_values = function(logic) {
    return logic[jsonLogic.get_operator(logic)];
  };

  jsonLogic.apply = function(logic, data) {
    // Does this array contain logic? Only one way to find out.
    if(Array.isArray(logic)) {
      return logic.map(function(l) {
        return jsonLogic.apply(l, data);
      });
    }
    // You've recursed to a primitive, stop!
    if( ! jsonLogic.is_logic(logic) ) {
      return logic;
    }

    data = data || {};

    var op = jsonLogic.get_operator(logic);
    var values = logic[op];
    var i;
    var current;
    var scopedLogic, scopedData, filtered, initial;

    // easy syntax for unary operators, like {"var" : "x"} instead of strict {"var" : ["x"]}
    if( ! Array.isArray(values)) {
      values = [values];
    }

    // 'if', 'and', and 'or' violate the normal rule of depth-first calculating consequents, let each manage recursion as needed.
    if(op === "if" || op == "?:") {
      /* 'if' should be called with a odd number of parameters, 3 or greater
      This works on the pattern:
      if( 0 ){ 1 }else{ 2 };
      if( 0 ){ 1 }else if( 2 ){ 3 }else{ 4 };
      if( 0 ){ 1 }else if( 2 ){ 3 }else if( 4 ){ 5 }else{ 6 };

      The implementation is:
      For pairs of values (0,1 then 2,3 then 4,5 etc)
      If the first evaluates truthy, evaluate and return the second
      If the first evaluates falsy, jump to the next pair (e.g, 0,1 to 2,3)
      given one parameter, evaluate and return it. (it's an Else and all the If/ElseIf were false)
      given 0 parameters, return NULL (not great practice, but there was no Else)
      */
      for(i = 0; i < values.length - 1; i += 2) {
        if( jsonLogic.truthy( jsonLogic.apply(values[i], data) ) ) {
          return jsonLogic.apply(values[i+1], data);
        }
      }
      if(values.length === i+1) return jsonLogic.apply(values[i], data);
      return null;
    }else if(op === "and") { // Return first falsy, or last
      for(i=0; i < values.length; i+=1) {
        current = jsonLogic.apply(values[i], data);
        if( ! jsonLogic.truthy(current)) {
          return current;
        }
      }
      return current; // Last
    }else if(op === "or") {// Return first truthy, or last
      for(i=0; i < values.length; i+=1) {
        current = jsonLogic.apply(values[i], data);
        if( jsonLogic.truthy(current) ) {
          return current;
        }
      }
      return current; // Last




    }else if(op === 'filter'){
      scopedData = jsonLogic.apply(values[0], data);
      scopedLogic = values[1];

      if ( ! Array.isArray(scopedData)) {
          return [];
      }
      // Return only the elements from the array in the first argument,
      // that return truthy when passed to the logic in the second argument.
      // For parity with JavaScript, reindex the returned array
      return scopedData.filter(function(datum){
          return jsonLogic.truthy( jsonLogic.apply(scopedLogic, datum));
      });
  }else if(op === 'map'){
      scopedData = jsonLogic.apply(values[0], data);
      scopedLogic = values[1];

      if ( ! Array.isArray(scopedData)) {
          return [];
      }

      return scopedData.map(function(datum){
          return jsonLogic.apply(scopedLogic, datum);
      });

  }else if(op === 'reduce'){
      scopedData = jsonLogic.apply(values[0], data);
      scopedLogic = values[1];
      initial = typeof values[2] !== 'undefined' ? values[2] : null;

      if ( ! Array.isArray(scopedData)) {
          return initial;
      }

      return scopedData.reduce(
          function(accumulator, current){
              return jsonLogic.apply(
                  scopedLogic,
                  {'current':current, 'accumulator':accumulator}
              );
          },
          initial
      );

    }else if(op === "all") {
      scopedData = jsonLogic.apply(values[0], data);
      scopedLogic = values[1];
      // All of an empty set is false. Note, some and none have correct fallback after the for loop
      if( ! scopedData.length) {
        return false;
      }
      for(i=0; i < scopedData.length; i+=1) {
        if( ! jsonLogic.truthy( jsonLogic.apply(scopedLogic, scopedData[i]) )) {
          return false; // First falsy, short circuit
        }
      }
      return true; // All were truthy
    }else if(op === "none") {
      filtered = jsonLogic.apply({'filter' : values}, data);
      return filtered.length === 0;

    }else if(op === "some") {
      filtered = jsonLogic.apply({'filter' : values}, data);
      return filtered.length > 0;
    }

    // Everyone else gets immediate depth-first recursion
    values = values.map(function(val) {
      return jsonLogic.apply(val, data);
    });


    // The operation is called with "data" bound to its "this" and "values" passed as arguments.
    // Structured commands like % or > can name formal arguments while flexible commands (like missing or merge) can operate on the pseudo-array arguments
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
    if(typeof operations[op] === "function") {
      return operations[op].apply(data, values);
    }else if(op.indexOf(".") > 0) { // Contains a dot, and not in the 0th position
      var sub_ops = String(op).split(".");
      var operation = operations;
      for(i = 0; i < sub_ops.length; i++) {
        // Descending into operations
        operation = operation[sub_ops[i]];
        if(operation === undefined) {
          throw new Error("Unrecognized operation " + op +
          " (failed at " + sub_ops.slice(0, i+1).join(".") + ")");
        }
      }

      return operation.apply(data, values);
    }

    throw new Error("Unrecognized operation " + op );
  };

  jsonLogic.uses_data = function(logic) {
    var collection = [];

    if( jsonLogic.is_logic(logic) ) {
      var op = jsonLogic.get_operator(logic);
      var values = logic[op];

      if( ! Array.isArray(values)) {
        values = [values];
      }

      if(op === "var") {
        // This doesn't cover the case where the arg to var is itself a rule.
        collection.push(values[0]);
      }else{
        // Recursion!
        values.map(function(val) {
          collection.push.apply(collection, jsonLogic.uses_data(val) );
        });
      }
    }

    return arrayUnique(collection);
  };

  jsonLogic.add_operation = function(name, code) {
    operations[name] = code;
  };

  jsonLogic.rm_operation = function(name) {
    delete operations[name];
  };

  jsonLogic.rule_like = function(rule, pattern) {
    // console.log("Is ". JSON.stringify(rule) . " like " . JSON.stringify(pattern) . "?");
    if(pattern === rule) {
      return true;
    } // TODO : Deep object equivalency?
    if(pattern === "@") {
      return true;
    } // Wildcard!
    if(pattern === "number") {
      return (typeof rule === "number");
    }
    if(pattern === "string") {
      return (typeof rule === "string");
    }
    if(pattern === "array") {
      // !logic test might be superfluous in JavaScript
      return Array.isArray(rule) && ! jsonLogic.is_logic(rule);
    }

    if(jsonLogic.is_logic(pattern)) {
      if(jsonLogic.is_logic(rule)) {
        var pattern_op = jsonLogic.get_operator(pattern);
        var rule_op = jsonLogic.get_operator(rule);

        if(pattern_op === "@" || pattern_op === rule_op) {
        // echo "\nOperators match, go deeper\n";
          return jsonLogic.rule_like(
            jsonLogic.get_values(rule, false),
            jsonLogic.get_values(pattern, false)
          );
        }
      }
      return false; // pattern is logic, rule isn't, can't be eq
    }

    if(Array.isArray(pattern)) {
      if(Array.isArray(rule)) {
        if(pattern.length !== rule.length) {
          return false;
        }
        /*
          Note, array order MATTERS, because we're using this array test logic to consider arguments, where order can matter. (e.g., + is commutative, but '-' or 'if' or 'var' are NOT)
        */
        for(var i = 0; i < pattern.length; i += 1) {
          // If any fail, we fail
          if( ! jsonLogic.rule_like(rule[i], pattern[i])) {
            return false;
          }
        }
        return true; // If they *all* passed, we pass
      }else{
        return false; // Pattern is array, rule isn't
      }
    }

    // Not logic, not array, not a === match for rule.
    return false;
  };

  return jsonLogic;
});
define('skylark-formio/vendors/moment/timezone',['skylark-moment'], function (moment) {
	"use strict";

	// Resolves es6 module loading issue
	if (moment.version === undefined && moment.default) {
		moment = moment.default;
	}

	// Do not load moment-timezone a second time.
	// if (moment.tz !== undefined) {
	// 	logError('Moment Timezone ' + moment.tz.version + ' was already loaded ' + (moment.tz.dataVersion ? 'with data from ' : 'without any data') + moment.tz.dataVersion);
	// 	return moment;
	// }

	var VERSION = "0.5.31",
		zones = {},
		links = {},
		countries = {},
		names = {},
		guesses = {},
		cachedGuess;

	if (!moment || typeof moment.version !== 'string') {
		logError('Moment Timezone requires Moment.js. See https://momentjs.com/timezone/docs/#/use-it/browser/');
	}

	var momentVersion = moment.version.split('.'),
		major = +momentVersion[0],
		minor = +momentVersion[1];

	// Moment.js version check
	if (major < 2 || (major === 2 && minor < 6)) {
		logError('Moment Timezone requires Moment.js >= 2.6.0. You are using Moment.js ' + moment.version + '. See momentjs.com');
	}

	/************************************
		Unpacking
	************************************/

	function charCodeToInt(charCode) {
		if (charCode > 96) {
			return charCode - 87;
		} else if (charCode > 64) {
			return charCode - 29;
		}
		return charCode - 48;
	}

	function unpackBase60(string) {
		var i = 0,
			parts = string.split('.'),
			whole = parts[0],
			fractional = parts[1] || '',
			multiplier = 1,
			num,
			out = 0,
			sign = 1;

		// handle negative numbers
		if (string.charCodeAt(0) === 45) {
			i = 1;
			sign = -1;
		}

		// handle digits before the decimal
		for (i; i < whole.length; i++) {
			num = charCodeToInt(whole.charCodeAt(i));
			out = 60 * out + num;
		}

		// handle digits after the decimal
		for (i = 0; i < fractional.length; i++) {
			multiplier = multiplier / 60;
			num = charCodeToInt(fractional.charCodeAt(i));
			out += num * multiplier;
		}

		return out * sign;
	}

	function arrayToInt (array) {
		for (var i = 0; i < array.length; i++) {
			array[i] = unpackBase60(array[i]);
		}
	}

	function intToUntil (array, length) {
		for (var i = 0; i < length; i++) {
			array[i] = Math.round((array[i - 1] || 0) + (array[i] * 60000)); // minutes to milliseconds
		}

		array[length - 1] = Infinity;
	}

	function mapIndices (source, indices) {
		var out = [], i;

		for (i = 0; i < indices.length; i++) {
			out[i] = source[indices[i]];
		}

		return out;
	}

	function unpack (string) {
		var data = string.split('|'),
			offsets = data[2].split(' '),
			indices = data[3].split(''),
			untils  = data[4].split(' ');

		arrayToInt(offsets);
		arrayToInt(indices);
		arrayToInt(untils);

		intToUntil(untils, indices.length);

		return {
			name       : data[0],
			abbrs      : mapIndices(data[1].split(' '), indices),
			offsets    : mapIndices(offsets, indices),
			untils     : untils,
			population : data[5] | 0
		};
	}

	/************************************
		Zone object
	************************************/

	function Zone (packedString) {
		if (packedString) {
			this._set(unpack(packedString));
		}
	}

	Zone.prototype = {
		_set : function (unpacked) {
			this.name       = unpacked.name;
			this.abbrs      = unpacked.abbrs;
			this.untils     = unpacked.untils;
			this.offsets    = unpacked.offsets;
			this.population = unpacked.population;
		},

		_index : function (timestamp) {
			var target = +timestamp,
				untils = this.untils,
				i;

			for (i = 0; i < untils.length; i++) {
				if (target < untils[i]) {
					return i;
				}
			}
		},

		countries : function () {
			var zone_name = this.name;
			return Object.keys(countries).filter(function (country_code) {
				return countries[country_code].zones.indexOf(zone_name) !== -1;
			});
		},

		parse : function (timestamp) {
			var target  = +timestamp,
				offsets = this.offsets,
				untils  = this.untils,
				max     = untils.length - 1,
				offset, offsetNext, offsetPrev, i;

			for (i = 0; i < max; i++) {
				offset     = offsets[i];
				offsetNext = offsets[i + 1];
				offsetPrev = offsets[i ? i - 1 : i];

				if (offset < offsetNext && tz.moveAmbiguousForward) {
					offset = offsetNext;
				} else if (offset > offsetPrev && tz.moveInvalidForward) {
					offset = offsetPrev;
				}

				if (target < untils[i] - (offset * 60000)) {
					return offsets[i];
				}
			}

			return offsets[max];
		},

		abbr : function (mom) {
			return this.abbrs[this._index(mom)];
		},

		offset : function (mom) {
			logError("zone.offset has been deprecated in favor of zone.utcOffset");
			return this.offsets[this._index(mom)];
		},

		utcOffset : function (mom) {
			return this.offsets[this._index(mom)];
		}
	};

	/************************************
		Country object
	************************************/

	function Country (country_name, zone_names) {
		this.name = country_name;
		this.zones = zone_names;
	}

	/************************************
		Current Timezone
	************************************/

	function OffsetAt(at) {
		var timeString = at.toTimeString();
		var abbr = timeString.match(/\([a-z ]+\)/i);
		if (abbr && abbr[0]) {
			// 17:56:31 GMT-0600 (CST)
			// 17:56:31 GMT-0600 (Central Standard Time)
			abbr = abbr[0].match(/[A-Z]/g);
			abbr = abbr ? abbr.join('') : undefined;
		} else {
			// 17:56:31 CST
			// 17:56:31 GMT+0800 (台北標準時間)
			abbr = timeString.match(/[A-Z]{3,5}/g);
			abbr = abbr ? abbr[0] : undefined;
		}

		if (abbr === 'GMT') {
			abbr = undefined;
		}

		this.at = +at;
		this.abbr = abbr;
		this.offset = at.getTimezoneOffset();
	}

	function ZoneScore(zone) {
		this.zone = zone;
		this.offsetScore = 0;
		this.abbrScore = 0;
	}

	ZoneScore.prototype.scoreOffsetAt = function (offsetAt) {
		this.offsetScore += Math.abs(this.zone.utcOffset(offsetAt.at) - offsetAt.offset);
		if (this.zone.abbr(offsetAt.at).replace(/[^A-Z]/g, '') !== offsetAt.abbr) {
			this.abbrScore++;
		}
	};

	function findChange(low, high) {
		var mid, diff;

		while ((diff = ((high.at - low.at) / 12e4 | 0) * 6e4)) {
			mid = new OffsetAt(new Date(low.at + diff));
			if (mid.offset === low.offset) {
				low = mid;
			} else {
				high = mid;
			}
		}

		return low;
	}

	function userOffsets() {
		var startYear = new Date().getFullYear() - 2,
			last = new OffsetAt(new Date(startYear, 0, 1)),
			offsets = [last],
			change, next, i;

		for (i = 1; i < 48; i++) {
			next = new OffsetAt(new Date(startYear, i, 1));
			if (next.offset !== last.offset) {
				change = findChange(last, next);
				offsets.push(change);
				offsets.push(new OffsetAt(new Date(change.at + 6e4)));
			}
			last = next;
		}

		for (i = 0; i < 4; i++) {
			offsets.push(new OffsetAt(new Date(startYear + i, 0, 1)));
			offsets.push(new OffsetAt(new Date(startYear + i, 6, 1)));
		}

		return offsets;
	}

	function sortZoneScores (a, b) {
		if (a.offsetScore !== b.offsetScore) {
			return a.offsetScore - b.offsetScore;
		}
		if (a.abbrScore !== b.abbrScore) {
			return a.abbrScore - b.abbrScore;
		}
		if (a.zone.population !== b.zone.population) {
			return b.zone.population - a.zone.population;
		}
		return b.zone.name.localeCompare(a.zone.name);
	}

	function addToGuesses (name, offsets) {
		var i, offset;
		arrayToInt(offsets);
		for (i = 0; i < offsets.length; i++) {
			offset = offsets[i];
			guesses[offset] = guesses[offset] || {};
			guesses[offset][name] = true;
		}
	}

	function guessesForUserOffsets (offsets) {
		var offsetsLength = offsets.length,
			filteredGuesses = {},
			out = [],
			i, j, guessesOffset;

		for (i = 0; i < offsetsLength; i++) {
			guessesOffset = guesses[offsets[i].offset] || {};
			for (j in guessesOffset) {
				if (guessesOffset.hasOwnProperty(j)) {
					filteredGuesses[j] = true;
				}
			}
		}

		for (i in filteredGuesses) {
			if (filteredGuesses.hasOwnProperty(i)) {
				out.push(names[i]);
			}
		}

		return out;
	}

	function rebuildGuess () {

		// use Intl API when available and returning valid time zone
		try {
			var intlName = Intl.DateTimeFormat().resolvedOptions().timeZone;
			if (intlName && intlName.length > 3) {
				var name = names[normalizeName(intlName)];
				if (name) {
					return name;
				}
				logError("Moment Timezone found " + intlName + " from the Intl api, but did not have that data loaded.");
			}
		} catch (e) {
			// Intl unavailable, fall back to manual guessing.
		}

		var offsets = userOffsets(),
			offsetsLength = offsets.length,
			guesses = guessesForUserOffsets(offsets),
			zoneScores = [],
			zoneScore, i, j;

		for (i = 0; i < guesses.length; i++) {
			zoneScore = new ZoneScore(getZone(guesses[i]), offsetsLength);
			for (j = 0; j < offsetsLength; j++) {
				zoneScore.scoreOffsetAt(offsets[j]);
			}
			zoneScores.push(zoneScore);
		}

		zoneScores.sort(sortZoneScores);

		return zoneScores.length > 0 ? zoneScores[0].zone.name : undefined;
	}

	function guess (ignoreCache) {
		if (!cachedGuess || ignoreCache) {
			cachedGuess = rebuildGuess();
		}
		return cachedGuess;
	}

	/************************************
		Global Methods
	************************************/

	function normalizeName (name) {
		return (name || '').toLowerCase().replace(/\//g, '_');
	}

	function addZone (packed) {
		var i, name, split, normalized;

		if (typeof packed === "string") {
			packed = [packed];
		}

		for (i = 0; i < packed.length; i++) {
			split = packed[i].split('|');
			name = split[0];
			normalized = normalizeName(name);
			zones[normalized] = packed[i];
			names[normalized] = name;
			addToGuesses(normalized, split[2].split(' '));
		}
	}

	function getZone (name, caller) {

		name = normalizeName(name);

		var zone = zones[name];
		var link;

		if (zone instanceof Zone) {
			return zone;
		}

		if (typeof zone === 'string') {
			zone = new Zone(zone);
			zones[name] = zone;
			return zone;
		}

		// Pass getZone to prevent recursion more than 1 level deep
		if (links[name] && caller !== getZone && (link = getZone(links[name], getZone))) {
			zone = zones[name] = new Zone();
			zone._set(link);
			zone.name = names[name];
			return zone;
		}

		return null;
	}

	function getNames () {
		var i, out = [];

		for (i in names) {
			if (names.hasOwnProperty(i) && (zones[i] || zones[links[i]]) && names[i]) {
				out.push(names[i]);
			}
		}

		return out.sort();
	}

	function getCountryNames () {
		return Object.keys(countries);
	}

	function addLink (aliases) {
		var i, alias, normal0, normal1;

		if (typeof aliases === "string") {
			aliases = [aliases];
		}

		for (i = 0; i < aliases.length; i++) {
			alias = aliases[i].split('|');

			normal0 = normalizeName(alias[0]);
			normal1 = normalizeName(alias[1]);

			links[normal0] = normal1;
			names[normal0] = alias[0];

			links[normal1] = normal0;
			names[normal1] = alias[1];
		}
	}

	function addCountries (data) {
		var i, country_code, country_zones, split;
		if (!data || !data.length) return;
		for (i = 0; i < data.length; i++) {
			split = data[i].split('|');
			country_code = split[0].toUpperCase();
			country_zones = split[1].split(' ');
			countries[country_code] = new Country(
				country_code,
				country_zones
			);
		}
	}

	function getCountry (name) {
		name = name.toUpperCase();
		return countries[name] || null;
	}

	function zonesForCountry(country, with_offset) {
		country = getCountry(country);

		if (!country) return null;

		var zones = country.zones.sort();

		if (with_offset) {
			return zones.map(function (zone_name) {
				var zone = getZone(zone_name);
				return {
					name: zone_name,
					offset: zone.utcOffset(new Date())
				};
			});
		}

		return zones;
	}

	function loadData (data) {
		addZone(data.zones);
		addLink(data.links);
		addCountries(data.countries);
		tz.dataVersion = data.version;
	}

	function zoneExists (name) {
		if (!zoneExists.didShowError) {
			zoneExists.didShowError = true;
				logError("moment.tz.zoneExists('" + name + "') has been deprecated in favor of !moment.tz.zone('" + name + "')");
		}
		return !!getZone(name);
	}

	function needsOffset (m) {
		var isUnixTimestamp = (m._f === 'X' || m._f === 'x');
		return !!(m._a && (m._tzm === undefined) && !isUnixTimestamp);
	}

	function logError (message) {
		if (typeof console !== 'undefined' && typeof console.error === 'function') {
			console.error(message);
		}
	}

	/************************************
		moment.tz namespace
	************************************/

	function tz (input) {
		var args = Array.prototype.slice.call(arguments, 0, -1),
			name = arguments[arguments.length - 1],
			zone = getZone(name),
			out  = moment.utc.apply(null, args);

		if (zone && !moment.isMoment(input) && needsOffset(out)) {
			out.add(zone.parse(out), 'minutes');
		}

		out.tz(name);

		return out;
	}

	tz.version      = VERSION;
	tz.dataVersion  = '';
	tz._zones       = zones;
	tz._links       = links;
	tz._names       = names;
	tz._countries	= countries;
	tz.add          = addZone;
	tz.link         = addLink;
	tz.load         = loadData;
	tz.zone         = getZone;
	tz.zoneExists   = zoneExists; // deprecated in 0.1.0
	tz.guess        = guess;
	tz.names        = getNames;
	tz.Zone         = Zone;
	tz.unpack       = unpack;
	tz.unpackBase60 = unpackBase60;
	tz.needsOffset  = needsOffset;
	tz.moveInvalidForward   = true;
	tz.moveAmbiguousForward = false;
	tz.countries    = getCountryNames;
	tz.zonesForCountry = zonesForCountry;

	/************************************
		Interface with Moment.js
	************************************/

	var fn = moment.fn;

	moment.tz = tz;

	moment.defaultZone = null;

	moment.updateOffset = function (mom, keepTime) {
		var zone = moment.defaultZone,
			offset;

		if (mom._z === undefined) {
			if (zone && needsOffset(mom) && !mom._isUTC) {
				mom._d = moment.utc(mom._a)._d;
				mom.utc().add(zone.parse(mom), 'minutes');
			}
			mom._z = zone;
		}
		if (mom._z) {
			offset = mom._z.utcOffset(mom);
			if (Math.abs(offset) < 16) {
				offset = offset / 60;
			}
			if (mom.utcOffset !== undefined) {
				var z = mom._z;
				mom.utcOffset(-offset, keepTime);
				mom._z = z;
			} else {
				mom.zone(offset, keepTime);
			}
		}
	};

	fn.tz = function (name, keepTime) {
		if (name) {
			if (typeof name !== 'string') {
				throw new Error('Time zone name must be a string, got ' + name + ' [' + typeof name + ']');
			}
			this._z = getZone(name);
			if (this._z) {
				moment.updateOffset(this, keepTime);
			} else {
				logError("Moment Timezone has no data for " + name + ". See http://momentjs.com/timezone/docs/#/data-loading/.");
			}
			return this;
		}
		if (this._z) { return this._z.name; }
	};

	function abbrWrap (old) {
		return function () {
			if (this._z) { return this._z.abbr(this); }
			return old.call(this);
		};
	}

	function resetZoneWrap (old) {
		return function () {
			this._z = null;
			return old.apply(this, arguments);
		};
	}

	function resetZoneWrap2 (old) {
		return function () {
			if (arguments.length > 0) this._z = null;
			return old.apply(this, arguments);
		};
	}

	fn.zoneName  = abbrWrap(fn.zoneName);
	fn.zoneAbbr  = abbrWrap(fn.zoneAbbr);
	fn.utc       = resetZoneWrap(fn.utc);
	fn.local     = resetZoneWrap(fn.local);
	fn.utcOffset = resetZoneWrap2(fn.utcOffset);

	moment.tz.setDefault = function(name) {
		if (major < 2 || (major === 2 && minor < 9)) {
			logError('Moment Timezone setDefault() requires Moment.js >= 2.9.0. You are using Moment.js ' + moment.version + '.');
		}
		moment.defaultZone = name ? getZone(name) : null;
		return moment;
	};

	// Cloning a moment should include the _z property.
	var momentProperties = moment.momentProperties;
	if (Object.prototype.toString.call(momentProperties) === '[object Array]') {
		// moment 2.8.1+
		momentProperties.push('_z');
		momentProperties.push('_a');
	} else if (momentProperties) {
		// moment 2.7.0
		momentProperties._z = null;
	}

	// INJECT DATA

	return moment;
});
define('skylark-formio/vendors/jstimezonedetect/jstz',[], function() {


/*global exports, Intl*/
/**
 * This script gives you the zone info key representing your device's time zone setting.
 *
 * @name jsTimezoneDetect
 * @version 1.0.6
 * @author Jon Nylander
 * @license MIT License - https://bitbucket.org/pellepim/jstimezonedetect/src/default/LICENCE.txt
 *
 * For usage and examples, visit:
 * http://pellepim.bitbucket.org/jstz/
 *
 * Copyright (c) Jon Nylander
 */


/**
 * Namespace to hold all the code for timezone detection.
 */
    var jstz = (function () {
        'use strict';
        var HEMISPHERE_SOUTH = 's',

            consts = {
                DAY: 86400000,
                HOUR: 3600000,
                MINUTE: 60000,
                SECOND: 1000,
                BASELINE_YEAR: 2014,
                MAX_SCORE: 864000000, // 10 days
                AMBIGUITIES: {
                    'America/Denver':       ['America/Mazatlan'],
                    'America/Chicago':      ['America/Mexico_City'],
                    'America/Asuncion':     ['America/Campo_Grande', 'America/Santiago'],
                    'America/Montevideo':   ['America/Sao_Paulo', 'America/Santiago'],
                    'Asia/Beirut':          ['Asia/Amman', 'Asia/Jerusalem', 'Europe/Helsinki', 'Asia/Damascus', 'Africa/Cairo', 'Asia/Gaza', 'Europe/Minsk', 'Africa/Windhoek'],
                    'Pacific/Auckland':     ['Pacific/Fiji'],
                    'America/Los_Angeles':  ['America/Santa_Isabel'],
                    'America/New_York':     ['America/Havana'],
                    'America/Halifax':      ['America/Goose_Bay'],
                    'America/Godthab':      ['America/Miquelon'],
                    'Asia/Dubai':           ['Asia/Yerevan'],
                    'Asia/Jakarta':         ['Asia/Krasnoyarsk'],
                    'Asia/Shanghai':        ['Asia/Irkutsk', 'Australia/Perth'],
                    'Australia/Sydney':     ['Australia/Lord_Howe'],
                    'Asia/Tokyo':           ['Asia/Yakutsk'],
                    'Asia/Dhaka':           ['Asia/Omsk'],
                    'Asia/Baku':            ['Asia/Yerevan'],
                    'Australia/Brisbane':   ['Asia/Vladivostok'],
                    'Pacific/Noumea':       ['Asia/Vladivostok'],
                    'Pacific/Majuro':       ['Asia/Kamchatka', 'Pacific/Fiji'],
                    'Pacific/Tongatapu':    ['Pacific/Apia'],
                    'Asia/Baghdad':         ['Europe/Minsk', 'Europe/Moscow'],
                    'Asia/Karachi':         ['Asia/Yekaterinburg'],
                    'Africa/Johannesburg':  ['Asia/Gaza', 'Africa/Cairo']
                }
            },

            /**
             * Gets the offset in minutes from UTC for a certain date.
             * @param {Date} date
             * @returns {Number}
             */
            get_date_offset = function get_date_offset(date) {
                var offset = -date.getTimezoneOffset();
                return (offset !== null ? offset : 0);
            },


            get_offsets = function get_offsets() {
                var offsets = [];

                for (var month = 0; month <= 11; month++) {
                    for (var date = 1; date <= 28; date++) {
                        var currentOffset = get_date_offset(new Date(consts.BASELINE_YEAR, month, date));
                        if (!offsets) {
                            offsets.push();
                        } else if (offsets && offsets[offsets.length-1] !== currentOffset) {
                            offsets.push(currentOffset);
                        }
                    }
                }

                return offsets;
            },

            /**
             * This function does some basic calculations to create information about
             * the user's timezone. It uses REFERENCE_YEAR as a solid year for which
             * the script has been tested rather than depend on the year set by the
             * client device.
             *
             * Returns a key that can be used to do lookups in jstz.olson.timezones.
             * eg: "720,1,2".
             *
             * @returns {String}
             */
            lookup_key = function lookup_key() {
                var diff = 0;
                var offsets = get_offsets();

                if (offsets.length > 1) {
                    diff = offsets[0] - offsets[1];
                }

                if (offsets.length > 3) {
                    return offsets[0] + ",1,weird";
                } else if (diff < 0) {
                    return offsets[0] + ",1";
                } else if (diff > 0) {
                    return offsets[1] + ",1," + HEMISPHERE_SOUTH;
                }

                return offsets[0] + ",0";
            },


            /**
             * Tries to get the time zone key directly from the operating system for those
             * environments that support the ECMAScript Internationalization API.
             */
            get_from_internationalization_api = function get_from_internationalization_api() {
                var format, timezone;
                if (!Intl || typeof Intl === "undefined" || typeof Intl.DateTimeFormat === "undefined") {
                    return;
                }

                format = Intl.DateTimeFormat();

                if (typeof format === "undefined" || typeof format.resolvedOptions === "undefined") {
                    return;
                }

                timezone = format.resolvedOptions().timeZone;

                if (timezone && (timezone.indexOf("/") > -1 || timezone === 'UTC')) {
                    return timezone;
                }

            },

            /**
             * Starting point for getting all the DST rules for a specific year
             * for the current timezone (as described by the client system).
             *
             * Returns an object with start and end attributes, or false if no
             * DST rules were found for the year.
             *
             * @param year
             * @returns {Object} || {Boolean}
             */
            dst_dates = function dst_dates(year) {
                var yearstart = new Date(year, 0, 1, 0, 0, 1, 0).getTime();
                var yearend = new Date(year, 12, 31, 23, 59, 59).getTime();
                var current = yearstart;
                var offset = (new Date(current)).getTimezoneOffset();
                var dst_start = null;
                var dst_end = null;

                while (current < yearend - 86400000) {
                    var dateToCheck = new Date(current);
                    var dateToCheckOffset = dateToCheck.getTimezoneOffset();

                    if (dateToCheckOffset !== offset) {
                        if (dateToCheckOffset < offset) {
                            dst_start = dateToCheck;
                        }
                        if (dateToCheckOffset > offset) {
                            dst_end = dateToCheck;
                        }
                        offset = dateToCheckOffset;
                    }

                    current += 86400000;
                }

                if (dst_start && dst_end) {
                    return {
                        s: find_dst_fold(dst_start).getTime(),
                        e: find_dst_fold(dst_end).getTime()
                    };
                }

                return false;
            },

            /**
             * Probably completely unnecessary function that recursively finds the
             * exact (to the second) time when a DST rule was changed.
             *
             * @param a_date - The candidate Date.
             * @param padding - integer specifying the padding to allow around the candidate
             *                  date for finding the fold.
             * @param iterator - integer specifying how many milliseconds to iterate while
             *                   searching for the fold.
             *
             * @returns {Date}
             */
            find_dst_fold = function find_dst_fold(a_date, padding, iterator) {
                if (typeof padding === 'undefined') {
                    padding = consts.DAY;
                    iterator = consts.HOUR;
                }

                var date_start = new Date(a_date.getTime() - padding).getTime();
                var date_end = a_date.getTime() + padding;
                var offset = new Date(date_start).getTimezoneOffset();

                var current = date_start;

                var dst_change = null;
                while (current < date_end - iterator) {
                    var dateToCheck = new Date(current);
                    var dateToCheckOffset = dateToCheck.getTimezoneOffset();

                    if (dateToCheckOffset !== offset) {
                        dst_change = dateToCheck;
                        break;
                    }
                    current += iterator;
                }

                if (padding === consts.DAY) {
                    return find_dst_fold(dst_change, consts.HOUR, consts.MINUTE);
                }

                if (padding === consts.HOUR) {
                    return find_dst_fold(dst_change, consts.MINUTE, consts.SECOND);
                }

                return dst_change;
            },

            windows7_adaptations = function windows7_adaptions(rule_list, preliminary_timezone, score, sample) {
                if (score !== 'N/A') {
                    return score;
                }
                if (preliminary_timezone === 'Asia/Beirut') {
                    if (sample.name === 'Africa/Cairo') {
                        if (rule_list[6].s === 1398376800000 && rule_list[6].e === 1411678800000) {
                            return 0;
                        }
                    }
                    if (sample.name === 'Asia/Jerusalem') {
                        if (rule_list[6].s === 1395964800000 && rule_list[6].e === 1411858800000) {
                            return 0;
                    }
                }
                } else if (preliminary_timezone === 'America/Santiago') {
                    if (sample.name === 'America/Asuncion') {
                        if (rule_list[6].s === 1412481600000 && rule_list[6].e === 1397358000000) {
                            return 0;
                        }
                    }
                    if (sample.name === 'America/Campo_Grande') {
                        if (rule_list[6].s === 1413691200000 && rule_list[6].e === 1392519600000) {
                            return 0;
                        }
                    }
                } else if (preliminary_timezone === 'America/Montevideo') {
                    if (sample.name === 'America/Sao_Paulo') {
                        if (rule_list[6].s === 1413687600000 && rule_list[6].e === 1392516000000) {
                            return 0;
                        }
                    }
                } else if (preliminary_timezone === 'Pacific/Auckland') {
                    if (sample.name === 'Pacific/Fiji') {
                        if (rule_list[6].s === 1414245600000 && rule_list[6].e === 1396101600000) {
                            return 0;
                        }
                    }
                }

                return score;
            },

            /**
             * Takes the DST rules for the current timezone, and proceeds to find matches
             * in the jstz.olson.dst_rules.zones array.
             *
             * Compares samples to the current timezone on a scoring basis.
             *
             * Candidates are ruled immediately if either the candidate or the current zone
             * has a DST rule where the other does not.
             *
             * Candidates are ruled out immediately if the current zone has a rule that is
             * outside the DST scope of the candidate.
             *
             * Candidates are included for scoring if the current zones rules fall within the
             * span of the samples rules.
             *
             * Low score is best, the score is calculated by summing up the differences in DST
             * rules and if the consts.MAX_SCORE is overreached the candidate is ruled out.
             *
             * Yah follow? :)
             *
             * @param rule_list
             * @param preliminary_timezone
             * @returns {*}
             */
            best_dst_match = function best_dst_match(rule_list, preliminary_timezone) {
                var score_sample = function score_sample(sample) {
                    var score = 0;

                    for (var j = 0; j < rule_list.length; j++) {

                        // Both sample and current time zone report DST during the year.
                        if (!!sample.rules[j] && !!rule_list[j]) {

                            // The current time zone's DST rules are inside the sample's. Include.
                            if (rule_list[j].s >= sample.rules[j].s && rule_list[j].e <= sample.rules[j].e) {
                                score = 0;
                                score += Math.abs(rule_list[j].s - sample.rules[j].s);
                                score += Math.abs(sample.rules[j].e - rule_list[j].e);

                            // The current time zone's DST rules are outside the sample's. Discard.
                            } else {
                                score = 'N/A';
                                break;
                            }

                            // The max score has been reached. Discard.
                            if (score > consts.MAX_SCORE) {
                                score = 'N/A';
                                break;
                            }
                        }
                    }

                    score = windows7_adaptations(rule_list, preliminary_timezone, score, sample);

                    return score;
                };
                var scoreboard = {};
                var dst_zones = jstz.olson.dst_rules.zones;
                var dst_zones_length = dst_zones.length;
                var ambiguities = consts.AMBIGUITIES[preliminary_timezone];

                for (var i = 0; i < dst_zones_length; i++) {
                    var sample = dst_zones[i];
                    var score = score_sample(dst_zones[i]);

                    if (score !== 'N/A') {
                        scoreboard[sample.name] = score;
                    }
                }

                for (var tz in scoreboard) {
                    if (scoreboard.hasOwnProperty(tz)) {
                        for (var j = 0; j < ambiguities.length; j++) {
                            if (ambiguities[j] === tz) {
                                return tz;
                            }
                        }
                    }
                }

                return preliminary_timezone;
            },

            /**
             * Takes the preliminary_timezone as detected by lookup_key().
             *
             * Builds up the current timezones DST rules for the years defined
             * in the jstz.olson.dst_rules.years array.
             *
             * If there are no DST occurences for those years, immediately returns
             * the preliminary timezone. Otherwise proceeds and tries to solve
             * ambiguities.
             *
             * @param preliminary_timezone
             * @returns {String} timezone_name
             */
            get_by_dst = function get_by_dst(preliminary_timezone) {
                var get_rules = function get_rules() {
                    var rule_list = [];
                    for (var i = 0; i < jstz.olson.dst_rules.years.length; i++) {
                        var year_rules = dst_dates(jstz.olson.dst_rules.years[i]);
                        rule_list.push(year_rules);
                    }
                    return rule_list;
                };
                var check_has_dst = function check_has_dst(rules) {
                    for (var i = 0; i < rules.length; i++) {
                        if (rules[i] !== false) {
                            return true;
                        }
                    }
                    return false;
                };
                var rules = get_rules();
                var has_dst = check_has_dst(rules);

                if (has_dst) {
                    return best_dst_match(rules, preliminary_timezone);
                }

                return preliminary_timezone;
            },

            /**
             * Uses get_timezone_info() to formulate a key to use in the olson.timezones dictionary.
             *
             * Returns an object with one function ".name()"
             *
             * @returns Object
             */
            determine = function determine(using_intl) {
                var preliminary_tz = false;
                var needle = lookup_key();
                if (using_intl || typeof using_intl === 'undefined') {
                    preliminary_tz = get_from_internationalization_api();
                }

                if (!preliminary_tz) {
                    preliminary_tz = jstz.olson.timezones[needle];

                    if (typeof consts.AMBIGUITIES[preliminary_tz] !== 'undefined') {
                        preliminary_tz = get_by_dst(preliminary_tz);
                    }
                }

                return {
                    name: function () {
                        return preliminary_tz;
                    },
                    using_intl: using_intl || typeof using_intl === 'undefined',
                    needle: needle,
                    offsets: get_offsets()
                };
            };

        return {
            determine: determine
        };
    }());


    jstz.olson = jstz.olson || {};

    /**
     * The keys in this dictionary are comma separated as such:
     *
     * First the offset compared to UTC time in minutes.
     *
     * Then a flag which is 0 if the timezone does not take daylight savings into account and 1 if it
     * does.
     *
     * Thirdly an optional 's' signifies that the timezone is in the southern hemisphere,
     * only interesting for timezones with DST.
     *
     * The mapped arrays is used for constructing the jstz.TimeZone object from within
     * jstz.determine();
     */
    jstz.olson.timezones = {
        '-720,0': 'Etc/GMT+12',
        '-660,0': 'Pacific/Pago_Pago',
        '-660,1,s': 'Pacific/Apia', // Why? Because windows... cry!
        '-600,1': 'America/Adak',
        '-600,0': 'Pacific/Honolulu',
        '-570,0': 'Pacific/Marquesas',
        '-540,0': 'Pacific/Gambier',
        '-540,1': 'America/Anchorage',
        '-480,1': 'America/Los_Angeles',
        '-480,0': 'Pacific/Pitcairn',
        '-420,0': 'America/Phoenix',
        '-420,1': 'America/Denver',
        '-360,0': 'America/Guatemala',
        '-360,1': 'America/Chicago',
        '-360,1,s': 'Pacific/Easter',
        '-300,0': 'America/Bogota',
        '-300,1': 'America/New_York',
        '-270,0': 'America/Caracas',
        '-240,1': 'America/Halifax',
        '-240,0': 'America/Santo_Domingo',
        '-240,1,s': 'America/Asuncion',
        '-210,1': 'America/St_Johns',
        '-180,1': 'America/Godthab',
        '-180,0': 'America/Buenos_Aires',
        '-180,1,s': 'America/Montevideo',
        '-120,0': 'America/Noronha',
        '-120,1': 'America/Noronha',
        '-60,1': 'Atlantic/Azores',
        '-60,0': 'Atlantic/Cape_Verde',
        '0,0': 'UTC',
        '0,1': 'Europe/London',
        '0,1,weird': 'Africa/Casablanca',
        '60,1': 'Europe/Berlin',
        '60,0': 'Africa/Lagos',
        '60,1,weird': 'Africa/Casablanca',
        '120,1': 'Asia/Beirut',
        '120,1,weird': 'Africa/Cairo',
        '120,0': 'Africa/Johannesburg',
        '180,0': 'Asia/Baghdad',
        '180,1': 'Europe/Moscow',
        '210,1': 'Asia/Tehran',
        '240,0': 'Asia/Dubai',
        '240,1': 'Asia/Baku',
        '270,0': 'Asia/Kabul',
        '300,1': 'Asia/Yekaterinburg',
        '300,0': 'Asia/Karachi',
        '330,0': 'Asia/Calcutta',
        '345,0': 'Asia/Katmandu',
        '360,0': 'Asia/Dhaka',
        '360,1': 'Asia/Omsk',
        '390,0': 'Asia/Rangoon',
        '420,1': 'Asia/Krasnoyarsk',
        '420,0': 'Asia/Jakarta',
        '480,0': 'Asia/Shanghai',
        '480,1': 'Asia/Irkutsk',
        '525,0': 'Australia/Eucla',
        '525,1,s': 'Australia/Eucla',
        '540,1': 'Asia/Yakutsk',
        '540,0': 'Asia/Tokyo',
        '570,0': 'Australia/Darwin',
        '570,1,s': 'Australia/Adelaide',
        '600,0': 'Australia/Brisbane',
        '600,1': 'Asia/Vladivostok',
        '600,1,s': 'Australia/Sydney',
        '630,1,s': 'Australia/Lord_Howe',
        '660,1': 'Asia/Kamchatka',
        '660,0': 'Pacific/Noumea',
        '690,0': 'Pacific/Norfolk',
        '720,1,s': 'Pacific/Auckland',
        '720,0': 'Pacific/Majuro',
        '765,1,s': 'Pacific/Chatham',
        '780,0': 'Pacific/Tongatapu',
        '780,1,s': 'Pacific/Apia',
        '840,0': 'Pacific/Kiritimati'
    };

    /* Build time: 2019-09-09 11:29:41Z Build by invoking python utilities/dst.py generate */
    jstz.olson.dst_rules = {
        "years": [
            2008,
            2009,
            2010,
            2011,
            2012,
            2013,
            2014
        ],
        "zones": [
            {
                "name": "Africa/Cairo",
                "rules": [
                    {
                        "e": 1219957200000,
                        "s": 1209074400000
                    },
                    {
                        "e": 1250802000000,
                        "s": 1240524000000
                    },
                    {
                        "e": 1285880400000,
                        "s": 1284069600000
                    },
                    false,
                    false,
                    false,
                    {
                        "e": 1411678800000,
                        "s": 1406844000000
                    }
                ]
            },
            {
                "name": "America/Asuncion",
                "rules": [
                    {
                        "e": 1205031600000,
                        "s": 1224388800000
                    },
                    {
                        "e": 1236481200000,
                        "s": 1255838400000
                    },
                    {
                        "e": 1270954800000,
                        "s": 1286078400000
                    },
                    {
                        "e": 1302404400000,
                        "s": 1317528000000
                    },
                    {
                        "e": 1333854000000,
                        "s": 1349582400000
                    },
                    {
                        "e": 1364094000000,
                        "s": 1381032000000
                    },
                    {
                        "e": 1395543600000,
                        "s": 1412481600000
                    }
                ]
            },
            {
                "name": "America/Campo_Grande",
                "rules": [
                    {
                        "e": 1203217200000,
                        "s": 1224388800000
                    },
                    {
                        "e": 1234666800000,
                        "s": 1255838400000
                    },
                    {
                        "e": 1266721200000,
                        "s": 1287288000000
                    },
                    {
                        "e": 1298170800000,
                        "s": 1318737600000
                    },
                    {
                        "e": 1330225200000,
                        "s": 1350792000000
                    },
                    {
                        "e": 1361070000000,
                        "s": 1382241600000
                    },
                    {
                        "e": 1392519600000,
                        "s": 1413691200000
                    }
                ]
            },
            {
                "name": "America/Goose_Bay",
                "rules": [
                    {
                        "e": 1225594860000,
                        "s": 1205035260000
                    },
                    {
                        "e": 1257044460000,
                        "s": 1236484860000
                    },
                    {
                        "e": 1289098860000,
                        "s": 1268539260000
                    },
                    {
                        "e": 1320555600000,
                        "s": 1299988860000
                    },
                    {
                        "e": 1352005200000,
                        "s": 1331445600000
                    },
                    {
                        "e": 1383454800000,
                        "s": 1362895200000
                    },
                    {
                        "e": 1414904400000,
                        "s": 1394344800000
                    }
                ]
            },
            {
                "name": "America/Havana",
                "rules": [
                    {
                        "e": 1224997200000,
                        "s": 1205643600000
                    },
                    {
                        "e": 1256446800000,
                        "s": 1236488400000
                    },
                    {
                        "e": 1288501200000,
                        "s": 1268542800000
                    },
                    {
                        "e": 1321160400000,
                        "s": 1300597200000
                    },
                    {
                        "e": 1352005200000,
                        "s": 1333256400000
                    },
                    {
                        "e": 1383454800000,
                        "s": 1362891600000
                    },
                    {
                        "e": 1414904400000,
                        "s": 1394341200000
                    }
                ]
            },
            {
                "name": "America/Mazatlan",
                "rules": [
                    {
                        "e": 1225008000000,
                        "s": 1207472400000
                    },
                    {
                        "e": 1256457600000,
                        "s": 1238922000000
                    },
                    {
                        "e": 1288512000000,
                        "s": 1270371600000
                    },
                    {
                        "e": 1319961600000,
                        "s": 1301821200000
                    },
                    {
                        "e": 1351411200000,
                        "s": 1333270800000
                    },
                    {
                        "e": 1382860800000,
                        "s": 1365325200000
                    },
                    {
                        "e": 1414310400000,
                        "s": 1396774800000
                    }
                ]
            },
            {
                "name": "America/Mexico_City",
                "rules": [
                    {
                        "e": 1225004400000,
                        "s": 1207468800000
                    },
                    {
                        "e": 1256454000000,
                        "s": 1238918400000
                    },
                    {
                        "e": 1288508400000,
                        "s": 1270368000000
                    },
                    {
                        "e": 1319958000000,
                        "s": 1301817600000
                    },
                    {
                        "e": 1351407600000,
                        "s": 1333267200000
                    },
                    {
                        "e": 1382857200000,
                        "s": 1365321600000
                    },
                    {
                        "e": 1414306800000,
                        "s": 1396771200000
                    }
                ]
            },
            {
                "name": "America/Miquelon",
                "rules": [
                    {
                        "e": 1225598400000,
                        "s": 1205038800000
                    },
                    {
                        "e": 1257048000000,
                        "s": 1236488400000
                    },
                    {
                        "e": 1289102400000,
                        "s": 1268542800000
                    },
                    {
                        "e": 1320552000000,
                        "s": 1299992400000
                    },
                    {
                        "e": 1352001600000,
                        "s": 1331442000000
                    },
                    {
                        "e": 1383451200000,
                        "s": 1362891600000
                    },
                    {
                        "e": 1414900800000,
                        "s": 1394341200000
                    }
                ]
            },
            {
                "name": "America/Santa_Isabel",
                "rules": [
                    {
                        "e": 1225011600000,
                        "s": 1207476000000
                    },
                    {
                        "e": 1256461200000,
                        "s": 1238925600000
                    },
                    {
                        "e": 1289120400000,
                        "s": 1268560800000
                    },
                    {
                        "e": 1320570000000,
                        "s": 1300010400000
                    },
                    {
                        "e": 1352019600000,
                        "s": 1331460000000
                    },
                    {
                        "e": 1383469200000,
                        "s": 1362909600000
                    },
                    {
                        "e": 1414918800000,
                        "s": 1394359200000
                    }
                ]
            },
            {
                "name": "America/Santiago",
                "rules": [
                    {
                        "e": 1206846000000,
                        "s": 1223784000000
                    },
                    {
                        "e": 1237086000000,
                        "s": 1255233600000
                    },
                    {
                        "e": 1270350000000,
                        "s": 1286683200000
                    },
                    {
                        "e": 1304823600000,
                        "s": 1313899200000
                    },
                    {
                        "e": 1335668400000,
                        "s": 1346558400000
                    },
                    {
                        "e": 1367118000000,
                        "s": 1378612800000
                    },
                    {
                        "e": 1398567600000,
                        "s": 1410062400000
                    }
                ]
            },
            {
                "name": "America/Sao_Paulo",
                "rules": [
                    {
                        "e": 1203213600000,
                        "s": 1224385200000
                    },
                    {
                        "e": 1234663200000,
                        "s": 1255834800000
                    },
                    {
                        "e": 1266717600000,
                        "s": 1287284400000
                    },
                    {
                        "e": 1298167200000,
                        "s": 1318734000000
                    },
                    {
                        "e": 1330221600000,
                        "s": 1350788400000
                    },
                    {
                        "e": 1361066400000,
                        "s": 1382238000000
                    },
                    {
                        "e": 1392516000000,
                        "s": 1413687600000
                    }
                ]
            },
            {
                "name": "Asia/Amman",
                "rules": [
                    {
                        "e": 1225404000000,
                        "s": 1206655200000
                    },
                    {
                        "e": 1256853600000,
                        "s": 1238104800000
                    },
                    {
                        "e": 1288303200000,
                        "s": 1269554400000
                    },
                    {
                        "e": 1319752800000,
                        "s": 1301608800000
                    },
                    false,
                    false,
                    {
                        "e": 1414706400000,
                        "s": 1395957600000
                    }
                ]
            },
            {
                "name": "Asia/Damascus",
                "rules": [
                    {
                        "e": 1225486800000,
                        "s": 1207260000000
                    },
                    {
                        "e": 1256850000000,
                        "s": 1238104800000
                    },
                    {
                        "e": 1288299600000,
                        "s": 1270159200000
                    },
                    {
                        "e": 1319749200000,
                        "s": 1301608800000
                    },
                    {
                        "e": 1351198800000,
                        "s": 1333058400000
                    },
                    {
                        "e": 1382648400000,
                        "s": 1364508000000
                    },
                    {
                        "e": 1414702800000,
                        "s": 1395957600000
                    }
                ]
            },
            {
                "name": "Asia/Dubai",
                "rules": [
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Asia/Gaza",
                "rules": [
                    {
                        "e": 1219957200000,
                        "s": 1206655200000
                    },
                    {
                        "e": 1252015200000,
                        "s": 1238104800000
                    },
                    {
                        "e": 1281474000000,
                        "s": 1269640860000
                    },
                    {
                        "e": 1312146000000,
                        "s": 1301608860000
                    },
                    {
                        "e": 1348178400000,
                        "s": 1333058400000
                    },
                    {
                        "e": 1380229200000,
                        "s": 1364508000000
                    },
                    {
                        "e": 1414098000000,
                        "s": 1395957600000
                    }
                ]
            },
            {
                "name": "Asia/Irkutsk",
                "rules": [
                    {
                        "e": 1224957600000,
                        "s": 1206813600000
                    },
                    {
                        "e": 1256407200000,
                        "s": 1238263200000
                    },
                    {
                        "e": 1288461600000,
                        "s": 1269712800000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Asia/Jerusalem",
                "rules": [
                    {
                        "e": 1223161200000,
                        "s": 1206662400000
                    },
                    {
                        "e": 1254006000000,
                        "s": 1238112000000
                    },
                    {
                        "e": 1284246000000,
                        "s": 1269561600000
                    },
                    {
                        "e": 1317510000000,
                        "s": 1301616000000
                    },
                    {
                        "e": 1348354800000,
                        "s": 1333065600000
                    },
                    {
                        "e": 1382828400000,
                        "s": 1364515200000
                    },
                    {
                        "e": 1414278000000,
                        "s": 1395964800000
                    }
                ]
            },
            {
                "name": "Asia/Kamchatka",
                "rules": [
                    {
                        "e": 1224943200000,
                        "s": 1206799200000
                    },
                    {
                        "e": 1256392800000,
                        "s": 1238248800000
                    },
                    {
                        "e": 1288450800000,
                        "s": 1269698400000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Asia/Krasnoyarsk",
                "rules": [
                    {
                        "e": 1224961200000,
                        "s": 1206817200000
                    },
                    {
                        "e": 1256410800000,
                        "s": 1238266800000
                    },
                    {
                        "e": 1288465200000,
                        "s": 1269716400000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Asia/Omsk",
                "rules": [
                    {
                        "e": 1224964800000,
                        "s": 1206820800000
                    },
                    {
                        "e": 1256414400000,
                        "s": 1238270400000
                    },
                    {
                        "e": 1288468800000,
                        "s": 1269720000000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Asia/Vladivostok",
                "rules": [
                    {
                        "e": 1224950400000,
                        "s": 1206806400000
                    },
                    {
                        "e": 1256400000000,
                        "s": 1238256000000
                    },
                    {
                        "e": 1288454400000,
                        "s": 1269705600000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Asia/Yakutsk",
                "rules": [
                    {
                        "e": 1224954000000,
                        "s": 1206810000000
                    },
                    {
                        "e": 1256403600000,
                        "s": 1238259600000
                    },
                    {
                        "e": 1288458000000,
                        "s": 1269709200000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Asia/Yekaterinburg",
                "rules": [
                    {
                        "e": 1224968400000,
                        "s": 1206824400000
                    },
                    {
                        "e": 1256418000000,
                        "s": 1238274000000
                    },
                    {
                        "e": 1288472400000,
                        "s": 1269723600000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Asia/Yerevan",
                "rules": [
                    {
                        "e": 1224972000000,
                        "s": 1206828000000
                    },
                    {
                        "e": 1256421600000,
                        "s": 1238277600000
                    },
                    {
                        "e": 1288476000000,
                        "s": 1269727200000
                    },
                    {
                        "e": 1319925600000,
                        "s": 1301176800000
                    },
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Australia/Lord_Howe",
                "rules": [
                    {
                        "e": 1207407600000,
                        "s": 1223134200000
                    },
                    {
                        "e": 1238857200000,
                        "s": 1254583800000
                    },
                    {
                        "e": 1270306800000,
                        "s": 1286033400000
                    },
                    {
                        "e": 1301756400000,
                        "s": 1317483000000
                    },
                    {
                        "e": 1333206000000,
                        "s": 1349537400000
                    },
                    {
                        "e": 1365260400000,
                        "s": 1380987000000
                    },
                    {
                        "e": 1396710000000,
                        "s": 1412436600000
                    }
                ]
            },
            {
                "name": "Australia/Perth",
                "rules": [
                    {
                        "e": 1206813600000,
                        "s": 1224957600000
                    },
                    false,
                    false,
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Europe/Helsinki",
                "rules": [
                    {
                        "e": 1224982800000,
                        "s": 1206838800000
                    },
                    {
                        "e": 1256432400000,
                        "s": 1238288400000
                    },
                    {
                        "e": 1288486800000,
                        "s": 1269738000000
                    },
                    {
                        "e": 1319936400000,
                        "s": 1301187600000
                    },
                    {
                        "e": 1351386000000,
                        "s": 1332637200000
                    },
                    {
                        "e": 1382835600000,
                        "s": 1364691600000
                    },
                    {
                        "e": 1414285200000,
                        "s": 1396141200000
                    }
                ]
            },
            {
                "name": "Europe/Minsk",
                "rules": [
                    {
                        "e": 1224979200000,
                        "s": 1206835200000
                    },
                    {
                        "e": 1256428800000,
                        "s": 1238284800000
                    },
                    {
                        "e": 1288483200000,
                        "s": 1269734400000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Europe/Moscow",
                "rules": [
                    {
                        "e": 1224975600000,
                        "s": 1206831600000
                    },
                    {
                        "e": 1256425200000,
                        "s": 1238281200000
                    },
                    {
                        "e": 1288479600000,
                        "s": 1269730800000
                    },
                    false,
                    false,
                    false,
                    false
                ]
            },
            {
                "name": "Pacific/Apia",
                "rules": [
                    false,
                    false,
                    false,
                    {
                        "e": 1301752800000,
                        "s": 1316872800000
                    },
                    {
                        "e": 1333202400000,
                        "s": 1348927200000
                    },
                    {
                        "e": 1365256800000,
                        "s": 1380376800000
                    },
                    {
                        "e": 1396706400000,
                        "s": 1411826400000
                    }
                ]
            },
            {
                "name": "Pacific/Fiji",
                "rules": [
                    false,
                    false,
                    {
                        "e": 1269698400000,
                        "s": 1287842400000
                    },
                    {
                        "e": 1327154400000,
                        "s": 1319292000000
                    },
                    {
                        "e": 1358604000000,
                        "s": 1350741600000
                    },
                    {
                        "e": 1390050000000,
                        "s": 1382796000000
                    },
                    {
                        "e": 1421503200000,
                        "s": 1414850400000
                    }
                ]
            },
            {
                "name": "Europe/London",
                "rules": [
                    {
                        "e": 1224982800000,
                        "s": 1206838800000
                    },
                    {
                        "e": 1256432400000,
                        "s": 1238288400000
                    },
                    {
                        "e": 1288486800000,
                        "s": 1269738000000
                    },
                    {
                        "e": 1319936400000,
                        "s": 1301187600000
                    },
                    {
                        "e": 1351386000000,
                        "s": 1332637200000
                    },
                    {
                        "e": 1382835600000,
                        "s": 1364691600000
                    },
                    {
                        "e": 1414285200000,
                        "s": 1396141200000
                    }
                ]
            },
            {
                "name": "Africa/Windhoek",
                "rules": [
                    {
                        "e": 1220749200000,
                        "s": 1207440000000
                    },
                    {
                        "e": 1252198800000,
                        "s": 1238889600000
                    },
                    {
                        "e": 1283648400000,
                        "s": 1270339200000
                    },
                    {
                        "e": 1315098000000,
                        "s": 1301788800000
                    },
                    {
                        "e": 1346547600000,
                        "s": 1333238400000
                    },
                    {
                        "e": 1377997200000,
                        "s": 1365292800000
                    },
                    {
                        "e": 1410051600000,
                        "s": 1396742400000
                    }
                ]
            }
        ]
    };

    return jstz;
});

define('skylark-formio/utils/jsonlogic/operators',[],function () {
    'use strict';
    const lodashOperators = [
        'chunk',
        'compact',
        'concat',
        'difference',
        'differenceBy',
        'differenceWith',
        'drop',
        'dropRight',
        'dropRightWhile',
        'dropWhile',
        'findIndex',
        'findLastIndex',
        'first',
        'flatten',
        'flattenDeep',
        'flattenDepth',
        'fromPairs',
        'head',
        'indexOf',
        'initial',
        'intersection',
        'intersectionBy',
        'intersectionWith',
        'join',
        'last',
        'lastIndexOf',
        'nth',
        'slice',
        'sortedIndex',
        'sortedIndexBy',
        'sortedIndexOf',
        'sortedLastIndex',
        'sortedLastIndexBy',
        'sortedLastIndexOf',
        'sortedUniq',
        'sortedUniqBy',
        'tail',
        'take',
        'takeRight',
        'takeRightWhile',
        'takeWhile',
        'union',
        'unionBy',
        'unionWith',
        'uniq',
        'uniqBy',
        'uniqWith',
        'unzip',
        'unzipWith',
        'without',
        'xor',
        'xorBy',
        'xorWith',
        'zip',
        'zipObject',
        'zipObjectDeep',
        'zipWith',
        'countBy',
        'every',
        'filter',
        'find',
        'findLast',
        'flatMap',
        'flatMapDeep',
        'flatMapDepth',
        'groupBy',
        'includes',
        'invokeMap',
        'keyBy',
        'map',
        'orderBy',
        'partition',
        'reduce',
        'reduceRight',
        'reject',
        'sample',
        'sampleSize',
        'shuffle',
        'size',
        'some',
        'sortBy',
        'now',
        'flip',
        'negate',
        'overArgs',
        'partial',
        'partialRight',
        'rearg',
        'rest',
        'spread',
        'castArray',
        'clone',
        'cloneDeep',
        'cloneDeepWith',
        'cloneDeep',
        'conformsTo',
        'eq',
        'gt',
        'gte',
        'isArguments',
        'isArray',
        'isArrayBuffer',
        'isArrayLike',
        'isArrayLikeObject',
        'isBoolean',
        'isBuffer',
        'isDate',
        'isElement',
        'isEmpty',
        'isEqual',
        'isEqualWith',
        'isError',
        'isFinite',
        'isFunction',
        'isInteger',
        'isLength',
        'isMap',
        'isMatch',
        'isMatchWith',
        'isNaN',
        'isNative',
        'isNil',
        'isNull',
        'isNumber',
        'isObject',
        'isObjectLike',
        'isPlainObject',
        'isRegExp',
        'isSafeInteger',
        'isSet',
        'isString',
        'isSymbol',
        'isTypedArray',
        'isUndefined',
        'isWeakMap',
        'isWeakSet',
        'lt',
        'lte',
        'toArray',
        'toFinite',
        'toInteger',
        'toLength',
        'toNumber',
        'toPlainObject',
        'toSafeInteger',
        'toString',
        'add',
        'ceil',
        'divide',
        'floor',
        'max',
        'maxBy',
        'mean',
        'meanBy',
        'min',
        'minBy',
        'multiply',
        'round',
        'subtract',
        'sum',
        'sumBy',
        'clamp',
        'inRange',
        'random',
        'at',
        'entries',
        'entriesIn',
        'findKey',
        'findLastKey',
        'functions',
        'functionsIn',
        'get',
        'has',
        'hasIn',
        'invert',
        'invertBy',
        'invoke',
        'keys',
        'keysIn',
        'mapKeys',
        'mapValues',
        'omit',
        'omitBy',
        'pick',
        'pickBy',
        'result',
        'toPairs',
        'toPairsIn',
        'transform',
        'values',
        'valuesIn',
        'camelCase',
        'capitalize',
        'deburr',
        'endsWith',
        'escape',
        'escapeRegExp',
        'kebabCase',
        'lowerCase',
        'lowerFirst',
        'pad',
        'padEnd',
        'padStart',
        'parseInt',
        'repeat',
        'replace',
        'snakeCase',
        'split',
        'startCase',
        'startsWith',
        'toLower',
        'toUpper',
        'trim',
        'trimEnd',
        'trimStart',
        'truncate',
        'unescape',
        'upperCase',
        'upperFirst',
        'words',
        'cond',
        'conforms',
        'constant',
        'defaultTo',
        'flow',
        'flowRight',
        'identity',
        'iteratee',
        'matches',
        'matchesProperty',
        'method',
        'methodOf',
        'nthArg',
        'over',
        'overEvery',
        'overSome',
        'property',
        'propertyOf',
        'range',
        'rangeRight',
        'stubArray',
        'stubFalse',
        'stubObject',
        'stubString',
        'stubTrue',
        'times',
        'toPath',
        'uniqueId'
    ];
    return { lodashOperators: lodashOperators };
});
define('skylark-formio/vendors/dompurify/purify',[],function(){
  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var hasOwnProperty = Object.hasOwnProperty,
      setPrototypeOf = Object.setPrototypeOf,
      isFrozen = Object.isFrozen,
      objectKeys = Object.keys;
  var freeze = Object.freeze,
      seal = Object.seal,
      create = Object.create; // eslint-disable-line import/no-mutable-exports

  var _ref = typeof Reflect !== 'undefined' && Reflect,
      apply = _ref.apply,
      construct = _ref.construct;

  if (!apply) {
    apply = function apply(fun, thisValue, args) {
      return fun.apply(thisValue, args);
    };
  }

  if (!freeze) {
    freeze = function freeze(x) {
      return x;
    };
  }

  if (!seal) {
    seal = function seal(x) {
      return x;
    };
  }

  if (!construct) {
    construct = function construct(Func, args) {
      return new (Function.prototype.bind.apply(Func, [null].concat(_toConsumableArray(args))))();
    };
  }

  var arrayForEach = unapply(Array.prototype.forEach);
  var arrayIndexOf = unapply(Array.prototype.indexOf);
  var arrayJoin = unapply(Array.prototype.join);
  var arrayPop = unapply(Array.prototype.pop);
  var arrayPush = unapply(Array.prototype.push);
  var arraySlice = unapply(Array.prototype.slice);

  var stringToLowerCase = unapply(String.prototype.toLowerCase);
  var stringMatch = unapply(String.prototype.match);
  var stringReplace = unapply(String.prototype.replace);
  var stringIndexOf = unapply(String.prototype.indexOf);
  var stringTrim = unapply(String.prototype.trim);

  var regExpTest = unapply(RegExp.prototype.test);
  var regExpCreate = unconstruct(RegExp);

  var typeErrorCreate = unconstruct(TypeError);

  function unapply(func) {
    return function (thisArg) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return apply(func, thisArg, args);
    };
  }

  function unconstruct(func) {
    return function () {
      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return construct(func, args);
    };
  }

  /* Add properties to a lookup table */
  function addToSet(set, array) {
    if (setPrototypeOf) {
      // Make 'in' and truthy checks like Boolean(set.constructor)
      // independent of any properties defined on Object.prototype.
      // Prevent prototype setters from intercepting set as a this value.
      setPrototypeOf(set, null);
    }

    var l = array.length;
    while (l--) {
      var element = array[l];
      if (typeof element === 'string') {
        var lcElement = stringToLowerCase(element);
        if (lcElement !== element) {
          // Config presets (e.g. tags.js, attrs.js) are immutable.
          if (!isFrozen(array)) {
            array[l] = lcElement;
          }

          element = lcElement;
        }
      }

      set[element] = true;
    }

    return set;
  }

  /* Shallow clone an object */
  function clone(object) {
    var newObject = create(null);

    var property = void 0;
    for (property in object) {
      if (apply(hasOwnProperty, object, [property])) {
        newObject[property] = object[property];
      }
    }

    return newObject;
  }

  var html = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);

  // SVG
  var svg = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'audio', 'canvas', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'image', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'style', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'video', 'view', 'vkern']);

  var svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR', 'feGaussianBlur', 'feMerge', 'feMergeNode', 'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile', 'feTurbulence']);

  var mathMl = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

  var text = freeze(['#text']);

  var html$1 = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background', 'bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'disablepictureinpicture', 'disableremoteplayback', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method', 'min', 'minlength', 'multiple', 'muted', 'name', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'spellcheck', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'xmlns']);

  var svg$1 = freeze(['accent-height', 'accumulate', 'additive', 'alignment-baseline', 'ascent', 'attributename', 'attributetype', 'azimuth', 'basefrequency', 'baseline-shift', 'begin', 'bias', 'by', 'class', 'clip', 'clippathunits', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-interpolation-filters', 'color-profile', 'color-rendering', 'cx', 'cy', 'd', 'dx', 'dy', 'diffuseconstant', 'direction', 'display', 'divisor', 'dur', 'edgemode', 'elevation', 'end', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'filterunits', 'flood-color', 'flood-opacity', 'font-family', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-variant', 'font-weight', 'fx', 'fy', 'g1', 'g2', 'glyph-name', 'glyphref', 'gradientunits', 'gradienttransform', 'height', 'href', 'id', 'image-rendering', 'in', 'in2', 'k', 'k1', 'k2', 'k3', 'k4', 'kerning', 'keypoints', 'keysplines', 'keytimes', 'lang', 'lengthadjust', 'letter-spacing', 'kernelmatrix', 'kernelunitlength', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'markerheight', 'markerunits', 'markerwidth', 'maskcontentunits', 'maskunits', 'max', 'mask', 'media', 'method', 'mode', 'min', 'name', 'numoctaves', 'offset', 'operator', 'opacity', 'order', 'orient', 'orientation', 'origin', 'overflow', 'paint-order', 'path', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'rx', 'ry', 'radius', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'scale', 'seed', 'shape-rendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stitchtiles', 'stop-color', 'stop-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-opacity', 'stroke', 'stroke-width', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'transform', 'text-anchor', 'text-decoration', 'text-rendering', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vert-adv-y', 'vert-origin-x', 'vert-origin-y', 'width', 'word-spacing', 'wrap', 'writing-mode', 'xchannelselector', 'ychannelselector', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2', 'z', 'zoomandpan']);

  var mathMl$1 = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'denomalign', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'lquote', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'open', 'rowalign', 'rowlines', 'rowspacing', 'rowspan', 'rspace', 'rquote', 'scriptlevel', 'scriptminsize', 'scriptsizemultiplier', 'selection', 'separator', 'separators', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);

  var xml = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

  // eslint-disable-next-line unicorn/better-regex
  var MUSTACHE_EXPR = seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
  var ERB_EXPR = seal(/<%[\s\S]*|[\s\S]*%>/gm);
  var DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
  var ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
  var IS_ALLOWED_URI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
  );
  var IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
  var ATTR_WHITESPACE = seal(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
  );

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

  function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

  var getGlobal = function getGlobal() {
    return typeof window === 'undefined' ? null : window;
  };

  /**
   * Creates a no-op policy for internal use only.
   * Don't export this function outside this module!
   * @param {?TrustedTypePolicyFactory} trustedTypes The policy factory.
   * @param {Document} document The document object (to determine policy name suffix)
   * @return {?TrustedTypePolicy} The policy created (or null, if Trusted Types
   * are not supported).
   */
  var _createTrustedTypesPolicy = function _createTrustedTypesPolicy(trustedTypes, document) {
    if ((typeof trustedTypes === 'undefined' ? 'undefined' : _typeof(trustedTypes)) !== 'object' || typeof trustedTypes.createPolicy !== 'function') {
      return null;
    }

    // Allow the callers to control the unique policy name
    // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
    // Policy creation with duplicate names throws in Trusted Types.
    var suffix = null;
    var ATTR_NAME = 'data-tt-policy-suffix';
    if (document.currentScript && document.currentScript.hasAttribute(ATTR_NAME)) {
      suffix = document.currentScript.getAttribute(ATTR_NAME);
    }

    var policyName = 'dompurify' + (suffix ? '#' + suffix : '');

    try {
      return trustedTypes.createPolicy(policyName, {
        createHTML: function createHTML(html$$1) {
          return html$$1;
        }
      });
    } catch (_) {
      // Policy creation failed (most likely another DOMPurify script has
      // already run). Skip creating the policy, as this will only cause errors
      // if TT are enforced.
      console.warn('TrustedTypes policy ' + policyName + ' could not be created.');
      return null;
    }
  };

  function createDOMPurify() {
    var window = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : getGlobal();

    var DOMPurify = function DOMPurify(root) {
      return createDOMPurify(root);
    };

    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    DOMPurify.version = '2.0.16';

    /**
     * Array of elements that DOMPurify removed during sanitation.
     * Empty if nothing was removed.
     */
    DOMPurify.removed = [];

    if (!window || !window.document || window.document.nodeType !== 9) {
      // Not running in a browser, provide a factory function
      // so that you can pass your own Window
      DOMPurify.isSupported = false;

      return DOMPurify;
    }

    var originalDocument = window.document;
    var removeTitle = false;

    var document = window.document;
    var DocumentFragment = window.DocumentFragment,
        HTMLTemplateElement = window.HTMLTemplateElement,
        Node = window.Node,
        NodeFilter = window.NodeFilter,
        _window$NamedNodeMap = window.NamedNodeMap,
        NamedNodeMap = _window$NamedNodeMap === undefined ? window.NamedNodeMap || window.MozNamedAttrMap : _window$NamedNodeMap,
        Text = window.Text,
        Comment = window.Comment,
        DOMParser = window.DOMParser,
        trustedTypes = window.trustedTypes;

    // As per issue #47, the web-components registry is inherited by a
    // new document created via createHTMLDocument. As per the spec
    // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
    // a new empty registry is used when creating a template contents owner
    // document, so we use that as our parent document to ensure nothing
    // is inherited.

    if (typeof HTMLTemplateElement === 'function') {
      var template = document.createElement('template');
      if (template.content && template.content.ownerDocument) {
        document = template.content.ownerDocument;
      }
    }

    var trustedTypesPolicy = _createTrustedTypesPolicy(trustedTypes, originalDocument);
    var emptyHTML = trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML('') : '';

    var _document = document,
        implementation = _document.implementation,
        createNodeIterator = _document.createNodeIterator,
        getElementsByTagName = _document.getElementsByTagName,
        createDocumentFragment = _document.createDocumentFragment;
    var importNode = originalDocument.importNode;


    var documentMode = {};
    try {
      documentMode = clone(document).documentMode ? document.documentMode : {};
    } catch (_) {}

    var hooks = {};

    /**
     * Expose whether this browser supports running the full DOMPurify.
     */
    DOMPurify.isSupported = implementation && typeof implementation.createHTMLDocument !== 'undefined' && documentMode !== 9;

    var MUSTACHE_EXPR$$1 = MUSTACHE_EXPR,
        ERB_EXPR$$1 = ERB_EXPR,
        DATA_ATTR$$1 = DATA_ATTR,
        ARIA_ATTR$$1 = ARIA_ATTR,
        IS_SCRIPT_OR_DATA$$1 = IS_SCRIPT_OR_DATA,
        ATTR_WHITESPACE$$1 = ATTR_WHITESPACE;
    var IS_ALLOWED_URI$$1 = IS_ALLOWED_URI;

    /**
     * We consider the elements and attributes below to be safe. Ideally
     * don't add any new ones but feel free to remove unwanted ones.
     */

    /* allowed element names */

    var ALLOWED_TAGS = null;
    var DEFAULT_ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(html), _toConsumableArray$1(svg), _toConsumableArray$1(svgFilters), _toConsumableArray$1(mathMl), _toConsumableArray$1(text)));

    /* Allowed attribute names */
    var ALLOWED_ATTR = null;
    var DEFAULT_ALLOWED_ATTR = addToSet({}, [].concat(_toConsumableArray$1(html$1), _toConsumableArray$1(svg$1), _toConsumableArray$1(mathMl$1), _toConsumableArray$1(xml)));

    /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
    var FORBID_TAGS = null;

    /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
    var FORBID_ATTR = null;

    /* Decide if ARIA attributes are okay */
    var ALLOW_ARIA_ATTR = true;

    /* Decide if custom data attributes are okay */
    var ALLOW_DATA_ATTR = true;

    /* Decide if unknown protocols are okay */
    var ALLOW_UNKNOWN_PROTOCOLS = false;

    /* Output should be safe for jQuery's $() factory? */
    var SAFE_FOR_JQUERY = false;

    /* Output should be safe for common template engines.
     * This means, DOMPurify removes data attributes, mustaches and ERB
     */
    var SAFE_FOR_TEMPLATES = false;

    /* Decide if document with <html>... should be returned */
    var WHOLE_DOCUMENT = false;

    /* Track whether config is already set on this instance of DOMPurify. */
    var SET_CONFIG = false;

    /* Decide if all elements (e.g. style, script) must be children of
     * document.body. By default, browsers might move them to document.head */
    var FORCE_BODY = false;

    /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
     * string (or a TrustedHTML object if Trusted Types are supported).
     * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
     */
    var RETURN_DOM = false;

    /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
     * string  (or a TrustedHTML object if Trusted Types are supported) */
    var RETURN_DOM_FRAGMENT = false;

    /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
     * `Node` is imported into the current `Document`. If this flag is not enabled the
     * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
     * DOMPurify. */
    var RETURN_DOM_IMPORT = false;

    /* Try to return a Trusted Type object instead of a string, return a string in
     * case Trusted Types are not supported  */
    var RETURN_TRUSTED_TYPE = false;

    /* Output should be free from DOM clobbering attacks? */
    var SANITIZE_DOM = true;

    /* Keep element content when removing element? */
    var KEEP_CONTENT = true;

    /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
     * of importing it into a new Document and returning a sanitized copy */
    var IN_PLACE = false;

    /* Allow usage of profiles like html, svg and mathMl */
    var USE_PROFILES = {};

    /* Tags to ignore content of when KEEP_CONTENT is true */
    var FORBID_CONTENTS = addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'desc', 'foreignobject', 'head', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']);

    /* Tags that are safe for data: URIs */
    var DATA_URI_TAGS = null;
    var DEFAULT_DATA_URI_TAGS = addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']);

    /* Attributes safe for values like "javascript:" */
    var URI_SAFE_ATTRIBUTES = null;
    var DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, ['alt', 'class', 'for', 'id', 'label', 'name', 'pattern', 'placeholder', 'summary', 'title', 'value', 'style', 'xmlns']);

    /* Keep a reference to config to pass to hooks */
    var CONFIG = null;

    /* Ideally, do not touch anything below this line */
    /* ______________________________________________ */

    var formElement = document.createElement('form');

    /**
     * _parseConfig
     *
     * @param  {Object} cfg optional config literal
     */
    // eslint-disable-next-line complexity
    var _parseConfig = function _parseConfig(cfg) {
      if (CONFIG && CONFIG === cfg) {
        return;
      }

      /* Shield configuration object from tampering */
      if (!cfg || (typeof cfg === 'undefined' ? 'undefined' : _typeof(cfg)) !== 'object') {
        cfg = {};
      }

      /* Shield configuration object from prototype pollution */
      cfg = clone(cfg);

      /* Set configuration parameters */
      ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
      ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
      URI_SAFE_ATTRIBUTES = 'ADD_URI_SAFE_ATTR' in cfg ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
      DATA_URI_TAGS = 'ADD_DATA_URI_TAGS' in cfg ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS) : DEFAULT_DATA_URI_TAGS;
      FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
      FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
      USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
      ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
      ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
      ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
      SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY || false; // Default false
      SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
      WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
      RETURN_DOM = cfg.RETURN_DOM || false; // Default false
      RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
      RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT || false; // Default false
      RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
      FORCE_BODY = cfg.FORCE_BODY || false; // Default false
      SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
      KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
      IN_PLACE = cfg.IN_PLACE || false; // Default false
      IS_ALLOWED_URI$$1 = cfg.ALLOWED_URI_REGEXP || IS_ALLOWED_URI$$1;
      if (SAFE_FOR_TEMPLATES) {
        ALLOW_DATA_ATTR = false;
      }

      if (RETURN_DOM_FRAGMENT) {
        RETURN_DOM = true;
      }

      /* Parse profile info */
      if (USE_PROFILES) {
        ALLOWED_TAGS = addToSet({}, [].concat(_toConsumableArray$1(text)));
        ALLOWED_ATTR = [];
        if (USE_PROFILES.html === true) {
          addToSet(ALLOWED_TAGS, html);
          addToSet(ALLOWED_ATTR, html$1);
        }

        if (USE_PROFILES.svg === true) {
          addToSet(ALLOWED_TAGS, svg);
          addToSet(ALLOWED_ATTR, svg$1);
          addToSet(ALLOWED_ATTR, xml);
        }

        if (USE_PROFILES.svgFilters === true) {
          addToSet(ALLOWED_TAGS, svgFilters);
          addToSet(ALLOWED_ATTR, svg$1);
          addToSet(ALLOWED_ATTR, xml);
        }

        if (USE_PROFILES.mathMl === true) {
          addToSet(ALLOWED_TAGS, mathMl);
          addToSet(ALLOWED_ATTR, mathMl$1);
          addToSet(ALLOWED_ATTR, xml);
        }
      }

      /* Merge configuration parameters */
      if (cfg.ADD_TAGS) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = clone(ALLOWED_TAGS);
        }

        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
      }

      if (cfg.ADD_ATTR) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = clone(ALLOWED_ATTR);
        }

        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
      }

      if (cfg.ADD_URI_SAFE_ATTR) {
        addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
      }

      /* Add #text in case KEEP_CONTENT is set to true */
      if (KEEP_CONTENT) {
        ALLOWED_TAGS['#text'] = true;
      }

      /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
      if (WHOLE_DOCUMENT) {
        addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
      }

      /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
      if (ALLOWED_TAGS.table) {
        addToSet(ALLOWED_TAGS, ['tbody']);
        delete FORBID_TAGS.tbody;
      }

      // Prevent further manipulation of configuration.
      // Not available in IE8, Safari 5, etc.
      if (freeze) {
        freeze(cfg);
      }

      CONFIG = cfg;
    };

    /**
     * _forceRemove
     *
     * @param  {Node} node a DOM node
     */
    var _forceRemove = function _forceRemove(node) {
      arrayPush(DOMPurify.removed, { element: node });
      try {
        node.parentNode.removeChild(node);
      } catch (_) {
        node.outerHTML = emptyHTML;
      }
    };

    /**
     * _removeAttribute
     *
     * @param  {String} name an Attribute name
     * @param  {Node} node a DOM node
     */
    var _removeAttribute = function _removeAttribute(name, node) {
      try {
        arrayPush(DOMPurify.removed, {
          attribute: node.getAttributeNode(name),
          from: node
        });
      } catch (_) {
        arrayPush(DOMPurify.removed, {
          attribute: null,
          from: node
        });
      }

      node.removeAttribute(name);
    };

    /**
     * _initDocument
     *
     * @param  {String} dirty a string of dirty markup
     * @return {Document} a DOM, filled with the dirty markup
     */
    var _initDocument = function _initDocument(dirty) {
      /* Create a HTML document */
      var doc = void 0;
      var leadingWhitespace = void 0;

      if (FORCE_BODY) {
        dirty = '<remove></remove>' + dirty;
      } else {
        /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
        var matches = stringMatch(dirty, /^[\r\n\t ]+/);
        leadingWhitespace = matches && matches[0];
      }

      var dirtyPayload = trustedTypesPolicy ? trustedTypesPolicy.createHTML(dirty) : dirty;
      /* Use the DOMParser API by default, fallback later if needs be */
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, 'text/html');
      } catch (_) {}

      /* Remove title to fix a mXSS bug in older MS Edge */
      if (removeTitle) {
        addToSet(FORBID_TAGS, ['title']);
      }

      /* Use createHTMLDocument in case DOMParser is not available */
      if (!doc || !doc.documentElement) {
        doc = implementation.createHTMLDocument('');
        var _doc = doc,
            body = _doc.body;

        body.parentNode.removeChild(body.parentNode.firstElementChild);
        body.outerHTML = dirtyPayload;
      }

      if (dirty && leadingWhitespace) {
        doc.body.insertBefore(document.createTextNode(leadingWhitespace), doc.body.childNodes[0] || null);
      }

      /* Work on whole document or just its body */
      return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
    };

    /* Here we test for a broken feature in Edge that might cause mXSS */
    if (DOMPurify.isSupported) {
      (function () {
        try {
          var doc = _initDocument('<x/><title>&lt;/title&gt;&lt;img&gt;');
          if (regExpTest(/<\/title/, doc.querySelector('title').innerHTML)) {
            removeTitle = true;
          }
        } catch (_) {}
      })();
    }

    /**
     * _createIterator
     *
     * @param  {Document} root document/fragment to create iterator for
     * @return {Iterator} iterator instance
     */
    var _createIterator = function _createIterator(root) {
      return createNodeIterator.call(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, function () {
        return NodeFilter.FILTER_ACCEPT;
      }, false);
    };

    /**
     * _isClobbered
     *
     * @param  {Node} elm element to check for clobbering attacks
     * @return {Boolean} true if clobbered, false if safe
     */
    var _isClobbered = function _isClobbered(elm) {
      if (elm instanceof Text || elm instanceof Comment) {
        return false;
      }

      if (typeof elm.nodeName !== 'string' || typeof elm.textContent !== 'string' || typeof elm.removeChild !== 'function' || !(elm.attributes instanceof NamedNodeMap) || typeof elm.removeAttribute !== 'function' || typeof elm.setAttribute !== 'function' || typeof elm.namespaceURI !== 'string') {
        return true;
      }

      return false;
    };

    /**
     * _isNode
     *
     * @param  {Node} obj object to check whether it's a DOM node
     * @return {Boolean} true is object is a DOM node
     */
    var _isNode = function _isNode(object) {
      return (typeof Node === 'undefined' ? 'undefined' : _typeof(Node)) === 'object' ? object instanceof Node : object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' && typeof object.nodeType === 'number' && typeof object.nodeName === 'string';
    };

    /**
     * _executeHook
     * Execute user configurable hooks
     *
     * @param  {String} entryPoint  Name of the hook's entry point
     * @param  {Node} currentNode node to work on with the hook
     * @param  {Object} data additional hook parameters
     */
    var _executeHook = function _executeHook(entryPoint, currentNode, data) {
      if (!hooks[entryPoint]) {
        return;
      }

      arrayForEach(hooks[entryPoint], function (hook) {
        hook.call(DOMPurify, currentNode, data, CONFIG);
      });
    };

    /**
     * _sanitizeElements
     *
     * @protect nodeName
     * @protect textContent
     * @protect removeChild
     *
     * @param   {Node} currentNode to check for permission to exist
     * @return  {Boolean} true if node was killed, false if left alive
     */
    // eslint-disable-next-line complexity
    var _sanitizeElements = function _sanitizeElements(currentNode) {
      var content = void 0;

      /* Execute a hook if present */
      _executeHook('beforeSanitizeElements', currentNode, null);

      /* Check if element is clobbered or can clobber */
      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Check if tagname contains Unicode */
      if (stringMatch(currentNode.nodeName, /[\u0080-\uFFFF]/)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Now let's check the element's type and name */
      var tagName = stringToLowerCase(currentNode.nodeName);

      /* Execute a hook if present */
      _executeHook('uponSanitizeElement', currentNode, {
        tagName: tagName,
        allowedTags: ALLOWED_TAGS
      });

      /* Take care of an mXSS pattern using p, br inside svg, math */
      if ((tagName === 'svg' || tagName === 'math') && currentNode.querySelectorAll('p, br, form').length !== 0) {
        _forceRemove(currentNode);
        return true;
      }

      /* Remove element if anything forbids its presence */
      if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
        /* Keep content except for bad-listed elements */
        if (KEEP_CONTENT && !FORBID_CONTENTS[tagName] && typeof currentNode.insertAdjacentHTML === 'function') {
          try {
            var htmlToInsert = currentNode.innerHTML;
            currentNode.insertAdjacentHTML('AfterEnd', trustedTypesPolicy ? trustedTypesPolicy.createHTML(htmlToInsert) : htmlToInsert);
          } catch (_) {}
        }

        _forceRemove(currentNode);
        return true;
      }

      /* Remove in case a noscript/noembed XSS is suspected */
      if (tagName === 'noscript' && regExpTest(/<\/noscript/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      if (tagName === 'noembed' && regExpTest(/<\/noembed/i, currentNode.innerHTML)) {
        _forceRemove(currentNode);
        return true;
      }

      /* Convert markup to cover jQuery behavior */
      if (SAFE_FOR_JQUERY && !_isNode(currentNode.firstElementChild) && (!_isNode(currentNode.content) || !_isNode(currentNode.content.firstElementChild)) && regExpTest(/</g, currentNode.textContent)) {
        arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
        if (currentNode.innerHTML) {
          currentNode.innerHTML = stringReplace(currentNode.innerHTML, /</g, '&lt;');
        } else {
          currentNode.innerHTML = stringReplace(currentNode.textContent, /</g, '&lt;');
        }
      }

      /* Sanitize element content to be template-safe */
      if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
        /* Get the element's text content */
        content = currentNode.textContent;
        content = stringReplace(content, MUSTACHE_EXPR$$1, ' ');
        content = stringReplace(content, ERB_EXPR$$1, ' ');
        if (currentNode.textContent !== content) {
          arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
          currentNode.textContent = content;
        }
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeElements', currentNode, null);

      return false;
    };

    /**
     * _isValidAttribute
     *
     * @param  {string} lcTag Lowercase tag name of containing element.
     * @param  {string} lcName Lowercase attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid, otherwise false.
     */
    // eslint-disable-next-line complexity
    var _isValidAttribute = function _isValidAttribute(lcTag, lcName, value) {
      /* Make sure attribute cannot clobber */
      if (SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
        return false;
      }

      /* Allow valid data-* attributes: At least one character after "-"
          (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
          XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
          We don't need to check the value; it's always URI safe. */
      if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR$$1, lcName)) ; else if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR$$1, lcName)) ; else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        return false;

        /* Check value is safe. First, is attr inert? If so, is safe */
      } else if (URI_SAFE_ATTRIBUTES[lcName]) ; else if (regExpTest(IS_ALLOWED_URI$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && stringIndexOf(value, 'data:') === 0 && DATA_URI_TAGS[lcTag]) ; else if (ALLOW_UNKNOWN_PROTOCOLS && !regExpTest(IS_SCRIPT_OR_DATA$$1, stringReplace(value, ATTR_WHITESPACE$$1, ''))) ; else if (!value) ; else {
        return false;
      }

      return true;
    };

    /**
     * _sanitizeAttributes
     *
     * @protect attributes
     * @protect nodeName
     * @protect removeAttribute
     * @protect setAttribute
     *
     * @param  {Node} currentNode to sanitize
     */
    // eslint-disable-next-line complexity
    var _sanitizeAttributes = function _sanitizeAttributes(currentNode) {
      var attr = void 0;
      var value = void 0;
      var lcName = void 0;
      var idAttr = void 0;
      var l = void 0;
      /* Execute a hook if present */
      _executeHook('beforeSanitizeAttributes', currentNode, null);

      var attributes = currentNode.attributes;

      /* Check if we have attributes; if not we might have a text node */

      if (!attributes) {
        return;
      }

      var hookEvent = {
        attrName: '',
        attrValue: '',
        keepAttr: true,
        allowedAttributes: ALLOWED_ATTR
      };
      l = attributes.length;

      /* Go backwards over all attributes; safely remove bad ones */
      while (l--) {
        attr = attributes[l];
        var _attr = attr,
            name = _attr.name,
            namespaceURI = _attr.namespaceURI;

        value = stringTrim(attr.value);
        lcName = stringToLowerCase(name);

        /* Execute a hook if present */
        hookEvent.attrName = lcName;
        hookEvent.attrValue = value;
        hookEvent.keepAttr = true;
        hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
        _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
        value = hookEvent.attrValue;
        /* Did the hooks approve of the attribute? */
        if (hookEvent.forceKeepAttr) {
          continue;
        }

        /* Remove attribute */
        // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
        // remove a "name" attribute from an <img> tag that has an "id"
        // attribute at the time.
        if (lcName === 'name' && currentNode.nodeName === 'IMG' && attributes.id) {
          idAttr = attributes.id;
          attributes = arraySlice(attributes, []);
          _removeAttribute('id', currentNode);
          _removeAttribute(name, currentNode);
          if (arrayIndexOf(attributes, idAttr) > l) {
            currentNode.setAttribute('id', idAttr.value);
          }
        } else if (
        // This works around a bug in Safari, where input[type=file]
        // cannot be dynamically set after type has been removed
        currentNode.nodeName === 'INPUT' && lcName === 'type' && value === 'file' && hookEvent.keepAttr && (ALLOWED_ATTR[lcName] || !FORBID_ATTR[lcName])) {
          continue;
        } else {
          // This avoids a crash in Safari v9.0 with double-ids.
          // The trick is to first set the id to be empty and then to
          // remove the attribute
          if (name === 'id') {
            currentNode.setAttribute(name, '');
          }

          _removeAttribute(name, currentNode);
        }

        /* Did the hooks approve of the attribute? */
        if (!hookEvent.keepAttr) {
          continue;
        }

        /* Work around a security issue in jQuery 3.0 */
        if (SAFE_FOR_JQUERY && regExpTest(/\/>/i, value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Take care of an mXSS pattern using namespace switches */
        if (regExpTest(/svg|math/i, currentNode.namespaceURI) && regExpTest(regExpCreate('</(' + arrayJoin(objectKeys(FORBID_CONTENTS), '|') + ')', 'i'), value)) {
          _removeAttribute(name, currentNode);
          continue;
        }

        /* Sanitize attribute content to be template-safe */
        if (SAFE_FOR_TEMPLATES) {
          value = stringReplace(value, MUSTACHE_EXPR$$1, ' ');
          value = stringReplace(value, ERB_EXPR$$1, ' ');
        }

        /* Is `value` valid for this attribute? */
        var lcTag = currentNode.nodeName.toLowerCase();
        if (!_isValidAttribute(lcTag, lcName, value)) {
          continue;
        }

        /* Handle invalid data-* attribute set by try-catching it */
        try {
          if (namespaceURI) {
            currentNode.setAttributeNS(namespaceURI, name, value);
          } else {
            /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
            currentNode.setAttribute(name, value);
          }

          arrayPop(DOMPurify.removed);
        } catch (_) {}
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeAttributes', currentNode, null);
    };

    /**
     * _sanitizeShadowDOM
     *
     * @param  {DocumentFragment} fragment to iterate over recursively
     */
    var _sanitizeShadowDOM = function _sanitizeShadowDOM(fragment) {
      var shadowNode = void 0;
      var shadowIterator = _createIterator(fragment);

      /* Execute a hook if present */
      _executeHook('beforeSanitizeShadowDOM', fragment, null);

      while (shadowNode = shadowIterator.nextNode()) {
        /* Execute a hook if present */
        _executeHook('uponSanitizeShadowNode', shadowNode, null);

        /* Sanitize tags and elements */
        if (_sanitizeElements(shadowNode)) {
          continue;
        }

        /* Deep shadow DOM detected */
        if (shadowNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(shadowNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(shadowNode);
      }

      /* Execute a hook if present */
      _executeHook('afterSanitizeShadowDOM', fragment, null);
    };

    /**
     * Sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String|Node} dirty string or DOM node
     * @param {Object} configuration object
     */
    // eslint-disable-next-line complexity
    DOMPurify.sanitize = function (dirty, cfg) {
      var body = void 0;
      var importedNode = void 0;
      var currentNode = void 0;
      var oldNode = void 0;
      var returnNode = void 0;
      /* Make sure we have a string to sanitize.
        DO NOT return early, as this will return the wrong type if
        the user has requested a DOM object rather than a string */
      if (!dirty) {
        dirty = '<!-->';
      }

      /* Stringify, in case dirty is an object */
      if (typeof dirty !== 'string' && !_isNode(dirty)) {
        // eslint-disable-next-line no-negated-condition
        if (typeof dirty.toString !== 'function') {
          throw typeErrorCreate('toString is not a function');
        } else {
          dirty = dirty.toString();
          if (typeof dirty !== 'string') {
            throw typeErrorCreate('dirty is not a string, aborting');
          }
        }
      }

      /* Check we can run. Otherwise fall back or ignore */
      if (!DOMPurify.isSupported) {
        if (_typeof(window.toStaticHTML) === 'object' || typeof window.toStaticHTML === 'function') {
          if (typeof dirty === 'string') {
            return window.toStaticHTML(dirty);
          }

          if (_isNode(dirty)) {
            return window.toStaticHTML(dirty.outerHTML);
          }
        }

        return dirty;
      }

      /* Assign config vars */
      if (!SET_CONFIG) {
        _parseConfig(cfg);
      }

      /* Clean up removed elements */
      DOMPurify.removed = [];

      /* Check if dirty is correctly typed for IN_PLACE */
      if (typeof dirty === 'string') {
        IN_PLACE = false;
      }

      if (IN_PLACE) ; else if (dirty instanceof Node) {
        /* If dirty is a DOM element, append to an empty document to avoid
           elements being stripped by the parser */
        body = _initDocument('<!-->');
        importedNode = body.ownerDocument.importNode(dirty, true);
        if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
          /* Node is already a body, use as is */
          body = importedNode;
        } else if (importedNode.nodeName === 'HTML') {
          body = importedNode;
        } else {
          // eslint-disable-next-line unicorn/prefer-node-append
          body.appendChild(importedNode);
        }
      } else {
        /* Exit directly if we have nothing to do */
        if (!RETURN_DOM && !SAFE_FOR_TEMPLATES && !WHOLE_DOCUMENT &&
        // eslint-disable-next-line unicorn/prefer-includes
        dirty.indexOf('<') === -1) {
          return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
        }

        /* Initialize the document to work on */
        body = _initDocument(dirty);

        /* Check we have a DOM node from the data */
        if (!body) {
          return RETURN_DOM ? null : emptyHTML;
        }
      }

      /* Remove first element node (ours) if FORCE_BODY is set */
      if (body && FORCE_BODY) {
        _forceRemove(body.firstChild);
      }

      /* Get node iterator */
      var nodeIterator = _createIterator(IN_PLACE ? dirty : body);

      /* Now start iterating over the created document */
      while (currentNode = nodeIterator.nextNode()) {
        /* Fix IE's strange behavior with manipulated textNodes #89 */
        if (currentNode.nodeType === 3 && currentNode === oldNode) {
          continue;
        }

        /* Sanitize tags and elements */
        if (_sanitizeElements(currentNode)) {
          continue;
        }

        /* Shadow DOM detected, sanitize it */
        if (currentNode.content instanceof DocumentFragment) {
          _sanitizeShadowDOM(currentNode.content);
        }

        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(currentNode);

        oldNode = currentNode;
      }

      oldNode = null;

      /* If we sanitized `dirty` in-place, return it. */
      if (IN_PLACE) {
        return dirty;
      }

      /* Return sanitized string or DOM */
      if (RETURN_DOM) {
        if (RETURN_DOM_FRAGMENT) {
          returnNode = createDocumentFragment.call(body.ownerDocument);

          while (body.firstChild) {
            // eslint-disable-next-line unicorn/prefer-node-append
            returnNode.appendChild(body.firstChild);
          }
        } else {
          returnNode = body;
        }

        if (RETURN_DOM_IMPORT) {
          /*
            AdoptNode() is not used because internal state is not reset
            (e.g. the past names map of a HTMLFormElement), this is safe
            in theory but we would rather not risk another attack vector.
            The state that is cloned by importNode() is explicitly defined
            by the specs.
          */
          returnNode = importNode.call(originalDocument, returnNode, true);
        }

        return returnNode;
      }

      var serializedHTML = WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

      /* Sanitize final string template-safe */
      if (SAFE_FOR_TEMPLATES) {
        serializedHTML = stringReplace(serializedHTML, MUSTACHE_EXPR$$1, ' ');
        serializedHTML = stringReplace(serializedHTML, ERB_EXPR$$1, ' ');
      }

      return trustedTypesPolicy && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
    };

    /**
     * Public method to set the configuration once
     * setConfig
     *
     * @param {Object} cfg configuration object
     */
    DOMPurify.setConfig = function (cfg) {
      _parseConfig(cfg);
      SET_CONFIG = true;
    };

    /**
     * Public method to remove the configuration
     * clearConfig
     *
     */
    DOMPurify.clearConfig = function () {
      CONFIG = null;
      SET_CONFIG = false;
    };

    /**
     * Public method to check if an attribute value is valid.
     * Uses last set config, if any. Otherwise, uses config defaults.
     * isValidAttribute
     *
     * @param  {string} tag Tag name of containing element.
     * @param  {string} attr Attribute name.
     * @param  {string} value Attribute value.
     * @return {Boolean} Returns true if `value` is valid. Otherwise, returns false.
     */
    DOMPurify.isValidAttribute = function (tag, attr, value) {
      /* Initialize shared config vars if necessary. */
      if (!CONFIG) {
        _parseConfig({});
      }

      var lcTag = stringToLowerCase(tag);
      var lcName = stringToLowerCase(attr);
      return _isValidAttribute(lcTag, lcName, value);
    };

    /**
     * AddHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint entry point for the hook to add
     * @param {Function} hookFunction function to execute
     */
    DOMPurify.addHook = function (entryPoint, hookFunction) {
      if (typeof hookFunction !== 'function') {
        return;
      }

      hooks[entryPoint] = hooks[entryPoint] || [];
      arrayPush(hooks[entryPoint], hookFunction);
    };

    /**
     * RemoveHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint entry point for the hook to remove
     */
    DOMPurify.removeHook = function (entryPoint) {
      if (hooks[entryPoint]) {
        arrayPop(hooks[entryPoint]);
      }
    };

    /**
     * RemoveHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint entry point for the hooks to remove
     */
    DOMPurify.removeHooks = function (entryPoint) {
      if (hooks[entryPoint]) {
        hooks[entryPoint] = [];
      }
    };

    /**
     * RemoveAllHooks
     * Public method to remove all DOMPurify hooks
     *
     */
    DOMPurify.removeAllHooks = function () {
      hooks = {};
    };

    return DOMPurify;
  }

  var purify = createDOMPurify();

  return purify;

});

define('skylark-formio/vendors/fast-json-patch/helpers',[],function(){
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    /*!
     * https://github.com/Starcounter-Jack/JSON-Patch
     * (c) 2017 Joachim Wester
     * MIT license
     */
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    function hasOwnProperty(obj, key) {
        return _hasOwnProperty.call(obj, key);
    }
    exports.hasOwnProperty = hasOwnProperty;
    function _objectKeys(obj) {
        if (Array.isArray(obj)) {
            var keys = new Array(obj.length);
            for (var k = 0; k < keys.length; k++) {
                keys[k] = "" + k;
            }
            return keys;
        }
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var i in obj) {
            if (hasOwnProperty(obj, i)) {
                keys.push(i);
            }
        }
        return keys;
    }
    ;
    /**
    * Deeply clone the object.
    * https://jsperf.com/deep-copy-vs-json-stringify-json-parse/25 (recursiveDeepCopy)
    * @param  {any} obj value to clone
    * @return {any} cloned obj
    */
    function _deepClone(obj) {
        switch (typeof obj) {
            case "object":
                return JSON.parse(JSON.stringify(obj)); //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
            case "undefined":
                return null; //this is how JSON.stringify behaves for array items
            default:
                return obj; //no need to clone primitives
        }
    }
    //3x faster than cached /^\d+$/.test(str)
    function isInteger(str) {
        var i = 0;
        var len = str.length;
        var charCode;
        while (i < len) {
            charCode = str.charCodeAt(i);
            if (charCode >= 48 && charCode <= 57) {
                i++;
                continue;
            }
            return false;
        }
        return true;
    }
    /**
    * Escapes a json pointer path
    * @param path The raw pointer
    * @return the Escaped path
    */
    function escapePathComponent(path) {
        if (path.indexOf('/') === -1 && path.indexOf('~') === -1)
            return path;
        return path.replace(/~/g, '~0').replace(/\//g, '~1');
    }
    /**
     * Unescapes a json pointer path
     * @param path The escaped pointer
     * @return The unescaped path
     */
    function unescapePathComponent(path) {
        return path.replace(/~1/g, '/').replace(/~0/g, '~');
    }
    function _getPathRecursive(root, obj) {
        var found;
        for (var key in root) {
            if (hasOwnProperty(root, key)) {
                if (root[key] === obj) {
                    return escapePathComponent(key) + '/';
                }
                else if (typeof root[key] === 'object') {
                    found = _getPathRecursive(root[key], obj);
                    if (found != '') {
                        return escapePathComponent(key) + '/' + found;
                    }
                }
            }
        }
        return '';
    }
    function getPath(root, obj) {
        if (root === obj) {
            return '/';
        }
        var path = _getPathRecursive(root, obj);
        if (path === '') {
            throw new Error("Object not found in root");
        }
        return '/' + path;
    }
    /**
    * Recursively checks whether an object has any undefined values inside.
    */
    function hasUndefined(obj) {
        if (obj === undefined) {
            return true;
        }
        if (obj) {
            if (Array.isArray(obj)) {
                for (var i = 0, len = obj.length; i < len; i++) {
                    if (hasUndefined(obj[i])) {
                        return true;
                    }
                }
            }
            else if (typeof obj === "object") {
                var objKeys = _objectKeys(obj);
                var objKeysLength = objKeys.length;
                for (var i = 0; i < objKeysLength; i++) {
                    if (hasUndefined(obj[objKeys[i]])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    var PatchError = (function (_super) {
        __extends(PatchError, _super);
        function PatchError(message, name, index, operation, tree) {
            _super.call(this, message);
            this.message = message;
            this.name = name;
            this.index = index;
            this.operation = operation;
            this.tree = tree;
        }
        return PatchError;
    }(Error));

    return {
        PatchError,
        hasUndefined,
        getPath,
        unescapePathComponent,
        escapePathComponent,
        isInteger,
        _objectKeys,
        _deepClone,
        _getPathRecursive
    };

});
define('skylark-formio/vendors/fast-json-patch/core',[
    "skylark-lodash",
    "./helpers"
],function(
    _,
    helpers_1
){
    var areEquals = function (a, b) {
        return _.isEqual(a, b);
    };

    /* We use a Javascript hash to store each
     function. Each hash entry (property) uses
     the operation identifiers specified in rfc6902.
     In this way, we can map each patch operation
     to its dedicated function in efficient way.
     */
    /* The operations applicable to an object */
    var objOps = {
        add: function (obj, key, document) {
            obj[key] = this.value;
            return { newDocument: document };
        },
        remove: function (obj, key, document) {
            var removed = obj[key];
            delete obj[key];
            return { newDocument: document, removed: removed };
        },
        replace: function (obj, key, document) {
            var removed = obj[key];
            obj[key] = this.value;
            return { newDocument: document, removed: removed };
        },
        move: function (obj, key, document) {
            /* in case move target overwrites an existing value,
            return the removed value, this can be taxing performance-wise,
            and is potentially unneeded */
            var removed = getValueByPointer(document, this.path);
            if (removed) {
                removed = helpers_1._deepClone(removed);
            }
            var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
            applyOperation(document, { op: "add", path: this.path, value: originalValue });
            return { newDocument: document, removed: removed };
        },
        copy: function (obj, key, document) {
            var valueToCopy = getValueByPointer(document, this.from);
            // enforce copy by value so further operations don't affect source (see issue #177)
            applyOperation(document, { op: "add", path: this.path, value: helpers_1._deepClone(valueToCopy) });
            return { newDocument: document };
        },
        test: function (obj, key, document) {
            return { newDocument: document, test: areEquals(obj[key], this.value) };
        },
        _get: function (obj, key, document) {
            this.value = obj[key];
            return { newDocument: document };
        }
    };
    /* The operations applicable to an array. Many are the same as for the object */
    var arrOps = {
        add: function (arr, i, document) {
            if (helpers_1.isInteger(i)) {
                arr.splice(i, 0, this.value);
            }
            else {
                arr[i] = this.value;
            }
            // this may be needed when using '-' in an array
            return { newDocument: document, index: i };
        },
        remove: function (arr, i, document) {
            var removedList = arr.splice(i, 1);
            return { newDocument: document, removed: removedList[0] };
        },
        replace: function (arr, i, document) {
            var removed = arr[i];
            arr[i] = this.value;
            return { newDocument: document, removed: removed };
        },
        move: objOps.move,
        copy: objOps.copy,
        test: objOps.test,
        _get: objOps._get
    };
    /**
     * Retrieves a value from a JSON document by a JSON pointer.
     * Returns the value.
     *
     * @param document The document to get the value from
     * @param pointer an escaped JSON pointer
     * @return The retrieved value
     */
    function getValueByPointer(document, pointer) {
        if (pointer == '') {
            return document;
        }
        var getOriginalDestination = { op: "_get", path: pointer };
        applyOperation(document, getOriginalDestination);
        return getOriginalDestination.value;
    }
    /**
     * Apply a single JSON Patch Operation on a JSON document.
     * Returns the {newDocument, result} of the operation.
     * It modifies the `document` and `operation` objects - it gets the values by reference.
     * If you would like to avoid touching your values, clone them:
     * `jsonpatch.applyOperation(document, jsonpatch._deepClone(operation))`.
     *
     * @param document The document to patch
     * @param operation The operation to apply
     * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
     * @param mutateDocument Whether to mutate the original document or clone it before applying
     * @return `{newDocument, result}` after the operation
     */
    function applyOperation(document, operation, validateOperation, mutateDocument) {
        if (validateOperation === void 0) { validateOperation = false; }
        if (mutateDocument === void 0) { mutateDocument = true; }
        if (validateOperation) {
            if (typeof validateOperation == 'function') {
                validateOperation(operation, 0, document, operation.path);
            }
            else {
                validator(operation, 0);
            }
        }
        /* ROOT OPERATIONS */
        if (operation.path === "") {
            var returnValue = { newDocument: document };
            if (operation.op === 'add') {
                returnValue.newDocument = operation.value;
                return returnValue;
            }
            else if (operation.op === 'replace') {
                returnValue.newDocument = operation.value;
                returnValue.removed = document; //document we removed
                return returnValue;
            }
            else if (operation.op === 'move' || operation.op === 'copy') {
                returnValue.newDocument = getValueByPointer(document, operation.from); // get the value by json-pointer in `from` field
                if (operation.op === 'move') {
                    returnValue.removed = document;
                }
                return returnValue;
            }
            else if (operation.op === 'test') {
                returnValue.test = areEquals(document, operation.value);
                if (returnValue.test === false) {
                    throw new helpers_1.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
                }
                returnValue.newDocument = document;
                return returnValue;
            }
            else if (operation.op === 'remove') {
                returnValue.removed = document;
                returnValue.newDocument = null;
                return returnValue;
            }
            else if (operation.op === '_get') {
                operation.value = document;
                return returnValue;
            }
            else {
                if (validateOperation) {
                    throw new helpers_1.JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', 0, operation, document);
                }
                else {
                    return returnValue;
                }
            }
        } /* END ROOT OPERATIONS */
        else {
            if (!mutateDocument) {
                document = helpers_1._deepClone(document);
            }
            var path = operation.path || "";
            var keys = path.split('/');
            var obj = document;
            var t = 1; //skip empty element - http://jsperf.com/to-shift-or-not-to-shift
            var len = keys.length;
            var existingPathFragment = undefined;
            var key = void 0;
            var validateFunction = void 0;
            if (typeof validateOperation == 'function') {
                validateFunction = validateOperation;
            }
            else {
                validateFunction = validator;
            }
            while (true) {
                key = keys[t];
                if (validateOperation) {
                    if (existingPathFragment === undefined) {
                        if (obj[key] === undefined) {
                            existingPathFragment = keys.slice(0, t).join('/');
                        }
                        else if (t == len - 1) {
                            existingPathFragment = operation.path;
                        }
                        if (existingPathFragment !== undefined) {
                            validateFunction(operation, 0, document, existingPathFragment);
                        }
                    }
                }
                t++;
                if (Array.isArray(obj)) {
                    if (key === '-') {
                        key = obj.length;
                    }
                    else {
                        if (validateOperation && !helpers_1.isInteger(key)) {
                            throw new helpers_1.JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", 0, operation.path, operation);
                        } // only parse key when it's an integer for `arr.prop` to work
                        else if (helpers_1.isInteger(key)) {
                            key = ~~key;
                        }
                    }
                    if (t >= len) {
                        if (validateOperation && operation.op === "add" && key > obj.length) {
                            throw new helpers_1.JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", 0, operation.path, operation);
                        }
                        var returnValue = arrOps[operation.op].call(operation, obj, key, document); // Apply patch
                        if (returnValue.test === false) {
                            throw new helpers_1.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
                        }
                        return returnValue;
                    }
                }
                else {
                    if (key && key.indexOf('~') != -1) {
                        key = helpers_1.unescapePathComponent(key);
                    }
                    if (t >= len) {
                        var returnValue = objOps[operation.op].call(operation, obj, key, document); // Apply patch
                        if (returnValue.test === false) {
                            throw new helpers_1.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
                        }
                        return returnValue;
                    }
                }
                obj = obj[key];
            }
        }
    }
    /**
     * Apply a full JSON Patch array on a JSON document.
     * Returns the {newDocument, result} of the patch.
     * It modifies the `document` object and `patch` - it gets the values by reference.
     * If you would like to avoid touching your values, clone them:
     * `jsonpatch.applyPatch(document, jsonpatch._deepClone(patch))`.
     *
     * @param document The document to patch
     * @param patch The patch to apply
     * @param validateOperation `false` is without validation, `true` to use default jsonpatch's validation, or you can pass a `validateOperation` callback to be used for validation.
     * @param mutateDocument Whether to mutate the original document or clone it before applying
     * @return An array of `{newDocument, result}` after the patch
     */
    function applyPatch(document, patch, validateOperation, mutateDocument) {
        if (mutateDocument === void 0) { mutateDocument = true; }
        if (validateOperation) {
            if (!Array.isArray(patch)) {
                throw new helpers_1.JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
            }
        }
        if (!mutateDocument) {
            document = helpers_1._deepClone(document);
        }
        var results = new Array(patch.length);
        for (var i = 0, length_1 = patch.length; i < length_1; i++) {
            results[i] = applyOperation(document, patch[i], validateOperation);
            document = results[i].newDocument; // in case root was replaced
        }
        results.newDocument = document;
        return results;
    }
    /**
     * Apply a single JSON Patch Operation on a JSON document.
     * Returns the updated document.
     * Suitable as a reducer.
     *
     * @param document The document to patch
     * @param operation The operation to apply
     * @return The updated document
     */
    function applyReducer(document, operation) {
        var operationResult = applyOperation(document, operation);
        if (operationResult.test === false) {
            throw new helpers_1.JsonPatchError("Test operation failed", 'TEST_OPERATION_FAILED', 0, operation, document);
        }
        return operationResult.newDocument;
    }
    /**
     * Validates a single operation. Called from `jsonpatch.validate`. Throws `JsonPatchError` in case of an error.
     * @param {object} operation - operation object (patch)
     * @param {number} index - index of operation in the sequence
     * @param {object} [document] - object where the operation is supposed to be applied
     * @param {string} [existingPathFragment] - comes along with `document`
     */
    function validator(operation, index, document, existingPathFragment) {
        if (typeof operation !== 'object' || operation === null || Array.isArray(operation)) {
            throw new helpers_1.JsonPatchError('Operation is not an object', 'OPERATION_NOT_AN_OBJECT', index, operation, document);
        }
        else if (!objOps[operation.op]) {
            throw new helpers_1.JsonPatchError('Operation `op` property is not one of operations defined in RFC-6902', 'OPERATION_OP_INVALID', index, operation, document);
        }
        else if (typeof operation.path !== 'string') {
            throw new helpers_1.JsonPatchError('Operation `path` property is not a string', 'OPERATION_PATH_INVALID', index, operation, document);
        }
        else if (operation.path.indexOf('/') !== 0 && operation.path.length > 0) {
            // paths that aren't empty string should start with "/"
            throw new helpers_1.JsonPatchError('Operation `path` property must start with "/"', 'OPERATION_PATH_INVALID', index, operation, document);
        }
        else if ((operation.op === 'move' || operation.op === 'copy') && typeof operation.from !== 'string') {
            throw new helpers_1.JsonPatchError('Operation `from` property is not present (applicable in `move` and `copy` operations)', 'OPERATION_FROM_REQUIRED', index, operation, document);
        }
        else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && operation.value === undefined) {
            throw new helpers_1.JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_REQUIRED', index, operation, document);
        }
        else if ((operation.op === 'add' || operation.op === 'replace' || operation.op === 'test') && helpers_1.hasUndefined(operation.value)) {
            throw new helpers_1.JsonPatchError('Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)', 'OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED', index, operation, document);
        }
        else if (document) {
            if (operation.op == "add") {
                var pathLen = operation.path.split("/").length;
                var existingPathLen = existingPathFragment.split("/").length;
                if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
                    throw new helpers_1.JsonPatchError('Cannot perform an `add` operation at the desired path', 'OPERATION_PATH_CANNOT_ADD', index, operation, document);
                }
            }
            else if (operation.op === 'replace' || operation.op === 'remove' || operation.op === '_get') {
                if (operation.path !== existingPathFragment) {
                    throw new helpers_1.JsonPatchError('Cannot perform the operation at a path that does not exist', 'OPERATION_PATH_UNRESOLVABLE', index, operation, document);
                }
            }
            else if (operation.op === 'move' || operation.op === 'copy') {
                var existingValue = { op: "_get", path: operation.from, value: undefined };
                var error = validate([existingValue], document);
                if (error && error.name === 'OPERATION_PATH_UNRESOLVABLE') {
                    throw new helpers_1.JsonPatchError('Cannot perform the operation from a path that does not exist', 'OPERATION_FROM_UNRESOLVABLE', index, operation, document);
                }
            }
        }
    }
    /**
     * Validates a sequence of operations. If `document` parameter is provided, the sequence is additionally validated against the object document.
     * If error is encountered, returns a JsonPatchError object
     * @param sequence
     * @param document
     * @returns {JsonPatchError|undefined}
     */
    function validate(sequence, document, externalValidator) {
        try {
            if (!Array.isArray(sequence)) {
                throw new helpers_1.JsonPatchError('Patch sequence must be an array', 'SEQUENCE_NOT_AN_ARRAY');
            }
            if (document) {
                //clone document and sequence so that we can safely try applying operations
                applyPatch(helpers_1._deepClone(document), helpers_1._deepClone(sequence), externalValidator || true);
            }
            else {
                externalValidator = externalValidator || validator;
                for (var i = 0; i < sequence.length; i++) {
                    externalValidator(sequence[i], i, document, undefined);
                }
            }
        }
        catch (e) {
            if (e instanceof helpers_1.JsonPatchError) {
                return e;
            }
            else {
                throw e;
            }
        }
    }

    return {
        JsonPatchError : helpers_1.PatchError,
        deepClone : helpers_1._deepClone,
        getValueByPointer,
        applyOperation,
        applyPatch,
        applyReducer,
        validator,
        validate
    };
});
define('skylark-formio/vendors/fast-json-patch/duplex',[
    "./helpers",
    "./core"
],function(
    helpers_1,
    core_1
){


    var beforeDict = new WeakMap();
    var Mirror = (function () {
        function Mirror(obj) {
            this.observers = new Map();
            this.obj = obj;
        }
        return Mirror;
    }());
    var ObserverInfo = (function () {
        function ObserverInfo(callback, observer) {
            this.callback = callback;
            this.observer = observer;
        }
        return ObserverInfo;
    }());
    function getMirror(obj) {
        return beforeDict.get(obj);
    }
    function getObserverFromMirror(mirror, callback) {
        return mirror.observers.get(callback);
    }
    function removeObserverFromMirror(mirror, observer) {
        mirror.observers.delete(observer.callback);
    }
    /**
     * Detach an observer from an object
     */
    function unobserve(root, observer) {
        observer.unobserve();
    }
    /**
     * Observes changes made to an object, which can then be retrieved using generate
     */
    function observe(obj, callback) {
        var patches = [];
        var observer;
        var mirror = getMirror(obj);
        if (!mirror) {
            mirror = new Mirror(obj);
            beforeDict.set(obj, mirror);
        }
        else {
            var observerInfo = getObserverFromMirror(mirror, callback);
            observer = observerInfo && observerInfo.observer;
        }
        if (observer) {
            return observer;
        }
        observer = {};
        mirror.value = helpers_1._deepClone(obj);
        if (callback) {
            observer.callback = callback;
            observer.next = null;
            var dirtyCheck = function () {
                generate(observer);
            };
            var fastCheck = function () {
                clearTimeout(observer.next);
                observer.next = setTimeout(dirtyCheck);
            };
            if (typeof window !== 'undefined') {
                if (window.addEventListener) {
                    window.addEventListener('mouseup', fastCheck);
                    window.addEventListener('keyup', fastCheck);
                    window.addEventListener('mousedown', fastCheck);
                    window.addEventListener('keydown', fastCheck);
                    window.addEventListener('change', fastCheck);
                }
                else {
                    document.documentElement.attachEvent('onmouseup', fastCheck);
                    document.documentElement.attachEvent('onkeyup', fastCheck);
                    document.documentElement.attachEvent('onmousedown', fastCheck);
                    document.documentElement.attachEvent('onkeydown', fastCheck);
                    document.documentElement.attachEvent('onchange', fastCheck);
                }
            }
        }
        observer.patches = patches;
        observer.object = obj;
        observer.unobserve = function () {
            generate(observer);
            clearTimeout(observer.next);
            removeObserverFromMirror(mirror, observer);
            if (typeof window !== 'undefined') {
                if (window.removeEventListener) {
                    window.removeEventListener('mouseup', fastCheck);
                    window.removeEventListener('keyup', fastCheck);
                    window.removeEventListener('mousedown', fastCheck);
                    window.removeEventListener('keydown', fastCheck);
                }
                else {
                    document.documentElement.detachEvent('onmouseup', fastCheck);
                    document.documentElement.detachEvent('onkeyup', fastCheck);
                    document.documentElement.detachEvent('onmousedown', fastCheck);
                    document.documentElement.detachEvent('onkeydown', fastCheck);
                }
            }
        };
        mirror.observers.set(callback, new ObserverInfo(callback, observer));
        return observer;
    }
    /**
     * Generate an array of patches from an observer
     */
    function generate(observer) {
        var mirror = beforeDict.get(observer.object);
        _generate(mirror.value, observer.object, observer.patches, "");
        if (observer.patches.length) {
            core_1.applyPatch(mirror.value, observer.patches);
        }
        var temp = observer.patches;
        if (temp.length > 0) {
            observer.patches = [];
            if (observer.callback) {
                observer.callback(temp);
            }
        }
        return temp;
    }
    // Dirty check if obj is different from mirror, generate patches and update mirror
    function _generate(mirror, obj, patches, path) {
        if (obj === mirror) {
            return;
        }
        if (typeof obj.toJSON === "function") {
            obj = obj.toJSON();
        }
        var newKeys = helpers_1._objectKeys(obj);
        var oldKeys = helpers_1._objectKeys(mirror);
        var changed = false;
        var deleted = false;
        //if ever "move" operation is implemented here, make sure this test runs OK: "should not generate the same patch twice (move)"
        for (var t = oldKeys.length - 1; t >= 0; t--) {
            var key = oldKeys[t];
            var oldVal = mirror[key];
            if (helpers_1.hasOwnProperty(obj, key) && !(obj[key] === undefined && oldVal !== undefined && Array.isArray(obj) === false)) {
                var newVal = obj[key];
                if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null) {
                    _generate(oldVal, newVal, patches, path + "/" + helpers_1.escapePathComponent(key));
                }
                else {
                    if (oldVal !== newVal) {
                        changed = true;
                        patches.push({ op: "replace", path: path + "/" + helpers_1.escapePathComponent(key), value: helpers_1._deepClone(newVal) });
                    }
                }
            }
            else {
                patches.push({ op: "remove", path: path + "/" + helpers_1.escapePathComponent(key) });
                deleted = true; // property has been deleted
            }
        }
        if (!deleted && newKeys.length == oldKeys.length) {
            return;
        }
        for (var t = 0; t < newKeys.length; t++) {
            var key = newKeys[t];
            if (!helpers_1.hasOwnProperty(mirror, key) && obj[key] !== undefined) {
                patches.push({ op: "add", path: path + "/" + helpers_1.escapePathComponent(key), value: helpers_1._deepClone(obj[key]) });
            }
        }
    }
    /**
     * Create an array of patches from the differences in two objects
     */
    function compare(tree1, tree2) {
        var patches = [];
        _generate(tree1, tree2, patches, '');
        return patches;
    }


    return {
     applyPatch : core_1.applyPatch,
     unobserve,
     observe,
     generate,
     compare
    };

});
define('skylark-formio/utils/formUtils',[
    "skylark-lodash",
    '../vendors/fast-json-patch/duplex'
], function (_, a) {
    'use strict';
    const {
        get, set, has, clone, forOwn, isString, isNaN, isNil, isPlainObject, round, chunk, pad
    } = _;


    function isLayoutComponent(component) {
        return Boolean(component.columns && Array.isArray(component.columns) || component.rows && Array.isArray(component.rows) || component.components && Array.isArray(component.components));
    }
    function eachComponent(components, fn, includeAll, path, parent) {
        if (!components)
            return;
        path = path || '';
        components.forEach(component => {
            if (!component) {
                return;
            }
            const hasColumns = component.columns && Array.isArray(component.columns);
            const hasRows = component.rows && Array.isArray(component.rows);
            const hasComps = component.components && Array.isArray(component.components);
            let noRecurse = false;
            const newPath = component.key ? path ? `${ path }.${ component.key }` : component.key : '';
            if (parent) {
                component.parent = clone(parent);
                delete component.parent.components;
                delete component.parent.componentMap;
                delete component.parent.columns;
                delete component.parent.rows;
            }
            if (includeAll || component.tree || !hasColumns && !hasRows && !hasComps) {
                noRecurse = fn(component, newPath);
            }
            const subPath = () => {
                if (component.key && ![
                        'panel',
                        'table',
                        'well',
                        'columns',
                        'fieldset',
                        'tabs',
                        'form'
                    ].includes(component.type) && ([
                        'datagrid',
                        'container',
                        'editgrid'
                    ].includes(component.type) || component.tree)) {
                    return newPath;
                } else if (component.key && component.type === 'form') {
                    return `${ newPath }.data`;
                }
                return path;
            };
            if (!noRecurse) {
                if (hasColumns) {
                    component.columns.forEach(column => eachComponent(column.components, fn, includeAll, subPath(), parent ? component : null));
                } else if (hasRows) {
                    component.rows.forEach(row => {
                        if (Array.isArray(row)) {
                            row.forEach(column => eachComponent(column.components, fn, includeAll, subPath(), parent ? component : null));
                        }
                    });
                } else if (hasComps) {
                    eachComponent(component.components, fn, includeAll, subPath(), parent ? component : null);
                }
            }
        });
    }
    function matchComponent(component, query) {
        if (isString(query)) {
            return component.key === query || component.path === query;
        } else {
            let matches = false;
            forOwn(query, (value, key) => {
                matches = get(component, key) === value;
                if (!matches) {
                    return false;
                }
            });
            return matches;
        }
    }
    function getComponent(components, key, includeAll) {
        let result;
        eachComponent(components, (component, path) => {
            if (path === key || component.path === key) {
                result = component;
                return true;
            }
        }, includeAll);
        return result;
    }
    function searchComponents(components, query) {
        const results = [];
        eachComponent(components, component => {
            if (matchComponent(component, query)) {
                results.push(component);
            }
        }, true);
        return results;
    }
    function findComponents(components, query) {
        console.warn('formio.js/utils findComponents is deprecated. Use searchComponents instead.');
        return searchComponents(components, query);
    }
    function findComponent(components, key, path, fn) {
        if (!components)
            return;
        path = path || [];
        if (!key) {
            return fn(components);
        }
        components.forEach(function (component, index) {
            var newPath = path.slice();
            newPath.push(index);
            if (!component)
                return;
            if (component.hasOwnProperty('columns') && Array.isArray(component.columns)) {
                newPath.push('columns');
                component.columns.forEach(function (column, index) {
                    var colPath = newPath.slice();
                    colPath.push(index);
                    colPath.push('components');
                    findComponent(column.components, key, colPath, fn);
                });
            }
            if (component.hasOwnProperty('rows') && Array.isArray(component.rows)) {
                newPath.push('rows');
                component.rows.forEach(function (row, index) {
                    var rowPath = newPath.slice();
                    rowPath.push(index);
                    row.forEach(function (column, index) {
                        var colPath = rowPath.slice();
                        colPath.push(index);
                        colPath.push('components');
                        findComponent(column.components, key, colPath, fn);
                    });
                });
            }
            if (component.hasOwnProperty('components') && Array.isArray(component.components)) {
                newPath.push('components');
                findComponent(component.components, key, newPath, fn);
            }
            if (component.key === key) {
                fn(component, newPath);
            }
        });
    }
    function removeComponent(components, path) {
        var index = path.pop();
        if (path.length !== 0) {
            components = get(components, path);
        }
        components.splice(index, 1);
    }
    function generateFormChange(type, data) {
        let change;
        switch (type) {
        case 'add':
            change = {
                op: 'add',
                key: data.component.key,
                container: data.parent.key,
                path: data.path,
                index: data.index,
                component: data.component
            };
            break;
        case 'edit':
            change = {
                op: 'edit',
                key: data.originalComponent.key,
                patches: duplex.compare(data.originalComponent, data.component)
            };
            if (!change.patches.length) {
                change = null;
            }
            break;
        case 'remove':
            change = {
                op: 'remove',
                key: data.component.key
            };
            break;
        }
        return change;
    }
    function applyFormChanges(form, changes) {
        const failed = [];
        changes.forEach(function (change) {
            var found = false;
            switch (change.op) {
            case 'add':
                var newComponent = change.component;
                findComponent(form.components, change.container, null, function (parent) {
                    if (!change.container) {
                        parent = form;
                    }
                    findComponent(form.components, change.key, null, function (component, path) {
                        newComponent = component;
                        removeComponent(form.components, path);
                    });
                    found = true;
                    var container = get(parent, change.path);
                    container.splice(change.index, 0, newComponent);
                });
                break;
            case 'remove':
                findComponent(form.components, change.key, null, function (component, path) {
                    found = true;
                    const oldComponent = get(form.components, path);
                    if (oldComponent.key !== component.key) {
                        path.pop();
                    }
                    removeComponent(form.components, path);
                });
                break;
            case 'edit':
                findComponent(form.components, change.key, null, function (component, path) {
                    found = true;
                    try {
                        const oldComponent = get(form.components, path);
                        const newComponent = duplex.applyPatch(component, change.patches).newDocument;
                        if (oldComponent.key !== newComponent.key) {
                            path.pop();
                        }
                        set(form.components, path, newComponent);
                    } catch (err) {
                        failed.push(change);
                    }
                });
                break;
            case 'move':
                break;
            }
            if (!found) {
                failed.push(change);
            }
        });
        return {
            form,
            failed
        };
    }
    function flattenComponents(components, includeAll) {
        const flattened = {};
        eachComponent(components, (component, path) => {
            flattened[path] = component;
        }, includeAll);
        return flattened;
    }
    function hasCondition(component) {
        return Boolean(component.customConditional || component.conditional && component.conditional.when || component.conditional && component.conditional.json);
    }
    function parseFloatExt(value) {
        return parseFloat(isString(value) ? value.replace(/[^\de.+-]/gi, '') : value);
    }
    function formatAsCurrency(value) {
        const parsedValue = parseFloatExt(value);
        if (isNaN(parsedValue)) {
            return '';
        }
        const parts = round(parsedValue, 2).toString().split('.');
        parts[0] = chunk(Array.from(parts[0]).reverse(), 3).reverse().map(part => part.reverse().join('')).join(',');
        parts[1] = pad(parts[1], 2, '0');
        return parts.join('.');
    }
    function escapeRegExCharacters(value) {
        return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    }
    function getValue(submission, key) {
        const search = data => {
            if (isPlainObject(data)) {
                if (has(data, key)) {
                    return data[key];
                }
                let value = null;
                forOwn(data, prop => {
                    const result = search(prop);
                    if (!isNil(result)) {
                        value = result;
                        return false;
                    }
                });
                return value;
            } else {
                return null;
            }
        };
        return search(submission.data);
    }
    function getStrings(form) {
        const properties = [
            'label',
            'title',
            'legend',
            'tooltip',
            'description',
            'placeholder',
            'prefix',
            'suffix',
            'errorLabel',
            'content',
            'html'
        ];
        const strings = [];
        eachComponent(form.components, component => {
            properties.forEach(property => {
                if (component.hasOwnProperty(property) && component[property]) {
                    strings.push({
                        key: component.key,
                        type: component.type,
                        property,
                        string: component[property]
                    });
                }
            });
            if ((!component.dataSrc || component.dataSrc === 'values') && component.hasOwnProperty('values') && Array.isArray(component.values) && component.values.length) {
                component.values.forEach((value, index) => {
                    strings.push({
                        key: component.key,
                        property: `value[${ index }].label`,
                        string: component.values[index].label
                    });
                });
            }
            if (component.type === 'day') {
                [
                    'day',
                    'month',
                    'year',
                    'Day',
                    'Month',
                    'Year',
                    'january',
                    'february',
                    'march',
                    'april',
                    'may',
                    'june',
                    'july',
                    'august',
                    'september',
                    'october',
                    'november',
                    'december'
                ].forEach(string => {
                    strings.push({
                        key: component.key,
                        property: 'day',
                        string
                    });
                });
                if (component.fields.day.placeholder) {
                    strings.push({
                        key: component.key,
                        property: 'fields.day.placeholder',
                        string: component.fields.day.placeholder
                    });
                }
                if (component.fields.month.placeholder) {
                    strings.push({
                        key: component.key,
                        property: 'fields.month.placeholder',
                        string: component.fields.month.placeholder
                    });
                }
                if (component.fields.year.placeholder) {
                    strings.push({
                        key: component.key,
                        property: 'fields.year.placeholder',
                        string: component.fields.year.placeholder
                    });
                }
            }
            if (component.type === 'editgrid') {
                const string = component.addAnother || 'Add Another';
                if (component.addAnother) {
                    strings.push({
                        key: component.key,
                        property: 'addAnother',
                        string
                    });
                }
            }
            if (component.type === 'select') {
                [
                    'loading...',
                    'Type to search'
                ].forEach(string => {
                    strings.push({
                        key: component.key,
                        property: 'select',
                        string
                    });
                });
            }
        }, true);
        return strings;
    }
    return {
        isLayoutComponent: isLayoutComponent,
        eachComponent: eachComponent,
        matchComponent: matchComponent,
        getComponent: getComponent,
        searchComponents: searchComponents,
        findComponents: findComponents,
        findComponent: findComponent,
        removeComponent: removeComponent,
        generateFormChange: generateFormChange,
        applyFormChanges: applyFormChanges,
        flattenComponents: flattenComponents,
        hasCondition: hasCondition,
        parseFloatExt: parseFloatExt,
        formatAsCurrency: formatAsCurrency,
        escapeRegExCharacters: escapeRegExCharacters,
        getValue: getValue,
        getStrings: getStrings
    };
});
define('skylark-formio/utils/Evaluator',[
    'skylark-lodash'
], function (_) {
    'use strict';

    function stringHash(str) {
      var hash = 5381,
          i    = str.length;

      while(i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
      }

      /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
       * integers. Since we want the results to be always positive, convert the
       * signed int to an unsigned by doing an unsigned bitshift. */
      return hash >>> 0;
    }

    const Evaluator = {
        noeval: false,
        cache: {},
        templateSettings: {
            evaluate: /\{%([\s\S]+?)%\}/g,
            interpolate: /\{\{([\s\S]+?)\}\}/g,
            escape: /\{\{\{([\s\S]+?)\}\}\}/g
        },
        evaluator(func, ...params) {
            if (Evaluator.noeval) {
                console.warn('No evaluations allowed for this renderer.');
                return _.noop;
            }
            if (typeof params[0] === 'object') {
                params = _.keys(params[0]);
            }
            return new Function(...params, func);
        },
        template(template, hash) {
            hash = hash || stringHash(template);
            try {
                template = template.replace(/ctx\./g, '');
                return Evaluator.cache[hash] = _.template(template, Evaluator.templateSettings);
            } catch (err) {
                console.warn('Error while processing template', err, template);
            }
        },
        interpolate(rawTemplate, data) {
            if (typeof rawTemplate === 'function') {
                try {
                    return rawTemplate(data);
                } catch (err) {
                    console.warn('Error interpolating template', err, data);
                    return err.message;
                }
            }
            rawTemplate = String(rawTemplate);
            const hash = stringHash(rawTemplate);
            let template;
            if (Evaluator.cache[hash]) {
                template = Evaluator.cache[hash];
            } else if (Evaluator.noeval) {
                return rawTemplate.replace(/({{\s*(.*?)\s*}})/g, (match, $1, $2) => _.get(data, $2));
            } else {
                template = Evaluator.template(rawTemplate, hash);
            }
            if (typeof template === 'function') {
                try {
                    return template(data);
                } catch (err) {
                    console.warn('Error interpolating template', err, rawTemplate, data);
                    return err.message;
                }
            }
            return template;
        },
        evaluate(func, args) {
            return Array.isArray(args) ? func(...args) : func(args);
        }
    };
    return Evaluator;
});
define('skylark-formio/utils/utils',[
    'skylark-lodash',
    '../vendors/fetch-ponyfill/fetch',
    '../vendors/json-logic-js/logic',
    '../vendors/moment/timezone',
    '../vendors/jstimezonedetect/jstz',
    './jsonlogic/operators',
    '../vendors/getify/npo',
    '../vendors/dompurify/purify',
    './formUtils',
    './Evaluator'
], function (_, fetchPonyfill, jsonLogic, moment, jtz, a, NativePromise, dompurify, formUtils, Evaluator) {
    'use strict';
    const interpolate = Evaluator.interpolate;
    const {fetch} = fetchPonyfill({ Promise: NativePromise });
   // export * from './formUtils';
    a.lodashOperators.forEach(name => jsonLogic.add_operation(`_${ name }`, _[name]));
    jsonLogic.add_operation('getDate', date => {
        return moment(date).toISOString();
    });
    jsonLogic.add_operation('relativeMinDate', relativeMinDate => {
        return moment().subtract(relativeMinDate, 'days').toISOString();
    });
    jsonLogic.add_operation('relativeMaxDate', relativeMaxDate => {
        return moment().add(relativeMaxDate, 'days').toISOString();
    });
    function evaluate(func, args, ret, tokenize) {
        let returnVal = null;
        const component = args.component ? args.component : { key: 'unknown' };
        if (!args.form && args.instance) {
            args.form = _.get(args.instance, 'root._form', {});
        }
        const componentKey = component.key;
        if (typeof func === 'string') {
            if (ret) {
                func += `;return ${ ret }`;
            }
            if (tokenize) {
                func = func.replace(/({{\s+(.*)\s+}})/, (match, $1, $2) => {
                    if ($2.indexOf('data.') === 0) {
                        return _.get(args.data, $2.replace('data.', ''));
                    } else if ($2.indexOf('row.') === 0) {
                        return _.get(args.row, $2.replace('row.', ''));
                    }
                    return _.get(args.data, $2);
                });
            }
            try {
                func = Evaluator.evaluator(func, args);
                args = _.values(args);
            } catch (err) {
                console.warn(`An error occured within the custom function for ${ componentKey }`, err);
                returnVal = null;
                func = false;
            }
        }
        if (typeof func === 'function') {
            try {
                returnVal = Evaluator.evaluate(func, args);
            } catch (err) {
                returnVal = null;
                console.warn(`An error occured within custom function for ${ componentKey }`, err);
            }
        } else if (typeof func === 'object') {
            try {
                returnVal = jsonLogic.apply(func, args);
            } catch (err) {
                returnVal = null;
                console.warn(`An error occured within custom function for ${ componentKey }`, err);
            }
        } else if (func) {
            console.warn(`Unknown function type for ${ componentKey }`);
        }
        return returnVal;
    }
    function getRandomComponentId() {
        return `e${ Math.random().toString(36).substring(7) }`;
    }
    function getPropertyValue(style, prop) {
        let value = style.getPropertyValue(prop);
        value = value ? value.replace(/[^0-9.]/g, '') : '0';
        return parseFloat(value);
    }
    function getElementRect(element) {
        const style = window.getComputedStyle(element, null);
        return {
            x: getPropertyValue(style, 'left'),
            y: getPropertyValue(style, 'top'),
            width: getPropertyValue(style, 'width'),
            height: getPropertyValue(style, 'height')
        };
    }
    function boolValue(value) {
        if (_.isBoolean(value)) {
            return value;
        } else if (_.isString(value)) {
            return value.toLowerCase() === 'true';
        } else {
            return !!value;
        }
    }
    function isMongoId(text) {
        return text.toString().match(/^[0-9a-fA-F]{24}$/);
    }
    function checkCalculated(component, submission, rowData) {
        if (component.calculateValue) {
            _.set(rowData, component.key, evaluate(component.calculateValue, {
                value: undefined,
                data: submission ? submission.data : rowData,
                row: rowData,
                util: this,
                component
            }, 'value'));
        }
    }
    function checkSimpleConditional(component, condition, row, data) {
        let value = null;
        if (row) {
            value = formUtils.getValue({ data: row }, condition.when);
        }
        if (data && _.isNil(value)) {
            value = formUtils.getValue({ data }, condition.when);
        }
        if (_.isNil(value)) {
            value = '';
        }
        const eq = String(condition.eq);
        const show = String(condition.show);
        if (_.isObject(value) && _.has(value, condition.eq)) {
            return String(value[condition.eq]) === show;
        }
        if (Array.isArray(value) && value.map(String).includes(eq)) {
            return show === 'true';
        }
        return String(value) === eq === (show === 'true');
    }
    function checkCustomConditional(component, custom, row, data, form, variable, onError, instance) {
        if (typeof custom === 'string') {
            custom = `var ${ variable } = true; ${ custom }; return ${ variable };`;
        }
        const value = instance && instance.evaluate ? instance.evaluate(custom) : evaluate(custom, {
            row,
            data,
            form
        });
        if (value === null) {
            return onError;
        }
        return value;
    }
    function checkJsonConditional(component, json, row, data, form, onError) {
        try {
            return jsonLogic.apply(json, {
                data,
                row,
                form,
                _
            });
        } catch (err) {
            console.warn(`An error occurred in jsonLogic advanced condition for ${ component.key }`, err);
            return onError;
        }
    }
    function checkCondition(component, row, data, form, instance) {
        if (component.customConditional) {
            return checkCustomConditional(component, component.customConditional, row, data, form, 'show', true, instance);
        } else if (component.conditional && component.conditional.when) {
            return checkSimpleConditional(component, component.conditional, row, data);
        } else if (component.conditional && component.conditional.json) {
            return checkJsonConditional(component, component.conditional.json, row, data, form, true);
        }
        return true;
    }
    function checkTrigger(component, trigger, row, data, form, instance) {
        if (!trigger[trigger.type]) {
            return false;
        }
        switch (trigger.type) {
        case 'simple':
            return checkSimpleConditional(component, trigger.simple, row, data);
        case 'javascript':
            return checkCustomConditional(component, trigger.javascript, row, data, form, 'result', false, instance);
        case 'json':
            return checkJsonConditional(component, trigger.json, row, data, form, false);
        }
        return false;
    }
    function setActionProperty(component, action, result, row, data, instance) {
        const property = action.property.value;
        switch (action.property.type) {
        case 'boolean': {
                const currentValue = _.get(component, property, false).toString();
                const newValue = action.state.toString();
                if (currentValue !== newValue) {
                    _.set(component, property, newValue === 'true');
                }
                break;
            }
        case 'string': {
                const evalData = {
                    data,
                    row,
                    component,
                    result
                };
                const textValue = action.property.component ? action[action.property.component] : action.text;
                const currentValue = _.get(component, property, '');
                const newValue = instance && instance.interpolate ? instance.interpolate(textValue, evalData) : Evaluator.interpolate(textValue, evalData);
                if (newValue !== currentValue) {
                    _.set(component, property, newValue);
                }
                break;
            }
        }
        return component;
    }
    function uniqueName(name, template, evalContext) {
        template = template || '{{fileName}}-{{guid}}';
        if (!template.includes('{{guid}}')) {
            template = `${ template }-{{guid}}`;
        }
        const parts = name.split('.');
        let fileName = parts.slice(0, parts.length - 1).join('.');
        const extension = parts.length > 1 ? `.${ _.last(parts) }` : '';
        fileName = fileName.substr(0, 100);
        evalContext = Object.assign(evalContext || {}, {
            fileName,
            guid: guid()
        });
        const uniqueName = `${ Evaluator.interpolate(template, evalContext) }${ extension }`.replace(/[^0-9a-zA-Z.\-_ ]/g, '-');
        return uniqueName;
    }
    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : r & 3 | 8;
            return v.toString(16);
        });
    }
    function getDateSetting(date) {
        if (_.isNil(date) || _.isNaN(date) || date === '') {
            return null;
        }
        if (date instanceof Date) {
            return date;
        } else if (typeof date.toDate === 'function') {
            return date.isValid() ? date.toDate() : null;
        }
        let dateSetting = typeof date !== 'string' || date.indexOf('moment(') === -1 ? moment(date) : null;
        if (dateSetting && dateSetting.isValid()) {
            return dateSetting.toDate();
        }
        dateSetting = null;
        try {
            const value = Evaluator.evaluator(`return ${ date };`, 'moment')(moment);
            if (typeof value === 'string') {
                dateSetting = moment(value);
            } else if (typeof value.toDate === 'function') {
                dateSetting = moment(value.toDate().toUTCString());
            } else if (value instanceof Date) {
                dateSetting = moment(value);
            }
        } catch (e) {
            return null;
        }
        if (!dateSetting) {
            return null;
        }
        if (!dateSetting.isValid()) {
            return null;
        }
        return dateSetting.toDate();
    }
    function isValidDate(date) {
        return _.isDate(date) && !_.isNaN(date.getDate());
    }
    function currentTimezone() {
        if (moment.currentTimezone) {
            return moment.currentTimezone;
        }
        moment.currentTimezone = jtz.determine().name();
        return moment.currentTimezone;
    }
    function offsetDate(date, timezone) {
        if (timezone === 'UTC') {
            return {
                date: new Date(date.getTime() + date.getTimezoneOffset() * 60000),
                abbr: 'UTC'
            };
        }
        const dateMoment = moment(date).tz(timezone);
        return {
            date: new Date(date.getTime() + (dateMoment.utcOffset() + date.getTimezoneOffset()) * 60000),
            abbr: dateMoment.format('z')
        };
    }
    function zonesLoaded() {
        return moment.zonesLoaded;
    }
    function shouldLoadZones(timezone) {
        if (timezone === currentTimezone() || timezone === 'UTC') {
            return false;
        }
        return true;
    }
    function loadZones(timezone) {
        if (timezone && !shouldLoadZones(timezone)) {
            return new NativePromise(_.noop);
        }
        if (moment.zonesPromise) {
            return moment.zonesPromise;
        }
        return moment.zonesPromise = fetch('https://cdn.form.io/moment-timezone/data/packed/latest.json').then(resp => resp.json().then(zones => {
            moment.tz.load(zones);
            moment.zonesLoaded = true;
            if (document && document.createEvent && document.body && document.body.dispatchEvent) {
                var event = document.createEvent('Event');
                event.initEvent('zonesLoaded', true, true);
                document.body.dispatchEvent(event);
            }
        }));
    }
    function momentDate(value, format, timezone) {
        const momentDate = moment(value);
        if (timezone === 'UTC') {
            timezone = 'Etc/UTC';
        }
        if ((timezone !== currentTimezone() || format && format.match(/\s(z$|z\s)/)) && moment.zonesLoaded) {
            return momentDate.tz(timezone);
        }
        return momentDate;
    }
    function formatDate(value, format, timezone) {
        const momentDate = moment(value);
        if (timezone === currentTimezone()) {
            if (format.match(/\s(z$|z\s)/)) {
                loadZones();
                if (moment.zonesLoaded) {
                    return momentDate.tz(timezone).format(convertFormatToMoment(format));
                } else {
                    return momentDate.format(convertFormatToMoment(format.replace(/\s(z$|z\s)/, '')));
                }
            }
            return momentDate.format(convertFormatToMoment(format));
        }
        if (timezone === 'UTC') {
            const offset = offsetDate(momentDate.toDate(), 'UTC');
            return `${ moment(offset.date).format(convertFormatToMoment(format)) } UTC`;
        }
        loadZones();
        if (moment.zonesLoaded) {
            return momentDate.tz(timezone).format(`${ convertFormatToMoment(format) } z`);
        } else {
            return momentDate.format(convertFormatToMoment(format));
        }
    }
    function formatOffset(formatFn, date, format, timezone) {
        if (timezone === currentTimezone()) {
            return formatFn(date, format);
        }
        if (timezone === 'UTC') {
            return `${ formatFn(offsetDate(date, 'UTC').date, format) } UTC`;
        }
        loadZones();
        if (moment.zonesLoaded) {
            const offset = offsetDate(date, timezone);
            return `${ formatFn(offset.date, format) } ${ offset.abbr }`;
        } else {
            return formatFn(date, format);
        }
    }
    function getLocaleDateFormatInfo(locale) {
        const formatInfo = {};
        const day = 21;
        const exampleDate = new Date(2017, 11, day);
        const localDateString = exampleDate.toLocaleDateString(locale);
        formatInfo.dayFirst = localDateString.slice(0, 2) === day.toString();
        return formatInfo;
    }
    function convertFormatToFlatpickr(format) {
        return format.replace(/Z/g, '').replace(/y/g, 'Y').replace('YYYY', 'Y').replace('YY', 'y').replace('MMMM', 'F').replace(/M/g, 'n').replace('nnn', 'M').replace('nn', 'm').replace(/d/g, 'j').replace(/jj/g, 'd').replace('EEEE', 'l').replace('EEE', 'D').replace('HH', 'H').replace('hh', 'G').replace('mm', 'i').replace('ss', 'S').replace(/a/g, 'K');
    }
    function convertFormatToMoment(format) {
        return format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/E/g, 'd').replace(/a/g, 'A').replace(/U/g, 'X');
    }
    function convertFormatToMask(format) {
        return format.replace(/M{4}/g, 'MM').replace(/M{3}/g, '***').replace(/e/g, 'Q').replace(/[ydhmsHMG]/g, '9').replace(/a/g, 'AA');
    }
    function getInputMask(mask) {
        if (mask instanceof Array) {
            return mask;
        }
        const maskArray = [];
        maskArray.numeric = true;
        for (let i = 0; i < mask.length; i++) {
            switch (mask[i]) {
            case '9':
                maskArray.push(/\d/);
                break;
            case 'A':
                maskArray.numeric = false;
                maskArray.push(/[a-zA-Z]/);
                break;
            case 'a':
                maskArray.numeric = false;
                maskArray.push(/[a-z]/);
                break;
            case '*':
                maskArray.numeric = false;
                maskArray.push(/[a-zA-Z0-9]/);
                break;
            default:
                maskArray.numeric = false;
                maskArray.push(mask[i]);
                break;
            }
        }
        return maskArray;
    }
    function matchInputMask(value, inputMask) {
        if (!inputMask) {
            return true;
        }
        if (value.length > inputMask.length) {
            return false;
        }
        for (let i = 0; i < inputMask.length; i++) {
            const char = value[i];
            const charPart = inputMask[i];
            if (!(_.isRegExp(charPart) && charPart.test(char) || charPart === char)) {
                return false;
            }
        }
        return true;
    }
    function getNumberSeparators(lang = 'en') {
        const formattedNumberString = 12345.6789.toLocaleString(lang);
        const delimeters = formattedNumberString.match(/..(.)...(.)../);
        if (!delimeters) {
            return {
                delimiter: ',',
                decimalSeparator: '.'
            };
        }
        return {
            delimiter: delimeters.length > 1 ? delimeters[1] : ',',
            decimalSeparator: delimeters.length > 2 ? delimeters[2] : '.'
        };
    }
    function getNumberDecimalLimit(component, defaultLimit) {
        if (_.has(component, 'decimalLimit')) {
            return _.get(component, 'decimalLimit');
        }
        let decimalLimit = defaultLimit || 20;
        const step = _.get(component, 'validate.step', 'any');
        if (step !== 'any') {
            const parts = step.toString().split('.');
            if (parts.length > 1) {
                decimalLimit = parts[1].length;
            }
        }
        return decimalLimit;
    }
    function getCurrencyAffixes({currency = 'USD', decimalLimit, decimalSeparator, lang}) {
        let regex = '(.*)?100';
        if (decimalLimit) {
            regex += `${ decimalSeparator === '.' ? '\\.' : decimalSeparator }0{${ decimalLimit }}`;
        }
        regex += '(.*)?';
        const parts = 100 .toLocaleString(lang, {
            style: 'currency',
            currency,
            useGrouping: true,
            maximumFractionDigits: decimalLimit,
            minimumFractionDigits: decimalLimit
        }).replace('.', decimalSeparator).match(new RegExp(regex));
        return {
            prefix: parts[1] || '',
            suffix: parts[2] || ''
        };
    }
    function fieldData(data, component) {
        if (!data) {
            return '';
        }
        if (!component || !component.key) {
            return data;
        }
        if (component.key.includes('.')) {
            let value = data;
            const parts = component.key.split('.');
            let key = '';
            for (let i = 0; i < parts.length; i++) {
                key = parts[i];
                if (value.hasOwnProperty('_id')) {
                    value = value.data;
                }
                if (!value.hasOwnProperty(key)) {
                    return;
                }
                if (key === parts[parts.length - 1] && component.multiple && !Array.isArray(value[key])) {
                    value[key] = [value[key]];
                }
                value = value[key];
            }
            return value;
        } else {
            if (component.multiple && !Array.isArray(data[component.key])) {
                data[component.key] = [data[component.key]];
            }
            return data[component.key];
        }
    }
    function delay(fn, delay = 0, ...args) {
        const timer = setTimeout(fn, delay, ...args);
        function cancel() {
            clearTimeout(timer);
        }
        function earlyCall() {
            cancel();
            return fn(...args);
        }
        earlyCall.timer = timer;
        earlyCall.cancel = cancel;
        return earlyCall;
    }
    function iterateKey(key) {
        if (!key.match(/(\d+)$/)) {
            return `${ key }1`;
        }
        return key.replace(/(\d+)$/, function (suffix) {
            return Number(suffix) + 1;
        });
    }
    function uniqueKey(map, base) {
        let newKey = base;
        while (map.hasOwnProperty(newKey)) {
            newKey = iterateKey(newKey);
        }
        return newKey;
    }
    function bootstrapVersion(options) {
        if (options.bootstrap) {
            return options.bootstrap;
        }
        if (typeof $ === 'function' && typeof $().collapse === 'function') {
            return parseInt($.fn.collapse.Constructor.VERSION.split('.')[0], 10);
        }
        return 0;
    }
    function unfold(e) {
        if (typeof e === 'function') {
            return e();
        }
        return e;
    }
    const firstNonNil = _.flow([
        _.partialRight(_.map, unfold),
        _.partialRight(_.find, v => !_.isUndefined(v))
    ]);
    function withSwitch(a, b) {
        let state = a;
        let next = b;
        function get() {
            return state;
        }
        function toggle() {
            const prev = state;
            state = next;
            next = prev;
        }
        return [
            get,
            toggle
        ];
    }
    function observeOverload(callback, options = {}) {
        const {limit = 50, delay = 500} = options;
        let callCount = 0;
        let timeoutID = 0;
        const reset = () => callCount = 0;
        return () => {
            if (timeoutID !== 0) {
                clearTimeout(timeoutID);
                timeoutID = 0;
            }
            timeoutID = setTimeout(reset, delay);
            callCount += 1;
            if (callCount >= limit) {
                clearTimeout(timeoutID);
                reset();
                return callback();
            }
        };
    }
    function getContextComponents(context) {
        const values = [];
        context.utils.eachComponent(context.instance.options.editForm.components, (component, path) => {
            if (component.key !== context.data.key) {
                values.push({
                    label: `${ component.label || component.key } (${ path })`,
                    value: component.key
                });
            }
        });
        return values;
    }
    function sanitize(string, options) {
        const sanitizeOptions = {
            ADD_ATTR: [
                'ref',
                'target'
            ],
            USE_PROFILES: { html: true }
        };
        if (options.sanitizeConfig && Array.isArray(options.sanitizeConfig.addAttr) && options.sanitizeConfig.addAttr.length > 0) {
            options.sanitizeConfig.addAttr.forEach(attr => {
                sanitizeOptions.ADD_ATTR.push(attr);
            });
        }
        if (options.sanitizeConfig && Array.isArray(options.sanitizeConfig.addTags) && options.sanitizeConfig.addTags.length > 0) {
            sanitizeOptions.ADD_TAGS = options.sanitizeConfig.addTags;
        }
        if (options.sanitizeConfig && Array.isArray(options.sanitizeConfig.allowedTags) && options.sanitizeConfig.allowedTags.length > 0) {
            sanitizeOptions.ALLOWED_TAGS = options.sanitizeConfig.allowedTags;
        }
        if (options.sanitizeConfig && Array.isArray(options.sanitizeConfig.allowedAttrs) && options.sanitizeConfig.allowedAttrs.length > 0) {
            sanitizeOptions.ALLOWED_ATTR = options.sanitizeConfig.allowedAttrs;
        }
        if (options.sanitizeConfig && options.sanitizeConfig.allowedUriRegex) {
            sanitizeOptions.ALLOWED_URI_REGEXP = options.sanitizeConfig.allowedUriRegex;
        }
        return dompurify.sanitize(string, sanitizeOptions);
    }
    function fastCloneDeep(obj) {
        return obj ? JSON.parse(JSON.stringify(obj)) : obj;
    }
    function isInputComponent(componentJson) {
        if (componentJson.input === false || componentJson.input === true) {
            return componentJson.input;
        }
        switch (componentJson.type) {
        case 'htmlelement':
        case 'content':
        case 'columns':
        case 'fieldset':
        case 'panel':
        case 'table':
        case 'tabs':
        case 'well':
        case 'button':
            return false;
        default:
            return true;
        }
    }
    return {
        jsonLogic,
        moment,
        evaluate: evaluate,
        getRandomComponentId: getRandomComponentId,
        getPropertyValue: getPropertyValue,
        getElementRect: getElementRect,
        boolValue: boolValue,
        isMongoId: isMongoId,
        checkCalculated: checkCalculated,
        checkSimpleConditional: checkSimpleConditional,
        checkCustomConditional: checkCustomConditional,
        checkJsonConditional: checkJsonConditional,
        checkCondition: checkCondition,
        checkTrigger: checkTrigger,
        setActionProperty: setActionProperty,
        uniqueName: uniqueName,
        guid: guid,
        getDateSetting: getDateSetting,
        isValidDate: isValidDate,
        currentTimezone: currentTimezone,
        offsetDate: offsetDate,
        zonesLoaded: zonesLoaded,
        shouldLoadZones: shouldLoadZones,
        loadZones: loadZones,
        momentDate: momentDate,
        formatDate: formatDate,
        formatOffset: formatOffset,
        getLocaleDateFormatInfo: getLocaleDateFormatInfo,
        convertFormatToFlatpickr: convertFormatToFlatpickr,
        convertFormatToMoment: convertFormatToMoment,
        convertFormatToMask: convertFormatToMask,
        getInputMask: getInputMask,
        matchInputMask: matchInputMask,
        getNumberSeparators: getNumberSeparators,
        getNumberDecimalLimit: getNumberDecimalLimit,
        getCurrencyAffixes: getCurrencyAffixes,
        fieldData: fieldData,
        delay: delay,
        iterateKey: iterateKey,
        uniqueKey: uniqueKey,
        bootstrapVersion: bootstrapVersion,
        unfold: unfold,
        firstNonNil: firstNonNil,
        withSwitch: withSwitch,
        observeOverload: observeOverload,
        getContextComponents: getContextComponents,
        sanitize: sanitize,
        fastCloneDeep: fastCloneDeep,
        Evaluator,
        interpolate,
        isInputComponent: isInputComponent
    };
});
define('skylark-formio/EventEmitter',[
    './vendors/eventemitter2/EventEmitter2',
    './utils/utils'
], function (EventEmitter2, utils) {
    'use strict';
    return class EventEmitter extends EventEmitter2 {
        constructor(conf = {}) {
            const {
                loadLimit = 50,
                eventsSafeInterval = 300,
                pause = 500,
                ...ee2conf
            } = conf;
            super(ee2conf);
            const [isPaused, togglePause] = utils.withSwitch(false, true);
            const overloadHandler = () => {
                console.warn('Infinite loop detected', this.id, pause);
                togglePause();
                setTimeout(togglePause, pause);
            };
            const dispatch = utils.observeOverload(overloadHandler, {
                limit: loadLimit,
                delay: eventsSafeInterval
            });
            this.emit = (...args) => {
                if (isPaused()) {
                    return;
                }
                super.emit(...args);
                dispatch();
            };
        }
    };
});
define('skylark-formio/vendors/browser-cookies/cookies',[],function(){
  var exports = {

  };

  exports.set = function(name, value, options) {
    // Retrieve options and defaults
    var opts = options || {};
    var defaults = exports.defaults;

    // Apply default value for unspecified options
    var expires  = opts.expires  || defaults.expires;
    var domain   = opts.domain   || defaults.domain;
    var path     = opts.path     !== undefined ? opts.path     : (defaults.path !== undefined ? defaults.path : '/');
    var secure   = opts.secure   !== undefined ? opts.secure   : defaults.secure;
    var httponly = opts.httponly !== undefined ? opts.httponly : defaults.httponly;
    var samesite = opts.samesite !== undefined ? opts.samesite : defaults.samesite;

    // Determine cookie expiration date
    // If succesful the result will be a valid Date, otherwise it will be an invalid Date or false(ish)
    var expDate = expires ? new Date(
        // in case expires is an integer, it should specify the number of days till the cookie expires
        typeof expires === 'number' ? new Date().getTime() + (expires * 864e5) :
        // else expires should be either a Date object or in a format recognized by Date.parse()
        expires
    ) : 0;

    // Set cookie
    document.cookie = name.replace(/[^+#$&^`|]/g, encodeURIComponent)                // Encode cookie name
    .replace('(', '%28')
    .replace(')', '%29') +
    '=' + value.replace(/[^+#$&/:<-\[\]-}]/g, encodeURIComponent) +                  // Encode cookie value (RFC6265)
    (expDate && expDate.getTime() >= 0 ? ';expires=' + expDate.toUTCString() : '') + // Add expiration date
    (domain   ? ';domain=' + domain     : '') +                                      // Add domain
    (path     ? ';path='   + path       : '') +                                      // Add path
    (secure   ? ';secure'               : '') +                                      // Add secure option
    (httponly ? ';httponly'             : '') +                                      // Add httponly option
    (samesite ? ';samesite=' + samesite : '');                                       // Add samesite option
  };

  exports.get = function(name) {
    var cookies = document.cookie.split(';');
    
    // Iterate all cookies
    while(cookies.length) {
      var cookie = cookies.pop();

      // Determine separator index ("name=value")
      var separatorIndex = cookie.indexOf('=');

      // IE<11 emits the equal sign when the cookie value is empty
      separatorIndex = separatorIndex < 0 ? cookie.length : separatorIndex;

      var cookie_name = decodeURIComponent(cookie.slice(0, separatorIndex).replace(/^\s+/, ''));

      // Return cookie value if the name matches
      if (cookie_name === name) {
        return decodeURIComponent(cookie.slice(separatorIndex + 1));
      }
    }

    // Return `null` as the cookie was not found
    return null;
  };

  exports.erase = function(name, options) {
    exports.set(name, '', {
      expires:  -1,
      domain:   options && options.domain,
      path:     options && options.path,
      secure:   0,
      httponly: 0}
    );
  };

  exports.all = function() {
    var all = {};
    var cookies = document.cookie.split(';');

    // Iterate all cookies
    while(cookies.length) {
      var cookie = cookies.pop();

      // Determine separator index ("name=value")
      var separatorIndex = cookie.indexOf('=');

      // IE<11 emits the equal sign when the cookie value is empty
      separatorIndex = separatorIndex < 0 ? cookie.length : separatorIndex;

      // add the cookie name and value to the `all` object
      var cookie_name = decodeURIComponent(cookie.slice(0, separatorIndex).replace(/^\s+/, ''));
      all[cookie_name] = decodeURIComponent(cookie.slice(separatorIndex + 1));
    }

    return all;
  };

  return exports;
});



define('skylark-formio/providers/address/AddressProvider',[
    'skylark-lodash',
    '../../Formio'
], function (_, Formio) {
    'use strict';
    class AddressProvider {
        static get name() {
            return 'address';
        }
        static get displayName() {
            return 'Address';
        }
        constructor(options = {}) {
            this.options = _.merge({}, this.defaultOptions, options);
        }
        get defaultOptions() {
            return {};
        }
        get queryProperty() {
            return 'query';
        }
        get responseProperty() {
            return null;
        }
        get displayValueProperty() {
            return null;
        }
        serialize(params) {
            return _.toPairs(params).map(([key, value]) => `${ encodeURIComponent(key) }=${ encodeURIComponent(value) }`).join('&');
        }
        getRequestOptions(options = {}) {
            return _.merge({}, this.options, options);
        }
        getRequestUrl(options = {}) {
            throw new Error('Method AddressProvider#getRequestUrl(options) is abstract.');
        }
        makeRequest(options = {}) {
            return Formio.makeStaticRequest(this.getRequestUrl(options), 'GET', null, { noToken: true });
        }
        search(query, options = {}) {
            const requestOptions = this.getRequestOptions(options);
            const params = requestOptions.params = requestOptions.params || {};
            params[this.queryProperty] = query;
            return this.makeRequest(requestOptions).then(result => this.responseProperty ? _.get(result, this.responseProperty, []) : result);
        }
        getDisplayValue(address) {
            return this.displayValueProperty ? _.get(address, this.displayValueProperty, '') : String(address);
        }
    }
    return { AddressProvider: AddressProvider };
});
define('skylark-formio/providers/address/AzureAddressProvider',['./AddressProvider'], function (a) {
    'use strict';
    class AzureAddressProvider extends a.AddressProvider {
        static get name() {
            return 'azure';
        }
        static get displayName() {
            return 'Azure Maps';
        }
        get defaultOptions() {
            return {
                params: {
                    'api-version': '1.0',
                    typeahead: 'true'
                }
            };
        }
        get responseProperty() {
            return 'results';
        }
        get displayValueProperty() {
            return 'address.freeformAddress';
        }
        getRequestUrl(options = {}) {
            const {params} = options;
            return `https://atlas.microsoft.com/search/address/json?${ this.serialize(params) }`;
        }
    }
    return { AzureAddressProvider: AzureAddressProvider };
});
define('skylark-formio/providers/address/CustomAddressProvider',['./AddressProvider'], function (a) {
    'use strict';
    class CustomAddressProvider extends a.AddressProvider {
        static get name() {
            return 'custom';
        }
        static get displayName() {
            return 'Custom';
        }
        get queryProperty() {
            return this.options.queryProperty || super.queryProperty;
        }
        get responseProperty() {
            return this.options.responseProperty || super.responseProperty;
        }
        get displayValueProperty() {
            return this.options.displayValueProperty || super.displayValueProperty;
        }
        getRequestUrl(options = {}) {
            const {params, url} = options;
            return `${ url }?${ this.serialize(params) }`;
        }
    }
    return { CustomAddressProvider: CustomAddressProvider };
});
define('skylark-formio/providers/address/GoogleAddressProvider',['./AddressProvider'], function (a) {
    'use strict';
    class GoogleAddressProvider extends a.AddressProvider {
        static get name() {
            return 'google';
        }
        static get displayName() {
            return 'Google Maps';
        }
        get defaultOptions() {
            return { params: { sensor: 'false' } };
        }
        get queryProperty() {
            return 'address';
        }
        get responseProperty() {
            return 'results';
        }
        get displayValueProperty() {
            return 'formatted_address';
        }
        makeRequest(options = {}) {
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'json';
                xhr.open('GET', this.getRequestUrl(options), true);
                xhr.onload = () => resolve(xhr.response);
                xhr.onerror = reject;
                xhr.send();
            });
        }
        getRequestUrl(options = {}) {
            const {params} = options;
            return `https://maps.googleapis.com/maps/api/geocode/json?${ this.serialize(params) }`;
        }
    }
    return { GoogleAddressProvider: GoogleAddressProvider };
});
define('skylark-formio/providers/address/NominatimAddressProvider',['./AddressProvider'], function (a) {
    'use strict';
    class NominatimAddressProvider extends a.AddressProvider {
        static get name() {
            return 'nominatim';
        }
        static get displayName() {
            return 'OpenStreetMap Nominatim';
        }
        get defaultOptions() {
            return {
                params: {
                    addressdetails: '1',
                    format: 'json'
                }
            };
        }
        get queryProperty() {
            return 'q';
        }
        get displayValueProperty() {
            return 'display_name';
        }
        getRequestUrl(options = {}) {
            const {params} = options;
            return `https://nominatim.openstreetmap.org/search?${ this.serialize(params) }`;
        }
    }
    return { NominatimAddressProvider: NominatimAddressProvider };
});
define('skylark-formio/providers/address/index',[
    './AzureAddressProvider',
    './CustomAddressProvider',
    './GoogleAddressProvider',
    './NominatimAddressProvider'
], function (a, b, c, d) {
    'use strict';
    return {
        [a.AzureAddressProvider.name]: a.AzureAddressProvider,
        [b.CustomAddressProvider.name]: b.CustomAddressProvider,
        [c.GoogleAddressProvider.name]: c.GoogleAddressProvider,
        [d.NominatimAddressProvider.name]: d.NominatimAddressProvider
    };
});
define('skylark-formio/providers/auth/index',[],function () {
    'use strict';
    return {};
});
define('skylark-formio/providers/storage/base64',['../../vendors/getify/npo'], function (NativePromise) {
    'use strict';
    const base64 = () => ({
        title: 'Base64',
        name: 'base64',
        uploadFile(file, fileName) {
            const reader = new FileReader();
            return new NativePromise((resolve, reject) => {
                reader.onload = event => {
                    const url = event.target.result;
                    resolve({
                        storage: 'base64',
                        name: fileName,
                        url: url,
                        size: file.size,
                        type: file.type
                    });
                };
                reader.onerror = () => {
                    return reject(this);
                };
                reader.readAsDataURL(file);
            });
        },
        downloadFile(file) {
            return NativePromise.resolve(file);
        }
    });
    base64.title = 'Base64';
    return base64;
});
define('skylark-formio/providers/storage/dropbox',['../../vendors/getify/npo'], function (NativePromise) {
    'use strict';
    const dropbox = formio => ({
        uploadFile(file, fileName, dir, progressCallback) {
            return new NativePromise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                if (typeof progressCallback === 'function') {
                    xhr.upload.onprogress = progressCallback;
                }
                const fd = new FormData();
                fd.append('name', fileName);
                fd.append('dir', dir);
                fd.append('file', file);
                xhr.onerror = err => {
                    err.networkError = true;
                    reject(err);
                };
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.response);
                        response.storage = 'dropbox';
                        response.size = file.size;
                        response.type = file.type;
                        response.url = response.path_lower;
                        resolve(response);
                    } else {
                        reject(xhr.response || 'Unable to upload file');
                    }
                };
                xhr.onabort = reject;
                xhr.open('POST', `${ formio.formUrl }/storage/dropbox`);
                const token = formio.getToken();
                if (token) {
                    xhr.setRequestHeader('x-jwt-token', token);
                }
                xhr.send(fd);
            });
        },
        downloadFile(file) {
            const token = formio.getToken();
            file.url = `${ formio.formUrl }/storage/dropbox?path_lower=${ file.path_lower }${ token ? `&x-jwt-token=${ token }` : '' }`;
            return NativePromise.resolve(file);
        }
    });
    dropbox.title = 'Dropbox';
    return dropbox;
});
define('skylark-formio/providers/storage/xhr',[
    '../../vendors/getify/npo',
    'skylark-lodash'
], function (NativePromise, _) {
    'use strict';

    const _trime = _.trim;
    const XHR = {
        trim(text) {
            return _trim(text, '/');
        },
        path(items) {
            return items.filter(item => !!item).map(XHR.trim).join('/');
        },
        upload(formio, type, xhrCb, file, fileName, dir, progressCallback) {
            return new NativePromise((resolve, reject) => {
                const pre = new XMLHttpRequest();
                pre.onerror = err => {
                    err.networkError = true;
                    reject(err);
                };
                pre.onabort = reject;
                pre.onload = () => {
                    if (pre.status >= 200 && pre.status < 300) {
                        const response = JSON.parse(pre.response);
                        const xhr = new XMLHttpRequest();
                        if (typeof progressCallback === 'function') {
                            xhr.upload.onprogress = progressCallback;
                        }
                        xhr.onerror = err => {
                            err.networkError = true;
                            reject(err);
                        };
                        xhr.onabort = err => {
                            err.networkError = true;
                            reject(err);
                        };
                        xhr.onload = () => {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve(response);
                            } else {
                                reject(xhr.response || 'Unable to upload file');
                            }
                        };
                        xhr.onabort = reject;
                        xhr.send(xhrCb(xhr, response));
                    } else {
                        reject(pre.response || 'Unable to sign file');
                    }
                };
                pre.open('POST', `${ formio.formUrl }/storage/${ type }`);
                pre.setRequestHeader('Accept', 'application/json');
                pre.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                const token = formio.getToken();
                if (token) {
                    pre.setRequestHeader('x-jwt-token', token);
                }
                pre.send(JSON.stringify({
                    name: XHR.path([
                        dir,
                        fileName
                    ]),
                    size: file.size,
                    type: file.type
                }));
            });
        }
    };
    return XHR;
});
define('skylark-formio/providers/storage/s3',[
    '../../vendors/getify/npo',
    './xhr'
], function (NativePromise, XHR) {
    'use strict';
    const s3 = formio => ({
        uploadFile(file, fileName, dir, progressCallback) {
            return XHR.upload(formio, 's3', (xhr, response) => {
                response.data.fileName = fileName;
                response.data.key = XHR.path([
                    response.data.key,
                    dir,
                    fileName
                ]);
                if (response.signed) {
                    xhr.open('PUT', response.signed);
                    xhr.setRequestHeader('Content-Type', file.type);
                    return file;
                } else {
                    const fd = new FormData();
                    for (const key in response.data) {
                        fd.append(key, response.data[key]);
                    }
                    fd.append('file', file);
                    xhr.open('POST', response.url);
                    return fd;
                }
            }, file, fileName, dir, progressCallback).then(response => {
                return {
                    storage: 's3',
                    name: fileName,
                    bucket: response.bucket,
                    key: response.data.key,
                    url: XHR.path([
                        response.url,
                        response.data.key
                    ]),
                    acl: response.data.acl,
                    size: file.size,
                    type: file.type
                };
            });
        },
        downloadFile(file) {
            if (file.acl !== 'public-read') {
                return formio.makeRequest('file', `${ formio.formUrl }/storage/s3?bucket=${ XHR.trim(file.bucket) }&key=${ XHR.trim(file.key) }`, 'GET');
            } else {
                return NativePromise.resolve(file);
            }
        }
    });
    s3.title = 'S3';
    return s3;
});
define('skylark-formio/providers/storage/azure',['./xhr'], function (XHR) {
    'use strict';
    const azure = formio => ({
        uploadFile(file, fileName, dir, progressCallback) {
            return XHR.upload(formio, 'azure', (xhr, response) => {
                xhr.open('PUT', response.url);
                xhr.setRequestHeader('Content-Type', file.type);
                xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
                return file;
            }, file, fileName, dir, progressCallback).then(() => {
                return {
                    storage: 'azure',
                    name: XHR.path([
                        dir,
                        fileName
                    ]),
                    size: file.size,
                    type: file.type
                };
            });
        },
        downloadFile(file) {
            return formio.makeRequest('file', `${ formio.formUrl }/storage/azure?name=${ XHR.trim(file.name) }`, 'GET');
        }
    });
    azure.title = 'Azure File Services';
    return azure;
});
define('skylark-formio/providers/storage/url',['../../vendors/getify/npo'], function (NativePromise) {
    'use strict';
    const url = formio => {
        const xhrRequest = (url, name, query, data, options, onprogress) => {
            return new NativePromise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                const json = typeof data === 'string';
                const fd = new FormData();
                if (typeof onprogress === 'function') {
                    xhr.upload.onprogress = onprogress;
                }
                if (!json) {
                    for (const key in data) {
                        fd.append(key, data[key]);
                    }
                }
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        let respData = {};
                        try {
                            respData = typeof xhr.response === 'string' ? JSON.parse(xhr.response) : {};
                            respData = respData && respData.data ? respData.data : respData;
                        } catch (err) {
                            respData = {};
                        }
                        let respUrl = respData.hasOwnProperty('url') ? respData.url : `${ xhr.responseURL }/${ name }`;
                        if (respUrl && respUrl[0] === '/') {
                            respUrl = `${ url }${ respUrl }`;
                        }
                        resolve({
                            url: respUrl,
                            data: respData
                        });
                    } else {
                        reject(xhr.response || 'Unable to upload file');
                    }
                };
                xhr.onerror = () => reject(xhr);
                xhr.onabort = () => reject(xhr);
                let requestUrl = url + (url.indexOf('?') > -1 ? '&' : '?');
                for (const key in query) {
                    requestUrl += `${ key }=${ query[key] }&`;
                }
                if (requestUrl[requestUrl.length - 1] === '&') {
                    requestUrl = requestUrl.substr(0, requestUrl.length - 1);
                }
                xhr.open('POST', requestUrl);
                if (json) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                }
                const token = formio.getToken();
                if (token) {
                    xhr.setRequestHeader('x-jwt-token', token);
                }
                if (options) {
                    const parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
                    for (const prop in parsedOptions) {
                        xhr[prop] = parsedOptions[prop];
                    }
                }
                xhr.send(json ? data : fd);
            });
        };
        return {
            title: 'Url',
            name: 'url',
            uploadFile(file, name, dir, progressCallback, url, options, fileKey) {
                const uploadRequest = function (form) {
                    return xhrRequest(url, name, {
                        baseUrl: encodeURIComponent(formio.projectUrl),
                        project: form ? form.project : '',
                        form: form ? form._id : ''
                    }, {
                        [fileKey]: file,
                        name,
                        dir
                    }, options, progressCallback).then(response => {
                        response.data = response.data || {};
                        response.data.baseUrl = formio.projectUrl;
                        response.data.project = form ? form.project : '';
                        response.data.form = form ? form._id : '';
                        return {
                            storage: 'url',
                            name,
                            url: response.url,
                            size: file.size,
                            type: file.type,
                            data: response.data
                        };
                    });
                };
                if (file.private && formio.formId) {
                    return formio.loadForm().then(form => uploadRequest(form));
                } else {
                    return uploadRequest();
                }
            },
            deleteFile(fileInfo) {
                return new NativePromise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('DELETE', fileInfo.url, true);
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve('File deleted');
                        } else {
                            reject(xhr.response || 'Unable to delete file');
                        }
                    };
                    xhr.send(null);
                });
            },
            downloadFile(file) {
                if (file.private) {
                    if (formio.submissionId && file.data) {
                        file.data.submission = formio.submissionId;
                    }
                    return xhrRequest(file.url, file.name, {}, JSON.stringify(file)).then(response => response.data);
                }
                return NativePromise.resolve(file);
            }
        };
    };
    url.title = 'Url';
    return url;
});
define('skylark-formio/vendors/uuid/rng',[],function() {
  // Unique ID creation requires a high quality random # generator.  In the
  // browser this is a little complicated due to unknown quality of Math.random()
  // and inconsistent support for the `crypto` API.  We do the best we can via
  // feature-detection

  // getRandomValues needs to be invoked in a context where "this" is a Crypto
  // implementation. Also, find the complete implementation of crypto on IE11.
  var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                        (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

  var rng;
  if (getRandomValues) {
    // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
    var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

    rng = function whatwgRNG() {
      getRandomValues(rnds8);
      return rnds8;
    };
  } else {
    // Math.random()-based (RNG)
    //
    // If all else fails, use Math.random().  It's fast, but is of unspecified
    // quality.
    var rnds = new Array(16);

    rng = function mathRNG() {
      for (var i = 0, r; i < 16; i++) {
        if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
        rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return rnds;
    };
  }

  return rng;

});


define('skylark-formio/vendors/uuid/bytesToUuid',[],function() {
	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];
	for (var i = 0; i < 256; ++i) {
	  byteToHex[i] = (i + 0x100).toString(16).substr(1);
	}

	function bytesToUuid(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex;
	  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
	  return ([bth[buf[i++]], bth[buf[i++]], 
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]], '-',
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]],
		bth[buf[i++]], bth[buf[i++]]]).join('');
	}

	return bytesToUuid;

});

define('skylark-formio/vendors/uuid/v4',[
  "./rng",
  "./bytesToUuid"
],function(rng,bytesToUuid){
  function v4(options, buf, offset) {
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options === 'binary' ? new Array(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ++ii) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || bytesToUuid(rnds);
  }

  return v4;

});

define('skylark-formio/providers/storage/indexeddb',[
    '../../vendors/uuid/v4',
    '../../vendors/getify/npo'
], function (uuidv4, NativePromise) {
    'use strict';
    const indexeddb = () => ({
        title: 'indexedDB',
        name: 'indexeddb',
        uploadFile(file, fileName, dir, progressCallback, url, options) {
            if (!('indexedDB' in window)) {
                console.log("This browser doesn't support IndexedDB");
                return;
            }
            return new NativePromise(resolve => {
                const request = indexedDB.open(options.indexeddb, 3);
                request.onsuccess = function (event) {
                    const db = event.target.result;
                    resolve(db);
                };
                request.onupgradeneeded = function (e) {
                    const db = e.target.result;
                    db.createObjectStore(options.indexeddbTable);
                };
            }).then(db => {
                const reader = new FileReader();
                return new NativePromise((resolve, reject) => {
                    reader.onload = () => {
                        const blobObject = new Blob([file], { type: file.type });
                        const id = uuidv4(blobObject);
                        const data = {
                            id,
                            data: blobObject,
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            url
                        };
                        const trans = db.transaction([options.indexeddbTable], 'readwrite');
                        const addReq = trans.objectStore(options.indexeddbTable).put(data, id);
                        addReq.onerror = function (e) {
                            console.log('error storing data');
                            console.error(e);
                        };
                        trans.oncomplete = function () {
                            resolve({
                                storage: 'indexeddb',
                                name: file.name,
                                size: file.size,
                                type: file.type,
                                url: url,
                                id
                            });
                        };
                    };
                    reader.onerror = () => {
                        return reject(this);
                    };
                    reader.readAsDataURL(file);
                });
            });
        },
        downloadFile(file, options) {
            return new NativePromise(resolve => {
                const request = indexedDB.open(options.indexeddb, 3);
                request.onsuccess = function (event) {
                    const db = event.target.result;
                    resolve(db);
                };
            }).then(db => {
                return new NativePromise((resolve, reject) => {
                    const trans = db.transaction([options.indexeddbTable], 'readonly');
                    const store = trans.objectStore(options.indexeddbTable).get(file.id);
                    store.onsuccess = () => {
                        trans.oncomplete = () => {
                            const result = store.result;
                            const dbFile = new File([store.result.data], file.name, { type: store.result.type });
                            const reader = new FileReader();
                            reader.onload = event => {
                                result.url = event.target.result;
                                resolve(result);
                            };
                            reader.onerror = () => {
                                return reject(this);
                            };
                            reader.readAsDataURL(dbFile);
                        };
                    };
                    store.onerror = () => {
                        return reject(this);
                    };
                });
            });
        }
    });
    indexeddb.title = 'IndexedDB';
    return indexeddb;
});
define('skylark-formio/providers/storage/index',[
    './base64',
    './dropbox',
    './s3',
    './azure',
    './url',
    './indexeddb'
], function (base64, dropbox, s3, azure, url, indexeddb) {
    'use strict';
    return {
        base64,
        dropbox,
        s3,
        url,
        azure,
        indexeddb
    };
});
define('skylark-formio/providers/Providers',[
    'skylark-lodash',
    './address/index',
    './auth/index',
    './storage/index'
], function (_, address, auth, storage) {
    'use strict';
    return class {
        static addProvider(type, name, provider) {
            Providers.providers[type] = Providers.providers[type] || {};
            Providers.providers[type][name] = provider;
        }
        static addProviders(type, providers) {
            Providers.providers[type] = _.merge(Providers.providers[type], providers);
        }
        static getProvider(type, name) {
            if (Providers.providers[type] && Providers.providers[type][name]) {
                return Providers.providers[type][name];
            }
        }
        static getProviders(type) {
            if (Providers.providers[type]) {
                return Providers.providers[type];
            }
        }
    };
    Providers.providers = {
        address,
        auth,
        storage
    };
});
define('skylark-formio/providers/index',['./Providers'], function (Providers) {
    'use strict';
    return Providers;
});
define('vendors/jwt-decode/atob',[],function(){
	return window.atob;
});
define('vendors/jwt-decode/base64_url_decode',[
  './atob'
],function(atob) {
  function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
      var code = p.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = '0' + code;
      }
      return '%' + code;
    }));
  }

  return function(str) {
    var output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += "==";
        break;
      case 3:
        output += "=";
        break;
      default:
        throw "Illegal base64url string!";
    }

    try{
      return b64DecodeUnicode(output);
    } catch (err) {
      return atob(output);
    }
  };
});




 define('vendors/jwt-decode/decode',[
  './base64_url_decode'
],function(base64_url_decode) {
  'use strict';

  function InvalidTokenError(message) {
    this.message = message;
  }

  InvalidTokenError.prototype = new Error();
  InvalidTokenError.prototype.name = 'InvalidTokenError';

  return function (token,options) {
    if (typeof token !== 'string') {
      throw new InvalidTokenError('Invalid token specified');
    }

    options = options || {};
    var pos = options.header === true ? 0 : 1;
    try {
      return JSON.parse(base64_url_decode(token.split('.')[pos]));
    } catch (e) {
      throw new InvalidTokenError('Invalid token specified: ' + e.message);
    }
  };


});
define('skylark-formio/polyfills/custom-event-polyfill',[],function() {
// Polyfill for creating CustomEvents on IE9/10/11

// code pulled from:
// https://github.com/d4tocchini/customevent-polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Polyfill

try {
    var ce = new window.CustomEvent('test');
    ce.preventDefault();
    if (ce.defaultPrevented !== true) {
        // IE has problems with .preventDefault() on custom events
        // http://stackoverflow.com/questions/23349191
        throw new Error('Could not prevent default');
    }
} catch(e) {
  var CustomEvent = function(event, params) {
    var evt, origPrevent;
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };

    evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    origPrevent = evt.preventDefault;
    evt.preventDefault = function () {
      origPrevent.call(this);
      try {
        Object.defineProperty(this, 'defaultPrevented', {
          get: function () {
            return true;
          }
        });
      } catch(e) {
        this.defaultPrevented = true;
      }
    };
    return evt;
  };

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent; // expose definition to window
}
	
});
define('skylark-formio/polyfills/ElementPolyfill',[],function() {

// Using polyfill from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
/* eslint-disable */
if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      var el = this;
      do {
        if (el.matches(s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
}

// Generated by https://polyfill.io/v3/
/* Polyfill service v3.52.1
 * For detailed credits and licence information see https://github.com/financial-times/polyfill-service.
 *
 * Features requested: DOMTokenList
 *
 * - Object.defineProperty, License: CC0 (required by "_DOMTokenList", "DOMTokenList")
 * - _DOMTokenList, License: ISC (required by "DOMTokenList")
 * - DOMTokenList, License: CC0 */

(function(self, undefined) {
  if (!("defineProperty"in Object&&function(){try{var e={}
  return Object.defineProperty(e,"test",{value:42}),!0}catch(t){return!1}}()
  )) {

  // Object.defineProperty
  (function (nativeDefineProperty) {

    var supportsAccessors = Object.prototype.hasOwnProperty.call(Object.prototype, '__defineGetter__');
    var ERR_ACCESSORS_NOT_SUPPORTED = 'Getters & setters cannot be defined on this javascript engine';
    var ERR_VALUE_ACCESSORS = 'A property cannot both have accessors and be writable or have a value';

    // Polyfill.io - This does not use CreateMethodProperty because our CreateMethodProperty function uses Object.defineProperty.
    Object.defineProperty = function defineProperty(object, property, descriptor) {

      // Where native support exists, assume it
      if (nativeDefineProperty && (object === window || object === document || object === Element.prototype || object instanceof Element)) {
        return nativeDefineProperty(object, property, descriptor);
      }

      if (object === null || !(object instanceof Object || typeof object === 'object')) {
        throw new TypeError('Object.defineProperty called on non-object');
      }

      if (!(descriptor instanceof Object)) {
        throw new TypeError('Property description must be an object');
      }

      var propertyString = String(property);
      var hasValueOrWritable = 'value' in descriptor || 'writable' in descriptor;
      var getterType = 'get' in descriptor && typeof descriptor.get;
      var setterType = 'set' in descriptor && typeof descriptor.set;

      // handle descriptor.get
      if (getterType) {
        if (getterType !== 'function') {
          throw new TypeError('Getter must be a function');
        }
        if (!supportsAccessors) {
          throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
        }
        if (hasValueOrWritable) {
          throw new TypeError(ERR_VALUE_ACCESSORS);
        }
        Object.__defineGetter__.call(object, propertyString, descriptor.get);
      } else {
        object[propertyString] = descriptor.value;
      }

      // handle descriptor.set
      if (setterType) {
        if (setterType !== 'function') {
          throw new TypeError('Setter must be a function');
        }
        if (!supportsAccessors) {
          throw new TypeError(ERR_ACCESSORS_NOT_SUPPORTED);
        }
        if (hasValueOrWritable) {
          throw new TypeError(ERR_VALUE_ACCESSORS);
        }
        Object.__defineSetter__.call(object, propertyString, descriptor.set);
      }

      // OK to define value unconditionally - if a getter has been specified as well, an error would be thrown above
      if ('value' in descriptor) {
        object[propertyString] = descriptor.value;
      }

      return object;
    };
  }(Object.defineProperty));

  }


  // _DOMTokenList
  /*
  Copyright (c) 2016, John Gardner

  Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
  */
  var _DOMTokenList = (function() { // eslint-disable-line no-unused-vars
    var dpSupport = true;
    var defineGetter = function (object, name, fn, configurable) {
      if (Object.defineProperty)
        Object.defineProperty(object, name, {
          configurable: false === dpSupport ? true : !!configurable,
          get: fn
        });

      else object.__defineGetter__(name, fn);
    };

    /** Ensure the browser allows Object.defineProperty to be used on native JavaScript objects. */
    try {
      defineGetter({}, "support");
    }
    catch (e) {
      dpSupport = false;
    }


    var _DOMTokenList = function (el, prop) {
      var that = this;
      var tokens = [];
      var tokenMap = {};
      var length = 0;
      var maxLength = 0;
      var addIndexGetter = function (i) {
        defineGetter(that, i, function () {
          preop();
          return tokens[i];
        }, false);

      };
      var reindex = function () {

        /** Define getter functions for array-like access to the tokenList's contents. */
        if (length >= maxLength)
          for (; maxLength < length; ++maxLength) {
            addIndexGetter(maxLength);
          }
      };

      /** Helper function called at the start of each class method. Internal use only. */
      var preop = function () {
        var error;
        var i;
        var args = arguments;
        var rSpace = /\s+/;

        /** Validate the token/s passed to an instance method, if any. */
        if (args.length)
          for (i = 0; i < args.length; ++i)
            if (rSpace.test(args[i])) {
              error = new SyntaxError('String "' + args[i] + '" ' + "contains" + ' an invalid character');
              error.code = 5;
              error.name = "InvalidCharacterError";
              throw error;
            }


        /** Split the new value apart by whitespace*/
        if (typeof el[prop] === "object") {
          tokens = ("" + el[prop].baseVal).replace(/^\s+|\s+$/g, "").split(rSpace);
        } else {
          tokens = ("" + el[prop]).replace(/^\s+|\s+$/g, "").split(rSpace);
        }

        /** Avoid treating blank strings as single-item token lists */
        if ("" === tokens[0]) tokens = [];

        /** Repopulate the internal token lists */
        tokenMap = {};
        for (i = 0; i < tokens.length; ++i)
          tokenMap[tokens[i]] = true;
        length = tokens.length;
        reindex();
      };

      /** Populate our internal token list if the targeted attribute of the subject element isn't empty. */
      preop();

      /** Return the number of tokens in the underlying string. Read-only. */
      defineGetter(that, "length", function () {
        preop();
        return length;
      });

      /** Override the default toString/toLocaleString methods to return a space-delimited list of tokens when typecast. */
      that.toLocaleString =
        that.toString = function () {
          preop();
          return tokens.join(" ");
        };

      that.item = function (idx) {
        preop();
        return tokens[idx];
      };

      that.contains = function (token) {
        preop();
        return !!tokenMap[token];
      };

      that.add = function () {
        preop.apply(that, args = arguments);

        for (var args, token, i = 0, l = args.length; i < l; ++i) {
          token = args[i];
          if (!tokenMap[token]) {
            tokens.push(token);
            tokenMap[token] = true;
          }
        }

        /** Update the targeted attribute of the attached element if the token list's changed. */
        if (length !== tokens.length) {
          length = tokens.length >>> 0;
          if (typeof el[prop] === "object") {
            el[prop].baseVal = tokens.join(" ");
          } else {
            el[prop] = tokens.join(" ");
          }
          reindex();
        }
      };

      that.remove = function () {
        preop.apply(that, args = arguments);

        /** Build a hash of token names to compare against when recollecting our token list. */
        for (var args, ignore = {}, i = 0, t = []; i < args.length; ++i) {
          ignore[args[i]] = true;
          delete tokenMap[args[i]];
        }

        /** Run through our tokens list and reassign only those that aren't defined in the hash declared above. */
        for (i = 0; i < tokens.length; ++i)
          if (!ignore[tokens[i]]) t.push(tokens[i]);

        tokens = t;
        length = t.length >>> 0;

        /** Update the targeted attribute of the attached element. */
        if (typeof el[prop] === "object") {
          el[prop].baseVal = tokens.join(" ");
        } else {
          el[prop] = tokens.join(" ");
        }
        reindex();
      };

      that.toggle = function (token, force) {
        preop.apply(that, [token]);

        /** Token state's being forced. */
        if (undefined !== force) {
          if (force) {
            that.add(token);
            return true;
          } else {
            that.remove(token);
            return false;
          }
        }

        /** Token already exists in tokenList. Remove it, and return FALSE. */
        if (tokenMap[token]) {
          that.remove(token);
          return false;
        }

        /** Otherwise, add the token and return TRUE. */
        that.add(token);
        return true;
      };

      return that;
    };

    return _DOMTokenList;
  }());
  if (!("DOMTokenList"in self&&function(e){return!("classList"in e)||!e.classList.toggle("x",!1)&&!e.className}(document.createElement("x"))
  )) {

  // DOMTokenList
  /* global _DOMTokenList */
  (function (global) {
    var nativeImpl = "DOMTokenList" in global && global.DOMTokenList;

    if (
        !nativeImpl ||
        (
          !!document.createElementNS &&
          !!document.createElementNS('http://www.w3.org/2000/svg', 'svg') &&
          !(document.createElementNS("http://www.w3.org/2000/svg", "svg").classList instanceof DOMTokenList)
        )
      ) {
      global.DOMTokenList = _DOMTokenList;
    }

    // Add second argument to native DOMTokenList.toggle() if necessary
    (function () {
      var e = document.createElement('span');
      if (!('classList' in e)) return;
      e.classList.toggle('x', false);
      if (!e.classList.contains('x')) return;
      e.classList.constructor.prototype.toggle = function toggle(token /*, force*/) {
        var force = arguments[1];
        if (force === undefined) {
          var add = !this.contains(token);
          this[add ? 'add' : 'remove'](token);
          return add;
        }
        force = !!force;
        this[force ? 'add' : 'remove'](token);
        return force;
      };
    }());

    // Add multiple arguments to native DOMTokenList.add() if necessary
    (function () {
      var e = document.createElement('span');
      if (!('classList' in e)) return;
      e.classList.add('a', 'b');
      if (e.classList.contains('b')) return;
      var native = e.classList.constructor.prototype.add;
      e.classList.constructor.prototype.add = function () {
        var args = arguments;
        var l = arguments.length;
        for (var i = 0; i < l; i++) {
          native.call(this, args[i]);
        }
      };
    }());

    // Add multiple arguments to native DOMTokenList.remove() if necessary
    (function () {
      var e = document.createElement('span');
      if (!('classList' in e)) return;
      e.classList.add('a');
      e.classList.add('b');
      e.classList.remove('a', 'b');
      if (!e.classList.contains('b')) return;
      var native = e.classList.constructor.prototype.remove;
      e.classList.constructor.prototype.remove = function () {
        var args = arguments;
        var l = arguments.length;
        for (var i = 0; i < l; i++) {
          native.call(this, args[i]);
        }
      };
    }());

  }(self));

  }

  })
  ('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});


});
define('skylark-formio/polyfills/index',[
    './custom-event-polyfill',
    './ElementPolyfill'
], function () {
    'use strict';
});
define('skylark-formio/Formio',[
    './vendors/getify/npo',
    './vendors/fetch-ponyfill/fetch',
    './EventEmitter',
    './vendors/browser-cookies/cookies',
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
define('skylark-formio/vendors/vanilla-text-mask/constants',[],function() {	
	const placeholderChar = '_';
	const strFunction = 'function';

	return {
		placeholderChar,
		strFunction
	}
});
define('skylark-formio/vendors/vanilla-text-mask/utilities',[
  './constants'
],function(constants) {

  const defaultPlaceholderChar  = constants.placeholderChar; 

  const emptyArray = []

  function convertMaskToPlaceholder(mask = emptyArray, placeholderChar = defaultPlaceholderChar) {
    if (!isArray(mask)) {
      throw new Error(
        'Text-mask:convertMaskToPlaceholder; The mask property must be an array.'
      )
    }

    if (mask.indexOf(placeholderChar) !== -1) {
      throw new Error(
        'Placeholder character must not be used as part of the mask. Please specify a character ' +
        'that is not present in your mask as your placeholder character.\n\n' +
        `The placeholder character that was received is: ${JSON.stringify(placeholderChar)}\n\n` +
        `The mask that was received is: ${JSON.stringify(mask)}`
      )
    }

    return mask.map((char) => {
      return (char instanceof RegExp) ? placeholderChar : char
    }).join('')
  }

  function isArray(value) {
    return (Array.isArray && Array.isArray(value)) || value instanceof Array
  }

  function isString(value) {
    return typeof value === 'string' || value instanceof String
  }

  function isNumber(value) {
    return typeof value === 'number' && value.length === undefined && !isNaN(value)
  }

  function isNil(value) {
    return typeof value === 'undefined' || value === null
  }

  const strCaretTrap = '[]'
  function processCaretTraps(mask) {
    const indexes = []

    let indexOfCaretTrap
    while(indexOfCaretTrap = mask.indexOf(strCaretTrap), indexOfCaretTrap !== -1) { // eslint-disable-line
      indexes.push(indexOfCaretTrap)

      mask.splice(indexOfCaretTrap, 1)
    }

    return {maskWithoutCaretTraps: mask, indexes}
  }


  return {
    convertMaskToPlaceholder,
    isArray,
    isString,
    isNumber,
    isNil,
    processCaretTraps
  }
});


define('skylark-formio/vendors/vanilla-text-mask/adjustCaretPosition',[],function(){
  const defaultArray = [];
  const emptyString = '';

  function adjustCaretPosition({
    previousConformedValue = emptyString,
    previousPlaceholder = emptyString,
    currentCaretPosition = 0,
    conformedValue,
    rawValue,
    placeholderChar,
    placeholder,
    indexesOfPipedChars = defaultArray,
    caretTrapIndexes = defaultArray
  }) {
    if (currentCaretPosition === 0 || !rawValue.length) { return 0 }

    // Store lengths for faster performance?
    const rawValueLength = rawValue.length
    const previousConformedValueLength = previousConformedValue.length
    const placeholderLength = placeholder.length
    const conformedValueLength = conformedValue.length

    // This tells us how long the edit is. If user modified input from `(2__)` to `(243__)`,
    // we know the user in this instance pasted two characters
    const editLength = rawValueLength - previousConformedValueLength

    // If the edit length is positive, that means the user is adding characters, not deleting.
    const isAddition = editLength > 0

    // This is the first raw value the user entered that needs to be conformed to mask
    const isFirstRawValue = previousConformedValueLength === 0

    // A partial multi-character edit happens when the user makes a partial selection in their
    // input and edits that selection. That is going from `(123) 432-4348` to `() 432-4348` by
    // selecting the first 3 digits and pressing backspace.
    //
    // Such cases can also happen when the user presses the backspace while holding down the ALT
    // key.
    const isPartialMultiCharEdit = editLength > 1 && !isAddition && !isFirstRawValue

    // This algorithm doesn't support all cases of multi-character edits, so we just return
    // the current caret position.
    //
    // This works fine for most cases.
    if (isPartialMultiCharEdit) { return currentCaretPosition }

    // For a mask like (111), if the `previousConformedValue` is (1__) and user attempts to enter
    // `f` so the `rawValue` becomes (1f__), the new `conformedValue` would be (1__), which is the
    // same as the original `previousConformedValue`. We handle this case differently for caret
    // positioning.
    const possiblyHasRejectedChar = isAddition && (
      previousConformedValue === conformedValue ||
      conformedValue === placeholder
    )

    let startingSearchIndex = 0
    let trackRightCharacter
    let targetChar

    if (possiblyHasRejectedChar) {
      startingSearchIndex = currentCaretPosition - editLength
    } else {
      // At this point in the algorithm, we want to know where the caret is right before the raw input
      // has been conformed, and then see if we can find that same spot in the conformed input.
      //
      // We do that by seeing what character lies immediately before the caret, and then look for that
      // same character in the conformed input and place the caret there.

      // First, we need to normalize the inputs so that letter capitalization between raw input and
      // conformed input wouldn't matter.
      const normalizedConformedValue = conformedValue.toLowerCase()
      const normalizedRawValue = rawValue.toLowerCase()

      // Then we take all characters that come before where the caret currently is.
      const leftHalfChars = normalizedRawValue.substr(0, currentCaretPosition).split(emptyString)

      // Now we find all the characters in the left half that exist in the conformed input
      // This step ensures that we don't look for a character that was filtered out or rejected by `conformToMask`.
      const intersection = leftHalfChars.filter((char) => normalizedConformedValue.indexOf(char) !== -1)

      // The last character in the intersection is the character we want to look for in the conformed
      // value and the one we want to adjust the caret close to
      targetChar = intersection[intersection.length - 1]

      // Calculate the number of mask characters in the previous placeholder
      // from the start of the string up to the place where the caret is
      const previousLeftMaskChars = previousPlaceholder
        .substr(0, intersection.length)
        .split(emptyString)
        .filter(char => char !== placeholderChar)
        .length

      // Calculate the number of mask characters in the current placeholder
      // from the start of the string up to the place where the caret is
      const leftMaskChars = placeholder
        .substr(0, intersection.length)
        .split(emptyString)
        .filter(char => char !== placeholderChar)
        .length

      // Has the number of mask characters up to the caret changed?
      const masklengthChanged = leftMaskChars !== previousLeftMaskChars

      // Detect if `targetChar` is a mask character and has moved to the left
      const targetIsMaskMovingLeft = (
        previousPlaceholder[intersection.length - 1] !== undefined &&
        placeholder[intersection.length - 2] !== undefined &&
        previousPlaceholder[intersection.length - 1] !== placeholderChar &&
        previousPlaceholder[intersection.length - 1] !== placeholder[intersection.length - 1] &&
        previousPlaceholder[intersection.length - 1] === placeholder[intersection.length - 2]
      )

      // If deleting and the `targetChar` `is a mask character and `masklengthChanged` is true
      // or the mask is moving to the left, we can't use the selected `targetChar` any longer
      // if we are not at the end of the string.
      // In this case, change tracking strategy and track the character to the right of the caret.
      if (
        !isAddition &&
        (masklengthChanged || targetIsMaskMovingLeft) &&
        previousLeftMaskChars > 0 &&
        placeholder.indexOf(targetChar) > -1 &&
        rawValue[currentCaretPosition] !== undefined
      ) {
        trackRightCharacter = true
        targetChar = rawValue[currentCaretPosition]
      }

      // It is possible that `targetChar` will appear multiple times in the conformed value.
      // We need to know not to select a character that looks like our target character from the placeholder or
      // the piped characters, so we inspect the piped characters and the placeholder to see if they contain
      // characters that match our target character.

      // If the `conformedValue` got piped, we need to know which characters were piped in so that when we look for
      // our `targetChar`, we don't select a piped char by mistake
      const pipedChars = indexesOfPipedChars.map((index) => normalizedConformedValue[index])

      // We need to know how many times the `targetChar` occurs in the piped characters.
      const countTargetCharInPipedChars = pipedChars.filter((char) => char === targetChar).length

      // We need to know how many times it occurs in the intersection
      const countTargetCharInIntersection = intersection.filter((char) => char === targetChar).length

      // We need to know if the placeholder contains characters that look like
      // our `targetChar`, so we don't select one of those by mistake.
      const countTargetCharInPlaceholder = placeholder
        .substr(0, placeholder.indexOf(placeholderChar))
        .split(emptyString)
        .filter((char, index) => (
          // Check if `char` is the same as our `targetChar`, so we account for it
          char === targetChar &&

          // but also make sure that both the `rawValue` and placeholder don't have the same character at the same
          // index because if they are equal, that means we are already counting those characters in
          // `countTargetCharInIntersection`
          rawValue[index] !== char
        ))
        .length

      // The number of times we need to see occurrences of the `targetChar` before we know it is the one we're looking
      // for is:
      const requiredNumberOfMatches = (
        countTargetCharInPlaceholder +
        countTargetCharInIntersection +
        countTargetCharInPipedChars +
        // The character to the right of the caret isn't included in `intersection`
        // so add one if we are tracking the character to the right
        (trackRightCharacter ? 1 : 0)
      )

      // Now we start looking for the location of the `targetChar`.
      // We keep looping forward and store the index in every iteration. Once we have encountered
      // enough occurrences of the target character, we break out of the loop
      // If are searching for the second `1` in `1214`, `startingSearchIndex` will point at `4`.
      let numberOfEncounteredMatches = 0
      for (let i = 0; i < conformedValueLength; i++) {
        const conformedValueChar = normalizedConformedValue[i]

        startingSearchIndex = i + 1

        if (conformedValueChar === targetChar) {
          numberOfEncounteredMatches++
        }

        if (numberOfEncounteredMatches >= requiredNumberOfMatches) {
          break
        }
      }
    }

    // At this point, if we simply return `startingSearchIndex` as the adjusted caret position,
    // most cases would be handled. However, we want to fast forward or rewind the caret to the
    // closest placeholder character if it happens to be in a non-editable spot. That's what the next
    // logic is for.

    // In case of addition, we fast forward.
    if (isAddition) {
      // We want to remember the last placeholder character encountered so that if the mask
      // contains more characters after the last placeholder character, we don't forward the caret
      // that far to the right. Instead, we stop it at the last encountered placeholder character.
      let lastPlaceholderChar = startingSearchIndex

      for (let i = startingSearchIndex; i <= placeholderLength; i++) {
        if (placeholder[i] === placeholderChar) {
          lastPlaceholderChar = i
        }

        if (
          // If we're adding, we can position the caret at the next placeholder character.
          placeholder[i] === placeholderChar ||

          // If a caret trap was set by a mask function, we need to stop at the trap.
          caretTrapIndexes.indexOf(i) !== -1 ||

          // This is the end of the placeholder. We cannot move any further. Let's put the caret there.
          i === placeholderLength
        ) {
          return lastPlaceholderChar
        }
      }
    } else {
      // In case of deletion, we rewind.
      if (trackRightCharacter) {
        // Searching for the character that was to the right of the caret
        // We start at `startingSearchIndex` - 1 because it includes one character extra to the right
        for (let i = startingSearchIndex - 1; i >= 0; i--) {
          // If tracking the character to the right of the cursor, we move to the left until
          // we found the character and then place the caret right before it

          if (
            // `targetChar` should be in `conformedValue`, since it was in `rawValue`, just
            // to the right of the caret
            conformedValue[i] === targetChar ||

            // If a caret trap was set by a mask function, we need to stop at the trap.
            caretTrapIndexes.indexOf(i) !== -1 ||

            // This is the beginning of the placeholder. We cannot move any further.
            // Let's put the caret there.
            i === 0
          ) {
            return i
          }
        }
      } else {
        // Searching for the first placeholder or caret trap to the left

        for (let i = startingSearchIndex; i >= 0; i--) {
          // If we're deleting, we stop the caret right before the placeholder character.
          // For example, for mask `(111) 11`, current conformed input `(456) 86`. If user
          // modifies input to `(456 86`. That is, they deleted the `)`, we place the caret
          // right after the first `6`

          if (
            // If we're deleting, we can position the caret right before the placeholder character
            placeholder[i - 1] === placeholderChar ||

            // If a caret trap was set by a mask function, we need to stop at the trap.
            caretTrapIndexes.indexOf(i) !== -1 ||

            // This is the beginning of the placeholder. We cannot move any further.
            // Let's put the caret there.
            i === 0
          ) {
            return i
          }
        }
      }
    }
  }

  return adjustCaretPosition;
});
define('skylark-formio/vendors/vanilla-text-mask/conformToMask',[
  "./utilities",
  "./constants"
],function(utilities,constants){


  const {convertMaskToPlaceholder, isArray, processCaretTraps} = utilities;
  const {strFunction} = constants;

  const defaultPlaceholderChar = constants.placeholderChar;

  const emptyArray = []
  const emptyString = ''

  function conformToMask(rawValue = emptyString, mask = emptyArray, config = {}) {
    if (!isArray(mask)) {
      // If someone passes a function as the mask property, we should call the
      // function to get the mask array - Normally this is handled by the
      // `createTextMaskInputElement:update` function - this allows mask functions
      // to be used directly with `conformToMask`
      if (typeof mask === strFunction) {
        // call the mask function to get the mask array
        mask = mask(rawValue, config)

        // mask functions can setup caret traps to have some control over how the caret moves. We need to process
        // the mask for any caret traps. `processCaretTraps` will remove the caret traps from the mask
        mask = processCaretTraps(mask).maskWithoutCaretTraps
      } else {
        throw new Error(
          'Text-mask:conformToMask; The mask property must be an array.'
        )
      }
    }

    // These configurations tell us how to conform the mask
    const {
      guide = true,
      previousConformedValue = emptyString,
      placeholderChar = defaultPlaceholderChar,
      placeholder = convertMaskToPlaceholder(mask, placeholderChar),
      currentCaretPosition,
      keepCharPositions
    } = config

    // The configs below indicate that the user wants the algorithm to work in *no guide* mode
    const suppressGuide = guide === false && previousConformedValue !== undefined

    // Calculate lengths once for performance
    const rawValueLength = rawValue.length
    const previousConformedValueLength = previousConformedValue.length
    const placeholderLength = placeholder.length
    const maskLength = mask.length

    // This tells us the number of edited characters and the direction in which they were edited (+/-)
    const editDistance = rawValueLength - previousConformedValueLength

    // In *no guide* mode, we need to know if the user is trying to add a character or not
    const isAddition = editDistance > 0

    // Tells us the index of the first change. For (438) 394-4938 to (38) 394-4938, that would be 1
    const indexOfFirstChange = currentCaretPosition + (isAddition ? -editDistance : 0)

    // We're also gonna need the index of last change, which we can derive as follows...
    const indexOfLastChange = indexOfFirstChange + Math.abs(editDistance)

    // If `conformToMask` is configured to keep character positions, that is, for mask 111, previous value
    // _2_ and raw value 3_2_, the new conformed value should be 32_, not 3_2 (default behavior). That's in the case of
    // addition. And in the case of deletion, previous value _23, raw value _3, the new conformed string should be
    // __3, not _3_ (default behavior)
    //
    // The next block of logic handles keeping character positions for the case of deletion. (Keeping
    // character positions for the case of addition is further down since it is handled differently.)
    // To do this, we want to compensate for all characters that were deleted
    if (keepCharPositions === true && !isAddition) {
      // We will be storing the new placeholder characters in this variable.
      let compensatingPlaceholderChars = emptyString

      // For every character that was deleted from a placeholder position, we add a placeholder char
      for (let i = indexOfFirstChange; i < indexOfLastChange; i++) {
        if (placeholder[i] === placeholderChar) {
          compensatingPlaceholderChars += placeholderChar
        }
      }

      // Now we trick our algorithm by modifying the raw value to make it contain additional placeholder characters
      // That way when the we start laying the characters again on the mask, it will keep the non-deleted characters
      // in their positions.
      rawValue = (
        rawValue.slice(0, indexOfFirstChange) +
        compensatingPlaceholderChars +
        rawValue.slice(indexOfFirstChange, rawValueLength)
      )
    }

    // Convert `rawValue` string to an array, and mark characters based on whether they are newly added or have
    // existed in the previous conformed value. Identifying new and old characters is needed for `conformToMask`
    // to work if it is configured to keep character positions.
    const rawValueArr = rawValue
      .split(emptyString)
      .map((char, i) => ({char, isNew: i >= indexOfFirstChange && i < indexOfLastChange}))

    // The loop below removes masking characters from user input. For example, for mask
    // `00 (111)`, the placeholder would be `00 (___)`. If user input is `00 (234)`, the loop below
    // would remove all characters but `234` from the `rawValueArr`. The rest of the algorithm
    // then would lay `234` on top of the available placeholder positions in the mask.
    for (let i = rawValueLength - 1; i >= 0; i--) {
      const {char} = rawValueArr[i]

      if (char !== placeholderChar) {
        const shouldOffset = i >= indexOfFirstChange && previousConformedValueLength === maskLength

        if (char === placeholder[(shouldOffset) ? i - editDistance : i]) {
          rawValueArr.splice(i, 1)
        }
      }
    }

    // This is the variable that we will be filling with characters as we figure them out
    // in the algorithm below
    let conformedValue = emptyString
    let someCharsRejected = false

    // Ok, so first we loop through the placeholder looking for placeholder characters to fill up.
    placeholderLoop: for (let i = 0; i < placeholderLength; i++) {
      const charInPlaceholder = placeholder[i]

      // We see one. Let's find out what we can put in it.
      if (charInPlaceholder === placeholderChar) {
        // But before that, do we actually have any user characters that need a place?
        if (rawValueArr.length > 0) {
          // We will keep chipping away at user input until either we run out of characters
          // or we find at least one character that we can map.
          while (rawValueArr.length > 0) {
            // Let's retrieve the first user character in the queue of characters we have left
            const {char: rawValueChar, isNew} = rawValueArr.shift()

            // If the character we got from the user input is a placeholder character (which happens
            // regularly because user input could be something like (540) 90_-____, which includes
            // a bunch of `_` which are placeholder characters) and we are not in *no guide* mode,
            // then we map this placeholder character to the current spot in the placeholder
            if (rawValueChar === placeholderChar && suppressGuide !== true) {
              conformedValue += placeholderChar

              // And we go to find the next placeholder character that needs filling
              continue placeholderLoop

            // Else if, the character we got from the user input is not a placeholder, let's see
            // if the current position in the mask can accept it.
            } else if (mask[i].test(rawValueChar)) {
              // we map the character differently based on whether we are keeping character positions or not.
              // If any of the conditions below are met, we simply map the raw value character to the
              // placeholder position.
              if (
                keepCharPositions !== true ||
                isNew === false ||
                previousConformedValue === emptyString ||
                guide === false ||
                !isAddition
              ) {
                conformedValue += rawValueChar
              } else {
                // We enter this block of code if we are trying to keep character positions and none of the conditions
                // above is met. In this case, we need to see if there's an available spot for the raw value character
                // to be mapped to. If we couldn't find a spot, we will discard the character.
                //
                // For example, for mask `1111`, previous conformed value `_2__`, raw value `942_2__`. We can map the
                // `9`, to the first available placeholder position, but then, there are no more spots available for the
                // `4` and `2`. So, we discard them and end up with a conformed value of `92__`.
                const rawValueArrLength = rawValueArr.length
                let indexOfNextAvailablePlaceholderChar = null

                // Let's loop through the remaining raw value characters. We are looking for either a suitable spot, ie,
                // a placeholder character or a non-suitable spot, ie, a non-placeholder character that is not new.
                // If we see a suitable spot first, we store its position and exit the loop. If we see a non-suitable
                // spot first, we exit the loop and our `indexOfNextAvailablePlaceholderChar` will stay as `null`.
                for (let i = 0; i < rawValueArrLength; i++) {
                  const charData = rawValueArr[i]

                  if (charData.char !== placeholderChar && charData.isNew === false) {
                    break
                  }

                  if (charData.char === placeholderChar) {
                    indexOfNextAvailablePlaceholderChar = i
                    break
                  }
                }

                // If `indexOfNextAvailablePlaceholderChar` is not `null`, that means the character is not blocked.
                // We can map it. And to keep the character positions, we remove the placeholder character
                // from the remaining characters
                if (indexOfNextAvailablePlaceholderChar !== null) {
                  conformedValue += rawValueChar
                  rawValueArr.splice(indexOfNextAvailablePlaceholderChar, 1)

                // If `indexOfNextAvailablePlaceholderChar` is `null`, that means the character is blocked. We have to
                // discard it.
                } else {
                  i--
                }
              }

              // Since we've mapped this placeholder position. We move on to the next one.
              continue placeholderLoop
            } else {
              someCharsRejected = true
            }
          }
        }

        // We reach this point when we've mapped all the user input characters to placeholder
        // positions in the mask. In *guide* mode, we append the left over characters in the
        // placeholder to the `conformedString`, but in *no guide* mode, we don't wanna do that.
        //
        // That is, for mask `(111)` and user input `2`, we want to return `(2`, not `(2__)`.
        if (suppressGuide === false) {
          conformedValue += placeholder.substr(i, placeholderLength)
        }

        // And we break
        break

      // Else, the charInPlaceholder is not a placeholderChar. That is, we cannot fill it
      // with user input. So we just map it to the final output
      } else {
        conformedValue += charInPlaceholder
      }
    }

    // The following logic is needed to deal with the case of deletion in *no guide* mode.
    //
    // Consider the silly mask `(111) /// 1`. What if user tries to delete the last placeholder
    // position? Something like `(589) /// `. We want to conform that to `(589`. Not `(589) /// `.
    // That's why the logic below finds the last filled placeholder character, and removes everything
    // from that point on.
    if (suppressGuide && isAddition === false) {
      let indexOfLastFilledPlaceholderChar = null

      // Find the last filled placeholder position and substring from there
      for (let i = 0; i < conformedValue.length; i++) {
        if (placeholder[i] === placeholderChar) {
          indexOfLastFilledPlaceholderChar = i
        }
      }

      if (indexOfLastFilledPlaceholderChar !== null) {
        // We substring from the beginning until the position after the last filled placeholder char.
        conformedValue = conformedValue.substr(0, indexOfLastFilledPlaceholderChar + 1)
      } else {
        // If we couldn't find `indexOfLastFilledPlaceholderChar` that means the user deleted
        // the first character in the mask. So we return an empty string.
        conformedValue = emptyString
      }
    }

    return {conformedValue, meta: {someCharsRejected}}
  }

  return conformToMask;

});
define('skylark-formio/vendors/vanilla-text-mask/createTextMaskInputElement',[
  "./utilities",
  "./constants",
  "./adjustCaretPosition",
  "./conformToMask"
],function(utilities,constants,adjustCaretPosition,conformToMask){


  const {convertMaskToPlaceholder, isArray, processCaretTraps} = utilities;
  const {strFunction} = constants;

  const defaultPlaceholderChar = constants.placeholderChar;

  const emptyString = ''
  const strNone = 'none'
  const strObject = 'object'
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
  const defer = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : setTimeout

  function createTextMaskInputElement(config) {
    // Anything that we will need to keep between `update` calls, we will store in this `state` object.
    const state = {previousConformedValue: undefined, previousPlaceholder: undefined}

    return {
      state,

      // `update` is called by framework components whenever they want to update the `value` of the input element.
      // The caller can send a `rawValue` to be conformed and set on the input element. However, the default use-case
      // is for this to be read from the `inputElement` directly.
      update(rawValue, {
        inputElement,
        mask: providedMask,
        guide,
        pipe,
        placeholderChar = defaultPlaceholderChar,
        keepCharPositions = false,
        showMask = false
      } = config) {
        // if `rawValue` is `undefined`, read from the `inputElement`
        if (typeof rawValue === 'undefined') {
          rawValue = inputElement.value
        }

        // If `rawValue` equals `state.previousConformedValue`, we don't need to change anything. So, we return.
        // This check is here to handle controlled framework components that repeat the `update` call on every render.
        if (rawValue === state.previousConformedValue) { return }

        // Text Mask accepts masks that are a combination of a `mask` and a `pipe` that work together. If such a `mask` is
        // passed, we destructure it below, so the rest of the code can work normally as if a separate `mask` and a `pipe`
        // were passed.
        if (typeof providedMask === strObject && providedMask.pipe !== undefined && providedMask.mask !== undefined) {
          pipe = providedMask.pipe
          providedMask = providedMask.mask
        }

        // The `placeholder` is an essential piece of how Text Mask works. For a mask like `(111)`, the placeholder would
        // be `(___)` if the `placeholderChar` is set to `_`.
        let placeholder

        // We don't know what the mask would be yet. If it is an array, we take it as is, but if it's a function, we will
        // have to call that function to get the mask array.
        let mask

        // If the provided mask is an array, we can call `convertMaskToPlaceholder` here once and we'll always have the
        // correct `placeholder`.
        if (providedMask instanceof Array) {
          placeholder = convertMaskToPlaceholder(providedMask, placeholderChar)
        }

        // In framework components that support reactivity, it's possible to turn off masking by passing
        // `false` for `mask` after initialization. See https://github.com/text-mask/text-mask/pull/359
        if (providedMask === false) { return }

        // We check the provided `rawValue` before moving further.
        // If it's something we can't work with `getSafeRawValue` will throw.
        const safeRawValue = getSafeRawValue(rawValue)

        // `selectionEnd` indicates to us where the caret position is after the user has typed into the input
        const {selectionEnd: currentCaretPosition} = inputElement

        // We need to know what the `previousConformedValue` and `previousPlaceholder` is from the previous `update` call
        const {previousConformedValue, previousPlaceholder} = state

        let caretTrapIndexes

        // If the `providedMask` is a function. We need to call it at every `update` to get the `mask` array.
        // Then we also need to get the `placeholder`
        if (typeof providedMask === strFunction) {
          mask = providedMask(safeRawValue, {currentCaretPosition, previousConformedValue, placeholderChar})

          // disable masking if `mask` is `false`
          if (mask === false) { return }

          // mask functions can setup caret traps to have some control over how the caret moves. We need to process
          // the mask for any caret traps. `processCaretTraps` will remove the caret traps from the mask and return
          // the indexes of the caret traps.
          const {maskWithoutCaretTraps, indexes} = processCaretTraps(mask)

          mask = maskWithoutCaretTraps // The processed mask is what we're interested in
          caretTrapIndexes = indexes // And we need to store these indexes because they're needed by `adjustCaretPosition`

          placeholder = convertMaskToPlaceholder(mask, placeholderChar)

        // If the `providedMask` is not a function, we just use it as-is.
        } else {
          mask = providedMask
        }

        // The following object will be passed to `conformToMask` to determine how the `rawValue` will be conformed
        const conformToMaskConfig = {
          previousConformedValue,
          guide,
          placeholderChar,
          pipe,
          placeholder,
          currentCaretPosition,
          keepCharPositions
        }

        // `conformToMask` returns `conformedValue` as part of an object for future API flexibility
        const {conformedValue} = conformToMask(safeRawValue, mask, conformToMaskConfig)

        // The following few lines are to support the `pipe` feature.
        const piped = typeof pipe === strFunction

        let pipeResults = {}

        // If `pipe` is a function, we call it.
        if (piped) {
          // `pipe` receives the `conformedValue` and the configurations with which `conformToMask` was called.
          pipeResults = pipe(conformedValue, {rawValue: safeRawValue, ...conformToMaskConfig})

          // `pipeResults` should be an object. But as a convenience, we allow the pipe author to just return `false` to
          // indicate rejection. Or return just a string when there are no piped characters.
          // If the `pipe` returns `false` or a string, the block below turns it into an object that the rest
          // of the code can work with.
          if (pipeResults === false) {
            // If the `pipe` rejects `conformedValue`, we use the `previousConformedValue`, and set `rejected` to `true`.
            pipeResults = {value: previousConformedValue, rejected: true}
          } else if (isString(pipeResults)) {
            pipeResults = {value: pipeResults}
          }
        }

        // Before we proceed, we need to know which conformed value to use, the one returned by the pipe or the one
        // returned by `conformToMask`.
        const finalConformedValue = (piped) ? pipeResults.value : conformedValue

        // After determining the conformed value, we will need to know where to set
        // the caret position. `adjustCaretPosition` will tell us.
        const adjustedCaretPosition = adjustCaretPosition({
          previousConformedValue,
          previousPlaceholder,
          conformedValue: finalConformedValue,
          placeholder,
          rawValue: safeRawValue,
          currentCaretPosition,
          placeholderChar,
          indexesOfPipedChars: pipeResults.indexesOfPipedChars,
          caretTrapIndexes
        })

        // Text Mask sets the input value to an empty string when the condition below is set. It provides a better UX.
        const inputValueShouldBeEmpty = finalConformedValue === placeholder && adjustedCaretPosition === 0
        const emptyValue = showMask ? placeholder : emptyString
        const inputElementValue = (inputValueShouldBeEmpty) ? emptyValue : finalConformedValue

        state.previousConformedValue = inputElementValue // store value for access for next time
        state.previousPlaceholder = placeholder

        // In some cases, this `update` method will be repeatedly called with a raw value that has already been conformed
        // and set to `inputElement.value`. The below check guards against needlessly readjusting the input state.
        // See https://github.com/text-mask/text-mask/issues/231
        if (inputElement.value === inputElementValue) {
          return
        }

        inputElement.value = inputElementValue // set the input value
        safeSetSelection(inputElement, adjustedCaretPosition) // adjust caret position
      }
    }
  }

  function safeSetSelection(element, selectionPosition) {
    if (document.activeElement === element) {
      if (isAndroid) {
        defer(() => element.setSelectionRange(selectionPosition, selectionPosition, strNone), 0)
      } else {
        element.setSelectionRange(selectionPosition, selectionPosition, strNone)
      }
    }
  }

  function getSafeRawValue(inputValue) {
    if (isString(inputValue)) {
      return inputValue
    } else if (isNumber(inputValue)) {
      return String(inputValue)
    } else if (inputValue === undefined || inputValue === null) {
      return emptyString
    } else {
      throw new Error(
        "The 'value' provided to Text Mask needs to be a string or a number. The value " +
        `received was:\n\n ${JSON.stringify(inputValue)}`
      )
    }
  }

  return createTextMaskInputElement;

});
define('skylark-formio/vendors/vanilla-text-mask/maskInput',[
	"./createTextMaskInputElement"
],function(createTextMaskInputElement) {

	function maskInput(textMaskConfig) {
	  const {inputElement} = textMaskConfig
	  const textMaskInputElement = createTextMaskInputElement(textMaskConfig)
	  const inputHandler = ({target: {value}}) => textMaskInputElement.update(value)

	  inputElement.addEventListener('input', inputHandler)

	  textMaskInputElement.update(inputElement.value)

	  return {
	    textMaskInputElement,

	    destroy() {
	      inputElement.removeEventListener('input', inputHandler)
	    }
	  }
	}

	return  maskInput;
});


define('skylark-formio/Element',[
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
/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.3.1
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

define('skylark-formio/vendors/tooltip-js/Tooltip',["skylark-popper"],function(Popper){



  /**
   * Check if the given variable is a function
   * @method
   * @memberof Popper.Utils
   * @argument {Any} functionToCheck - variable to check
   * @returns {Boolean} answer to: is a function?
   */
  function isFunction(functionToCheck) {
    const getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  const DEFAULT_OPTIONS = {
    container: false,
    delay: 0,
    html: false,
    placement: 'top',
    title: '',
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    offset: 0,
    arrowSelector: '.tooltip-arrow, .tooltip__arrow',
    innerSelector: '.tooltip-inner, .tooltip__inner'
  };

  class Tooltip {
    /**
     * Create a new Tooltip.js instance
     * @class Tooltip
     * @param {HTMLElement} reference - The DOM node used as reference of the tooltip (it can be a jQuery element).
     * @param {Object} options
     * @param {String} options.placement='top'
     *      Placement of the popper accepted values: `top(-start, -end), right(-start, -end), bottom(-start, -end),
     *      left(-start, -end)`
     * @param {String} options.arrowSelector='.tooltip-arrow, .tooltip__arrow' - className used to locate the DOM arrow element in the tooltip.
     * @param {String} options.innerSelector='.tooltip-inner, .tooltip__inner' - className used to locate the DOM inner element in the tooltip.
     * @param {HTMLElement|String|false} options.container=false - Append the tooltip to a specific element.
     * @param {Number|Object} options.delay=0
     *      Delay showing and hiding the tooltip (ms) - does not apply to manual trigger type.
     *      If a number is supplied, delay is applied to both hide/show.
     *      Object structure is: `{ show: 500, hide: 100 }`
     * @param {Boolean} options.html=false - Insert HTML into the tooltip. If false, the content will inserted with `textContent`.
     * @param {String} [options.template='<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>']
     *      Base HTML to used when creating the tooltip.
     *      The tooltip's `title` will be injected into the `.tooltip-inner` or `.tooltip__inner`.
     *      `.tooltip-arrow` or `.tooltip__arrow` will become the tooltip's arrow.
     *      The outermost wrapper element should have the `.tooltip` class.
     * @param {String|HTMLElement|TitleFunction} options.title='' - Default title value if `title` attribute isn't present.
     * @param {String} [options.trigger='hover focus']
     *      How tooltip is triggered - click, hover, focus, manual.
     *      You may pass multiple triggers; separate them with a space. `manual` cannot be combined with any other trigger.
     * @param {Boolean} options.closeOnClickOutside=false - Close a popper on click outside of the popper and reference element. This has effect only when options.trigger is 'click'.
     * @param {String|HTMLElement} options.boundariesElement
     *      The element used as boundaries for the tooltip. For more information refer to Popper.js'
     *      [boundariesElement docs](https://popper.js.org/popper-documentation.html)
     * @param {Number|String} options.offset=0 - Offset of the tooltip relative to its reference. For more information refer to Popper.js'
     *      [offset docs](https://popper.js.org/popper-documentation.html)
     * @param {Object} options.popperOptions={} - Popper options, will be passed directly to popper instance. For more information refer to Popper.js'
     *      [options docs](https://popper.js.org/popper-documentation.html)
     * @return {Object} instance - The generated tooltip instance
     */
    constructor(reference, options) {
      _initialiseProps.call(this);

      // apply user options over default ones
      options = _extends({}, DEFAULT_OPTIONS, options);

      reference.jquery && (reference = reference[0]);

      // cache reference and options
      this.reference = reference;
      this.options = options;

      // get events list
      const events = typeof options.trigger === 'string' ? options.trigger.split(' ').filter(trigger => ['click', 'hover', 'focus'].indexOf(trigger) !== -1) : [];

      // set initial state
      this._isOpen = false;
      this._popperOptions = {};

      // set event listeners
      this._setEventListeners(reference, events, options);
    }

    //
    // Public methods
    //

    /**
     * Reveals an element's tooltip. This is considered a "manual" triggering of the tooltip.
     * Tooltips with zero-length titles are never displayed.
     * @method Tooltip#show
     * @memberof Tooltip
     */


    /**
     * Hides an element’s tooltip. This is considered a “manual” triggering of the tooltip.
     * @method Tooltip#hide
     * @memberof Tooltip
     */


    /**
     * Hides and destroys an element’s tooltip.
     * @method Tooltip#dispose
     * @memberof Tooltip
     */


    /**
     * Toggles an element’s tooltip. This is considered a “manual” triggering of the tooltip.
     * @method Tooltip#toggle
     * @memberof Tooltip
     */


    /**
     * Updates the tooltip's title content
     * @method Tooltip#updateTitleContent
     * @memberof Tooltip
     * @param {String|HTMLElement} title - The new content to use for the title
     */


    //
    // Private methods
    //

    /**
     * Creates a new tooltip node
     * @memberof Tooltip
     * @private
     * @param {HTMLElement} reference
     * @param {String} template
     * @param {String|HTMLElement|TitleFunction} title
     * @param {Boolean} allowHtml
     * @return {HTMLElement} tooltipNode
     */
    _create(reference, template, title, allowHtml) {
      // create tooltip element
      const tooltipGenerator = window.document.createElement('div');
      tooltipGenerator.innerHTML = template.trim();
      const tooltipNode = tooltipGenerator.childNodes[0];

      // add unique ID to our tooltip (needed for accessibility reasons)
      tooltipNode.id = `tooltip_${Math.random().toString(36).substr(2, 10)}`;

      // set initial `aria-hidden` state to `false` (it's visible!)
      tooltipNode.setAttribute('aria-hidden', 'false');

      // add title to tooltip
      const titleNode = tooltipGenerator.querySelector(this.options.innerSelector);
      this._addTitleContent(reference, title, allowHtml, titleNode);

      // return the generated tooltip node
      return tooltipNode;
    }

    _addTitleContent(reference, title, allowHtml, titleNode) {
      if (title.nodeType === 1 || title.nodeType === 11) {
        // if title is a element node or document fragment, append it only if allowHtml is true
        allowHtml && titleNode.appendChild(title);
      } else if (isFunction(title)) {
        // if title is a function, call it and set textContent or innerHtml depending by `allowHtml` value
        const titleText = title.call(reference);
        allowHtml ? titleNode.innerHTML = titleText : titleNode.textContent = titleText;
      } else {
        // if it's just a simple text, set textContent or innerHtml depending by `allowHtml` value
        allowHtml ? titleNode.innerHTML = title : titleNode.textContent = title;
      }
    }

    _show(reference, options) {
      // don't show if it's already visible
      // or if it's not being showed
      if (this._isOpen && !this._isOpening) {
        return this;
      }
      this._isOpen = true;

      // if the tooltipNode already exists, just show it
      if (this._tooltipNode) {
        this._tooltipNode.style.visibility = 'visible';
        this._tooltipNode.setAttribute('aria-hidden', 'false');
        this.popperInstance.update();
        return this;
      }

      // get title
      const title = reference.getAttribute('title') || options.title;

      // don't show tooltip if no title is defined
      if (!title) {
        return this;
      }

      // create tooltip node
      const tooltipNode = this._create(reference, options.template, title, options.html);

      // Add `aria-describedby` to our reference element for accessibility reasons
      reference.setAttribute('aria-describedby', tooltipNode.id);

      // append tooltip to container
      const container = this._findContainer(options.container, reference);

      this._append(tooltipNode, container);

      this._popperOptions = _extends({}, options.popperOptions, {
        placement: options.placement
      });

      this._popperOptions.modifiers = _extends({}, this._popperOptions.modifiers, {
        arrow: {
          element: this.options.arrowSelector
        },
        offset: {
          offset: options.offset
        }
      });

      if (options.boundariesElement) {
        this._popperOptions.modifiers.preventOverflow = {
          boundariesElement: options.boundariesElement
        };
      }

      this.popperInstance = new Popper(reference, tooltipNode, this._popperOptions);

      this._tooltipNode = tooltipNode;

      return this;
    }

    _hide() /*reference, options*/{
      // don't hide if it's already hidden
      if (!this._isOpen) {
        return this;
      }

      this._isOpen = false;

      // hide tooltipNode
      this._tooltipNode.style.visibility = 'hidden';
      this._tooltipNode.setAttribute('aria-hidden', 'true');

      return this;
    }

    _dispose() {
      // remove event listeners first to prevent any unexpected behaviour
      this._events.forEach(({ func, event }) => {
        this.reference.removeEventListener(event, func);
      });
      this._events = [];

      if (this._tooltipNode) {
        this._hide();

        // destroy instance
        this.popperInstance.destroy();

        // destroy tooltipNode if removeOnDestroy is not set, as popperInstance.destroy() already removes the element
        if (!this.popperInstance.options.removeOnDestroy) {
          this._tooltipNode.parentNode.removeChild(this._tooltipNode);
          this._tooltipNode = null;
        }
      }
      return this;
    }

    _findContainer(container, reference) {
      // if container is a query, get the relative element
      if (typeof container === 'string') {
        container = window.document.querySelector(container);
      } else if (container === false) {
        // if container is `false`, set it to reference parent
        container = reference.parentNode;
      }
      return container;
    }

    /**
     * Append tooltip to container
     * @memberof Tooltip
     * @private
     * @param {HTMLElement} tooltipNode
     * @param {HTMLElement|String|false} container
     */
    _append(tooltipNode, container) {
      container.appendChild(tooltipNode);
    }

    _setEventListeners(reference, events, options) {
      const directEvents = [];
      const oppositeEvents = [];

      events.forEach(event => {
        switch (event) {
          case 'hover':
            directEvents.push('mouseenter');
            oppositeEvents.push('mouseleave');
            break;
          case 'focus':
            directEvents.push('focus');
            oppositeEvents.push('blur');
            break;
          case 'click':
            directEvents.push('click');
            oppositeEvents.push('click');
            break;
        }
      });

      // schedule show tooltip
      directEvents.forEach(event => {
        const func = evt => {
          if (this._isOpening === true) {
            return;
          }
          evt.usedByTooltip = true;
          this._scheduleShow(reference, options.delay, options, evt);
        };
        this._events.push({ event, func });
        reference.addEventListener(event, func);
      });

      // schedule hide tooltip
      oppositeEvents.forEach(event => {
        const func = evt => {
          if (evt.usedByTooltip === true) {
            return;
          }
          this._scheduleHide(reference, options.delay, options, evt);
        };
        this._events.push({ event, func });
        reference.addEventListener(event, func);
        if (event === 'click' && options.closeOnClickOutside) {
          document.addEventListener('mousedown', e => {
            if (!this._isOpening) {
              return;
            }
            const popper = this.popperInstance.popper;
            if (reference.contains(e.target) || popper.contains(e.target)) {
              return;
            }
            func(e);
          }, true);
        }
      });
    }

    _scheduleShow(reference, delay, options /*, evt */) {
      this._isOpening = true;
      // defaults to 0
      const computedDelay = delay && delay.show || delay || 0;
      this._showTimeout = window.setTimeout(() => this._show(reference, options), computedDelay);
    }

    _scheduleHide(reference, delay, options, evt) {
      this._isOpening = false;
      // defaults to 0
      const computedDelay = delay && delay.hide || delay || 0;
      window.setTimeout(() => {
        window.clearTimeout(this._showTimeout);
        if (this._isOpen === false) {
          return;
        }
        if (!document.body.contains(this._tooltipNode)) {
          return;
        }

        // if we are hiding because of a mouseleave, we must check that the new
        // reference isn't the tooltip, because in this case we don't want to hide it
        if (evt.type === 'mouseleave') {
          const isSet = this._setTooltipNodeEvent(evt, reference, delay, options);

          // if we set the new event, don't hide the tooltip yet
          // the new event will take care to hide it if necessary
          if (isSet) {
            return;
          }
        }

        this._hide(reference, options);
      }, computedDelay);
    }

    _updateTitleContent(title) {
      if (typeof this._tooltipNode === 'undefined') {
        if (typeof this.options.title !== 'undefined') {
          this.options.title = title;
        }
        return;
      }
      const titleNode = this._tooltipNode.parentNode.querySelector(this.options.innerSelector);
      this._clearTitleContent(titleNode, this.options.html, this.reference.getAttribute('title') || this.options.title);
      this._addTitleContent(this.reference, title, this.options.html, titleNode);
      this.options.title = title;
      this.popperInstance.update();
    }

    _clearTitleContent(titleNode, allowHtml, lastTitle) {
      if (lastTitle.nodeType === 1 || lastTitle.nodeType === 11) {
        allowHtml && titleNode.removeChild(lastTitle);
      } else {
        allowHtml ? titleNode.innerHTML = '' : titleNode.textContent = '';
      }
    }

  }

  /**
   * Title function, its context is the Tooltip instance.
   * @memberof Tooltip
   * @callback TitleFunction
   * @return {String} placement - The desired title.
   */

  var _initialiseProps = function () {
    this.show = () => this._show(this.reference, this.options);

    this.hide = () => this._hide();

    this.dispose = () => this._dispose();

    this.toggle = () => {
      if (this._isOpen) {
        return this.hide();
      } else {
        return this.show();
      }
    };

    this.updateTitleContent = title => this._updateTitleContent(title);

    this._events = [];

    this._setTooltipNodeEvent = (evt, reference, delay, options) => {
      const relatedreference = evt.relatedreference || evt.toElement || evt.relatedTarget;

      const callback = evt2 => {
        const relatedreference2 = evt2.relatedreference || evt2.toElement || evt2.relatedTarget;

        // Remove event listener after call
        this._tooltipNode.removeEventListener(evt.type, callback);

        // If the new reference is not the reference element
        if (!reference.contains(relatedreference2)) {
          // Schedule to hide tooltip
          this._scheduleHide(reference, options.delay, options, evt2);
        }
      };

      if (this._tooltipNode.contains(relatedreference)) {
        // listen to mouseleave on the tooltip element to be able to hide the tooltip
        this._tooltipNode.addEventListener(evt.type, callback);
        return true;
      }

      return false;
    };
  };

  return Tooltip;

});
define('skylark-formio/vendors/ismobilejs/isMobile',[],function(){ 
    var appleIphone = /iPhone/i;
    var appleIpod = /iPod/i;
    var appleTablet = /iPad/i;
    var appleUniversal = /\biOS-universal(?:.+)Mac\b/i;
    var androidPhone = /\bAndroid(?:.+)Mobile\b/i;
    var androidTablet = /Android/i;
    var amazonPhone = /(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i;
    var amazonTablet = /Silk/i;
    var windowsPhone = /Windows Phone/i;
    var windowsTablet = /\bWindows(?:.+)ARM\b/i;
    var otherBlackBerry = /BlackBerry/i;
    var otherBlackBerry10 = /BB10/i;
    var otherOpera = /Opera Mini/i;
    var otherChrome = /\b(CriOS|Chrome)(?:.+)Mobile/i;
    var otherFirefox = /Mobile(?:.+)Firefox\b/i;
    var isAppleTabletOnIos13 = function (navigator) {
        return (typeof navigator !== 'undefined' &&
            navigator.platform === 'MacIntel' &&
            typeof navigator.maxTouchPoints === 'number' &&
            navigator.maxTouchPoints > 1 &&
            typeof MSStream === 'undefined');
    };
    function createMatch(userAgent) {
        return function (regex) { return regex.test(userAgent); };
    }
    function isMobile(param) {
        var nav = {
            userAgent: '',
            platform: '',
            maxTouchPoints: 0
        };
        if (!param && typeof navigator !== 'undefined') {
            nav = {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                maxTouchPoints: navigator.maxTouchPoints || 0
            };
        }
        else if (typeof param === 'string') {
            nav.userAgent = param;
        }
        else if (param.userAgent) {
            nav = {
                userAgent: param.userAgent,
                platform: param.platform,
                maxTouchPoints: param.maxTouchPoints || 0
            };
        }
        var userAgent = nav.userAgent;
        var tmp = userAgent.split('[FBAN');
        if (typeof tmp[1] !== 'undefined') {
            userAgent = tmp[0];
        }
        tmp = userAgent.split('Twitter');
        if (typeof tmp[1] !== 'undefined') {
            userAgent = tmp[0];
        }
        var match = createMatch(userAgent);
        var result = {
            apple: {
                phone: match(appleIphone) && !match(windowsPhone),
                ipod: match(appleIpod),
                tablet: !match(appleIphone) &&
                    (match(appleTablet) || isAppleTabletOnIos13(nav)) &&
                    !match(windowsPhone),
                universal: match(appleUniversal),
                device: (match(appleIphone) ||
                    match(appleIpod) ||
                    match(appleTablet) ||
                    match(appleUniversal) ||
                    isAppleTabletOnIos13(nav)) &&
                    !match(windowsPhone)
            },
            amazon: {
                phone: match(amazonPhone),
                tablet: !match(amazonPhone) && match(amazonTablet),
                device: match(amazonPhone) || match(amazonTablet)
            },
            android: {
                phone: (!match(windowsPhone) && match(amazonPhone)) ||
                    (!match(windowsPhone) && match(androidPhone)),
                tablet: !match(windowsPhone) &&
                    !match(amazonPhone) &&
                    !match(androidPhone) &&
                    (match(amazonTablet) || match(androidTablet)),
                device: (!match(windowsPhone) &&
                    (match(amazonPhone) ||
                        match(amazonTablet) ||
                        match(androidPhone) ||
                        match(androidTablet))) ||
                    match(/\bokhttp\b/i)
            },
            windows: {
                phone: match(windowsPhone),
                tablet: match(windowsTablet),
                device: match(windowsPhone) || match(windowsTablet)
            },
            other: {
                blackberry: match(otherBlackBerry),
                blackberry10: match(otherBlackBerry10),
                opera: match(otherOpera),
                firefox: match(otherFirefox),
                chrome: match(otherChrome),
                device: match(otherBlackBerry) ||
                    match(otherBlackBerry10) ||
                    match(otherOpera) ||
                    match(otherFirefox) ||
                    match(otherChrome)
            },
            any: false,
            phone: false,
            tablet: false
        };
        result.any =
            result.apple.device ||
                result.android.device ||
                result.windows.device ||
                result.other.device;
        result.phone =
            result.apple.phone || result.android.phone || result.windows.phone;
        result.tablet =
            result.apple.tablet || result.android.tablet || result.windows.tablet;
        return result;
    }

    return isMobile;
});
define('skylark-formio/utils/calendarUtils',[
    'skylark-moment',
    'skylark-lodash'
], function (moment, _) {
    'use strict';
    const CALENDAR_ERROR_MESSAGES = {
        INVALID: 'You entered the Invalid Date',
        INCOMPLETE: 'You entered an incomplete date.',
        greater(date, format) {
            return `The entered date is greater than ${ date.format(format) }`;
        },
        less(date, format) {
            return `The entered date is less than ${ date.format(format) }`;
        }
    };
    function buildResponse(message, result) {
        return {
            message,
            result
        };
    }
    function lessOrGreater(value, format, maxDate, minDate) {
        let message = '';
        let result = true;
        if (maxDate && value.isValid()) {
            const maxDateMoment = moment(maxDate, format);
            if (value > maxDateMoment) {
                message = CALENDAR_ERROR_MESSAGES.greater(maxDateMoment, format);
                result = false;
            }
        }
        if (minDate && value.isValid()) {
            const minDateMoment = moment(minDate, format);
            if (value < minDateMoment) {
                message = CALENDAR_ERROR_MESSAGES.less(minDateMoment, format);
                result = false;
            }
        }
        return {
            message,
            result
        };
    }
    function checkInvalidDate(value, format, minDate, maxDate) {
        const date = moment(value, format, true);
        const isValidDate = date.isValid();
        if (!isValidDate) {
            const delimeters = value.match(/[^a-z0-9_]/gi);
            const delimetersRegEx = new RegExp(delimeters.join('|'), 'gi');
            const inputParts = value.replace(/_*/gi, '').split(delimetersRegEx);
            const formatParts = format[1] ? format[1].split(delimetersRegEx) : format[0].split(delimetersRegEx);
            const timeIndex = _.findIndex(formatParts, (part, index) => part.length === 1 && index === formatParts.length - 1);
            const yearIndex = _.findIndex(formatParts, part => part.match(/yyyy/gi));
            if (inputParts[yearIndex] / 1000 < 1) {
                return buildResponse(CALENDAR_ERROR_MESSAGES.INVALID, false);
            }
            if (inputParts[0].length === formatParts[0].length) {
                const modifiedParts = inputParts.map((part, index) => {
                    let partValue = part;
                    if (!part && index === timeIndex) {
                        partValue = 'AM';
                    } else if (!part) {
                        partValue = '01';
                    }
                    if (delimeters[index]) {
                        partValue = `${ partValue }${ delimeters[index] }`;
                    }
                    return partValue;
                });
                const problemDate = moment(modifiedParts.join(''), format, true);
                if (problemDate.isValid()) {
                    const checkedLessOrGreater = lessOrGreater(problemDate, format[0], maxDate, minDate);
                    if (!checkedLessOrGreater.result) {
                        const {message, result} = checkedLessOrGreater;
                        return buildResponse(message, result);
                    }
                    return buildResponse(CALENDAR_ERROR_MESSAGES.INCOMPLETE, false);
                } else {
                    return buildResponse(CALENDAR_ERROR_MESSAGES.INVALID, false);
                }
            } else {
                return buildResponse(CALENDAR_ERROR_MESSAGES.INVALID, false);
            }
        } else if (isValidDate && value.indexOf('_') === -1) {
            const checkedLessOrGreater = lessOrGreater(date, format[0], maxDate, minDate);
            if (!checkedLessOrGreater.result) {
                const {message, result} = checkedLessOrGreater;
                return buildResponse(message, result);
            }
        }
        return buildResponse('', true);
    }
    return {
        CALENDAR_ERROR_MESSAGES: CALENDAR_ERROR_MESSAGES,
        lessOrGreater: lessOrGreater,
        checkInvalidDate: checkInvalidDate
    };
});
const custom = require('./Custom');
const date = require('./Date');
const day = require('./Day');
const email = require('./Email');
const json = require('./JSON');
const mask = require('./Mask');
const max = require('./Max');
const maxDate = require('./MaxDate');
const maxLength = require('./MaxLength');
const maxWords = require('./MaxWords');
const min = require('./Min');
const minDate = require('./MinDate');
const minLength = require('./MinLength');
const minWords = require('./MinWords');
const pattern = require('./Pattern');
const required = require('./Required');
const select = require('./Select');
const unique = require('./Unique');
const url = require('./Url');
const minYear = require('./MinYear');
const maxYear = require('./MaxYear');
module.exports = {
    custom,
    date,
    day,
    email,
    json,
    mask,
    max,
    maxDate,
    maxLength,
    maxWords,
    min,
    minDate,
    minLength,
    minWords,
    pattern,
    required,
    select,
    unique,
    url,
    minYear,
    maxYear
};
define("skylark-formio/validator/rules/index", function(){});

define('skylark-formio/validator/Rules',[
    './rules/index'
], function (rules) {
    'use strict';
    return class Rules {
        static addRule(name, rule) {
            Rules.rules[name] = rule;
        }
        static addRules(rules) {
            Rules.rules = {
                ...Rules.rules,
                ...rules
            };
        }
        static getRule(name) {
            return Rules.rules[name];
        }
        static getRules() {
            return Rules.rules;
        }
    };
    Rules.rules = rules;
});
define('skylark-formio/validator/Validator',[
    'skylark-lodash',
    '../utils/utils',
    'skylark-moment',
    '../vendors/getify/npo',
    '../vendors/fetch-ponyfill/fetch',
    '../utils/calendarUtils',
    './Rules'
], function (_, a, moment, NativePromise, fetchPonyfill, b, Rules) {
    'use strict';
    const {fetch, Headers, Request} = fetchPonyfill({ Promise: NativePromise });
    class ValidationChecker {
        constructor(config = {}) {
            this.config = _.defaults(config, ValidationChecker.config);
            this.validators = {
                required: {
                    key: 'validate.required',
                    method: 'validateRequired',
                    message(component) {
                        return component.t(component.errorMessage('required'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        if (!a.boolValue(setting) || component.isValueHidden()) {
                            return true;
                        }
                        const isCalendar = component.validators.some(validator => validator === 'calendar');
                        if (!value && isCalendar && component.widget.enteredDate) {
                            return !this.validators.calendar.check.call(this, component, setting, value);
                        }
                        return !component.isEmpty(value);
                    }
                },
                unique: {
                    key: 'validate.unique',
                    message(component) {
                        return component.t(component.errorMessage('unique'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        if (!a.boolValue(setting)) {
                            return true;
                        }
                        if (!value || _.isEmpty(value)) {
                            return true;
                        }
                        if (!this.config.db) {
                            return true;
                        }
                        return new NativePromise(resolve => {
                            const form = this.config.form;
                            const submission = this.config.submission;
                            const path = `data.${ component.path }`;
                            const query = { form: form._id };
                            if (_.isString(value)) {
                                query[path] = {
                                    $regex: new RegExp(`^${ a.escapeRegExCharacters(value) }$`),
                                    $options: 'i'
                                };
                            } else if (_.isPlainObject(value) && value.address && value.address['address_components'] && value.address['place_id']) {
                                query[`${ path }.address.place_id`] = {
                                    $regex: new RegExp(`^${ a.escapeRegExCharacters(value.address['place_id']) }$`),
                                    $options: 'i'
                                };
                            } else if (_.isArray(value)) {
                                query[path] = { $all: value };
                            } else if (_.isObject(value)) {
                                query[path] = { $eq: value };
                            }
                            query.deleted = { $eq: null };
                            this.config.db.findOne(query, (err, result) => {
                                if (err) {
                                    return resolve(false);
                                } else if (result) {
                                    return resolve(submission._id && result._id.toString() === submission._id);
                                } else {
                                    return resolve(true);
                                }
                            });
                        }).catch(() => false);
                    }
                },
                multiple: {
                    key: 'validate.multiple',
                    message(component) {
                        const shouldBeArray = a.boolValue(component.component.multiple) || Array.isArray(component.emptyValue);
                        const isRequired = component.component.validate.required;
                        const messageKey = shouldBeArray ? isRequired ? 'array_nonempty' : 'array' : 'nonarray';
                        return component.t(component.errorMessage(messageKey), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        if (!component.validateMultiple()) {
                            return true;
                        }
                        const shouldBeArray = a.boolValue(setting);
                        const canBeArray = Array.isArray(component.emptyValue);
                        const isArray = Array.isArray(value);
                        const isRequired = component.component.validate.required;
                        if (shouldBeArray) {
                            if (isArray) {
                                return isRequired ? !!value.length : true;
                            } else {
                                return _.isNil(value) ? !isRequired : false;
                            }
                        } else {
                            return canBeArray || !isArray;
                        }
                    }
                },
                select: {
                    key: 'validate.select',
                    message(component) {
                        return component.t(component.errorMessage('select'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value, data, index, row, async) {
                        if (!a.boolValue(setting)) {
                            return true;
                        }
                        if (!value || _.isEmpty(value)) {
                            return true;
                        }
                        if (!async) {
                            return true;
                        }
                        const schema = component.component;
                        const requestOptions = {
                            url: setting,
                            method: 'GET',
                            qs: {},
                            json: true,
                            headers: {}
                        };
                        if (_.isBoolean(requestOptions.url)) {
                            requestOptions.url = !!requestOptions.url;
                            if (!requestOptions.url || schema.dataSrc !== 'url' || !schema.data.url || !schema.searchField) {
                                return true;
                            }
                            requestOptions.url = schema.data.url;
                            requestOptions.qs[schema.searchField] = value;
                            if (schema.filter) {
                                requestOptions.url += (!requestOptions.url.includes('?') ? '?' : '&') + schema.filter;
                            }
                            if (schema.selectFields) {
                                requestOptions.qs.select = schema.selectFields;
                            }
                        }
                        if (!requestOptions.url) {
                            return true;
                        }
                        requestOptions.url = a.interpolate(requestOptions.url, { data: component.data });
                        requestOptions.url += (requestOptions.url.includes('?') ? '&' : '?') + _.chain(requestOptions.qs).map((val, key) => `${ encodeURIComponent(key) }=${ encodeURIComponent(val) }`).join('&').value();
                        if (schema.data && schema.data.headers) {
                            _.each(schema.data.headers, header => {
                                if (header.key) {
                                    requestOptions.headers[header.key] = header.value;
                                }
                            });
                        }
                        if (schema.authenticate && this.config.token) {
                            requestOptions.headers['x-jwt-token'] = this.config.token;
                        }
                        return fetch(new Request(requestOptions.url, { headers: new Headers(requestOptions.headers) })).then(response => {
                            if (!response.ok) {
                                return false;
                            }
                            return response.json();
                        }).then(results => {
                            return results && results.length;
                        }).catch(() => false);
                    }
                },
                min: {
                    key: 'validate.min',
                    message(component, setting) {
                        return component.t(component.errorMessage('min'), {
                            field: component.errorLabel,
                            min: parseFloat(setting),
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const min = parseFloat(setting);
                        if (Number.isNaN(min) || !_.isNumber(value)) {
                            return true;
                        }
                        return parseFloat(value) >= min;
                    }
                },
                max: {
                    key: 'validate.max',
                    message(component, setting) {
                        return component.t(component.errorMessage('max'), {
                            field: component.errorLabel,
                            max: parseFloat(setting),
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const max = parseFloat(setting);
                        if (Number.isNaN(max) || !_.isNumber(value)) {
                            return true;
                        }
                        return parseFloat(value) <= max;
                    }
                },
                minSelectedCount: {
                    key: 'validate.minSelectedCount',
                    message(component, setting) {
                        return component.component.minSelectedCountMessage ? component.component.minSelectedCountMessage : component.t(component.errorMessage('minSelectedCount'), {
                            minCount: parseFloat(setting),
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const min = parseFloat(setting);
                        if (!min) {
                            return true;
                        }
                        const count = Object.keys(value).reduce((total, key) => {
                            if (value[key]) {
                                total++;
                            }
                            return total;
                        }, 0);
                        return count >= min;
                    }
                },
                maxSelectedCount: {
                    key: 'validate.maxSelectedCount',
                    message(component, setting) {
                        return component.component.maxSelectedCountMessage ? component.component.maxSelectedCountMessage : component.t(component.errorMessage('maxSelectedCount'), {
                            minCount: parseFloat(setting),
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const max = parseFloat(setting);
                        if (!max) {
                            return true;
                        }
                        const count = Object.keys(value).reduce((total, key) => {
                            if (value[key]) {
                                total++;
                            }
                            return total;
                        }, 0);
                        return count <= max;
                    }
                },
                minLength: {
                    key: 'validate.minLength',
                    message(component, setting) {
                        return component.t(component.errorMessage('minLength'), {
                            field: component.errorLabel,
                            length: setting,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const minLength = parseInt(setting, 10);
                        if (!minLength || typeof value !== 'string' || component.isEmpty(value)) {
                            return true;
                        }
                        return value.length >= minLength;
                    }
                },
                maxLength: {
                    key: 'validate.maxLength',
                    message(component, setting) {
                        return component.t(component.errorMessage('maxLength'), {
                            field: component.errorLabel,
                            length: setting,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const maxLength = parseInt(setting, 10);
                        if (!maxLength || typeof value !== 'string') {
                            return true;
                        }
                        return value.length <= maxLength;
                    }
                },
                maxWords: {
                    key: 'validate.maxWords',
                    message(component, setting) {
                        return component.t(component.errorMessage('maxWords'), {
                            field: component.errorLabel,
                            length: setting,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const maxWords = parseInt(setting, 10);
                        if (!maxWords || typeof value !== 'string') {
                            return true;
                        }
                        return value.trim().split(/\s+/).length <= maxWords;
                    }
                },
                minWords: {
                    key: 'validate.minWords',
                    message(component, setting) {
                        return component.t(component.errorMessage('minWords'), {
                            field: component.errorLabel,
                            length: setting,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const minWords = parseInt(setting, 10);
                        if (!minWords || typeof value !== 'string') {
                            return true;
                        }
                        return value.trim().split(/\s+/).length >= minWords;
                    }
                },
                email: {
                    message(component) {
                        return component.t(component.errorMessage('invalid_email'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                        return !value || re.test(value);
                    }
                },
                url: {
                    message(component) {
                        return component.t(component.errorMessage('invalid_url'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        const re = /[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
                        return !value || re.test(value);
                    }
                },
                date: {
                    message(component) {
                        return component.t(component.errorMessage('invalid_date'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        return value !== 'Invalid date';
                    }
                },
                day: {
                    message(component) {
                        return component.t(component.errorMessage('invalid_day'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        if (!value) {
                            return true;
                        }
                        const [DAY, MONTH, YEAR] = component.dayFirst ? [
                            0,
                            1,
                            2
                        ] : [
                            1,
                            0,
                            2
                        ];
                        const values = value.split('/').map(x => parseInt(x, 10)), day = values[DAY], month = values[MONTH], year = values[YEAR], maxDay = getDaysInMonthCount(month, year);
                        if (day < 0 || day > maxDay) {
                            return false;
                        }
                        if (month < 0 || month > 12) {
                            return false;
                        }
                        if (year < 0 || year > 9999) {
                            return false;
                        }
                        return true;
                        function isLeapYear(year) {
                            return !(year % 400) || !!(year % 100) && !(year % 4);
                        }
                        function getDaysInMonthCount(month, year) {
                            switch (month) {
                            case 1:
                            case 3:
                            case 5:
                            case 7:
                            case 8:
                            case 10:
                            case 12:
                                return 31;
                            case 4:
                            case 6:
                            case 9:
                            case 11:
                                return 30;
                            case 2:
                                return isLeapYear(year) ? 29 : 28;
                            default:
                                return 31;
                            }
                        }
                    }
                },
                pattern: {
                    key: 'validate.pattern',
                    message(component, setting) {
                        return component.t(_.get(component, 'component.validate.patternMessage', component.errorMessage('pattern'), {
                            field: component.errorLabel,
                            pattern: setting,
                            data: component.data
                        }));
                    },
                    check(component, setting, value) {
                        const pattern = setting;
                        if (!pattern) {
                            return true;
                        }
                        const regex = new RegExp(`^${ pattern }$`);
                        return regex.test(value);
                    }
                },
                json: {
                    key: 'validate.json',
                    check(component, setting, value, data, index, row) {
                        if (!setting) {
                            return true;
                        }
                        const valid = component.evaluate(setting, {
                            data,
                            row,
                            rowIndex: index,
                            input: value
                        });
                        if (valid === null) {
                            return true;
                        }
                        return valid;
                    }
                },
                mask: {
                    key: 'inputMask',
                    message(component) {
                        return component.t(component.errorMessage('mask'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value) {
                        let inputMask;
                        if (component.isMultipleMasksField) {
                            const maskName = value ? value.maskName : undefined;
                            const formioInputMask = component.getMaskByName(maskName);
                            if (formioInputMask) {
                                inputMask = formioInputMask;
                            }
                            value = value ? value.value : value;
                        } else {
                            inputMask = setting;
                        }
                        inputMask = inputMask ? a.getInputMask(inputMask) : null;
                        if (value && inputMask) {
                            return a.matchInputMask(value, inputMask);
                        }
                        return true;
                    }
                },
                custom: {
                    key: 'validate.custom',
                    message(component) {
                        return component.t(component.errorMessage('custom'), {
                            field: component.errorLabel,
                            data: component.data
                        });
                    },
                    check(component, setting, value, data, index, row) {
                        if (!setting) {
                            return true;
                        }
                        const valid = component.evaluate(setting, {
                            valid: true,
                            data,
                            rowIndex: index,
                            row,
                            input: value
                        }, 'valid', true);
                        if (valid === null) {
                            return true;
                        }
                        return valid;
                    }
                },
                maxDate: {
                    key: 'maxDate',
                    message(component, setting) {
                        const date = a.getDateSetting(setting);
                        return component.t(component.errorMessage('maxDate'), {
                            field: component.errorLabel,
                            maxDate: moment(date).format(component.format)
                        });
                    },
                    check(component, setting, value) {
                        if (component.isPartialDay && component.isPartialDay(value)) {
                            return true;
                        }
                        const date = moment(value);
                        const maxDate = a.getDateSetting(setting);
                        if (_.isNull(maxDate)) {
                            return true;
                        } else {
                            maxDate.setHours(0, 0, 0, 0);
                        }
                        return date.isBefore(maxDate) || date.isSame(maxDate);
                    }
                },
                minDate: {
                    key: 'minDate',
                    message(component, setting) {
                        const date = a.getDateSetting(setting);
                        return component.t(component.errorMessage('minDate'), {
                            field: component.errorLabel,
                            minDate: moment(date).format(component.format)
                        });
                    },
                    check(component, setting, value) {
                        if (component.isPartialDay && component.isPartialDay(value)) {
                            return true;
                        }
                        const date = moment(value);
                        const minDate = a.getDateSetting(setting);
                        if (_.isNull(minDate)) {
                            return true;
                        } else {
                            minDate.setHours(0, 0, 0, 0);
                        }
                        return date.isAfter(minDate) || date.isSame(minDate);
                    }
                },
                minYear: {
                    key: 'minYear',
                    message(component, setting) {
                        return component.t(component.errorMessage('minYear'), {
                            field: component.errorLabel,
                            minYear: setting
                        });
                    },
                    check(component, setting, value) {
                        const minYear = setting;
                        let year = /\d{4}$/.exec(value);
                        year = year ? year[0] : null;
                        if (!+minYear || !+year) {
                            return true;
                        }
                        return +year >= +minYear;
                    }
                },
                maxYear: {
                    key: 'maxYear',
                    message(component, setting) {
                        return component.t(component.errorMessage('maxYear'), {
                            field: component.errorLabel,
                            maxYear: setting
                        });
                    },
                    check(component, setting, value) {
                        const maxYear = setting;
                        let year = /\d{4}$/.exec(value);
                        year = year ? year[0] : null;
                        if (!+maxYear || !+year) {
                            return true;
                        }
                        return +year <= +maxYear;
                    }
                },
                calendar: {
                    key: 'validate.calendar',
                    messageText: '',
                    message(component) {
                        return component.t(component.errorMessage(this.validators.calendar.messageText), {
                            field: component.errorLabel,
                            maxDate: moment(component.dataValue).format(component.format)
                        });
                    },
                    check(component, setting, value, data, index) {
                        this.validators.calendar.messageText = '';
                        const widget = component.getWidget(index);
                        if (!widget) {
                            return true;
                        }
                        const {settings, enteredDate} = widget;
                        const {minDate, maxDate, format} = settings;
                        const momentFormat = [a.convertFormatToMoment(format)];
                        if (momentFormat[0].match(/M{3,}/g)) {
                            momentFormat.push(momentFormat[0].replace(/M{3,}/g, 'MM'));
                        }
                        if (!value && enteredDate) {
                            const {message, result} = b.checkInvalidDate(enteredDate, momentFormat, minDate, maxDate);
                            if (!result) {
                                this.validators.calendar.messageText = message;
                                return result;
                            }
                        }
                        if (value && enteredDate) {
                            if (moment(value).format() !== moment(enteredDate, momentFormat, true).format() && enteredDate.match(/_/gi)) {
                                this.validators.calendar.messageText = b.CALENDAR_ERROR_MESSAGES.INCOMPLETE;
                                return false;
                            } else {
                                widget.enteredDate = '';
                                return true;
                            }
                        }
                    }
                }
            };
        }
        checkValidator(component, validator, setting, value, data, index, row, async) {
            let resultOrPromise = null;
            if (validator.method && typeof component[validator.method] === 'function') {
                resultOrPromise = component[validator.method](setting, value, data, index, row, async);
            } else {
                resultOrPromise = validator.check.call(this, component, setting, value, data, index, row, async);
            }
            const processResult = result => {
                if (typeof result === 'string') {
                    return result;
                }
                if (!result && validator.message) {
                    return validator.message.call(this, component, setting, index, row);
                }
                return '';
            };
            if (async) {
                return NativePromise.resolve(resultOrPromise).then(processResult);
            } else {
                return processResult(resultOrPromise);
            }
        }
        validate(component, validatorName, value, data, index, row, async) {
            if (!component.conditionallyVisible()) {
                return false;
            }
            const validator = this.validators[validatorName];
            const setting = _.get(component.component, validator.key, null);
            const resultOrPromise = this.checkValidator(component, validator, setting, value, data, index, row, async);
            const processResult = result => {
                return result ? {
                    message: _.get(result, 'message', result),
                    level: _.get(result, 'level') === 'warning' ? 'warning' : 'error',
                    path: (component.path || '').replace(/[[\]]/g, '.').replace(/\.\./g, '.').split('.').map(part => _.defaultTo(_.toNumber(part), part)),
                    context: {
                        validator: validatorName,
                        setting,
                        key: component.key,
                        label: component.label,
                        value
                    }
                } : false;
            };
            if (async) {
                return NativePromise.resolve(resultOrPromise).then(processResult);
            } else {
                return processResult(resultOrPromise);
            }
        }
        checkComponent(component, data, row, includeWarnings = false, async = false) {
            const isServerSidePersistent = typeof process !== 'undefined' && _.get(process, 'release.name') === 'node' && !_.defaultTo(component.component.persistent, true);
            if (isServerSidePersistent || component.component.validate === false) {
                return async ? NativePromise.resolve([]) : [];
            }
            data = data || component.rootValue;
            row = row || component.data;
            const values = component.component.multiple && Array.isArray(component.validationValue) ? component.validationValue : [component.validationValue];
            const validations = _.get(component, 'component.validations');
            if (validations && Array.isArray(validations)) {
                const resultsOrPromises = this.checkValidations(component, validations, data, row, values, async);
                const formatResults = results => {
                    return includeWarnings ? results : results.filter(result => result.level === 'error');
                };
                if (async) {
                    return NativePromise.all(resultsOrPromises).then(formatResults);
                } else {
                    return formatResults(resultsOrPromises);
                }
            }
            const validateCustom = _.get(component, 'component.validate.custom');
            const customErrorMessage = _.get(component, 'component.validate.customMessage');
            const resultsOrPromises = _(component.validators).chain().map(validatorName => {
                if (!this.validators.hasOwnProperty(validatorName)) {
                    return {
                        message: `Validator for "${ validatorName }" is not defined`,
                        level: 'warning',
                        context: {
                            validator: validatorName,
                            key: component.key,
                            label: component.label
                        }
                    };
                }
                if (validatorName === 'required' && !values.length) {
                    return [this.validate(component, validatorName, null, data, 0, row, async)];
                }
                return _.map(values, (value, index) => this.validate(component, validatorName, value, data, index, row, async));
            }).flatten().value();
            component.component.validate = component.component.validate || {};
            component.component.validate.unique = component.component.unique;
            resultsOrPromises.push(this.validate(component, 'unique', component.validationValue, data, 0, data, async));
            component.component.validate.multiple = component.component.multiple;
            resultsOrPromises.push(this.validate(component, 'multiple', component.validationValue, data, 0, data, async));
            const formatResults = results => {
                results = _(results).chain().flatten().compact().value();
                if (customErrorMessage || validateCustom) {
                    _.each(results, result => {
                        result.message = component.t(customErrorMessage || result.message, {
                            field: component.errorLabel,
                            data,
                            row,
                            error: result
                        });
                    });
                }
                return includeWarnings ? results : _.reject(results, result => result.level === 'warning');
            };
            if (async) {
                return NativePromise.all(resultsOrPromises).then(formatResults);
            } else {
                return formatResults(resultsOrPromises);
            }
        }
        checkValidations(component, validations, data, row, values, async) {
            const results = validations.map(validation => {
                return this.checkRule(component, validation, data, row, values, async);
            });
            const messages = results.reduce((prev, result) => {
                if (result) {
                    return [
                        ...prev,
                        ...result
                    ];
                }
                return prev;
            }, []).filter(result => result);
            const rules = messages.reduce((prev, message) => {
                prev[message.context.validator] = message;
                return prev;
            }, {});
            return Object.values(rules);
        }
        checkRule(component, validation, data, row, values, async) {
            const Rule = Rules.getRule(validation.rule);
            const results = [];
            if (Rule) {
                const rule = new Rule(component, validation.settings, this.config);
                values.map((value, index) => {
                    const result = rule.check(value, data, row, async);
                    if (result !== true) {
                        results.push({
                            level: validation.level || 'error',
                            message: component.t(validation.message || rule.defaultMessage, {
                                settings: validation.settings,
                                field: component.errorLabel,
                                data,
                                row,
                                error: result
                            }),
                            context: {
                                key: component.key,
                                index,
                                label: component.label,
                                validator: validation.rule
                            }
                        });
                    }
                });
            }
            return results.length === 0 ? false : results;
        }
        get check() {
            return this.checkComponent;
        }
        get() {
            _.get.call(this, arguments);
        }
        each() {
            _.each.call(this, arguments);
        }
        has() {
            _.has.call(this, arguments);
        }
    }
    ValidationChecker.config = {
        db: null,
        token: null,
        form: null,
        submission: null
    };
    const instance = new ValidationChecker();
    return {
        instance,
        ValidationChecker
    };
});
define('skylark-formio/templates/bootstrap/address/form.ejs',[], function() { return "{% if (ctx.mode.autocomplete) { %}\n  <div class=\"address-autocomplete-container\">\n    <input\n      ref=\"{{ ctx.ref.searchInput }}\"\n      {% for (var attr in ctx.inputAttributes) { %}\n        {{attr}}=\"{{ctx.inputAttributes[attr]}}\"\n      {% } %}\n      value=\"{{ ctx.displayValue }}\"\n      autocomplete=\"off\"\n    >\n    {% if (!ctx.component.disableClearIcon) { %}\n      <i\n        class=\"address-autocomplete-remove-value-icon fa fa-times\"\n        tabindex=\"{{ ctx.inputAttributes.tabindex }}\"\n        ref=\"{{ ctx.ref.removeValueIcon }}\"\n      ></i>\n    {% } %}\n  </div>\n{% } %}\n{% if (ctx.self.manualModeEnabled) { %}\n  <div class=\"form-check checkbox\">\n    <label class=\"form-check-label\">\n      <input\n        ref=\"{{ ctx.ref.modeSwitcher }}\"\n        type=\"checkbox\"\n        class=\"form-check-input\"\n        tabindex=\"{{ ctx.inputAttributes.tabindex }}\"\n        {% if (ctx.mode.manual) { %}checked=true{% } %}\n        {% if (ctx.disabled) { %}disabled=true{% } %}\n      >\n      <span>{{ ctx.component.switchToManualModeLabel }}</span>\n    </label>\n  </div>\n{% } %}\n{% if (ctx.self.manualMode) { %}\n  <div ref=\"{{ ctx.nestedKey }}\">\n    {{ ctx.children }}\n  </div>\n{% } %}\n"; });
define('skylark-formio/templates/bootstrap/address/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/builder/form.ejs',[], function() { return "<div class=\"formio builder row formbuilder\">\n  <div class=\"col-xs-4 col-sm-3 col-md-2 formcomponents\">\n    {{ctx.sidebar}}\n  </div>\n  <div class=\"col-xs-8 col-sm-9 col-md-10 formarea\" ref=\"form\">\n    {{ctx.form}}\n  </div>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/builder/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/builderComponent/form.ejs',[], function() { return "<div class=\"builder-component\" ref=\"dragComponent\">\n  <div class=\"component-btn-group\" data-noattach=\"true\">\n    <div class=\"btn btn-xxs btn-danger component-settings-button component-settings-button-remove\" ref=\"removeComponent\">\n      <i class=\"{{ctx.iconClass('remove')}}\"></i>\n    </div>\n    <div class=\"btn btn-xxs btn-default component-settings-button component-settings-button-copy\" ref=\"copyComponent\">\n      <i class=\"{{ctx.iconClass('copy')}}\"></i>\n    </div>\n    <div class=\"btn btn-xxs btn-default component-settings-button component-settings-button-paste\" ref=\"pasteComponent\">\n      <i class=\"{{ctx.iconClass('save')}}\"></i>\n    </div>\n    <div class=\"btn btn-xxs btn-default component-settings-button component-settings-button-edit-json\" ref=\"editJson\">\n      <i class=\"{{ctx.iconClass('wrench')}}\"></i>\n    </div>\n    <div class=\"btn btn-xxs btn-default component-settings-button component-settings-button-move\" ref=\"moveComponent\">\n      <i class=\"{{ctx.iconClass('move')}}\"></i>\n    </div>\n    <div class=\"btn btn-xxs btn-secondary component-settings-button component-settings-button-edit\", ref=\"editComponent\">\n      <i class=\"{{ctx.iconClass('cog')}}\"></i>\n    </div>\n  </div>\n  {{ctx.html}}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/builderComponent/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/builderComponents/form.ejs',[], function() { return "<div class=\"builder-components drag-container formio-builder-{{ctx.type}}\" ref=\"{{ctx.key}}-container\">\n  {{ctx.html}}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/builderComponents/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/builderEditForm/form.ejs',[], function() { return "<div class=\"row\">\n  <div class=\"col col-sm-6\">\n    <p class=\"lead\">{{ctx.t(ctx.componentInfo.title)}} {{ctx.t('Component')}}</p>\n  </div>\n  <div class=\"col col-sm-6\">\n    <div class=\"float-right\" style=\"margin-right: 20px; margin-top: 10px\">\n      <a href=\"{{ctx.t(ctx.componentInfo.documentation)}}\" target=\"_blank\">\n        <i class=\"{{ctx.iconClass('new-window')}}\"></i> {{ctx.t('Help')}}\n      </a>\n    </div>\n  </div>\n</div>\n<div class=\"row\">\n  <div class=\"col {% if (ctx.preview) { %}col-sm-6{% } else { %}col-sm-12{% } %}\">\n    <div ref=\"editForm\">\n        {{ctx.editForm}}\n    </div>\n    {% if (!ctx.preview) { %}\n    <div style=\"margin-top: 10px;\">\n      <button class=\"btn btn-success\" style=\"margin-right: 10px;\" ref=\"saveButton\">{{ctx.t('Save')}}</button>\n      <button class=\"btn btn-secondary\" style=\"margin-right: 10px;\" ref=\"cancelButton\">{{ctx.t('Cancel')}}</button>\n      <button class=\"btn btn-danger\" ref=\"removeButton\">{{ctx.t('Remove')}}</button>\n    </div>\n    {% } %}\n  </div>\n  {% if (ctx.preview) { %}\n  <div class=\"col col-sm-6\">\n    <div class=\"card panel preview-panel\">\n      <div class=\"card-header\">\n        <h4 class=\"card-title mb-0\">{{ctx.t('Preview')}}</h4>\n      </div>\n      <div class=\"card-body\">\n        <div class=\"component-preview\" ref=\"preview\">\n          {{ctx.preview}}\n        </div>\n      </div>\n    </div>\n    {% if (ctx.componentInfo.help) { %}\n    <div class=\"card card-body bg-light formio-settings-help\">\n      {{ ctx.t(ctx.componentInfo.help) }}\n    </div>\n    {% } %}\n    <div style=\"margin-top: 10px;\">\n      <button class=\"btn btn-success\" style=\"margin-right: 10px;\" ref=\"saveButton\">{{ctx.t('Save')}}</button>\n      <button class=\"btn btn-secondary\" style=\"margin-right: 10px;\" ref=\"cancelButton\">{{ctx.t('Cancel')}}</button>\n      <button class=\"btn btn-danger\" ref=\"removeButton\">{{ctx.t('Remove')}}</button>\n    </div>\n  </div>\n  {% } %}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/builderEditForm/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/builderPlaceholder/form.ejs',[], function() { return "<div\n  class=\"drag-and-drop-alert alert alert-info no-drag\"\n  style=\"text-align:center;\"\n  role=\"alert\"\n  data-noattach=\"true\"\n  data-position=\"{{ctx.position}}\"\n>\n  {{ctx.t('Drag and Drop a form component')}}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/builderPlaceholder/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/builderSidebar/form.ejs',[], function() { return "<div id=\"{{ctx.groupId}}\" class=\"accordion builder-sidebar{{ctx.scrollEnabled ? ' builder-sidebar_scroll' : ''}}\" ref=\"sidebar\">\n  {% ctx.groups.forEach(function(group) { %}\n    {{ group }}\n  {% }) %}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/builderSidebar/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/builderSidebarGroup/form.ejs',[], function() { return "<div class=\"card form-builder-panel\" ref=\"group-panel-{{ctx.groupKey}}\">\n  <div class=\"card-header form-builder-group-header\" id=\"heading-{{ctx.groupKey}}\">\n    <h5 class=\"mb-0 mt-0\">\n      <button\n        class=\"btn btn-block builder-group-button\"\n        type=\"button\"\n        data-toggle=\"collapse\"\n        data-target=\"#group-{{ctx.groupKey}}\"\n        data-parent=\"#{{ctx.groupId}}\"\n        aria-expanded=\"{{ctx.group.default}}\"\n        aria-controls=\"group-{{ctx.groupKey}}\"\n        ref=\"sidebar-anchor\"\n      >\n        {{ctx.t(ctx.group.title)}}\n      </button>\n    </h5>\n  </div>\n  <div\n    id=\"group-{{ctx.groupKey}}\"\n    class=\"collapse {{ctx.group.default ? ' show' : ''}}\"\n    data-parent=\"#{{ctx.groupId}}\"\n    data-default=\"{{ctx.group.default}}\"\n    aria-labelledby=\"heading-{{ctx.groupKey}}\"\n    ref=\"sidebar-group\"\n  >\n    <div id=\"group-container-{{ctx.groupKey}}\" class=\"card-body no-drop p-2\" ref=\"sidebar-container\">\n      {% !ctx.group.componentOrder || ctx.group.componentOrder.forEach(function(componentKey) { %}\n      <span\n        data-group=\"{{ctx.groupKey}}\"\n        data-key=\"{{ctx.group.components[componentKey].key}}\"\n        data-type=\"{{ctx.group.components[componentKey].schema.type}}\"\n        class=\"btn btn-primary btn-sm btn-block formcomponent drag-copy\"\n      >\n        {% if (ctx.group.components[componentKey].icon) { %}\n          <i class=\"{{ctx.iconClass(ctx.group.components[componentKey].icon)}}\" style=\"margin-right: 5px;\"></i>\n        {% } %}\n        {{ctx.t(ctx.group.components[componentKey].title)}}\n        </span>\n      {% }) %}\n      {{ctx.subgroups.join('')}}\n    </div>\n  </div>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/builderSidebarGroup/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/builderWizard/form.ejs',[], function() { return "<div class=\"formio builder row formbuilder\">\n  <div class=\"col-xs-4 col-sm-3 col-md-2 formcomponents\">\n    {{ctx.sidebar}}\n  </div>\n  <div class=\"col-xs-8 col-sm-9 col-md-10 formarea\">\n    <ol class=\"breadcrumb\">\n      {% ctx.pages.forEach(function(page, pageIndex) { %}\n      <li>\n        <span title=\"{{page.title}}\" class=\"mr-2 badge {% if (pageIndex === ctx.self.page) { %}badge-primary{% } else { %}badge-info{% } %} wizard-page-label\" ref=\"gotoPage\">{{page.title}}</span>\n      </li>\n      {% }) %}\n      <li>\n        <span title=\"{{ctx.t('Create Page')}}\" class=\"mr-2 badge badge-success wizard-page-label\" ref=\"addPage\">\n          <i class=\"{{ctx.iconClass('plus')}}\"></i> {{ctx.t('Page')}}\n        </span>\n      </li>\n    </ol>\n    <div ref=\"form\">\n      {{ctx.form}}\n    </div>\n  </div>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/builderWizard/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/button/form.ejs',[], function() { return "<{{ctx.input.type}}\n  ref=\"button\"\n  {% for (var attr in ctx.input.attr) { %}\n  {{attr}}=\"{{ctx.input.attr[attr]}}\"\n  {% } %}\n>\n{% if (ctx.component.leftIcon) { %}<span class=\"{{ctx.component.leftIcon}}\"></span>&nbsp;{% } %}\n{{ctx.input.content}}\n{% if (ctx.component.tooltip) { %}\n  <i ref=\"tooltip\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>\n{% } %}\n{% if (ctx.component.rightIcon) { %}&nbsp;<span class=\"{{ctx.component.rightIcon}}\"></span>{% } %}\n</{{ctx.input.type}}>\n<div ref=\"buttonMessageContainer\">\n  <span class=\"help-block\" ref=\"buttonMessage\"></span>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/button/html.ejs',[], function() { return "\n"; });
define('skylark-formio/templates/bootstrap/button/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/checkbox/form.ejs',[], function() { return "<div class=\"form-check checkbox\">\n  <label class=\"{{ctx.input.labelClass}} form-check-label\">\n    <{{ctx.input.type}}\n      ref=\"input\"\n      {% for (var attr in ctx.input.attr) { %}\n      {{attr}}=\"{{ctx.input.attr[attr]}}\"\n      {% } %}\n      {% if (ctx.checked) { %}checked=true{% } %}\n      >\n    {% if (!ctx.self.labelIsHidden()) { %}<span>{{ctx.input.label}}</span>{% } %}\n    {% if (ctx.component.tooltip) { %}\n      <i ref=\"tooltip\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>\n    {% } %}\n    {{ctx.input.content}}\n    </{{ctx.input.type}}>\n  </label>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/checkbox/html.ejs',[], function() { return "<label class=\"{{ctx.input.labelClass}}\">\n    {{ctx.input.content}}\n    {% if (!ctx.self.labelIsHidden()) { %}<span>{{ctx.input.label}}</span>{% } %}\n</label>\n<div ref=\"value\">{% if (ctx.checked) { %}True{% } else { %}False{% } %}</div>\n"; });
define('skylark-formio/templates/bootstrap/checkbox/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/columns/form.ejs',[], function() { return "{% ctx.component.columns.forEach(function(column, index) { %}\n<div class=\"\n    col-{{column.size}}-{{column.width}}\n    col-{{column.size}}-offset-{{column.offset}}\n    col-{{column.size}}-push-{{column.push}}\n    col-{{column.size}}-pull-{{column.pull}}\n  \" ref=\"{{ctx.columnKey}}\">\n  {{ctx.columnComponents[index]}}\n</div>\n{% }) %}\n"; });
define('skylark-formio/templates/bootstrap/columns/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/component/form.ejs',[], function() { return "<div id=\"{{ctx.id}}\" class=\"{{ctx.classes}}\"{% if (ctx.styles) { %} styles=\"{{ctx.styles}}\"{% } %} ref=\"component\">\n  {% if (ctx.visible) { %}\n  {{ctx.children}}\n  <div ref=\"messageContainer\" class=\"formio-errors invalid-feedback\"></div>\n  {% } %}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/component/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/componentModal/form.ejs',[], function() { return "<div class=\"formio-component-modal-wrapper\" ref=\"componentModalWrapper\">\n  <div ref=\"openModalWrapper\"></div>\n\n  <div class=\"formio-dialog formio-dialog-theme-default component-rendering-hidden\" ref=\"modalWrapper\">\n    <div class=\"formio-dialog-overlay\" ref=\"modalOverlay\"></div>\n    <div class=\"formio-dialog-content\" ref=\"modalContents\">\n      <div ref=\"modalContents\">\n        {% if (ctx.visible) { %}\n        {{ctx.children}}\n        {% } %}\n        <div class=\"formio-dialog-buttons\">\n          <button class=\"btn btn-success formio-dialog-button\" ref=\"modalSave\">Save</button>\n        </div>\n      </div>\n      <button class=\"formio-dialog-close float-right btn btn-secondary btn-sm\" aria-label=\"close\" ref=\"modalClose\"></button>\n    </div>\n  </div>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/componentModal/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/components/form.ejs',[], function() { return "{{ ctx.children.join('') }}\n"; });
define('skylark-formio/templates/bootstrap/components/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/container/form.ejs',[], function() { return "<div ref=\"{{ctx.nestedKey}}\">\n  {{ctx.children}}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/container/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/datagrid/form.ejs',[], function() { return "<table class=\"table datagrid-table table-bordered\n    {{ ctx.component.striped ? 'table-striped' : ''}}\n    {{ ctx.component.hover ? 'table-hover' : ''}}\n    {{ ctx.component.condensed ? 'table-sm' : ''}}\n    \" {% if (ctx.component.layoutFixed) { %}style=\"table-layout: fixed;\"{% } %}>\n  {% if (ctx.hasHeader) { %}\n  <thead>\n    <tr>\n      {% if (ctx.component.reorder) { %}<th></th>{% } %}\n      {% ctx.columns.forEach(function(col) { %}\n        <th class=\"{{col.validate && col.validate.required ? 'field-required' : ''}}\">\n          {{ col.hideLabel ? '' : ctx.t(col.label || col.title) }}\n          {% if (col.tooltip) { %} <i ref=\"tooltip\" data-title=\"{{col.tooltip}}\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>{% } %}\n        </th>\n      {% }) %}\n      {% if (ctx.hasExtraColumn) { %}\n      <th>\n        {% if (!ctx.builder && ctx.hasAddButton && ctx.hasTopSubmit) { %}\n        <button class=\"btn btn-primary formio-button-add-row\" ref=\"{{ctx.datagridKey}}-addRow\">\n          <i class=\"{{ctx.iconClass('plus')}}\"></i>{{ctx.t(ctx.component.addAnother || 'Add Another')}}\n        </button>\n        {% } %}\n      </th>\n      {% } %}\n    </tr>\n  </thead>\n  {% } %}\n  <tbody ref=\"{{ctx.datagridKey}}-tbody\">\n    {% ctx.rows.forEach(function(row, index) { %}\n    {% if (ctx.hasGroups && ctx.groups[index]) { %}\n    <tr ref=\"{{ctx.datagridKey}}-group-header\" class=\"datagrid-group-header{{ctx.hasToggle ? ' clickable' : ''}}\">\n      <td\n        ref=\"{{ctx.datagridKey}}-group-label\"\n        colspan=\"{{ctx.numColumns}}\"\n        class=\"datagrid-group-label\">{{ctx.groups[index].label}}</td>\n    </tr>\n    {% } %}\n    <tr ref=\"{{ctx.datagridKey}}-row\">\n      {% if (ctx.component.reorder) { %}\n        <td>\n          <button type=\"button\" class=\"formio-drag-button btn btn-default fa fa-bars\"></button>\n        </td>\n      {% } %}\n      {% ctx.columns.forEach(function(col) { %}\n        <td ref=\"{{ctx.datagridKey}}\">\n          {{row[col.key]}}\n        </td>\n      {% }) %}\n      {% if (ctx.hasExtraColumn) { %}\n        {% if (!ctx.builder && ctx.hasRemoveButtons) { %}\n        <td>\n          <button type=\"button\" class=\"btn btn-secondary formio-button-remove-row\" ref=\"{{ctx.datagridKey}}-removeRow\">\n            <i class=\"{{ctx.iconClass('remove-circle')}}\"></i>\n          </button>\n        </td>\n        {% } %}\n        {% if (ctx.canAddColumn) { %}\n        <td ref=\"{{ctx.key}}-container\">\n          {{ctx.placeholder}}\n        </td>\n        {% } %}\n      {% } %}\n    </tr>\n    {% }) %}\n  </tbody>\n  {% if (!ctx.builder && ctx.hasAddButton && ctx.hasBottomSubmit) { %}\n  <tfoot>\n    <tr>\n      <td colspan=\"{{ctx.numColumns + 1}}\">\n        <button class=\"btn btn-primary formio-button-add-row\" ref=\"{{ctx.datagridKey}}-addRow\">\n          <i class=\"{{ctx.iconClass('plus')}}\"></i> {{ctx.t(ctx.component.addAnother || 'Add Another')}}\n        </button>\n      </td>\n    </tr>\n  </tfoot>\n  {% } %}\n</table>\n"; });
define('skylark-formio/templates/bootstrap/datagrid/html.ejs',[], function() { return "<table class=\"table datagrid-table table-bordered\n    {{ ctx.component.striped ? 'table-striped' : ''}}\n    {{ ctx.component.hover ? 'table-hover' : ''}}\n    {{ ctx.component.condensed ? 'table-sm' : ''}}\n    \">\n  {% if (ctx.hasHeader) { %}\n  <thead>\n    <tr>\n      {% ctx.columns.forEach(function(col) { %}\n        <th class=\"{{col.validate && col.validate.required ? 'field-required' : ''}}\">\n          {{ col.hideLabel ? '' : ctx.t(col.label || col.title) }}\n          {% if (col.tooltip) { %} <i ref=\"tooltip\" data-title=\"{{col.tooltip}}\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>{% } %}\n        </th>\n      {% }) %}\n    </tr>\n  </thead>\n  {% } %}\n  <tbody>\n    {% ctx.rows.forEach(function(row) { %}\n    <tr>\n      {% ctx.columns.forEach(function(col) { %}\n        <td ref=\"{{ctx.datagridKey}}\">\n          {{row[col.key]}}\n        </td>\n      {% }) %}\n    </tr>\n    {% }) %}\n  </tbody>\n</table>\n"; });
define('skylark-formio/templates/bootstrap/datagrid/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/day/form.ejs',[], function() { return "<div class=\"row\">\n  {% if (ctx.dayFirst && ctx.showDay) { %}\n  <div class=\"col col-xs-3\">\n    {% if (!ctx.component.hideInputLabels) { %}\n    <label for=\"{{ctx.component.key}}-day\" class=\"{% if(ctx.component.fields.day.required) { %}field-required{% } %}\">{{ctx.t('Day')}}</label>\n    {% } %}\n    <div>{{ctx.day}}</div>\n  </div>\n  {% } %}\n  {% if (ctx.showMonth) { %}\n  <div class=\"col col-xs-4\">\n    {% if (!ctx.component.hideInputLabels) { %}\n    <label for=\"{{ctx.component.key}}-month\" class=\"{% if(ctx.component.fields.month.required) { %}field-required{% } %}\">{{ctx.t('Month')}}</label>\n    {% } %}\n    <div>{{ctx.month}}</div>\n  </div>\n  {% } %}\n  {% if (!ctx.dayFirst && ctx.showDay) { %}\n  <div class=\"col col-xs-3\">\n    {% if (!ctx.component.hideInputLabels) { %}\n    <label for=\"{{ctx.component.key}}-day\" class=\"{% if(ctx.component.fields.day.required) { %}field-required{% } %}\">{{ctx.t('Day')}}</label>\n    {% } %}\n    <div>{{ctx.day}}</div>\n  </div>\n  {% } %}\n  {% if (ctx.showYear) { %}\n  <div class=\"col col-xs-5\">\n    {% if (!ctx.component.hideInputLabels) { %}\n    <label for=\"{{ctx.component.key}}-year\" class=\"{% if(ctx.component.fields.year.required) { %}field-required{% } %}\">{{ctx.t('Year')}}</label>\n    {% } %}\n    <div>{{ctx.year}}</div>\n  </div>\n  {% } %}\n</div>\n<input name=\"ctx.data[day]\" type=\"hidden\" class=\"form-control\" lang=\"en\" value=\"\" ref=\"input\">\n"; });
define('skylark-formio/templates/bootstrap/day/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/dialog/form.ejs',[], function() { return "<div class=\"formio-dialog formio-dialog-theme-default component-settings\">\n  <div class=\"formio-dialog-overlay\" ref=\"dialogOverlay\"></div>\n  <div class=\"formio-dialog-content\" ref=\"dialogContents\">\n    <div ref=\"dialogContents\"></div>\n    <button class=\"formio-dialog-close float-right btn btn-secondary btn-sm\" aria-label=\"close\" ref=\"dialogClose\"></button>\n  </div>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/dialog/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/editgrid/form.ejs',[], function() { return "<ul class=\"editgrid-listgroup list-group\n    {{ ctx.component.striped ? 'table-striped' : ''}}\n    {{ ctx.component.bordered ? 'table-bordered' : ''}}\n    {{ ctx.component.hover ? 'table-hover' : ''}}\n    {{ ctx.component.condensed ? 'table-sm' : ''}}\n    \">\n  {% if (ctx.header) { %}\n  <li class=\"list-group-item list-group-header\">\n    {{ctx.header}}\n  </li>\n  {% } %}\n  {% ctx.rows.forEach(function(row, rowIndex) { %}\n  <li class=\"list-group-item\" ref=\"{{ctx.ref.row}}\">\n    {{row}}\n    {% if (ctx.openRows[rowIndex] && !ctx.readOnly) { %}\n    <div class=\"editgrid-actions\">\n      <button class=\"btn btn-primary\" ref=\"{{ctx.ref.saveRow}}\">{{ctx.t(ctx.component.saveRow || 'Save')}}</button>\n      {% if (ctx.component.removeRow) { %}\n      <button class=\"btn btn-danger\" ref=\"{{ctx.ref.cancelRow}}\">{{ctx.t(ctx.component.removeRow || 'Cancel')}}</button>\n      {% } %}\n    </div>\n    {% } %}\n    <div class=\"has-error\">\n      <div class=\"editgrid-row-error help-block\">\n        {{ctx.errors[rowIndex]}}\n      </div>\n    </div>\n  </li>\n  {% }) %}\n  {% if (ctx.footer) { %}\n  <li class=\"list-group-item list-group-footer\">\n    {{ctx.footer}}\n  </li>\n  {% } %}\n</ul>\n{% if (!ctx.readOnly && ctx.hasAddButton) { %}\n<button class=\"btn btn-primary\" ref=\"{{ctx.ref.addRow}}\">\n  <i class=\"{{ctx.iconClass('plus')}}\"></i> {{ctx.t(ctx.component.addAnother || 'Add Another')}}\n</button>\n{% } %}\n"; });
define('skylark-formio/templates/bootstrap/editgrid/html.ejs',[], function() { return "<ul class=\"editgrid-listgroup list-group\n    {{ ctx.component.striped ? 'table-striped' : ''}}\n    {{ ctx.component.bordered ? 'table-bordered' : ''}}\n    {{ ctx.component.hover ? 'table-hover' : ''}}\n    {{ ctx.component.condensed ? 'table-sm' : ''}}\n    \">\n  {% if (ctx.header) { %}\n  <li class=\"list-group-item list-group-header\">\n    {{ctx.header}}\n  </li>\n  {% } %}\n  {% ctx.rows.forEach(function(row, rowIndex) { %}\n  <li class=\"list-group-item\" ref=\"{{ctx.ref.row}}\">\n    {{row}}\n    {% if (ctx.openRows[rowIndex] && !ctx.readOnly) { %}\n    <div class=\"editgrid-actions\">\n      <button class=\"btn btn-primary\" ref=\"{{ctx.ref.saveRow}}\">{{ctx.t(ctx.component.saveRow || 'Save')}}</button>\n      {% if (ctx.component.removeRow) { %}\n      <button class=\"btn btn-danger\" ref=\"{{ctx.ref.cancelRow}}\">{{ctx.t(ctx.component.removeRow || 'Cancel')}}</button>\n      {% } %}\n    </div>\n    {% } %}\n    <div class=\"has-error\">\n      <div class=\"editgrid-row-error help-block\">\n        {{ctx.errors[rowIndex]}}\n      </div>\n    </div>\n  </li>\n  {% }) %}\n  {% if (ctx.footer) { %}\n  <li class=\"list-group-item list-group-footer\">\n    {{ctx.footer}}\n  </li>\n  {% } %}\n</ul>\n"; });
define('skylark-formio/templates/bootstrap/editgrid/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/field/form.ejs',[], function() { return "{% if (!ctx.label.hidden && ctx.label.labelPosition !== 'bottom') { %}\n  {{ ctx.labelMarkup }}\n{% } %}\n\n{% if (ctx.label.hidden && ctx.label.className && ctx.component.validate.required) { %}\n  <label class=\"{{ctx.label.className}}\"></label>\n{% } %}\n\n{{ctx.element}}\n\n{% if (!ctx.label.hidden && ctx.label.labelPosition === 'bottom') { %}\n  {{ ctx.labelMarkup }}\n{% } %}\n{% if (ctx.component.description) { %}\n  <div class=\"form-text text-muted\">{{ctx.t(ctx.component.description)}}</div>\n{% } %}\n"; });
define('skylark-formio/templates/bootstrap/field/align.ejs',[], function() { return "<div class=\"field-wrapper\n  {{ctx.isRightPosition ? 'field-wrapper--reverse' : ''}}\">\n  {% if (!ctx.label.hidden) { %}\n    <div class=\"field-label\n      {{ctx.isRightAlign ? 'field-label--right' : ''}}\"\n      style=\"{{ctx.labelStyles}}\">\n    {{ ctx.labelMarkup }}\n    </div>\n  {% } %}\n\n  {% if (ctx.label.hidden && ctx.label.className && ctx.component.validate.required) { %}\n    <div class=\"field-label\n      {{ctx.isRightAlign ? 'field-label--right' : ''}}\"\n      style=\"{{ctx.labelStyles}}\">\n      <label class=\"{{ctx.label.className}}\"></label>\n    </div>\n  {% } %}\n\n  <div class=\"filed-content\" style=\"{{ctx.contentStyles}}\">\n    {{ctx.element}}\n  </div>\n</div>\n\n{% if (ctx.component.description) { %}\n  <div class=\"form-text text-muted\">{{ctx.t(ctx.component.description)}}</div>\n{% } %}\n"; });
define('skylark-formio/templates/bootstrap/field/index',[
    './form.ejs',
    './align.ejs'
], function (form, align) {
    'use strict';
    return {
        form,
        align
    };
});
define('skylark-formio/templates/bootstrap/fieldset/form.ejs',[], function() { return "<fieldset>\n  {% if (ctx.component.legend) { %}\n  <legend ref=\"header\" class=\"{{ctx.component.collapsible ? 'formio-clickable' : ''}}\">\n    {{ctx.t(ctx.component.legend)}}\n    {% if (ctx.component.tooltip) { %}\n      <i ref=\"tooltip\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>\n    {% } %}\n  </legend>\n  {% } %}\n  {% if (!ctx.collapsed) { %}\n  <div class=\"fieldset-body\" ref=\"{{ctx.nestedKey}}\">\n    {{ctx.children}}\n  </div>\n  {% } %}\n</fieldset>\n"; });
define('skylark-formio/templates/bootstrap/fieldset/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/file/form.ejs',[], function() { return "{% if (!ctx.self.imageUpload) { %}\n  <ul class=\"list-group list-group-striped\">\n    <li class=\"list-group-item list-group-header hidden-xs hidden-sm\">\n      <div class=\"row\">\n        {% if (!ctx.disabled) { %}\n          <div class=\"col-md-1\"></div>\n        {% } %}\n        <div class=\"col-md-{% if (ctx.self.hasTypes) { %}7{% } else { %}9{% } %}\"><strong>{{ctx.t('File Name')}}</strong></div>\n        <div class=\"col-md-2\"><strong>{{ctx.t('Size')}}</strong></div>\n        {% if (ctx.self.hasTypes) { %}\n          <div class=\"col-md-2\"><strong>{{ctx.t('Type')}}</strong></div>\n        {% } %}\n      </div>\n    </li>\n    {% ctx.files.forEach(function(file) { %}\n      <li class=\"list-group-item\">\n        <div class=\"row\">\n          {% if (!ctx.disabled) { %}\n            <div class=\"col-md-1\"><i class=\"{{ctx.iconClass('remove')}}\" ref=\"removeLink\"></i></div>\n          {% } %}\n          <div class=\"col-md-{% if (ctx.self.hasTypes) { %}7{% } else { %}9{% } %}\">\n            {% if (ctx.component.uploadOnly) { %}\n              {{file.originalName || file.name}}\n            {% } else { %}\n              <a href=\"{{file.url || '#'}}\" target=\"_blank\" ref=\"fileLink\">{{file.originalName || file.name}}</a>\n            {% } %}\n          </div>\n          <div class=\"col-md-2\">{{ctx.fileSize(file.size)}}</div>\n          {% if (ctx.self.hasTypes && !ctx.disabled) { %}\n            <div class=\"col-md-2\">\n              <select class=\"file-type\" ref=\"fileType\">\n                {% ctx.component.fileTypes.map(function(type) { %}\n                  <option class=\"test\" value=\"{{ type.value }}\" {% if (type.label === file.fileType) { %}selected=\"selected\"{% } %}>{{ type.label }}</option>\n                {% }); %}\n              </select>\n            </div>\n          {% } %}\n          {% if (ctx.self.hasTypes && ctx.disabled) { %}\n          <div class=\"col-md-2\">{{file.fileType}}</div>\n          {% } %}\n        </div>\n      </li>\n    {% }) %}\n  </ul>\n{% } else { %}\n  <div>\n    {% ctx.files.forEach(function(file) { %}\n      <div>\n        <span>\n          <img ref=\"fileImage\" src=\"\" alt=\"{{file.originalName || file.name}}\" style=\"width:{{ctx.component.imageSize}}px\">\n          {% if (!ctx.disabled) { %}\n            <i class=\"{{ctx.iconClass('remove')}}\" ref=\"removeLink\"></i>\n          {% } %}\n        </span>\n      </div>\n    {% }) %}\n  </div>\n{% } %}\n{% if (!ctx.disabled && (ctx.component.multiple || !ctx.files.length)) { %}\n  {% if (ctx.self.useWebViewCamera) { %}\n    <div class=\"fileSelector\">\n      <button class=\"btn btn-primary\" ref=\"galleryButton\"><i class=\"fa fa-book\"></i> {{ctx.t('Gallery')}}</button>\n      <button class=\"btn btn-primary\" ref=\"cameraButton\"><i class=\"fa fa-camera\"></i> {{ctx.t('Camera')}}</button>\n    </div>\n  {% } else if (!ctx.self.cameraMode) { %}\n    <div class=\"fileSelector\" ref=\"fileDrop\">\n      <i class=\"{{ctx.iconClass('cloud-upload')}}\"></i> {{ctx.t('Drop files to attach,')}}\n        {% if (ctx.self.imageUpload) { %}\n          <a href=\"#\" ref=\"toggleCameraMode\"><i class=\"fa fa-camera\"></i> {{ctx.t('Use Camera,')}}</a>\n        {% } %}\n        {{ctx.t('or')}} <a href=\"#\" ref=\"fileBrowse\" class=\"browse\">{{ctx.t('browse')}}</a>\n    </div>\n  {% } else { %}\n    <div>\n      <video class=\"video\" autoplay=\"true\" ref=\"videoPlayer\"></video>\n    </div>\n    <button class=\"btn btn-primary\" ref=\"takePictureButton\"><i class=\"fa fa-camera\"></i> {{ctx.t('Take Picture')}}</button>\n    <button class=\"btn btn-primary\" ref=\"toggleCameraMode\">{{ctx.t('Switch to file upload')}}</button>\n  {% } %}\n{% } %}\n{% ctx.statuses.forEach(function(status) { %}\n  <div class=\"file {{ctx.statuses.status === 'error' ? ' has-error' : ''}}\">\n    <div class=\"row\">\n      <div class=\"fileName col-form-label col-sm-10\">{{status.originalName}} <i class=\"{{ctx.iconClass('remove')}}\" ref=\"fileStatusRemove\"></i></div>\n      <div class=\"fileSize col-form-label col-sm-2 text-right\">{{ctx.fileSize(status.size)}}</div>\n    </div>\n    <div class=\"row\">\n      <div class=\"col-sm-12\">\n        {% if (status.status === 'progress') { %}\n          <div class=\"progress\">\n            <div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"{{status.progress}}\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: {{status.progress}}%\">\n              <span class=\"sr-only\">{{status.progress}}% {{ctx.t('Complete')}}</span>\n            </div>\n          </div>\n        {% } else { %}\n          <div class=\"bg-{{status.status}}\">{{ctx.t(status.message)}}</div>\n        {% } %}\n      </div>\n    </div>\n  </div>\n{% }) %}\n{% if (!ctx.component.storage || ctx.support.hasWarning) { %}\n  <div class=\"alert alert-warning\">\n    {% if (!ctx.component.storage) { %}\n      <p>{{ctx.t('No storage has been set for this field. File uploads are disabled until storage is set up.')}}</p>\n    {% } %}\n    {% if (!ctx.support.filereader) { %}\n      <p>{{ctx.t('File API & FileReader API not supported.')}}</p>\n    {% } %}\n    {% if (!ctx.support.formdata) { %}\n      <p>{{ctx.t(\"XHR2's FormData is not supported.\")}}</p>\n    {% } %}\n    {% if (!ctx.support.progress) { %}\n      <p>{{ctx.t(\"XHR2's upload progress isn't supported.\")}}</p>\n    {% } %}\n  </div>\n{% } %}\n"; });
define('skylark-formio/templates/bootstrap/file/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/html/form.ejs',[], function() { return "<{{ctx.tag}} class=\"{{ ctx.component.className }}\" ref=\"html\"\n  {% ctx.attrs.forEach(function(attr) { %}\n    {{attr.attr}}=\"{{attr.value}}\"\n  {% }) %}\n>{{ctx.content}}{% if (!ctx.singleTags || ctx.singleTags.indexOf(ctx.tag) === -1) { %}</{{ctx.tag}}>{% } %}\n"; });
define('skylark-formio/templates/bootstrap/html/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/icon/form.ejs',[], function() { return "<i ref=\"{{ctx.ref}}\" class=\"{{ctx.className}}\" style=\"{{ctx.styles}}\">{{ctx.content}}</i>\n"; });
define('skylark-formio/templates/bootstrap/icon/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/iconClass',[],function () {
    'use strict';
    return (iconset, name, spinning) => {
        if (iconset === 'fa') {
            switch (name) {
            case 'save':
                name = 'download';
                break;
            case 'zoom-in':
                name = 'search-plus';
                break;
            case 'zoom-out':
                name = 'search-minus';
                break;
            case 'question-sign':
                name = 'question-circle';
                break;
            case 'remove-circle':
                name = 'times-circle-o';
                break;
            case 'new-window':
                name = 'window-restore';
                break;
            case 'move':
                name = 'arrows';
                break;
            case 'time':
                name = 'clock-o';
                break;
            }
        }
        return spinning ? `${ iconset } ${ iconset }-${ name } ${ iconset }-spin` : `${ iconset } ${ iconset }-${ name }`;
    };
});
define('skylark-formio/templates/bootstrap/input/form.ejs',[], function() { return "{% if (ctx.component.prefix || ctx.component.suffix) { %}\n<div class=\"input-group\">\n{% } %}\n{% if (ctx.component.prefix) { %}\n<div class=\"input-group-prepend\" ref=\"prefix\">\n  <span class=\"input-group-text\">\n    {{ctx.component.prefix}}\n  </span>\n</div>\n{% } %}\n<{{ctx.input.type}}\n  ref=\"{{ctx.input.ref ? ctx.input.ref : 'input'}}\"\n  {% for (var attr in ctx.input.attr) { %}\n  {{attr}}=\"{{ctx.input.attr[attr]}}\"\n  {% } %}\n>{{ctx.input.content}}</{{ctx.input.type}}>\n{% if (ctx.component.showCharCount) { %}\n<span class=\"text-muted pull-right\" ref=\"charcount\"></span>\n{% } %}\n{% if (ctx.component.showWordCount) { %}\n<span class=\"text-muted pull-right\" ref=\"wordcount\"></span>\n{% } %}\n{% if (ctx.component.suffix) { %}\n<div class=\"input-group-append\" ref=\"suffix\">\n  <span class=\"input-group-text\">\n    {{ctx.component.suffix}}\n  </span>\n</div>\n{% } %}\n{% if (ctx.component.prefix || ctx.component.suffix) { %}\n</div>\n{% } %}\n"; });
define('skylark-formio/templates/bootstrap/input/html.ejs',[], function() { return "<div ref=\"value\">{% if (ctx.value) { %}{{ctx.value}}{% } else { %}-{% } %}</div>\n"; });
define('skylark-formio/templates/bootstrap/input/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/label/form.ejs',[], function() { return "<label class=\"col-form-label {{ctx.label.className}}\">\n  {{ ctx.t(ctx.component.label) }}\n  {% if (ctx.component.tooltip) { %}\n    <i ref=\"tooltip\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>\n  {% } %}\n</label>\n"; });
define('skylark-formio/templates/bootstrap/label/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/loader/form.ejs',[], function() { return "<div class=\"formio-loader\">\n  <div class=\"loader-wrapper\">\n    <div class=\"loader text-center\"></div>\n  </div> \n</div>\n"; });
define('skylark-formio/templates/bootstrap/loader/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/loading/form.ejs',[], function() { return "Loading...\n"; });
define('skylark-formio/templates/bootstrap/loading/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/map/form.ejs',[], function() { return "<div id=\"{{ctx.mapId}}\" style=\"min-height: 300px; height: calc(100vh - 600px);\" ref=\"gmapElement\"></div>\n"; });
define('skylark-formio/templates/bootstrap/map/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/message/form.ejs',[], function() { return "<div class=\"form-text {{ctx.level}}\">{{ctx.message}}</div>\n"; });
define('skylark-formio/templates/bootstrap/message/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/multipleMasksInput/form.ejs',[], function() { return "<div\n  class=\"input-group formio-multiple-mask-container\"\n  ref=\"{{ctx.input.ref ? ctx.input.ref : 'input'}}\"\n>\n  <select\n    class=\"form-control formio-multiple-mask-select\"\n    id=\"{{ctx.key}}-mask\"\n    ref=\"select\">\n    {% ctx.selectOptions.forEach(function(option) { %}\n    <option value=\"{{option.value}}\">{{option.label}}</option>\n    {% }); %}\n  </select>\n  <input\n    ref=\"mask\"\n    {% for (var attr in ctx.input.attr) { %}\n    {{attr}}=\"{{ctx.input.attr[attr]}}\"\n    {% } %}\n  >\n</div>\n"; });
define('skylark-formio/templates/bootstrap/multipleMasksInput/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/multiValueRow/form.ejs',[], function() { return "<tr ref=\"row\">\n  <td>\n    {{ctx.element}}\n  </td>\n  {% if (!ctx.disabled) { %}\n  <td>\n    <button type=\"button\" class=\"btn btn-secondary\" ref=\"removeRow\">\n      <i class=\"{{ctx.iconClass('remove-circle')}}\"></i>\n    </button>\n  </td>\n  {% } %}\n</tr>\n"; });
define('skylark-formio/templates/bootstrap/multiValueRow/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/multiValueTable/form.ejs',[], function() { return "<table class=\"table table-bordered\">\n  <tbody>\n  {{ctx.rows}}\n  {% if (!ctx.disabled) { %}\n  <tr>\n    <td colspan=\"2\">\n      <button class=\"btn btn-primary formio-button-add-another\" ref=\"addButton\"><i class=\"{{ctx.iconClass('plus')}}\"></i> {{ctx.t(ctx.addAnother)}}</button>\n    </td>\n  </tr>\n  {% } %}\n  </tbody>\n</table>\n"; });
define('skylark-formio/templates/bootstrap/multiValueTable/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/panel/form.ejs',[], function() { return "<div class=\"mb-2 card border\">\n  <div class=\"card-header {{ctx.transform('class', 'bg-' + ctx.component.theme)}}\" ref=\"header\">\n    <span class=\"mb-0 card-title\">\n      {% if (ctx.component.collapsible) { %}\n        <i class=\"formio-collapse-icon {{ctx.iconClass(ctx.collapsed ? 'plus-square-o' : 'minus-square-o')}} text-muted\" data-title=\"Collapse Panel\"></i>\n      {% } %}\n      {{ctx.t(ctx.component.title)}}\n      {% if (ctx.component.tooltip) { %}\n        <i ref=\"tooltip\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>\n      {% } %}\n    </span>\n  </div>\n  {% if (!ctx.collapsed || ctx.builder) { %}\n  <div class=\"card-body\" ref=\"{{ctx.nestedKey}}\">\n    {{ctx.children}}\n  </div>\n  {% } %}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/panel/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/pdf/form.ejs',[], function() { return "<div class=\"{{ctx.classes}}\" ref=\"webform\">\n\t<span data-noattach=\"true\" ref=\"zoomIn\" style=\"position:absolute;right:10px;top:10px;cursor:pointer;\" class=\"btn btn-default btn-secondary no-disable\">\n\t\t<i class=\"{{ ctx.iconClass('zoom-in') }}\"></i>\n\t</span>\n\t<span data-noattach=\"true\" ref=\"zoomOut\" style=\"position:absolute;right:10px;top:60px;cursor:pointer;\" class=\"btn btn-default btn-secondary no-disable\">\n\t\t<i class=\"{{ ctx.iconClass('zoom-out') }}\"></i>\n\t</span>\n  <div data-noattach=\"true\" ref=\"iframeContainer\"></div>\n  <button type=\"button\" class=\"btn btn-primary\" ref=\"submitButton\">{{ctx.t('Submit')}}</button>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/pdf/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/pdfBuilder/form.ejs',[], function() { return "<div class=\"formio builder row formbuilder\">\n  <div class=\"col-xs-4 col-sm-3 col-md-2 formcomponents\">\n    {{ctx.sidebar}}\n  </div>\n  <div class=\"col-xs-8 col-sm-9 col-md-10 formarea\" ref=\"form\">\n\t  <div class=\"formio-drop-zone\" ref=\"iframeDropzone\"></div>\n    {{ctx.form}}\n  </div>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/pdfBuilder/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/pdfBuilderUpload/form.ejs',[], function() { return "<div class=\"pdf-upload formio-component-file\">\n  <h3 class=\"label\">{{ctx.t('Upload a PDF File')}}</h3>\n  <input type=\"file\" style=\"opacity: 0; position: absolute;\" tabindex=\"-1\" accept=\".pdf\" ref=\"hiddenFileInputElement\">\n  <div class=\"fileSelector\" ref=\"fileDrop\">\n    <i class=\"{{ctx.iconClass('cloud-upload')}}\"></i>{{ctx.t('Drop pdf to start, or')}} <a href=\"#\" ref=\"fileBrowse\" class=\"browse\">{{ctx.t('browse')}}</a>\n  </div>\n  <div class=\"alert alert-danger\" ref=\"uploadError\">\n\n  </div>\n</div>\n\n"; });
define('skylark-formio/templates/bootstrap/pdfBuilderUpload/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/radio/form.ejs',[], function() { return "<div class=\"form-radio radio\">\n  {% ctx.values.forEach(function(item) { %}\n  <div class=\"form-check{{ctx.inline ? '-inline' : ''}}\" ref=\"wrapper\">\n    <label class=\"form-check-label label-position-{{ ctx.component.optionsLabelPosition }}\" for=\"{{ctx.id}}{{ctx.row}}-{{item.value}}\">\n      {% if (ctx.component.optionsLabelPosition === 'left' || ctx.component.optionsLabelPosition === 'top') { %}\n      <span>{{ctx.t(item.label)}}</span>\n      {% } %}\n      <{{ctx.input.type}}\n        ref=\"input\"\n        {% for (var attr in ctx.input.attr) { %}\n        {{attr}}=\"{{ctx.input.attr[attr]}}\"\n        {% } %}\n        value=\"{{item.value}}\"\n        {% if (ctx.value && (ctx.value === item.value || (typeof ctx.value === 'object' && ctx.value.hasOwnProperty(item.value) && ctx.value[item.value]))) { %}\n          checked=true\n        {% } %}\n        {% if (item.disabled) { %}\n          disabled=true\n        {% } %}\n        id=\"{{ctx.id}}{{ctx.row}}-{{item.value}}\"\n      >\n      {% if (!ctx.component.optionsLabelPosition || ctx.component.optionsLabelPosition === 'right' || ctx.component.optionsLabelPosition === 'bottom') { %}\n      <span>{{ctx.t(item.label)}}</span>\n      {% } %}\n    </label>\n  </div>\n  {% }) %}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/radio/html.ejs',[], function() { return "<div ref=\"value\">\n  {% var filtered = ctx.values.filter(function(item) {return ctx.value === item.value || (typeof ctx.value === 'object' && ctx.value.hasOwnProperty(item.value) && ctx.value[item.value])}).map(function(item) { return ctx.t(item.label)}).join(', ') %}\n  {{ filtered }}\n  </div>\n"; });
define('skylark-formio/templates/bootstrap/radio/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/resourceAdd/form.ejs',[], function() { return "<table class=\"table table-bordered\">\n  <tbody>\n    <tr>\n      <td>\n        {{ctx.element}}\n      </td>\n    </tr>\n    <tr>\n      <td colspan=\"2\">\n        <button class=\"btn btn-primary formio-button-add-resource\" ref=\"addResource\">\n          <i class=\"{{ctx.iconClass('plus')}}\"></i>\n          {{ctx.t(ctx.component.addResourceLabel || 'Add Resource')}}\n        </button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n"; });
define('skylark-formio/templates/bootstrap/resourceAdd/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/select/form.ejs',[], function() { return "<select\n  ref=\"{{ctx.input.ref ? ctx.input.ref : 'selectContainer'}}\"\n  {{ ctx.input.multiple ? 'multiple' : '' }}\n  {% for (var attr in ctx.input.attr) { %}\n  {{attr}}=\"{{ctx.input.attr[attr]}}\"\n  {% } %}\n>{{ctx.selectOptions}}</select>\n<input type=\"text\"\n       class=\"formio-select-autocomplete-input\"\n       ref=\"autocompleteInput\"\n       {% if (ctx.input.attr.autocomplete) { %}\n       autocomplete=\"{{ctx.input.attr.autocomplete}}\"\n       {% } %}\n       tabindex=\"-1\"\n/>\n"; });
define('skylark-formio/templates/bootstrap/select/html.ejs',[], function() { return "<div ref=\"value\">{% if (ctx.value) { %}{{ ctx.self.itemValueForHTMLMode(ctx.value) }}{% } else { %}-{% } %}</div>\n"; });
define('skylark-formio/templates/bootstrap/select/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/selectOption/form.ejs',[], function() { return "<option {{ ctx.selected ? 'selected=\"selected\"' : '' }}\n  value=\"{{ctx.useId ? ctx.id : ctx.option.value}}\"\n  {% for (var attr in ctx.attrs) { %}\n  {{attr}}=\"{{ctx.attrs[attr]}}\"\n  {% } %}\n  >\n  {{ctx.t(ctx.option.label)}}\n</option>\n"; });
define('skylark-formio/templates/bootstrap/selectOption/html.ejs',[], function() { return "{% if (ctx.selected) { %}{{ctx.t(ctx.option.label)}}{% } %}\n"; });
define('skylark-formio/templates/bootstrap/selectOption/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/signature/form.ejs',[], function() { return "{{ctx.element}}\n<div\n  class=\"signature-pad-body\"\n  style=\"width: {{ctx.component.width}};height: {{ctx.component.height}};padding:0;margin:0;\"\n  tabindex=\"{{ctx.component.tabindex || 0}}\"\n  ref=\"padBody\"\n>\n  <a class=\"btn btn-sm btn-light signature-pad-refresh\" ref=\"refresh\">\n    <i class=\"{{ctx.iconClass('refresh')}}\"></i>\n  </a>\n  <canvas class=\"signature-pad-canvas\" height=\"{{ctx.component.height}}\" ref=\"canvas\"></canvas>\n  {% if (ctx.required) { %}\n  <span class=\"form-control-feedback field-required-inline text-danger\">\n    <i class=\"{{ctx.iconClass('asterisk')}}\"></i>\n  </span>\n  {% } %}\n  <img style=\"width: 100%;display: none;\" ref=\"signatureImage\">\n</div>\n{% if (ctx.component.footer) { %}\n  <div class=\"signature-pad-footer\">\n    {{ctx.t(ctx.component.footer)}}\n  </div>\n{% } %}\n"; });
define('skylark-formio/templates/bootstrap/signature/html.ejs',[], function() { return "<img style=\"width: 100%;\" ref=\"signatureImage\">\n"; });
define('skylark-formio/templates/bootstrap/signature/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/survey/form.ejs',[], function() { return "<table class=\"table table-striped table-bordered\">\n  <thead>\n    <tr>\n      <th></th>\n      {% ctx.component.values.forEach(function(value) { %}\n      <th style=\"text-align: center;\">{{ctx.t(value.label)}}</th>\n      {% }) %}\n    </tr>\n  </thead>\n  <tbody>\n    {% ctx.component.questions.forEach(function(question) { %}\n    <tr>\n      <td>{{ctx.t(question.label)}}</td>\n      {% ctx.component.values.forEach(function(value) { %}\n      <td style=\"text-align: center;\">\n        <input type=\"radio\" name=\"{{ ctx.self.getInputName(question) }}\" value=\"{{value.value}}\" id=\"{{ctx.key}}-{{question.value}}-{{value.value}}\" ref=\"input\">\n      </td>\n      {% }) %}\n    </tr>\n    {% }) %}\n  </tbody>\n</table>\n"; });
define('skylark-formio/templates/bootstrap/survey/html.ejs',[], function() { return "<table class=\"table table-striped table-bordered\">\n  <tbody>\n    {% ctx.component.questions.forEach(function(question) { %}\n    <tr>\n      <th>{{ctx.t(question.label)}}</th>\n      <td>\n      {% ctx.component.values.forEach(function(item) { %}\n        {% if (ctx.value && ctx.value.hasOwnProperty(question.value) && ctx.value[question.value] === item.value) { %}\n          {{ctx.t(item.label)}}\n        {% } %}\n      {% }) %}\n      </td>\n    </tr>\n    {% }) %}\n  </tbody>\n</table>\n"; });
define('skylark-formio/templates/bootstrap/survey/index',[
    './form.ejs',
    './html.ejs'
], function (form, html) {
    'use strict';
    return {
        form,
        html
    };
});
define('skylark-formio/templates/bootstrap/tab/flat.ejs',[], function() { return "{% ctx.component.components.forEach(function(tab, index) { %}\n  <div class=\"mb-2 card border\">\n    <div class=\"card-header bg-default\">\n      <h4 class=\"mb-0 card-title\">{{ ctx.t(tab.label) }}</h4>\n    </div>\n    <div class=\"card-body\">\n      {{ ctx.tabComponents[index] }}\n    </div>\n  </div>\n{% }) %}\n"; });
define('skylark-formio/templates/bootstrap/tab/form.ejs',[], function() { return "<div class=\"card\">\n  <div class=\"card-header\">\n    <ul class=\"nav nav-tabs card-header-tabs\">\n      {% ctx.component.components.forEach(function(tab, index) { %}\n      <li class=\"nav-item{{ ctx.currentTab === index ? ' active' : ''}}\" role=\"presentation\" ref=\"{{ctx.tabLikey}}\">\n        <a class=\"nav-link{{ ctx.currentTab === index ? ' active' : ''}}\" href=\"#{{tab.key}}\" ref=\"{{ctx.tabLinkKey}}\">{{ctx.t(tab.label)}}</a>\n      </li>\n      {% }) %}\n    </ul>\n  </div>\n  {% ctx.component.components.forEach(function(tab, index) { %}\n  <div\n    role=\"tabpanel\"\n    class=\"card-body tab-pane{{ ctx.currentTab === index ? ' active' : ''}}\"\n    style=\"display: {{ctx.currentTab === index ? 'block' : 'none'}}\"\n    ref=\"{{ctx.tabKey}}\"\n  >\n    {{ctx.tabComponents[index]}}\n  </div>\n  {% }) %}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/tab/index',[
    './flat.ejs',
    './form.ejs'
], function (flat, form) {
    'use strict';
    return {
        flat,
        form
    };
});
define('skylark-formio/templates/bootstrap/table/form.ejs',[], function() { return "<table class=\"table\n    {{ ctx.component.striped ? 'table-striped' : ''}}\n    {{ ctx.component.bordered ? 'table-bordered' : ''}}\n    {{ ctx.component.hover ? 'table-hover' : ''}}\n    {{ ctx.component.condensed ? 'table-sm' : ''}}\n  \">\n  {% if (ctx.component.header && ctx.component.header.length > 0) { %}\n  <thead>\n    <tr>\n      {% ctx.component.header.forEach(function(header) { %}\n      <th>{{ctx.t(header)}}</th>\n      {% }) %}\n    </tr>\n  </thead>\n  {% } %}\n  <tbody>\n    {% ctx.tableComponents.forEach(function(row, rowIndex) { %}\n    <tr ref=\"row-{{ctx.id}}\">\n      {% row.forEach(function(column, colIndex) { %}\n      <td ref=\"{{ctx.tableKey}}-{{rowIndex}}\"{% if (ctx.cellClassName) { %} class=\"{{ctx.cellClassName}}\"{% } %}>{{column}}</td>\n      {% }) %}\n    </tr>\n    {% }) %}\n  </tbody>\n</table>\n"; });
define('skylark-formio/templates/bootstrap/table/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/tree/form.ejs',[], function() { return "{% if (ctx.node.isRoot) { %}\n  <div ref=\"root\" class=\"list-group-item\">\n{% } else { %}\n  <li ref=\"node\" class=\"list-group-item col-sm-12 tree__level tree__level_{{ ctx.odd ? 'odd' : 'even' }}\">\n{% } %}\n  {% if (ctx.content) { %}\n    <div ref=\"content\" class=\"tree__node-content\">\n      {{ ctx.content }}\n    </div>\n  {% } %}\n  {% if (ctx.childNodes && ctx.childNodes.length) { %}\n    <ul ref=\"childNodes\" class=\"tree__node-children list-group row\">\n      {{ ctx.childNodes.join('') }}\n    </ul>\n  {% } %}\n{% if (ctx.node.isRoot) { %}\n  </div>\n{% } else { %}\n  </li>\n{% } %}\n"; });
define('skylark-formio/templates/bootstrap/tree/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/tree/partials/edit.ejs',[], function() { return "<div class=\"node-edit\">\n  <div ref=\"nodeEdit\">{{ ctx.children }}</div>\n  {% if (!ctx.readOnly) { %}\n    <div class=\"node-actions\">\n      <button ref=\"saveNode\" class=\"btn btn-primary saveNode\">{{ ctx.t('Save') }}</button>\n      <button ref=\"cancelNode\" class=\"btn btn-danger cancelNode\">{{ ctx.t('Cancel') }}</button>\n    </div>\n  {% } %}\n</div>\n"; });
define('skylark-formio/templates/bootstrap/tree/partials/view.ejs',[], function() { return "<div class=\"row\">\n  {% ctx.values.forEach(function(value) { %}\n    <div class=\"col-sm-2\">\n      {{ value }}\n    </div>\n  {% }) %}\n  <div class=\"col-sm-3\">\n    <div class=\"btn-group pull-right\">\n      {% if (ctx.node.hasChildren) { %}\n        <button ref=\"toggleNode\" class=\"btn btn-default btn-sm toggleNode\">{{ ctx.t(ctx.node.collapsed ? 'Expand' : 'Collapse') }}</button>\n      {% } %}\n      {% if (!ctx.readOnly) { %}\n        <button ref=\"addChild\" class=\"btn btn-default btn-sm addChild\">{{ ctx.t('Add') }}</button>\n        <button ref=\"editNode\" class=\"btn btn-default btn-sm editNode\">{{ ctx.t('Edit') }}</button>\n        <button ref=\"removeNode\" class=\"btn btn-danger btn-sm removeNode\">{{ ctx.t('Delete') }}</button>\n        {% if (ctx.node.revertAvailable) { %}\n          <button ref=\"revertNode\" class=\"btn btn-danger btn-sm revertNode\">{{ ctx.t('Revert') }}</button>\n        {% } %}\n      {% } %}\n    </div>\n  </div>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/tree/partials/index',[
    './edit.ejs',
    './view.ejs'
], function (edit, view) {
    'use strict';
    return {
        treeView: { form: view },
        treeEdit: { form: edit }
    };
});
define('skylark-formio/templates/bootstrap/webform/form.ejs',[], function() { return "<div class=\"{{ctx.classes}}\" ref=\"webform\" novalidate>{{ctx.children}}</div>\n"; });
define('skylark-formio/templates/bootstrap/webform/builder.ejs',[], function() { return "<div class=\"text-muted text-center p-2\">{{ ctx.t(ctx.component.title) }}</div>\n"; });
define('skylark-formio/templates/bootstrap/webform/index',[
    './form.ejs',
    './builder.ejs'
], function (form, builder) {
    'use strict';
    return {
        form,
        builder
    };
});
define('skylark-formio/templates/bootstrap/well/form.ejs',[], function() { return "<div class=\"card card-body bg-light\">\n  <div ref=\"{{ctx.nestedKey}}\">\n    {{ctx.children}}\n  </div>\n</div>\n"; });
define('skylark-formio/templates/bootstrap/well/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/wizard/form.ejs',[], function() { return "<div class=\"{{ctx.className}}\">\n  <div style=\"position: relative;\">\n    {{ ctx.wizardHeader }}\n    <div class=\"wizard-page\" ref=\"{{ctx.wizardKey}}\">\n      {{ctx.components}}\n    </div>\n    {{ ctx.wizardNav }}\n  </div>\n</div>"; });
define('skylark-formio/templates/bootstrap/wizard/builder.ejs',[], function() { return "<div class=\"text-muted text-center p-2\">{{ ctx.t(ctx.component.title) }}</div>\n"; });
define('skylark-formio/templates/bootstrap/wizard/index',[
    './form.ejs',
    './builder.ejs'
], function (form, builder) {
    'use strict';
    return {
        form,
        builder
    };
});
define('skylark-formio/templates/bootstrap/wizardHeader/form.ejs',[], function() { return "<nav aria-label=\"navigation\" id=\"{{ ctx.wizardKey }}-header\">\n  <ul class=\"pagination\">\n    {% ctx.panels.forEach(function(panel, index) { %}\n    <li class=\"page-item{{ctx.currentPage === index ? ' active' : ''}}\" style=\"\">\n      <span class=\"page-link\" ref=\"{{ctx.wizardKey}}-link\">{{panel.title}}</span>\n    </li>\n    {% }) %}\n  </ul>\n</nav>\n"; });
define('skylark-formio/templates/bootstrap/wizardHeader/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/wizardNav/form.ejs',[], function() { return "<ul class=\"list-inline\" id=\"{{ ctx.wizardKey }}-nav\">\n  {% if (ctx.buttons.cancel) { %}\n  <li class=\"list-inline-item\">\n    <button class=\"btn btn-secondary btn-wizard-nav-cancel\" ref=\"{{ctx.wizardKey}}-cancel\">{{ctx.t('cancel')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.previous) { %}\n  <li class=\"list-inline-item\">\n    <button class=\"btn btn-primary btn-wizard-nav-previous\" ref=\"{{ctx.wizardKey}}-previous\">{{ctx.t('previous')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.next) { %}\n  <li class=\"list-inline-item\">\n    <button class=\"btn btn-primary btn-wizard-nav-next\" ref=\"{{ctx.wizardKey}}-next\">{{ctx.t('next')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.submit) { %}\n  <li class=\"list-inline-item\">\n    <button class=\"btn btn-primary btn-wizard-nav-submit\" ref=\"{{ctx.wizardKey}}-submit\">{{ctx.t('submit')}}</button>\n  </li>\n  {% } %}\n</ul>\n"; });
define('skylark-formio/templates/bootstrap/wizardNav/index',['./form.ejs'], function (form) {
    'use strict';
    return { form };
});
define('skylark-formio/templates/bootstrap/cssClasses',[],function () {
    'use strict';
    return {
        'border-default': '',
        'formio-tab-panel-active': 'active',
        'formio-tab-link-active': 'active',
        'formio-tab-link-container-active': 'active'
    };
});
define('skylark-formio/templates/bootstrap/index',[
    './address/index',
    './builder/index',
    './builderComponent/index',
    './builderComponents/index',
    './builderEditForm/index',
    './builderPlaceholder/index',
    './builderSidebar/index',
    './builderSidebarGroup/index',
    './builderWizard/index',
    './button/index',
    './checkbox/index',
    './columns/index',
    './component/index',
    './componentModal/index',
    './components/index',
    './container/index',
    './datagrid/index',
    './day/index',
    './dialog/index',
    './editgrid/index',
    './field/index',
    './fieldset/index',
    './file/index',
    './html/index',
    './icon/index',
    './iconClass',
    './input/index',
    './label/index',
    './loader/index',
    './loading/index',
    './map/index',
    './message/index',
    './multipleMasksInput/index',
    './multiValueRow/index',
    './multiValueTable/index',
    './panel/index',
    './pdf/index',
    './pdfBuilder/index',
    './pdfBuilderUpload/index',
    './radio/index',
    './resourceAdd/index',
    './select/index',
    './selectOption/index',
    './signature/index',
    './survey/index',
    './tab/index',
    './table/index',
    './tree/index',
    './tree/partials/index',
    './webform/index',
    './well/index',
    './wizard/index',
    './wizardHeader/index',
    './wizardNav/index',
    './cssClasses'
], function (address, builder, builderComponent, builderComponents, builderEditForm, builderPlaceholder, builderSidebar, builderSidebarGroup, builderWizard, button, checkbox, columns, component, componentModal, components, container, datagrid, day, dialog, editgrid, field, fieldset, file, html, icon, iconClass, input, label, loader, loading, map, message, multipleMasksInput, multiValueRow, multiValueTable, panel, pdf, pdfBuilder, pdfBuilderUpload, radio, resourceAdd, select, selectOption, signature, survey, tab, table, tree, treePartials, webform, well, wizard, wizardHeader, wizardNav, cssClasses) {
    'use strict';
    return {
        transform(type, text) {
            if (!text) {
                return text;
            }
            switch (type) {
            case 'class':
                return this.cssClasses.hasOwnProperty(text.toString()) ? this.cssClasses[text.toString()] : text;
            }
            return text;
        },
        defaultIconset: 'fa',
        iconClass,
        cssClasses,
        address,
        builder,
        builderComponent,
        builderComponents,
        builderEditForm,
        builderPlaceholder,
        builderSidebar,
        builderSidebarGroup,
        builderWizard,
        button,
        checkbox,
        columns,
        component,
        componentModal,
        components,
        container,
        datagrid,
        day,
        dialog,
        editgrid,
        field,
        fieldset,
        file,
        html,
        icon,
        input,
        label,
        loader,
        loading,
        map,
        message,
        multipleMasksInput,
        multiValueRow,
        multiValueTable,
        panel,
        pdf,
        pdfBuilder,
        pdfBuilderUpload,
        radio,
        resourceAdd,
        select,
        selectOption,
        signature,
        survey,
        tab,
        table,
        tree,
        ...treePartials,
        webform,
        well,
        wizard,
        wizardHeader,
        wizardNav
    };
});
define('skylark-formio/templates/index',[
    './bootstrap/index',
//    '@formio/bootstrap3',
//    '@formio/semantic'
], function (bootstrap, bootstrap3, semantic) {
    'use strict';
    //TODO : lwf
    return {
        bootstrap,
//        bootstrap3: bootstrap3.templates.bootstrap3,
//        semantic: semantic.templates.semantic
    };
});
define('skylark-formio/templates/Templates',[
    './index',
    'skylark-lodash'
], function (templates, _) {
    'use strict';
    return class Templates {
        static get templates() {
            if (!Templates._templates) {
                Templates._templates = templates;
            }
            return Templates._templates;
        }
        static addTemplate(name, template) {
            Templates.templates[name] = template;
        }
        static extendTemplate(name, template) {
            Templates.templates[name] = _.merge({}, Templates.templates[name], template);
        }
        static setTemplate(name, template) {
            Templates.addTemplate(name, template);
        }
        static set current(templates) {
            const defaultTemplates = Templates.current;
            Templates._current = _.merge({}, defaultTemplates, templates);
        }
        static get current() {
            if (Templates._current) {
                return Templates._current;
            }
            return Templates.defaultTemplates;
        }
        static get defaultTemplates() {
            return Templates.templates.bootstrap;
        }
        static set framework(framework) {
            if (Templates.templates.hasOwnProperty(framework)) {
                Templates._framework = framework;
                Templates._current = Templates.templates[framework];
            }
        }
        static get framework() {
            return Templates._framework;
        }
    };
});
define('skylark-formio/components/_classes/componentModal/ComponentModal',[],function () {
    'use strict';
    return class ComponentModal {
        static render(component, data, topLevel) {
            const children = component.renderTemplate('component', data, topLevel);
            return component.renderTemplate('componentModal', {
                ...data,
                children
            });
        }
        constructor(component, modal) {
            this.component = component;
            this.modal = modal;
            this.currentValue = this.component.dataValue;
            this.dataLoaded = false;
            this.init();
        }
        get refs() {
            return this.component.refs;
        }
        init() {
            this.loadRefs();
        }
        setValue(value) {
            if (this.dataLoaded) {
                return;
            }
            this.currentValue = value;
            this.dataLoaded = true;
            this.updateView();
        }
        setOpenModalElement(template) {
            this.openModalTemplate = template;
            this.component.setContent(this.refs.openModalWrapper, template);
            this.loadRefs();
            this.setEventListeners();
        }
        loadRefs() {
            this.component.loadRefs(this.modal, {
                modalOverlay: 'single',
                modalContents: 'single',
                modalClose: 'single',
                openModalWrapper: 'single',
                openModal: 'single',
                modalSave: 'single',
                modalWrapper: 'single'
            });
        }
        setEventListeners() {
            this.component.addEventListener(this.refs.openModal, 'click', this.openModalHandler.bind(this));
            this.component.addEventListener(this.refs.modalOverlay, 'click', this.closeModalHandler.bind(this));
            this.component.addEventListener(this.refs.modalClose, 'click', this.closeModalHandler.bind(this));
            this.component.addEventListener(this.refs.modalSave, 'click', this.saveModalValueHandler.bind(this));
        }
        setOpenEventListener() {
            this.component.loadRefs(this.modal, { 'openModal': 'single' });
            this.component.addEventListener(this.refs.openModal, 'click', this.openModalHandler.bind(this));
        }
        openModalHandler(event) {
            event.preventDefault();
            this.refs.modalWrapper.classList.remove('component-rendering-hidden');
        }
        updateView() {
            const template = this.currentValue === this.component.defaultValue ? this.openModalTemplate : this.component.getModalPreviewTemplate();
            this.component.setContent(this.refs.openModalWrapper, template);
            this.setOpenEventListener();
        }
        closeModal() {
            this.refs.modalWrapper.classList.add('component-rendering-hidden');
            this.updateView();
        }
        closeModalHandler(event) {
            event.preventDefault();
            this.component.setValue(this.currentValue);
            this.closeModal();
        }
        saveModalValueHandler(event) {
            event.preventDefault();
            this.currentValue = this.component.dataValue;
            this.closeModal();
        }
    };
});
define('skylark-formio/components/_classes/component/Component',[
    '../../../vendors/vanilla-text-mask/conformToMask',
    '../../../vendors/getify/npo',
    '../../../vendors/tooltip-js/Tooltip',
    'skylark-lodash',
    '../../../vendors/ismobilejs/isMobile',
    '../../../Formio',
    '../../../utils/utils',
    '../../../validator/Validator',
    '../../../templates/Templates',
    '../../../utils/utils',
    '../../../Element',
    '../componentModal/ComponentModal'
], function (conformToMask, NativePromise, Tooltip, _, isMobile, Formio, FormioUtils, Validator, Templates, utils, Element, ComponentModal) {
    'use strict';
    const CKEDITOR = 'https://cdn.form.io/ckeditor/16.0.0/ckeditor.js';
    const QUILL_URL = 'https://cdn.form.io/quill/1.3.7';
    const ACE_URL = 'https://cdn.form.io/ace/1.4.8/ace.js';
    const TINYMCE_URL = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/5/tinymce.min.js';
    return class Component extends Element {
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
                refreshOn: '',
                redrawOn: '',
                tableView: false,
                modalEdit: false,
                label: '',
                labelPosition: 'top',
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
                widget: null,
                attributes: {},
                validateOn: 'change',
                validate: {
                    required: false,
                    custom: '',
                    customPrivate: false,
                    strictDateValidation: false,
                    multiple: false,
                    unique: false
                },
                conditional: {
                    show: null,
                    when: null,
                    eq: ''
                },
                overlay: {
                    style: '',
                    left: '',
                    top: '',
                    width: '',
                    height: ''
                },
                allowCalculateOverride: false,
                encrypted: false,
                showCharCount: false,
                showWordCount: false,
                properties: {},
                allowMultipleMasks: false
            }, ...sources);
        }
        static tableView(value, options) {
        }
        constructor(component, options, data) {
            super(Object.assign({
                renderMode: 'form',
                attachMode: 'full'
            }, options || {}));
            this._hasCondition = null;
            this.refs = {};
            if (component && this.options.components && this.options.components[component.type]) {
                _.merge(component, this.options.components[component.type]);
            }
            this.validator = Validator;
            this.path = '';
            this.component = this.mergeSchema(component || {});
            this.originalComponent = utils.fastCloneDeep(this.component);
            this.attached = false;
            this.rendered = false;
            this._data = data || {};
            this.component.id = this.id;
            this.error = '';
            this.tooltip = '';
            this.row = this.options.row;
            this._disabled = utils.boolValue(this.component.disabled) ? this.component.disabled : false;
            this.root = this.options.root;
            this.pristine = true;
            this.parent = this.options.parent;
            this.options.name = this.options.name || 'data';
            this.validators = [
                'required',
                'minLength',
                'maxLength',
                'minWords',
                'maxWords',
                'custom',
                'pattern',
                'json',
                'mask'
            ];
            this._path = '';
            this._parentVisible = this.options.hasOwnProperty('parentVisible') ? this.options.parentVisible : true;
            this._visible = this._parentVisible && this.conditionallyVisible(null, data);
            this._parentDisabled = false;
            let lastChanged = null;
            let triggerArgs = [];
            const _triggerChange = _.debounce((...args) => {
                if (this.root) {
                    this.root.changing = false;
                }
                triggerArgs = [];
                if (!args[1] && lastChanged) {
                    args[1] = lastChanged;
                }
                if (_.isEmpty(args[0]) && lastChanged) {
                    args[0] = lastChanged.flags;
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
                if (args.length) {
                    triggerArgs = args;
                }
                return _triggerChange(...triggerArgs);
            };
            this.triggerRedraw = _.debounce(this.redraw.bind(this), 100);
            this.tooltips = [];
            this.invalid = false;
            if (this.component) {
                this.type = this.component.type;
                if (this.allowData && this.key) {
                    this.options.name += `[${ this.key }]`;
                    if (this.visible || !this.component.clearOnHide) {
                        if (!this.hasValue()) {
                            this.dataValue = this.defaultValue;
                        } else {
                            this.dataValue = this.dataValue;
                        }
                    }
                }
                this.info = this.elementInfo();
            }
            this.hook('component');
            if (!this.options.skipInit) {
                this.init();
            }
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
        }
        mergeSchema(component = {}) {
            return _.defaultsDeep(component, this.defaultSchema);
        }
        get ready() {
            return NativePromise.resolve(this);
        }
        get labelInfo() {
            const label = {};
            label.hidden = this.labelIsHidden();
            label.className = '';
            label.labelPosition = this.component.labelPosition;
            label.tooltipClass = `${ this.iconClass('question-sign') } text-muted`;
            if (this.hasInput && this.component.validate && utils.boolValue(this.component.validate.required)) {
                label.className += ' field-required';
            }
            if (label.hidden) {
                label.className += ' control-label--hidden';
            }
            if (this.info.attr.id) {
                label.for = this.info.attr.id;
            }
            return label;
        }
        init() {
            this.disabled = this.shouldDisabled;
        }
        destroy() {
            super.destroy();
            this.detach();
        }
        get shouldDisabled() {
            return this.options.readOnly || this.component.disabled || this.options.hasOwnProperty('disabled') && this.options.disabled[this.key];
        }
        get isInputComponent() {
            return !this.component.hasOwnProperty('input') || this.component.input;
        }
        get allowData() {
            return this.hasInput;
        }
        get hasInput() {
            return this.isInputComponent || this.refs.input && this.refs.input.length;
        }
        get defaultSchema() {
            return Component.schema();
        }
        get key() {
            return _.get(this.component, 'key', '');
        }
        set parentVisible(value) {
            if (this._parentVisible !== value) {
                this._parentVisible = value;
                this.clearOnHide();
                this.redraw();
            }
        }
        get parentVisible() {
            return this._parentVisible;
        }
        set parentDisabled(value) {
            if (this._parentDisabled !== value) {
                this._parentDisabled = value;
                this.clearOnHide();
                this.redraw();
            }
        }
        get parentDisabled() {
            return this._parentDisabled;
        }
        set visible(value) {
            if (this._visible !== value) {
                this._visible = value;
                this.clearOnHide();
                this.redraw();
            }
        }
        get visible() {
            if (this.builderMode || this.options.showHiddenFields) {
                return true;
            }
            if (this.options.hide && this.options.hide[this.component.key]) {
                return false;
            }
            if (this.options.show && this.options.show[this.component.key]) {
                return true;
            }
            return this._visible && this._parentVisible;
        }
        get currentForm() {
            return this._currentForm;
        }
        set currentForm(instance) {
            this._currentForm = instance;
        }
        get fullMode() {
            return this.options.attachMode === 'full';
        }
        get builderMode() {
            return this.options.attachMode === 'builder';
        }
        get calculatedPath() {
            if (this._path) {
                return this._path;
            }
            this._path = this.key;
            if (!this.root) {
                return this._path;
            }
            let parent = this.parent;
            while (parent && parent.id !== this.root.id) {
                if ([
                        'datagrid',
                        'container',
                        'editgrid'
                    ].includes(parent.type) || parent.tree) {
                    this._path = `${ parent.key }.${ this._path }`;
                }
                parent = parent.parent;
            }
            return this._path;
        }
        get labelPosition() {
            return this.component.labelPosition;
        }
        get labelWidth() {
            return this.component.labelWidth || 30;
        }
        get labelMargin() {
            return this.component.labelMargin || 3;
        }
        get isAdvancedLabel() {
            return [
                'left-left',
                'left-right',
                'right-left',
                'right-right'
            ].includes(this.labelPosition);
        }
        get labelPositions() {
            return this.labelPosition.split('-');
        }
        rightDirection(direction) {
            return direction === 'right';
        }
        getLabelInfo() {
            const isRightPosition = this.rightDirection(this.labelPositions[0]);
            const isRightAlign = this.rightDirection(this.labelPositions[1]);
            const labelStyles = `
      flex: ${ this.labelWidth };
      ${ isRightPosition ? 'margin-left' : 'margin-right' }:${ this.labelMargin }%;
    `;
            const contentStyles = `
      flex: ${ 100 - this.labelWidth - this.labelMargin };
    `;
            return {
                isRightPosition,
                isRightAlign,
                labelStyles,
                contentStyles
            };
        }
        getModifiedSchema(schema, defaultSchema, recursion) {
            const modified = {};
            if (!defaultSchema) {
                return schema;
            }
            _.each(schema, (val, key) => {
                if (!_.isArray(val) && _.isObject(val) && defaultSchema.hasOwnProperty(key)) {
                    const subModified = this.getModifiedSchema(val, defaultSchema[key], true);
                    if (!_.isEmpty(subModified)) {
                        modified[key] = subModified;
                    }
                } else if (_.isArray(val)) {
                    if (val.length !== 0) {
                        modified[key] = val;
                    }
                } else if (!recursion && key === 'type' || !recursion && key === 'key' || !recursion && key === 'label' || !recursion && key === 'input' || !recursion && key === 'tableView' || val !== '' && !defaultSchema.hasOwnProperty(key) || val !== '' && val !== defaultSchema[key]) {
                    modified[key] = val;
                }
            });
            return modified;
        }
        get schema() {
            return utils.fastCloneDeep(this.getModifiedSchema(_.omit(this.component, 'id'), this.defaultSchema));
        }
        t(text, params) {
            if (!text) {
                return '';
            }
            params = params || {};
            params.data = this.rootValue;
            params.row = this.data;
            params.component = this.component;
            params.nsSeparator = '::';
            params.keySeparator = '.|.';
            params.pluralSeparator = '._.';
            params.contextSeparator = '._.';
            const translated = this.i18next.t(text, params);
            return translated || text;
        }
        labelIsHidden() {
            return !this.component.label || !this.inDataGrid && this.component.hideLabel || this.inDataGrid && !this.component.dataGridLabel || this.options.inputsOnly;
        }
        get transform() {
            return Templates.current.hasOwnProperty('transform') ? Templates.current.transform.bind(Templates.current) : (type, value) => value;
        }
        getTemplate(names, modes) {
            modes = Array.isArray(modes) ? modes : [modes];
            names = Array.isArray(names) ? names : [names];
            if (!modes.includes('form')) {
                modes.push('form');
            }
            let result = null;
            if (this.options.templates) {
                result = this.checkTemplate(this.options.templates, names, modes);
                if (result) {
                    return result;
                }
            }
            const frameworkTemplates = this.options.template ? Templates.templates[this.options.template] : Templates.current;
            result = this.checkTemplate(frameworkTemplates, names, modes);
            if (result) {
                return result;
            }
            const name = names[names.length - 1];
            const templatesByName = Templates.defaultTemplates[name];
            if (!templatesByName) {
                return `Unknown template: ${ name }`;
            }
            const templateByMode = this.checkTemplateMode(templatesByName, modes);
            if (templateByMode) {
                return templateByMode;
            }
            return templatesByName.form;
        }
        checkTemplate(templates, names, modes) {
            for (const name of names) {
                const templatesByName = templates[name];
                if (templatesByName) {
                    const templateByMode = this.checkTemplateMode(templatesByName, modes);
                    if (templateByMode) {
                        return templateByMode;
                    }
                }
            }
            return null;
        }
        checkTemplateMode(templatesByName, modes) {
            for (const mode of modes) {
                const templateByMode = templatesByName[mode];
                if (templateByMode) {
                    return templateByMode;
                }
            }
            return null;
        }
        renderTemplate(name, data = {}, modeOption) {
            const mode = modeOption || this.options.renderMode || 'form';
            data.component = this.component;
            data.self = this;
            data.options = this.options;
            data.readOnly = this.options.readOnly;
            data.iconClass = this.iconClass.bind(this);
            data.t = this.t.bind(this);
            data.transform = this.transform;
            data.id = data.id || this.id;
            data.key = data.key || this.key;
            data.value = data.value || this.dataValue;
            data.disabled = this.disabled;
            data.builder = this.builderMode;
            data.render = (...args) => {
                console.warn(`Form.io 'render' template function is deprecated.
      If you need to render template (template A) inside of another template (template B),
      pass pre-compiled template A (use this.renderTemplate('template_A_name') as template context variable for template B`);
                return this.renderTemplate(...args);
            };
            data.label = this.labelInfo;
            data.tooltip = this.interpolate(this.component.tooltip || '').replace(/(?:\r\n|\r|\n)/g, '<br />');
            const names = [
                `${ name }-${ this.component.type }-${ this.key }`,
                `${ name }-${ this.component.type }`,
                `${ name }-${ this.key }`,
                `${ name }`
            ];
            return this.hook(`render${ name.charAt(0).toUpperCase() + name.substring(1, name.length) }`, this.interpolate(this.getTemplate(names, mode), data), data, mode);
        }
        sanitize(dirty) {
            return FormioUtils.sanitize(dirty, this.options);
        }
        renderString(template, data) {
            if (!template) {
                return '';
            }
            return this.interpolate(template, data);
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
        beforePage() {
            return NativePromise.resolve(true);
        }
        beforeNext() {
            return this.beforePage(true);
        }
        beforeSubmit() {
            return NativePromise.resolve(true);
        }
        get submissionTimezone() {
            this.options.submissionTimezone = this.options.submissionTimezone || _.get(this.root, 'options.submissionTimezone');
            return this.options.submissionTimezone;
        }
        loadRefs(element, refs) {
            for (const ref in refs) {
                if (refs[ref] === 'single') {
                    this.refs[ref] = element.querySelector(`[ref="${ ref }"]`);
                } else {
                    this.refs[ref] = element.querySelectorAll(`[ref="${ ref }"]`);
                }
            }
        }
        setOpenModalElement() {
            const template = `
      <label class="control-label">${ this.component.label }</label><br>
      <button lang='en' class='btn btn-light btn-md open-modal-button' ref='openModal'>Click to set value</button>
    `;
            this.componentModal.setOpenModalElement(template);
        }
        getModalPreviewTemplate() {
            return `
      <label class="control-label">${ this.component.label }</label><br>
      <button lang='en' class='btn btn-light btn-md open-modal-button' ref='openModal'>${ this.getValueAsString(this.dataValue) }</button>`;
        }
        build(element) {
            element = element || this.element;
            this.empty(element);
            this.setContent(element, this.render());
            return this.attach(element);
        }
        render(children = `Unknown component: ${ this.component.type }`, topLevel = false) {
            const isVisible = this.visible;
            this.rendered = true;
            if (!this.builderMode && this.component.modalEdit) {
                return ComponentModal.render(this, {
                    visible: isVisible,
                    id: this.id,
                    classes: this.className,
                    styles: this.customStyle,
                    children
                }, topLevel);
            } else {
                return this.renderTemplate('component', {
                    visible: isVisible,
                    id: this.id,
                    classes: this.className,
                    styles: this.customStyle,
                    children
                }, topLevel);
            }
        }
        attach(element) {
            if (!this.builderMode && this.component.modalEdit) {
                this.componentModal = new ComponentModal(this, element);
                this.setOpenModalElement();
            }
            this.attached = true;
            this.element = element;
            element.component = this;
            if (this.element.id) {
                this.id = this.element.id;
            }
            this.loadRefs(element, {
                messageContainer: 'single',
                tooltip: 'multiple'
            });
            this.refs.tooltip.forEach((tooltip, index) => {
                const title = this.interpolate(tooltip.getAttribute('data-title') || this.t(this.component.tooltip)).replace(/(?:\r\n|\r|\n)/g, '<br />');
                this.tooltips[index] = new Tooltip(tooltip, {
                    trigger: 'hover click focus',
                    placement: 'right',
                    html: true,
                    title: title,
                    template: `
          <div class="tooltip" style="opacity: 1;" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner"></div>
          </div>`
                });
            });
            this.attachLogic();
            this.autofocus();
            this.hook('attachComponent', element, this);
            const type = this.component.type;
            if (type) {
                this.hook(`attach${ type.charAt(0).toUpperCase() + type.substring(1, type.length) }`, element, this);
            }
            return NativePromise.resolve();
        }
        addShortcut(element, shortcut) {
            if (!element || !this.root || this.root === this) {
                return;
            }
            if (!shortcut) {
                shortcut = this.component.shortcut;
            }
            this.root.addShortcut(element, shortcut);
        }
        removeShortcut(element, shortcut) {
            if (!element || this.root === this) {
                return;
            }
            if (!shortcut) {
                shortcut = this.component.shortcut;
            }
            this.root.removeShortcut(element, shortcut);
        }
        detach() {
            this.refs = {};
            this.removeEventListeners();
            this.detachLogic();
            if (this.tooltip) {
                this.tooltip.dispose();
            }
        }
        checkRefresh(refreshData, changed) {
            const changePath = _.get(changed, 'instance.calculatedPath', false);
            if (changePath && this.calculatedPath === changePath) {
                return;
            }
            if (refreshData === 'data') {
                this.refresh(this.data);
            } else if (changePath && changePath === refreshData && changed && changed.instance && this.inContext(changed.instance)) {
                this.refresh(changed.value);
            }
        }
        checkRefreshOn(changed) {
            const refreshOn = this.component.refreshOn || this.component.redrawOn;
            if (refreshOn) {
                if (Array.isArray(refreshOn)) {
                    refreshOn.forEach(refreshData => {
                        this.checkRefresh(refreshData, changed);
                    });
                } else {
                    this.checkRefresh(refreshOn, changed);
                }
            }
        }
        refresh(value) {
            if (this.hasOwnProperty('refreshOnValue')) {
                this.refreshOnChanged = !_.isEqual(value, this.refreshOnValue);
            } else {
                this.refreshOnChanged = true;
            }
            this.refreshOnValue = utils.fastCloneDeep(value);
            if (this.refreshOnChanged) {
                if (this.component.clearOnRefresh) {
                    this.setValue(null);
                }
                this.triggerRedraw();
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
        get viewOnly() {
            return this.options.readOnly && this.options.viewAsHtml;
        }
        createViewOnlyElement() {
            this.element = this.ce('dl', { id: this.id });
            if (this.element) {
                this.element.component = this;
            }
            return this.element;
        }
        get defaultViewOnlyValue() {
            return '-';
        }
        getWidgetValueAsString(value) {
            const noInputWidget = !this.refs.input || !this.refs.input[0] || !this.refs.input[0].widget;
            if (!value || noInputWidget) {
                return value;
            }
            if (Array.isArray(value)) {
                const values = [];
                value.forEach((val, index) => {
                    const widget = this.refs.input[index] && this.refs.input[index].widge;
                    if (widget) {
                        values.push(widget.getValueAsString(val));
                    }
                });
                return values;
            }
            const widget = this.refs.input[0].widget;
            return widget.getValueAsString(value);
        }
        getValueAsString(value) {
            if (!value) {
                return '';
            }
            value = this.getWidgetValueAsString(value);
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            if (_.isPlainObject(value)) {
                return JSON.stringify(value);
            }
            if (value === null || value === undefined) {
                return '';
            }
            return value.toString();
        }
        getView(value) {
            if (this.component.protected) {
                return '--- PROTECTED ---';
            }
            return this.getValueAsString(value);
        }
        updateItems(...args) {
            this.restoreValue();
            this.onChange(...args);
        }
        itemValue(data, forceUseValue = false) {
            if (_.isObject(data)) {
                if (this.valueProperty) {
                    return _.get(data, this.valueProperty);
                }
                if (forceUseValue) {
                    return data.value;
                }
            }
            return data;
        }
        itemValueForHTMLMode(value) {
            if (Array.isArray(value)) {
                const values = value.map(item => Array.isArray(item) ? this.itemValueForHTMLMode(item) : this.itemValue(item));
                return values.join(', ');
            }
            return this.itemValue(value);
        }
        createModal(element, attr) {
            const dialog = this.ce('div', attr || {});
            this.setContent(dialog, this.renderTemplate('dialog'));
            dialog.refs = {};
            this.loadRefs.call(dialog, dialog, {
                dialogOverlay: 'single',
                dialogContents: 'single',
                dialogClose: 'single'
            });
            dialog.refs.dialogContents.appendChild(element);
            document.body.appendChild(dialog);
            document.body.classList.add('modal-open');
            dialog.close = () => {
                document.body.classList.remove('modal-open');
                dialog.dispatchEvent(new CustomEvent('close'));
            };
            this.addEventListener(dialog, 'close', () => this.removeChildFrom(dialog, document.body));
            const close = event => {
                event.preventDefault();
                dialog.close();
            };
            this.addEventListener(dialog.refs.dialogOverlay, 'click', close);
            this.addEventListener(dialog.refs.dialogClose, 'click', close);
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
            if (this.hasInput && this.component.validate && utils.boolValue(this.component.validate.required)) {
                className += ' required';
            }
            if (this.labelIsHidden()) {
                className += ' formio-component-label-hidden';
            }
            if (!this.visible) {
                className += ' formio-hidden';
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
        get isMobile() {
            return isMobile();
        }
        getElement() {
            return this.element;
        }
        evalContext(additional) {
            return super.evalContext(Object.assign({
                component: this.component,
                row: this.data,
                rowIndex: this.rowIndex,
                data: this.rootValue,
                iconClass: this.iconClass.bind(this),
                submission: this.root ? this.root._submission : {},
                form: this.root ? this.root._form : {}
            }, additional));
        }
        setPristine(pristine) {
            this.pristine = pristine;
        }
        removeValue(index) {
            this.splice(index);
            this.redraw();
            this.restoreValue();
            this.triggerRootChange();
        }
        iconClass(name, spinning) {
            const iconset = this.options.iconset || Templates.current.defaultIconset || 'fa';
            return Templates.current.hasOwnProperty('iconClass') ? Templates.current.iconClass(iconset, name, spinning) : this.options.iconset === 'fa' ? Templates.defaultTemplates.iconClass(iconset, name, spinning) : name;
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
        setContent(element, content) {
            if (element instanceof HTMLElement) {
                element.innerHTML = this.sanitize(content);
                return true;
            }
            return false;
        }
        redraw() {
            if (!this.element || !this.element.parentNode) {
                return NativePromise.resolve();
            }
            this.clear();
            const parent = this.element.parentNode;
            const index = Array.prototype.indexOf.call(parent.children, this.element);
            this.element.outerHTML = this.sanitize(this.render());
            this.element = parent.children[index];
            return this.attach(this.element);
        }
        rebuild() {
            this.destroy();
            this.init();
            return this.redraw();
        }
        removeEventListeners() {
            super.removeEventListeners();
            this.tooltips.forEach(tooltip => tooltip.dispose());
            this.tooltips = [];
            this.refs.input = [];
        }
        hasClass(element, className) {
            if (!element) {
                return;
            }
            return super.hasClass(element, this.transform('class', className));
        }
        addClass(element, className) {
            if (!element) {
                return;
            }
            return super.addClass(element, this.transform('class', className));
        }
        removeClass(element, className) {
            if (!element) {
                return;
            }
            return super.removeClass(element, this.transform('class', className));
        }
        hasCondition() {
            if (this._hasCondition !== null) {
                return this._hasCondition;
            }
            this._hasCondition = FormioUtils.hasCondition(this.component);
            return this._hasCondition;
        }
        conditionallyVisible(data, row) {
            data = data || this.rootValue;
            row = row || this.data;
            if (this.builderMode || !this.hasCondition()) {
                return !this.component.hidden;
            }
            data = data || (this.root ? this.root.data : {});
            return this.checkCondition(row, data);
        }
        checkCondition(row, data) {
            return FormioUtils.checkCondition(this.component, row || this.data, data || this.rootValue, this.root ? this.root._form : {}, this);
        }
        checkComponentConditions(data, flags, row) {
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            if (!this.builderMode && this.fieldLogic(data, row)) {
                this.redraw();
            }
            const visible = this.conditionallyVisible(data, row);
            if (this.visible !== visible) {
                this.visible = visible;
            }
            return visible;
        }
        checkConditions(data, flags, row) {
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            return this.checkComponentConditions(data, flags, row);
        }
        get logic() {
            return this.component.logic || [];
        }
        fieldLogic(data, row) {
            data = data || this.rootValue;
            row = row || this.data;
            const logics = this.logic;
            if (logics.length === 0) {
                return;
            }
            const newComponent = utils.fastCloneDeep(this.originalComponent);
            let changed = logics.reduce((changed, logic) => {
                const result = FormioUtils.checkTrigger(newComponent, logic.trigger, row, data, this.root ? this.root._form : {}, this);
                return (result ? this.applyActions(newComponent, logic.actions, result, row, data) : false) || changed;
            }, false);
            if (!_.isEqual(this.component, newComponent)) {
                this.component = newComponent;
                this.disabled = this.shouldDisabled;
                changed = true;
            }
            return changed;
        }
        isIE() {
            const userAgent = window.navigator.userAgent;
            const msie = userAgent.indexOf('MSIE ');
            if (msie > 0) {
                return parseInt(userAgent.substring(msie + 5, userAgent.indexOf('.', msie)), 10);
            }
            const trident = userAgent.indexOf('Trident/');
            if (trident > 0) {
                const rv = userAgent.indexOf('rv:');
                return parseInt(userAgent.substring(rv + 3, userAgent.indexOf('.', rv)), 10);
            }
            const edge = userAgent.indexOf('Edge/');
            if (edge > 0) {
                return parseInt(userAgent.substring(edge + 5, userAgent.indexOf('.', edge)), 10);
            }
            return false;
        }
        applyActions(newComponent, actions, result, row, data) {
            data = data || this.rootValue;
            row = row || this.data;
            return actions.reduce((changed, action) => {
                switch (action.type) {
                case 'property': {
                        FormioUtils.setActionProperty(newComponent, action, result, row, data, this);
                        const property = action.property.value;
                        if (!_.isEqual(_.get(this.component, property), _.get(newComponent, property))) {
                            changed = true;
                        }
                        break;
                    }
                case 'value': {
                        const oldValue = this.getValue();
                        const newValue = this.evaluate(action.value, {
                            value: _.clone(oldValue),
                            data,
                            row,
                            component: newComponent,
                            result
                        }, 'value');
                        if (!_.isEqual(oldValue, newValue)) {
                            this.setValue(newValue);
                            if (this.viewOnly) {
                                this.dataValue = newValue;
                            }
                            changed = true;
                        }
                        break;
                    }
                case 'mergeComponentSchema': {
                        const schema = this.evaluate(action.schemaDefinition, {
                            value: _.clone(this.getValue()),
                            data,
                            row,
                            component: newComponent,
                            result
                        }, 'schema');
                        _.assign(newComponent, schema);
                        if (!_.isEqual(this.component, newComponent)) {
                            changed = true;
                        }
                        break;
                    }
                }
                return changed;
            }, false);
        }
        addInputError(message, dirty, elements) {
            this.addMessages(message);
            this.setErrorClasses(elements, dirty, !!message);
        }
        removeInputError(elements) {
            this.setErrorClasses(elements, true, false);
        }
        addMessages(messages) {
            if (!messages) {
                return;
            }
            if (typeof messages === 'string') {
                messages = {
                    messages,
                    level: 'error'
                };
            }
            if (!Array.isArray(messages)) {
                messages = [messages];
            }
            if (this.refs.messageContainer) {
                this.setContent(this.refs.messageContainer, messages.map(message => this.renderTemplate('message', message)).join(''));
            }
        }
        setErrorClasses(elements, dirty, hasErrors, hasMessages) {
            this.clearErrorClasses();
            elements.forEach(element => this.removeClass(this.performInputMapping(element), 'is-invalid'));
            if (hasErrors) {
                elements.forEach(input => this.addClass(this.performInputMapping(input), 'is-invalid'));
                if (dirty && this.options.highlightErrors) {
                    this.addClass(this.element, this.options.componentErrorClass);
                } else {
                    this.addClass(this.element, 'has-error');
                }
            }
            if (hasMessages) {
                this.addClass(this.element, 'has-message');
            }
        }
        clearOnHide() {
            if (!this.rootPristine && this.component.clearOnHide !== false && !this.options.readOnly && !this.options.showHiddenFields) {
                if (!this.visible) {
                    this.deleteValue();
                } else if (!this.hasValue()) {
                    this.setValue(this.defaultValue, { noUpdateEvent: true });
                }
            }
        }
        triggerRootChange(...args) {
            if (this.options.onChange) {
                this.options.onChange(...args);
            } else if (this.root) {
                this.root.triggerChange(...args);
            }
        }
        onChange(flags, fromRoot) {
            flags = flags || {};
            if (flags.modified) {
                this.pristine = false;
                this.addClass(this.getElement(), 'formio-modified');
            }
            if (this.component.validateOn === 'blur' && !this.errors.length) {
                flags.noValidate = true;
            }
            if (this.component.onChange) {
                this.evaluate(this.component.onChange, { flags });
            }
            const changed = {
                instance: this,
                component: this.component,
                value: this.dataValue,
                flags: flags
            };
            this.emit('componentChange', changed);
            let modified = false;
            if (flags.modified) {
                modified = true;
                delete flags.modified;
            }
            if (!fromRoot) {
                this.triggerRootChange(flags, changed, modified);
            }
            return changed;
        }
        get wysiwygDefault() {
            return {
                quill: {
                    theme: 'snow',
                    placeholder: this.t(this.component.placeholder),
                    modules: {
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
                },
                ace: {
                    theme: 'ace/theme/xcode',
                    maxLines: 12,
                    minLines: 12,
                    tabSize: 2,
                    mode: 'javascript',
                    placeholder: this.t(this.component.placeholder)
                },
                ckeditor: {
                    image: {
                        toolbar: [
                            'imageTextAlternative',
                            '|',
                            'imageStyle:full',
                            'imageStyle:alignLeft',
                            'imageStyle:alignCenter',
                            'imageStyle:alignRight'
                        ],
                        styles: [
                            'full',
                            'alignLeft',
                            'alignCenter',
                            'alignRight'
                        ]
                    }
                },
                tiny: { theme: 'silver' },
                default: {}
            };
        }
        addCKE(element, settings, onChange) {
            settings = _.isEmpty(settings) ? {} : settings;
            settings.base64Upload = true;
            settings.mediaEmbed = { previewsInData: true };
            settings = _.merge(this.wysiwygDefault.ckeditor, _.get(this.options, 'editors.ckeditor.settings', {}), settings);
            return Formio.requireLibrary('ckeditor', 'ClassicEditor', _.get(this.options, 'editors.ckeditor.src', CKEDITOR), true).then(() => {
                if (!element.parentNode) {
                    return NativePromise.reject();
                }
                return ClassicEditor.create(element, settings).then(editor => {
                    editor.model.document.on('change', () => onChange(editor.data.get()));
                    return editor;
                });
            });
        }
        addQuill(element, settings, onChange) {
            settings = _.isEmpty(settings) ? this.wysiwygDefault.quill : settings;
            settings = _.merge(this.wysiwygDefault.quill, _.get(this.options, 'editors.quill.settings', {}), settings);
            Formio.requireLibrary(`quill-css-${ settings.theme }`, 'Quill', [{
                    type: 'styles',
                    src: `${ QUILL_URL }/quill.${ settings.theme }.css`
                }], true);
            return Formio.requireLibrary('quill', 'Quill', _.get(this.options, 'editors.quill.src', `${ QUILL_URL }/quill.min.js`), true).then(() => {
                if (!element.parentNode) {
                    return NativePromise.reject();
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
        addAce(element, settings, onChange) {
            settings = _.merge(this.wysiwygDefault.ace, _.get(this.options, 'editors.ace.settings', {}), settings || {});
            return Formio.requireLibrary('ace', 'ace', _.get(this.options, 'editors.ace.src', ACE_URL), true).then(editor => {
                editor = editor.edit(element);
                editor.removeAllListeners('change');
                editor.setOptions(settings);
                editor.getSession().setMode(`ace/mode/${ settings.mode }`);
                editor.on('change', () => onChange(editor.getValue()));
                return editor;
            });
        }
        addTiny(element, settings, onChange) {
            return Formio.requireLibrary('tinymce', 'tinymce', TINYMCE_URL.replace('no-api-key', settings.tinyApiKey), true).then(editor => {
                return editor.init({
                    ...settings,
                    target: element,
                    init_instance_callback: editor => {
                        editor.on('Change', () => onChange(editor.getContent()));
                    }
                });
            });
        }
        get tree() {
            return this.component.tree || false;
        }
        get emptyValue() {
            return null;
        }
        hasValue(data) {
            return _.has(data || this.data, this.key);
        }
        get rootValue() {
            return this.root ? this.root.data : this.data;
        }
        get rootPristine() {
            return _.get(this, 'root.pristine', false);
        }
        get dataValue() {
            if (!this.key || !this.visible && this.component.clearOnHide && !this.rootPristine) {
                return this.emptyValue;
            }
            if (!this.hasValue()) {
                const empty = this.component.multiple ? [] : this.emptyValue;
                if (!this.rootPristine) {
                    this.dataValue = empty;
                }
                return empty;
            }
            return _.get(this._data, this.key);
        }
        set dataValue(value) {
            if (!this.allowData || !this.key || !this.visible && this.component.clearOnHide && !this.rootPristine) {
                return value;
            }
            if (value !== null && value !== undefined) {
                value = this.hook('setDataValue', value, this.key, this._data);
            }
            if (value === null || value === undefined) {
                this.unset();
                return value;
            }
            _.set(this._data, this.key, value);
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
        unset() {
            _.unset(this._data, this.key);
        }
        deleteValue() {
            this.setValue(null, {
                noUpdateEvent: true,
                noDefault: true
            });
            this.unset();
        }
        get defaultValue() {
            let defaultValue = this.emptyValue;
            if (this.component.defaultValue) {
                defaultValue = this.component.defaultValue;
            }
            if (this.component.customDefaultValue && !this.options.preview) {
                defaultValue = this.evaluate(this.component.customDefaultValue, { value: '' }, 'value');
            }
            if (this.defaultMask) {
                if (typeof defaultValue === 'string') {
                    defaultValue = conformToMask(defaultValue, this.defaultMask).conformedValue;
                    if (!FormioUtils.matchInputMask(defaultValue, this.defaultMask)) {
                        defaultValue = '';
                    }
                } else {
                    defaultValue = '';
                }
            }
            return _.cloneDeep(defaultValue);
        }
        getValue() {
            if (!this.hasInput || this.viewOnly || !this.refs.input || !this.refs.input.length) {
                return this.dataValue;
            }
            const values = [];
            for (const i in this.refs.input) {
                if (this.refs.input.hasOwnProperty(i)) {
                    if (!this.component.multiple) {
                        return this.getValueAt(i);
                    }
                    values.push(this.getValueAt(i));
                }
            }
            if (values.length === 0 && !this.component.multiple) {
                return '';
            }
            return values;
        }
        getValueAt(index) {
            const input = this.performInputMapping(this.refs.input[index]);
            return input ? input.value : undefined;
        }
        setValue(value, flags = {}) {
            const changed = this.updateValue(value, flags);
            if (this.componentModal && flags && flags.fromSubmission) {
                this.componentModal.setValue(value);
            }
            value = this.dataValue;
            if (!this.hasInput) {
                return changed;
            }
            const isArray = Array.isArray(value);
            if (isArray && Array.isArray(this.defaultValue) && this.refs.hasOwnProperty('input') && this.refs.input && this.refs.input.length !== value.length) {
                this.redraw();
            }
            for (const i in this.refs.input) {
                if (this.refs.input.hasOwnProperty(i)) {
                    this.setValueAt(i, isArray ? value[i] : value, flags);
                }
            }
            return changed;
        }
        setValueAt(index, value, flags = {}) {
            if (!flags.noDefault && (value === null || value === undefined) && !this.component.multiple) {
                value = this.defaultValue;
            }
            const input = this.performInputMapping(this.refs.input[index]);
            if (input.mask) {
                input.mask.textMaskInputElement.update(value);
            } else if (input.widget && input.widget.setValue) {
                input.widget.setValue(value);
            } else {
                input.value = value;
            }
        }
        get hasSetValue() {
            return this.hasValue() && !this.isEmpty(this.dataValue);
        }
        restoreValue() {
            if (this.hasSetValue) {
                this.setValue(this.dataValue, { noUpdateEvent: true });
            } else {
                if (this.defaultValue) {
                    const defaultValue = this.component.multiple && !this.dataValue.length ? [] : this.defaultValue;
                    this.setValue(defaultValue, { noUpdateEvent: true });
                }
            }
        }
        normalizeValue(value) {
            if (this.component.multiple && !Array.isArray(value)) {
                value = value ? [value] : [];
            }
            return value;
        }
        updateComponentValue(value, flags = {}) {
            let newValue = !flags.resetValue && (value === undefined || value === null) ? this.getValue() : value;
            newValue = this.normalizeValue(newValue, flags);
            const changed = newValue !== undefined ? this.hasChanged(newValue, this.dataValue) : false;
            if (changed) {
                this.dataValue = newValue;
                this.updateOnChange(flags, changed);
            }
            return changed;
        }
        updateValue(...args) {
            return this.updateComponentValue(...args);
        }
        getIcon(name, content, styles, ref = 'icon') {
            return this.renderTemplate('icon', {
                className: this.iconClass(name),
                ref,
                styles,
                content
            });
        }
        resetValue() {
            this.setValue(this.emptyValue, {
                noUpdateEvent: true,
                noValidate: true,
                resetValue: true
            });
            this.unset();
        }
        hasChanged(newValue, oldValue) {
            if ((newValue === undefined || newValue === null) && (oldValue === undefined || oldValue === null || this.isEmpty(oldValue))) {
                return false;
            }
            if (newValue !== undefined && newValue !== null && !this.hasValue()) {
                return true;
            }
            return !_.isEqual(newValue, oldValue);
        }
        updateOnChange(flags = {}, changed = false) {
            if (!flags.noUpdateEvent && changed) {
                this.triggerChange(flags);
                return true;
            }
            return false;
        }
        convertNumberOrBoolToString(value) {
            if (typeof value === 'number' || typeof value === 'boolean') {
                return value.toString();
            }
            return value;
        }
        calculateComponentValue(data, flags, row) {
            if (!this.component.calculateValue || (!this.visible || this.component.hidden) && this.component.clearOnHide && !this.rootPristine) {
                return false;
            }
            const allowOverride = this.component.allowCalculateOverride;
            let firstPass = false;
            const dataValue = this.dataValue;
            if (this.calculatedValue === undefined) {
                firstPass = true;
                this.calculatedValue = null;
            }
            if (allowOverride && this.calculatedValue && !_.isEqual(dataValue, this.convertNumberOrBoolToString(this.calculatedValue))) {
                return false;
            }
            const calculatedValue = this.evaluate(this.component.calculateValue, {
                value: dataValue,
                data,
                row: row || this.data
            }, 'value');
            if (allowOverride && firstPass && !this.isEmpty(dataValue) && !_.isEqual(dataValue, this.convertNumberOrBoolToString(calculatedValue))) {
                this.calculatedValue = calculatedValue;
                return true;
            }
            const changed = this.setValue(calculatedValue, flags);
            this.calculatedValue = this.dataValue;
            return changed;
        }
        calculateValue(data, flags, row) {
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            return this.calculateComponentValue(data, flags, row);
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
        invalidMessage(data, dirty, ignoreCondition, row) {
            if (!ignoreCondition && !this.checkCondition(row, data)) {
                return '';
            }
            if (this.invalid) {
                return this.invalid;
            }
            if (!this.hasInput || !dirty && this.pristine) {
                return '';
            }
            return _.map(Validator.checkComponent(this, data), 'message').join('\n\n');
        }
        isValid(data, dirty) {
            return !this.invalidMessage(data, dirty);
        }
        setComponentValidity(messages, dirty) {
            const hasErrors = !!messages.filter(message => message.level === 'error').length;
            if (messages.length && (dirty || !this.pristine)) {
                this.setCustomValidity(messages, dirty);
            } else {
                this.setCustomValidity('');
            }
            return !hasErrors;
        }
        checkComponentValidity(data, dirty, row, async = false) {
            data = data || this.rootValue;
            row = row || this.data;
            if (this.shouldSkipValidation(data, dirty, row)) {
                this.setCustomValidity('');
                return async ? NativePromise.resolve(true) : true;
            }
            const check = Validator.checkComponent(this, data, row, true, async);
            return async ? check.then(messages => this.setComponentValidity(messages, dirty)) : this.setComponentValidity(check, dirty);
        }
        checkValidity(data, dirty, row) {
            data = data || this.rootValue;
            row = row || this.data;
            return this.checkComponentValidity(data, dirty, row);
        }
        checkAsyncValidity(data, dirty, row) {
            return NativePromise.resolve(this.checkComponentValidity(data, dirty, row, true));
        }
        checkData(data, flags, row) {
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            this.checkRefreshOn(flags.changed);
            if (flags.noCheck) {
                return true;
            }
            this.calculateComponentValue(data, flags, row);
            this.checkComponentConditions(data, flags, row);
            if (flags.noValidate) {
                return true;
            }
            let isDirty = !this.builderMode && !this.options.preview && !this.isEmpty(this.defaultValue) && this.isEqual(this.defaultValue, this.dataValue);
            if (this.options.alwaysDirty || flags.dirty) {
                isDirty = true;
            }
            if (flags.fromSubmission && this.hasValue(data)) {
                isDirty = true;
            }
            return this.checkComponentValidity(data, isDirty, row);
        }
        get validationValue() {
            return this.dataValue;
        }
        isEmpty(value = this.dataValue) {
            const isEmptyArray = _.isArray(value) && value.length === 1 ? _.isEqual(value[0], this.emptyValue) : false;
            return value == null || value.length === 0 || _.isEqual(value, this.emptyValue) || isEmptyArray;
        }
        isEqual(valueA, valueB = this.dataValue) {
            return this.isEmpty(valueA) && this.isEmpty(valueB) || _.isEqual(valueA, valueB);
        }
        validateMultiple() {
            return true;
        }
        get errors() {
            return this.error ? [this.error] : [];
        }
        clearErrorClasses() {
            this.removeClass(this.element, this.options.componentErrorClass);
            this.removeClass(this.element, 'alert alert-danger');
            this.removeClass(this.element, 'has-error');
            this.removeClass(this.element, 'has-message');
        }
        setCustomValidity(messages, dirty, external) {
            if (typeof messages === 'string' && messages) {
                messages = {
                    level: 'error',
                    message: messages
                };
            }
            if (!Array.isArray(messages)) {
                if (messages) {
                    messages = [messages];
                } else {
                    messages = [];
                }
            }
            const hasErrors = !!messages.filter(message => message.level === 'error').length;
            if (messages.length) {
                if (this.refs.messageContainer) {
                    this.empty(this.refs.messageContainer);
                }
                this.error = {
                    component: this.component,
                    message: messages[0].message,
                    messages,
                    external: !!external
                };
                this.emit('componentError', this.error);
                this.addMessages(messages, dirty, this.refs.input);
                if (this.refs.input) {
                    this.setErrorClasses(this.refs.input, dirty, hasErrors, !!messages.length);
                }
            } else if (this.error && this.error.external === !!external) {
                if (this.refs.messageContainer) {
                    this.empty(this.refs.messageContainer);
                }
                this.error = null;
                if (this.refs.input) {
                    this.setErrorClasses(this.refs.input, dirty, hasErrors, !!messages.length);
                }
                this.clearErrorClasses();
            }
        }
        isValueHidden() {
            if (!this.root || !this.root.hasOwnProperty('editing')) {
                return false;
            }
            if (!this.root || !this.root.editing) {
                return false;
            }
            return this.component.protected || !this.component.persistent || this.component.persistent === 'client-only';
        }
        shouldSkipValidation(data, dirty, row) {
            const rules = [
                () => this.shouldDisabled,
                () => this.isValueHidden(),
                () => !this.visible,
                () => !this.checkCondition(row, data)
            ];
            return rules.some(pred => pred());
        }
        whenReady() {
            console.warn('The whenReady() method has been deprecated. Please use the dataReady property instead.');
            return this.dataReady;
        }
        get dataReady() {
            return NativePromise.resolve();
        }
        asString(value) {
            value = value || this.getValue();
            return (Array.isArray(value) ? value : [value]).map(_.toString).join(', ');
        }
        get disabled() {
            return this._disabled || this.parentDisabled;
        }
        set disabled(disabled) {
            this._disabled = disabled;
        }
        setDisabled(element, disabled) {
            if (!element) {
                return;
            }
            element.disabled = disabled;
            if (disabled) {
                element.setAttribute('disabled', 'disabled');
            } else {
                element.removeAttribute('disabled');
            }
        }
        setLoading(element, loading) {
            if (!element || element.loading === loading) {
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
                select.onselect();
            }
        }
        clear() {
            this.detach();
            this.empty(this.getElement());
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
        detachLogic() {
            this.logic.forEach(logic => {
                if (logic.trigger.type === 'event') {
                    const event = this.interpolate(logic.trigger.event);
                    this.off(event);
                }
            });
        }
        attachLogic() {
            if (this.builderMode) {
                return;
            }
            this.logic.forEach(logic => {
                if (logic.trigger.type === 'event') {
                    const event = this.interpolate(logic.trigger.event);
                    this.on(event, (...args) => {
                        const newComponent = utils.fastCloneDeep(this.originalComponent);
                        if (this.applyActions(newComponent, logic.actions, args)) {
                            if (!_.isEqual(this.component, newComponent)) {
                                this.component = newComponent;
                            }
                            this.redraw();
                        }
                    }, true);
                }
            });
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
            if (this.disabled) {
                attributes.disabled = 'disabled';
            }
            _.defaults(attributes, this.component.attributes);
            return {
                type: 'input',
                component: this.component,
                changeEvent: 'change',
                attr: attributes
            };
        }
        autofocus() {
            if (this.component.autofocus && !this.builderMode) {
                this.on('render', () => this.focus(), true);
            }
        }
        focus() {
            if (this.refs.input && this.refs.input[0]) {
                this.refs.input[0].focus();
            }
        }
    };
    Component.externalLibraries = {};
    Component.requireLibrary = function (name, property, src, polling) {
        if (!Component.externalLibraries.hasOwnProperty(name)) {
            Component.externalLibraries[name] = {};
            Component.externalLibraries[name].ready = new NativePromise((resolve, reject) => {
                Component.externalLibraries[name].resolve = resolve;
                Component.externalLibraries[name].reject = reject;
            });
            const callbackName = `${ name }Callback`;
            if (!polling && !window[callbackName]) {
                window[callbackName] = function () {
                    this.resolve();
                }.bind(Component.externalLibraries[name]);
            }
            const plugin = _.get(window, property);
            if (plugin) {
                Component.externalLibraries[name].resolve(plugin);
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
                            async: true
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
                    const script = document.createElement(elementType);
                    for (const attr in attrs) {
                        script.setAttribute(attr, attrs[attr]);
                    }
                    document.getElementsByTagName('head')[0].appendChild(script);
                });
                if (polling) {
                    setTimeout(function checkLibrary() {
                        const plugin = _.get(window, property);
                        if (plugin) {
                            Component.externalLibraries[name].resolve(plugin);
                        } else {
                            setTimeout(checkLibrary, 200);
                        }
                    }, 200);
                }
            }
        }
        return Component.externalLibraries[name].ready;
    };
    Component.libraryReady = function (name) {
        if (Component.externalLibraries.hasOwnProperty(name) && Component.externalLibraries[name].ready) {
            return Component.externalLibraries[name].ready;
        }
        return NativePromise.reject(`${ name } library was not required.`);
    };
});
define('skylark-formio/components/_classes/field/Field',['../component/Component'], function (Component) {
    'use strict';
    return class Field extends Component {
        render(element) {
            if (this.noField) {
                return super.render(element);
            } else if (this.isAdvancedLabel) {
                return super.render(this.renderTemplate('field', {
                    ...this.getLabelInfo(),
                    labelMarkup: this.renderTemplate('label'),
                    element: element
                }, 'align'));
            } else {
                return super.render(this.renderTemplate('field', {
                    labelMarkup: this.renderTemplate('label'),
                    element: element
                }));
            }
        }
    };
});
define('skylark-formio/components/_classes/nested/NestedComponent',[
    'skylark-lodash',
    '../field/Field',
    '../../Components',
    '../../../vendors/getify/npo'
], function (_, Field, Components, NativePromise) {
    'use strict';
    'use strict';
    return class NestedComponent extends Field {
        static schema(...extend) {
            return Field.schema({ tree: false }, ...extend);
        }
        constructor(component, options, data) {
            super(component, options, data);
            this.type = 'components';
            this._collapsed = !!this.component.collapsed;
        }
        get defaultSchema() {
            return NestedComponent.schema();
        }
        get schema() {
            const schema = super.schema;
            const components = _.uniqBy(this.getComponents(), 'component.key');
            schema.components = _.map(components, 'schema');
            return schema;
        }
        get collapsed() {
            return this._collapsed;
        }
        set collapsed(value) {
            this._collapsed = value;
            this.redraw();
        }
        set visible(value) {
            super.visible = value;
            const isVisible = this.visible;
            const forceShow = this.options.show && this.options.show[this.component.key];
            const forceHide = this.options.hide && this.options.hide[this.component.key];
            this.components.forEach(component => {
                const conditionallyVisible = component.conditionallyVisible();
                if (forceShow || conditionallyVisible) {
                    component.visible = true;
                } else if (forceHide || !isVisible || !conditionallyVisible) {
                    component.visible = false;
                }
                if (!component.visible) {
                    component.error = '';
                }
                component.parentVisible = isVisible;
            });
        }
        get visible() {
            return super.visible;
        }
        set parentVisible(value) {
            super.parentVisible = value;
            this.components.forEach(component => {
                component.parentVisible = this.visible;
            });
        }
        get parentVisible() {
            return super.parentVisible;
        }
        get disabled() {
            return super.disabled;
        }
        set disabled(disabled) {
            super.disabled = disabled;
            this.components.forEach(component => component.parentDisabled = disabled);
        }
        set parentDisabled(value) {
            super.parentDisabled = value;
            this.components.forEach(component => {
                component.parentDisabled = this.disabled;
            });
        }
        get parentDisabled() {
            return super.parentDisabled;
        }
        get ready() {
            return NativePromise.all(this.getComponents().map(component => component.ready));
        }
        get currentForm() {
            return super.currentForm;
        }
        set currentForm(instance) {
            super.currentForm = instance;
            this.getComponents().forEach(component => {
                component.currentForm = instance;
            });
        }
        get rowIndex() {
            return this._rowIndex;
        }
        set rowIndex(value) {
            this._rowIndex = value;
            this.eachComponent(component => {
                component.rowIndex = value;
            });
        }
        componentContext() {
            return this._data;
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
            this.eachComponent(component => {
                component.data = this.componentContext(component);
            });
        }
        getComponents() {
            return this.components || [];
        }
        everyComponent(fn) {
            const components = this.getComponents();
            _.each(components, (component, index) => {
                if (fn(component, components, index) === false) {
                    return false;
                }
                if (typeof component.everyComponent === 'function') {
                    if (component.everyComponent(fn) === false) {
                        return false;
                    }
                }
            });
        }
        hasComponent(component) {
            let result = false;
            this.everyComponent(comp => {
                if (comp === component) {
                    result = true;
                    return false;
                }
            });
            return result;
        }
        flattenComponents() {
            const result = {};
            this.everyComponent(component => {
                result[component.component.flattenAs || component.key] = component;
            });
            return result;
        }
        eachComponent(fn) {
            _.each(this.getComponents(), (component, index) => {
                if (fn(component, index) === false) {
                    return false;
                }
            });
        }
        getComponent(path, fn) {
            path = Array.isArray(path) ? path : [path];
            const [key, ...remainingPath] = path;
            let comp = null;
            if (!_.isString(key)) {
                return comp;
            }
            this.everyComponent((component, components) => {
                if (component.component.key === key) {
                    comp = component;
                    if (remainingPath.length > 0 && 'getComponent' in component) {
                        comp = component.getComponent(remainingPath, fn);
                    } else if (fn) {
                        fn(component, components);
                    }
                    return false;
                }
            });
            return comp;
        }
        getComponentById(id, fn) {
            let comp = null;
            this.everyComponent((component, components) => {
                if (component.id === id) {
                    comp = component;
                    if (fn) {
                        fn(component, components);
                    }
                    return false;
                }
            });
            return comp;
        }
        createComponent(component, options, data, before) {
            if (!component) {
                return;
            }
            options = options || this.options;
            data = data || this.data;
            options.parent = this;
            options.parentVisible = this.visible;
            options.root = this.root || this;
            options.skipInit = true;
            const comp = Components.create(component, options, data, true);
            if (component.key) {
                let thisPath = this;
                while (thisPath && !thisPath.allowData && thisPath.parent) {
                    thisPath = thisPath.parent;
                }
                comp.path = thisPath.path ? `${ thisPath.path }.` : '';
                comp.path += component.key;
            }
            comp.init();
            if (component.internal) {
                return comp;
            }
            if (before) {
                const index = _.findIndex(this.components, { id: before.id });
                if (index !== -1) {
                    this.components.splice(index, 0, comp);
                } else {
                    this.components.push(comp);
                }
            } else {
                this.components.push(comp);
            }
            return comp;
        }
        getContainer() {
            return this.element;
        }
        get componentComponents() {
            return this.component.components || [];
        }
        get nestedKey() {
            return `nested-${ this.key }`;
        }
        get templateName() {
            return 'container';
        }
        init() {
            this.components = this.components || [];
            this.addComponents();
            return super.init();
        }
        addComponents(data, options) {
            data = data || this.data;
            options = options || this.options;
            if (options.components) {
                this.components = options.components;
            } else {
                const components = this.hook('addComponents', this.componentComponents, this) || [];
                components.forEach(component => this.addComponent(component, data));
            }
        }
        addComponent(component, data, before, noAdd) {
            data = data || this.data;
            component = this.hook('addComponent', component, data, before, noAdd);
            const comp = this.createComponent(component, this.options, data, before ? before : null);
            if (noAdd) {
                return comp;
            }
            return comp;
        }
        render(children) {
            return super.render(children || this.renderTemplate(this.templateName, {
                children: this.renderComponents(),
                nestedKey: this.nestedKey,
                collapsed: this.collapsed
            }));
        }
        renderComponents(components) {
            components = components || this.getComponents();
            const children = components.map(component => component.render());
            return this.renderTemplate('components', {
                children,
                components
            });
        }
        attach(element) {
            const superPromise = super.attach(element);
            this.loadRefs(element, {
                header: 'single',
                collapsed: this.collapsed,
                [this.nestedKey]: 'single'
            });
            let childPromise = NativePromise.resolve();
            if (this.refs[this.nestedKey]) {
                childPromise = this.attachComponents(this.refs[this.nestedKey]);
            }
            if (this.component.collapsible && this.refs.header) {
                this.addEventListener(this.refs.header, 'click', () => {
                    this.collapsed = !this.collapsed;
                });
            }
            return NativePromise.all([
                superPromise,
                childPromise
            ]);
        }
        attachComponents(element, components, container) {
            components = components || this.components;
            container = container || this.component.components;
            element = this.hook('attachComponents', element, components, container, this);
            if (!element) {
                return new NativePromise(() => {
                });
            }
            let index = 0;
            const promises = [];
            Array.prototype.slice.call(element.children).forEach(child => {
                if (!child.getAttribute('data-noattach') && components[index]) {
                    promises.push(components[index].attach(child));
                    index++;
                }
            });
            return NativePromise.all(promises);
        }
        removeComponent(component, components) {
            components = components || this.components;
            component.destroy();
            _.remove(components, { id: component.id });
        }
        removeComponentByKey(key, fn) {
            const comp = this.getComponent(key, (component, components) => {
                this.removeComponent(component, components);
                if (fn) {
                    fn(component, components);
                }
            });
            if (!comp) {
                if (fn) {
                    fn(null);
                }
                return null;
            }
        }
        removeComponentById(id, fn) {
            const comp = this.getComponentById(id, (component, components) => {
                this.removeComponent(component, components);
                if (fn) {
                    fn(component, components);
                }
            });
            if (!comp) {
                if (fn) {
                    fn(null);
                }
                return null;
            }
        }
        updateValue(value, flags = {}) {
            return this.components.reduce((changed, comp) => {
                return comp.updateValue(null, flags) || changed;
            }, super.updateValue(value, flags));
        }
        shouldSkipValidation(data, dirty, row) {
            if (!this.component.input) {
                return true;
            } else {
                return super.shouldSkipValidation(data, dirty, row);
            }
        }
        checkData(data, flags, row, components) {
            if (this.builderMode) {
                return true;
            }
            data = data || this.rootValue;
            flags = flags || {};
            row = row || this.data;
            components = components || this.getComponents();
            return components.reduce((valid, comp) => {
                return comp.checkData(data, flags, row) && valid;
            }, super.checkData(data, flags, row));
        }
        checkConditions(data, flags, row) {
            this.getComponents().forEach(comp => comp.checkConditions(data, flags, row));
            return super.checkConditions(data, flags, row);
        }
        clearOnHide(show) {
            super.clearOnHide(show);
            if (this.component.clearOnHide) {
                if (this.allowData && !this.hasValue()) {
                    this.dataValue = this.defaultValue;
                }
                if (this.hasValue()) {
                    this.restoreComponentsContext();
                }
            }
            this.getComponents().forEach(component => component.clearOnHide(show));
        }
        restoreComponentsContext() {
            this.getComponents().forEach(component => component.data = this.dataValue);
        }
        beforePage(next) {
            return NativePromise.all(this.getComponents().map(comp => comp.beforePage(next)));
        }
        beforeSubmit() {
            return NativePromise.all(this.getComponents().map(comp => comp.beforeSubmit()));
        }
        calculateValue(data, flags, row) {
            if (!this.conditionallyVisible()) {
                return false;
            }
            return this.getComponents().reduce((changed, comp) => comp.calculateValue(data, flags, row) || changed, super.calculateValue(data, flags, row));
        }
        isLastPage() {
            return this.pages.length - 1 === this.page;
        }
        isValid(data, dirty) {
            return this.getComponents().reduce((valid, comp) => comp.isValid(data, dirty) && valid, super.isValid(data, dirty));
        }
        checkValidity(data, dirty, row) {
            if (!this.checkCondition(row, data)) {
                this.setCustomValidity('');
                return true;
            }
            return this.getComponents().reduce((check, comp) => comp.checkValidity(data, dirty, row) && check, super.checkValidity(data, dirty, row));
        }
        checkAsyncValidity(data, dirty, row) {
            const promises = [super.checkAsyncValidity(data, dirty, row)];
            this.eachComponent(component => promises.push(component.checkAsyncValidity(data, dirty, row)));
            return NativePromise.all(promises).then(results => results.reduce((valid, result) => valid && result, true));
        }
        setPristine(pristine) {
            super.setPristine(pristine);
            this.getComponents().forEach(comp => comp.setPristine(pristine));
        }
        detach() {
            this.components.forEach(component => {
                component.detach();
            });
            super.detach();
        }
        destroy() {
            this.destroyComponents();
            super.destroy();
        }
        destroyComponents() {
            const components = this.getComponents().slice();
            components.forEach(comp => this.removeComponent(comp, this.components));
            this.components = [];
        }
        get errors() {
            const thisErrors = this.error ? [this.error] : [];
            return this.getComponents().reduce((errors, comp) => errors.concat(comp.errors || []), thisErrors);
        }
        getValue() {
            return this.data;
        }
        resetValue() {
            this.getComponents().forEach(comp => comp.resetValue());
            this.unset();
            this.setPristine(true);
        }
        get dataReady() {
            return NativePromise.all(this.getComponents().map(component => component.dataReady));
        }
        setNestedValue(component, value, flags = {}) {
            component._data = this.componentContext(component);
            if (component.type === 'button') {
                return false;
            }
            if (component.type === 'components') {
                return component.setValue(value, flags);
            } else if (value && component.hasValue(value)) {
                return component.setValue(_.get(value, component.key), flags);
            } else if (!this.rootPristine || component.visible) {
                flags.noValidate = !flags.dirty;
                flags.resetValue = true;
                return component.setValue(component.defaultValue, flags);
            }
        }
        setValue(value, flags = {}) {
            if (!value) {
                return false;
            }
            return this.getComponents().reduce((changed, component) => {
                return this.setNestedValue(component, value, flags, changed) || changed;
            }, false);
        }
    };
});
define('skylark-formio/components/Components',[
    './_classes/component/Component',
    './_classes/nested/NestedComponent',
    'skylark-lodash'
], function (Component, NestedComponent, _) {
    'use strict';
    return class Components {
        static get components() {
            if (!Components._components) {
                Components._components = {};
            }
            return Components._components;
        }
        static setComponents(comps) {
            if (comps.base) {
                comps.base.tableView = function (value, options) {
                    const comp = Components.create(options.component, options.options || {}, options.data || {}, true);
                    return comp.getView(value);
                };
            }
            _.assign(Components.components, comps);
        }
        static addComponent(name, comp) {
            return Components.setComponent(name, comp);
        }
        static setComponent(name, comp) {
            Components.components[name] = comp;
        }
        static create(component, options, data) {
            let comp = null;
            if (component.type && Components.components.hasOwnProperty(component.type)) {
                comp = new Components.components[component.type](component, options, data);
            } else if (Array.isArray(component.components)) {
                comp = new NestedComponent(component, options, data);
            } else {
                comp = new Component(component, options, data);
            }
            return comp;
        }
    };
});
define('skylark-formio/components/_classes/nesteddata/NestedDataComponent',[
    '../component/Component',
    '../nested/NestedComponent',
    'skylark-lodash'
], function (Component, NestedComponent, _) {
    'use strict';
    'use strict';
    return class NestedDataComponent extends NestedComponent {
        hasChanged(newValue, oldValue) {
            if (newValue !== undefined && newValue !== null && !this.hasValue()) {
                return true;
            }
            return !_.isEqual(newValue, oldValue);
        }
        get allowData() {
            return true;
        }
        getValueAsString() {
            return '[Complex Data]';
        }
        getValue() {
            return this.dataValue;
        }
        updateValue(value, flags = {}) {
            return Component.prototype.updateValue.call(this, value, flags);
        }
    };
});
define('skylark-formio/Webform',[
    'skylark-lodash',
    'skylark-moment',
    './EventEmitter',
    'skylark-i18next',
    './Formio',
    './vendors/getify/npo',
    './components/Components',
    './components/_classes/nesteddata/NestedDataComponent',
    './utils/utils',
    './utils/formUtils'
], function (_, moment, EventEmitter, i18next, Formio, NativePromise, Components, NestedDataComponent, a, b) {
    'use strict';
    Formio.forms = {};
    Formio.registerComponent = Components.setComponent;
    function getIconSet(icons) {
        if (icons === 'fontawesome') {
            return 'fa';
        }
        return icons || '';
    }
    function getOptions(options) {
        options = _.defaults(options, {
            submitOnEnter: false,
            iconset: getIconSet(options && options.icons ? options.icons : Formio.icons),
            i18next,
            saveDraft: false,
            alwaysDirty: false,
            saveDraftThrottle: 5000
        });
        if (!options.events) {
            options.events = new EventEmitter({
                wildcard: false,
                maxListeners: 0
            });
        }
        return options;
    }
    return class Webform extends NestedDataComponent {
        constructor() {
            let element, options;
            if (arguments[0] instanceof HTMLElement || arguments[1]) {
                element = arguments[0];
                options = arguments[1];
            } else {
                options = arguments[0];
            }
            super(null, getOptions(options));
            this.element = element;
            Formio.forms[this.id] = this;
            if (this.options.baseUrl) {
                Formio.setBaseUrl(this.options.baseUrl);
            }
            let i18n = require('./i18n').default;
            if (options && options.i18n && !options.i18nReady) {
                if (options.i18n.resources) {
                    i18n = options.i18n;
                } else {
                    _.each(options.i18n, (lang, code) => {
                        if (code === 'options') {
                            _.merge(i18n, lang);
                        } else if (!i18n.resources[code]) {
                            i18n.resources[code] = { translation: lang };
                        } else {
                            _.assign(i18n.resources[code].translation, lang);
                        }
                    });
                }
                options.i18n = i18n;
                options.i18nReady = true;
            }
            if (options && options.i18n) {
                this.options.i18n = options.i18n;
            } else {
                this.options.i18n = i18n;
            }
            if (this.options.language) {
                this.options.i18n.lng = this.options.language;
            }
            this.type = 'form';
            this._src = '';
            this._loading = false;
            this._form = {};
            this.draftEnabled = false;
            this.savingDraft = true;
            if (this.options.saveDraftThrottle) {
                this.triggerSaveDraft = _.throttle(this.saveDraft.bind(this), this.options.saveDraftThrottle);
            } else {
                this.triggerSaveDraft = this.saveDraft.bind(this);
            }
            this.customErrors = [];
            this.nosubmit = false;
            this.submitted = false;
            this.submitting = false;
            this.formio = null;
            this.loader = null;
            this.alert = null;
            this.onSubmission = null;
            this.submissionSet = false;
            this.formReady = new NativePromise((resolve, reject) => {
                this.formReadyResolve = resolve;
                this.formReadyReject = reject;
            });
            this.submissionReady = new NativePromise((resolve, reject) => {
                this.submissionReadyResolve = resolve;
                this.submissionReadyReject = reject;
            });
            this.shortcuts = [];
            this.localize().then(() => {
                this.language = this.options.language;
            });
            if (this.options.saveDraft && Formio.events) {
                Formio.events.on('formio.user', user => {
                    this.formReady.then(() => {
                        if (!this.submissionSet) {
                            this.restoreDraft(user._id);
                        }
                    });
                });
            }
            this.component.clearOnHide = false;
            this.root = this;
        }
        set language(lang) {
            return new NativePromise((resolve, reject) => {
                this.options.language = lang;
                if (i18next.language === lang) {
                    return resolve();
                }
                try {
                    i18next.changeLanguage(lang, err => {
                        if (err) {
                            return reject(err);
                        }
                        this.redraw();
                        this.emit('languageChanged');
                        resolve();
                    });
                } catch (err) {
                    return reject(err);
                }
            });
        }
        addLanguage(code, lang, active = false) {
            i18next.addResourceBundle(code, 'translation', lang, true, true);
            if (active) {
                this.language = code;
            }
        }
        localize() {
            if (i18next.initialized) {
                return NativePromise.resolve(i18next);
            }
            i18next.initialized = true;
            return new NativePromise((resolve, reject) => {
                try {
                    i18next.init(this.options.i18n, err => {
                        this.options.language = i18next.language.split(';')[0];
                        if (err) {
                            return reject(err);
                        }
                        resolve(i18next);
                    });
                } catch (err) {
                    return reject(err);
                }
            });
        }
        keyboardCatchableElement(element) {
            if (element.nodeName === 'TEXTAREA') {
                return false;
            }
            if (element.nodeName === 'INPUT') {
                return [
                    'text',
                    'email',
                    'password'
                ].indexOf(element.type) === -1;
            }
            return true;
        }
        executeShortcuts(event) {
            const {target} = event;
            if (!this.keyboardCatchableElement(target)) {
                return;
            }
            const ctrl = event.ctrlKey || event.metaKey;
            const keyCode = event.keyCode;
            let char = '';
            if (65 <= keyCode && keyCode <= 90) {
                char = String.fromCharCode(keyCode);
            } else if (keyCode === 13) {
                char = 'Enter';
            } else if (keyCode === 27) {
                char = 'Esc';
            }
            _.each(this.shortcuts, shortcut => {
                if (shortcut.ctrl && !ctrl) {
                    return;
                }
                if (shortcut.shortcut === char) {
                    shortcut.element.click();
                    event.preventDefault();
                }
            });
        }
        addShortcut(element, shortcut) {
            if (!shortcut || !/^([A-Z]|Enter|Esc)$/i.test(shortcut)) {
                return;
            }
            shortcut = _.capitalize(shortcut);
            if (shortcut === 'Enter' || shortcut === 'Esc') {
                if (element.tagName !== 'BUTTON') {
                    return;
                }
                this.shortcuts.push({
                    shortcut,
                    element
                });
            } else {
                this.shortcuts.push({
                    ctrl: true,
                    shortcut,
                    element
                });
            }
        }
        removeShortcut(element, shortcut) {
            if (!shortcut || !/^([A-Z]|Enter|Esc)$/i.test(shortcut)) {
                return;
            }
            _.remove(this.shortcuts, {
                shortcut,
                element
            });
        }
        get src() {
            return this._src;
        }
        loadSubmission() {
            this.loadingSubmission = true;
            if (this.formio.submissionId) {
                this.onSubmission = this.formio.loadSubmission().then(submission => this.setSubmission(submission), err => this.submissionReadyReject(err)).catch(err => this.submissionReadyReject(err));
            } else {
                this.submissionReadyResolve();
            }
            return this.submissionReady;
        }
        setSrc(value, options) {
            if (this.setUrl(value, options)) {
                this.nosubmit = false;
                return this.formio.loadForm({ params: { live: 1 } }).then(form => {
                    const setForm = this.setForm(form);
                    this.loadSubmission();
                    return setForm;
                }).catch(err => {
                    console.warn(err);
                    this.formReadyReject(err);
                });
            }
            return NativePromise.resolve();
        }
        set src(value) {
            this.setSrc(value);
        }
        get url() {
            return this._src;
        }
        setUrl(value, options) {
            if (!value || typeof value !== 'string' || value === this._src) {
                return false;
            }
            this._src = value;
            this.nosubmit = true;
            this.formio = this.options.formio = new Formio(value, options);
            if (this.type === 'form') {
                this.options.src = value;
            }
            return true;
        }
        set url(value) {
            this.setUrl(value);
        }
        get ready() {
            return this.formReady.then(() => {
                return super.ready.then(() => {
                    return this.loadingSubmission ? this.submissionReady : true;
                });
            });
        }
        get loading() {
            return this._loading;
        }
        set loading(loading) {
            if (this._loading !== loading) {
                this._loading = loading;
                if (!this.loader && loading) {
                    this.loader = this.ce('div', { class: 'loader-wrapper' });
                    const spinner = this.ce('div', { class: 'loader text-center' });
                    this.loader.appendChild(spinner);
                }
                if (this.loader) {
                    try {
                        if (loading) {
                            this.prependTo(this.loader, this.wrapper);
                        } else {
                            this.removeChildFrom(this.loader, this.wrapper);
                        }
                    } catch (err) {
                    }
                }
            }
        }
        setForm(form) {
            this._form = form;
            if (form && form.settings && form.settings.components) {
                this.options.components = form.settings.components;
            }
            if (form && form.module) {
                let formModule = null;
                if (typeof form.module === 'string') {
                    try {
                        formModule = this.evaluate(`return ${ form.module }`);
                    } catch (err) {
                        console.warn(err);
                    }
                } else {
                    formModule = form.module;
                }
                if (formModule) {
                    Formio.use(formModule);
                    if (formModule.options && formModule.options.form) {
                        this.options = Object.assign(this.options, formModule.options.form);
                    }
                }
            }
            this.initialized = false;
            const rebuild = this.rebuild() || NativePromise.resolve();
            return rebuild.then(() => {
                this.emit('formLoad', form);
                this.triggerRecaptcha();
                setTimeout(() => {
                    this.onChange();
                    this.formReadyResolve();
                }, 0);
                return this.formReady;
            });
        }
        get form() {
            if (!this._form) {
                this._form = { components: [] };
            }
            return this._form;
        }
        set form(form) {
            this.setForm(form);
        }
        get submission() {
            return this.getValue();
        }
        set submission(submission) {
            this.setSubmission(submission);
        }
        setSubmission(submission, flags = {}) {
            flags = {
                ...flags,
                fromSubmission: true
            };
            return this.onSubmission = this.formReady.then(() => {
                this.submissionSet = true;
                this.triggerChange(flags);
                this.setValue(submission, flags);
                return this.submissionReadyResolve(submission);
            }, err => this.submissionReadyReject(err)).catch(err => this.submissionReadyReject(err));
        }
        saveDraft() {
            if (!this.draftEnabled) {
                return;
            }
            if (!this.formio) {
                console.warn('Cannot save draft because there is no formio instance.');
                return;
            }
            if (!Formio.getUser()) {
                console.warn('Cannot save draft unless a user is authenticated.');
                return;
            }
            const draft = this.submission;
            draft.state = 'draft';
            if (!this.savingDraft) {
                this.savingDraft = true;
                this.formio.saveSubmission(draft).then(sub => {
                    const currentSubmission = _.merge(sub, draft);
                    this.emit('saveDraft', sub);
                    if (!draft._id) {
                        this.setSubmission(currentSubmission).then(() => {
                            this.savingDraft = false;
                        });
                    } else {
                        this.savingDraft = false;
                    }
                });
            }
        }
        restoreDraft(userId) {
            if (!this.formio) {
                console.warn('Cannot restore draft because there is no formio instance.');
                return;
            }
            this.savingDraft = true;
            this.formio.loadSubmissions({
                params: {
                    state: 'draft',
                    owner: userId
                }
            }).then(submissions => {
                if (submissions.length > 0 && !this.options.skipDraftRestore) {
                    const draft = a.fastCloneDeep(submissions[0]);
                    return this.setSubmission(draft).then(() => {
                        this.draftEnabled = true;
                        this.savingDraft = false;
                        this.emit('restoreDraft', draft);
                    });
                }
                this.draftEnabled = true;
                this.savingDraft = false;
                this.emit('restoreDraft', null);
            });
        }
        get schema() {
            const schema = a.fastCloneDeep(_.omit(this._form, ['components']));
            schema.components = [];
            this.undefined(component => schema.components.push(component.schema));
            return schema;
        }
        mergeData(_this, _that) {
            _.mergeWith(_this, _that, (thisValue, thatValue) => {
                if (Array.isArray(thisValue) && Array.isArray(thatValue) && thisValue.length !== thatValue.length) {
                    return thatValue;
                }
            });
        }
        setValue(submission, flags = {}) {
            if (!submission || !submission.data) {
                submission = { data: {} };
            }
            this._submission.metadata = submission.metadata || {};
            this.editing = !!submission._id;
            if (!this.options.submissionTimezone && submission.metadata && submission.metadata.timezone) {
                this.options.submissionTimezone = submission.metadata.timezone;
            }
            const changed = super.setValue(submission.data, flags);
            if (!flags.sanitize) {
                this.mergeData(this.data, submission.data);
            }
            submission.data = this.data;
            this._submission = submission;
            return changed;
        }
        getValue() {
            if (!this._submission.data) {
                this._submission.data = {};
            }
            if (this.viewOnly) {
                return this._submission;
            }
            const submission = this._submission;
            submission.data = this.data;
            return this._submission;
        }
        init() {
            this._submission = this._submission || { data: {} };
            if (this.components && this.components.length) {
                this.destroyComponents();
                this.components = [];
            }
            if (this.component) {
                this.component.components = this.form ? this.form.components : [];
            } else {
                this.component = this.form;
            }
            this.component.type = 'form';
            this.component.input = false;
            this.addComponents();
            this.on('submitButton', options => {
                this.submit(false, options).catch(e => e !== false && console.log(e));
            }, true);
            this.on('checkValidity', data => this.checkValidity(data, true, data), true);
            this.on('requestUrl', args => this.submitUrl(args.url, args.headers), true);
            this.on('resetForm', () => this.resetValue(), true);
            this.on('deleteSubmission', () => this.deleteSubmission(), true);
            this.on('refreshData', () => this.updateValue(), true);
            this.executeFormController();
            return this.formReady;
        }
        executeFormController() {
            if (!this.form || !this.form.controller || (!this.visible || this.component.hidden) && this.component.clearOnHide && !this.rootPristine) {
                return false;
            }
            this.formReady.then(() => {
                this.evaluate(this.form.controller, { components: this.components });
            });
        }
        destroy() {
            this.off('submitButton');
            this.off('checkValidity');
            this.off('requestUrl');
            this.off('resetForm');
            this.off('deleteSubmission');
            this.off('refreshData');
            return super.destroy();
        }
        build(element) {
            if (element || this.element) {
                return this.ready.then(() => {
                    element = element || this.element;
                    super.build(element);
                });
            }
            return this.ready;
        }
        getClassName() {
            return 'formio-form';
        }
        render() {
            return super.render(this.renderTemplate('webform', {
                classes: this.getClassName(),
                children: this.renderComponents()
            }), this.builderMode ? 'builder' : 'form', true);
        }
        redraw() {
            if (!this.element) {
                return NativePromise.resolve();
            }
            this.clear();
            this.setContent(this.element, this.render());
            return this.attach(this.element);
        }
        attach(element) {
            this.element = element;
            this.loadRefs(element, { webform: 'single' });
            const childPromise = this.attachComponents(this.refs.webform);
            this.addEventListener(this.element, 'keydown', this.executeShortcuts);
            this.currentForm = this;
            return childPromise.then(() => {
                this.emit('render');
                return this.setValue(this._submission, { noUpdateEvent: true });
            });
        }
        hasRequiredFields() {
            let result = false;
            b.eachComponent(this.form.components, component => {
                if (component.validate.required) {
                    result = true;
                    return true;
                }
            }, true);
            return result;
        }
        resetValue() {
            _.each(this.getComponents(), comp => comp.resetValue());
            this.setPristine(true);
        }
        setAlert(type, message) {
            if (!type && this.submitted) {
                if (this.alert) {
                    if (this.refs.errorRef && this.refs.errorRef.length) {
                        this.refs.errorRef.forEach(el => {
                            this.removeEventListener(el, 'click');
                            this.removeEventListener(el, 'keypress');
                        });
                    }
                    this.removeChild(this.alert);
                    this.alert = null;
                }
                return;
            }
            if (this.options.noAlerts) {
                if (!message) {
                    this.emit('error', false);
                }
                return;
            }
            if (this.alert) {
                try {
                    if (this.refs.errorRef && this.refs.errorRef.length) {
                        this.refs.errorRef.forEach(el => {
                            this.removeEventListener(el, 'click');
                            this.removeEventListener(el, 'keypress');
                        });
                    }
                    this.removeChild(this.alert);
                    this.alert = null;
                } catch (err) {
                }
            }
            if (message) {
                this.alert = this.ce('div', {
                    id: `error-list-${ this.id }`,
                    class: `alert alert-${ type }`,
                    role: 'alert'
                });
                if (message instanceof HTMLElement) {
                    this.appendTo(message, this.alert);
                } else {
                    this.setContent(this.alert, message);
                }
            }
            if (!this.alert) {
                return;
            }
            this.loadRefs(this.alert, { errorRef: 'multiple' });
            if (this.refs.errorRef && this.refs.errorRef.length) {
                this.refs.errorRef.forEach(el => {
                    this.addEventListener(el, 'click', e => {
                        const key = e.currentTarget.dataset.componentKey;
                        this.focusOnComponent(key);
                    });
                    this.addEventListener(el, 'keypress', e => {
                        if (e.keyCode === 13) {
                            const key = e.currentTarget.dataset.componentKey;
                            this.focusOnComponent(key);
                        }
                    });
                });
            }
            this.prepend(this.alert);
        }
        focusOnComponent(key) {
            if (key) {
                const component = this.getComponent(key);
                if (component) {
                    component.focus();
                }
            }
        }
        showErrors(error, triggerEvent) {
            this.loading = false;
            let errors = this.errors;
            if (error) {
                if (Array.isArray(error)) {
                    errors = errors.concat(error);
                } else {
                    errors.push(error);
                }
            } else {
                errors = super.errors;
            }
            errors = errors.concat(this.customErrors);
            if (!errors.length) {
                this.setAlert(false);
                return;
            }
            errors.forEach(err => {
                const {
                    components = []
                } = err;
                if (err.component) {
                    components.push(err.component);
                }
                if (err.path) {
                    components.push(err.path);
                }
                components.forEach(path => {
                    const component = this.getComponent(path, _.identity);
                    const components = _.compact(Array.isArray(component) ? component : [component]);
                    components.forEach(component => component.setCustomValidity(err.message, true));
                });
            });
            const message = document.createDocumentFragment();
            const p = this.ce('p');
            this.setContent(p, this.t('error'));
            const ul = this.ce('ul');
            errors.forEach(err => {
                if (err) {
                    const createListItem = message => {
                        const params = {
                            ref: 'errorRef',
                            tabIndex: 0,
                            'aria-label': `${ message }. Click to navigate to the field with following error.`
                        };
                        const li = this.ce('li', params);
                        this.setContent(li, message);
                        if (err.component && err.component.key) {
                            li.dataset.componentKey = err.component.key;
                        }
                        this.appendTo(li, ul);
                    };
                    if (err.messages && err.messages.length) {
                        err.messages.forEach(({message}) => createListItem(`${ this.t(err.component.label) }. ${ message }`));
                    } else if (err) {
                        const message = _.isObject(err) ? err.message || '' : err;
                        createListItem(message);
                    }
                }
            });
            p.appendChild(ul);
            message.appendChild(p);
            this.setAlert('danger', message);
            if (triggerEvent) {
                this.emit('error', errors);
            }
            return errors;
        }
        onSubmit(submission, saved) {
            this.loading = false;
            this.submitting = false;
            this.setPristine(true);
            this.setValue(a.fastCloneDeep(submission), {
                noValidate: true,
                noCheck: true
            });
            this.setAlert('success', `<p>${ this.t('complete') }</p>`);
            this.emit('submit', submission);
            if (saved) {
                this.emit('submitDone', submission);
            }
            return submission;
        }
        onSubmissionError(error) {
            if (error) {
                if (typeof error === 'string') {
                    error = { message: error };
                }
                if ('details' in error) {
                    error = error.details;
                }
            }
            this.submitting = false;
            this.setPristine(false);
            this.emit('submitError', error);
            if (error && error.silent) {
                this.emit('change', { isValid: true });
                return false;
            }
            return this.showErrors(error, true);
        }
        onChange(flags, changed, modified) {
            flags = flags || {};
            let isChangeEventEmitted = false;
            if (changed && changed.component) {
                this.customErrors = this.customErrors.filter(err => err.component && err.component !== changed.component.key);
            }
            super.onChange(flags, true);
            const value = _.clone(this.submission);
            flags.changed = value.changed = changed;
            if (modified && this.pristine) {
                this.pristine = false;
            }
            value.isValid = this.checkData(value.data, flags);
            this.loading = false;
            if (this.submitted) {
                this.showErrors();
            }
            if (modified && this.options.saveDraft) {
                this.triggerSaveDraft();
            }
            if (!flags || !flags.noEmit) {
                this.emit('change', value, flags);
                isChangeEventEmitted = true;
            }
            if (isChangeEventEmitted && !this.initialized) {
                this.emit('initialized');
                this.initialized = true;
            }
        }
        checkData(data, flags = {}) {
            const valid = super.checkData(data, flags);
            if ((_.isEmpty(flags) || flags.noValidate) && this.submitted) {
                this.showErrors();
            }
            return valid;
        }
        deleteSubmission() {
            return this.formio.deleteSubmission().then(() => {
                this.emit('submissionDeleted', this.submission);
                this.resetValue();
            });
        }
        cancel(noconfirm) {
            const shouldReset = this.hook('beforeCancel', true);
            if (shouldReset && (noconfirm || confirm('Are you sure you want to cancel?'))) {
                this.resetValue();
                return true;
            } else {
                return false;
            }
        }
        submitForm(options = {}) {
            return new NativePromise((resolve, reject) => {
                if (this.options.readOnly) {
                    return resolve({
                        submission: this.submission,
                        saved: false
                    });
                }
                const submission = a.fastCloneDeep(this.submission || {});
                submission.metadata = submission.metadata || {};
                _.defaults(submission.metadata, {
                    timezone: _.get(this, '_submission.metadata.timezone', a.currentTimezone()),
                    offset: parseInt(_.get(this, '_submission.metadata.offset', moment().utcOffset()), 10),
                    referrer: document.referrer,
                    browserName: navigator.appName,
                    userAgent: navigator.userAgent,
                    pathName: window.location.pathname,
                    onLine: navigator.onLine
                });
                submission.state = options.state || 'submitted';
                const isDraft = submission.state === 'draft';
                this.hook('beforeSubmit', {
                    ...submission,
                    component: options.component
                }, err => {
                    if (err) {
                        return reject(err);
                    }
                    if (!isDraft && !submission.data) {
                        return reject('Invalid Submission');
                    }
                    if (!isDraft && !this.checkValidity(submission.data, true, submission.data)) {
                        return reject();
                    }
                    this.everyComponent(comp => {
                        const {persistent} = comp.component;
                        if (persistent === 'client-only') {
                            _.unset(submission.data, comp.path);
                        }
                    });
                    this.hook('customValidation', {
                        ...submission,
                        component: options.component
                    }, err => {
                        if (err) {
                            if (typeof err === 'string') {
                                err = { message: err };
                            }
                            err = Array.isArray(err) ? err : [err];
                            this.customErrors = err;
                            return reject();
                        }
                        this.loading = true;
                        if (this._form && this._form.action) {
                            const method = submission.data._id && this._form.action.includes(submission.data._id) ? 'PUT' : 'POST';
                            return Formio.makeStaticRequest(this._form.action, method, submission, this.formio ? this.formio.options : {}).then(result => resolve({
                                submission: result,
                                saved: true
                            })).catch(reject);
                        }
                        const submitFormio = this.formio;
                        if (this.nosubmit || !submitFormio) {
                            return resolve({
                                submission,
                                saved: false
                            });
                        }
                        const submitMethod = submitFormio.actionUrl ? 'saveAction' : 'saveSubmission';
                        submitFormio[submitMethod](submission).then(result => resolve({
                            submission: result,
                            saved: true
                        })).catch(reject);
                    });
                });
            });
        }
        executeSubmit(options) {
            this.submitted = true;
            this.submitting = true;
            return this.submitForm(options).then(({submission, saved}) => this.onSubmit(submission, saved)).catch(err => NativePromise.reject(this.onSubmissionError(err)));
        }
        submit(before, options) {
            if (!before) {
                return this.beforeSubmit(options).then(() => this.executeSubmit(options));
            } else {
                return this.executeSubmit(options);
            }
        }
        submitUrl(URL, headers) {
            if (!URL) {
                return console.warn('Missing URL argument');
            }
            const submission = this.submission || {};
            const API_URL = URL;
            const settings = {
                method: 'POST',
                headers: {}
            };
            if (headers && headers.length > 0) {
                headers.map(e => {
                    if (e.header !== '' && e.value !== '') {
                        settings.headers[e.header] = this.interpolate(e.value, submission);
                    }
                });
            }
            if (API_URL && settings) {
                try {
                    Formio.makeStaticRequest(API_URL, settings.method, submission, { headers: settings.headers }).then(() => {
                        this.emit('requestDone');
                        this.setAlert('success', '<p> Success </p>');
                    });
                } catch (e) {
                    this.showErrors(`${ e.statusText } ${ e.status }`);
                    this.emit('error', `${ e.statusText } ${ e.status }`);
                    console.error(`${ e.statusText } ${ e.status }`);
                }
            } else {
                this.emit('error', 'You should add a URL to this button.');
                this.setAlert('warning', 'You should add a URL to this button.');
                return console.warn('You should add a URL to this button.');
            }
        }
        triggerRecaptcha() {
            if (!this || !this.components) {
                return;
            }
            const recaptchaComponent = this.components.find(component => {
                return component.component.type === 'recaptcha' && component.component.eventType === 'formLoad';
            });
            if (recaptchaComponent) {
                recaptchaComponent.verify(`${ this.form.name ? this.form.name : 'form' }Load`);
            }
        }
        set nosubmit(value) {
            this._nosubmit = !!value;
            this.emit('nosubmit', this._nosubmit);
        }
        get nosubmit() {
            return this._nosubmit || false;
        }
    };
    Webform.setBaseUrl = Formio.setBaseUrl;
    Webform.setApiUrl = Formio.setApiUrl;
    Webform.setAppUrl = Formio.setAppUrl;
});
define('skylark-formio/PDF',[
    './vendors/getify/npo',
    './Formio',
    './Webform',
    './utils/utils'
], function (NativePromise, Formio, Webform, a) {
    'use strict';
    return class PDF extends Webform {
        constructor(element, options) {
            super(element, options);
            this.components = [];
        }
        init() {
            super.init();
            this.on('iframe-submission', submission => this.setValue(submission, { fromIframe: true }), true);
            this.on('iframe-change', submission => this.setValue(submission, { fromIframe: true }), true);
            this.on('iframe-getIframePositions', () => {
                const iframeBoundingClientRect = document.querySelector('iframe').getBoundingClientRect();
                this.postMessage({
                    name: 'iframePositions',
                    data: {
                        iframe: { top: iframeBoundingClientRect.top },
                        scrollY: window.scrollY || window.pageYOffset
                    }
                });
            });
            this.on('iframe-ready', () => this.iframeReadyResolve(), true);
        }
        render() {
            return this.renderTemplate('pdf', {
                classes: 'formio-form-pdf',
                children: this.renderComponents()
            });
        }
        redraw() {
            return super.redraw();
        }
        attach(element) {
            return super.attach(element).then(() => {
                this.loadRefs(element, {
                    submitButton: 'single',
                    zoomIn: 'single',
                    zoomOut: 'single',
                    iframeContainer: 'single'
                });
                this.iframeReady = new NativePromise((resolve, reject) => {
                    this.iframeReadyResolve = resolve;
                    this.iframeReadyReject = reject;
                });
                this.iframeElement = this.ce('iframe', {
                    src: this.getSrc(),
                    id: `iframe-${ this.id }`,
                    seamless: true,
                    class: 'formio-iframe'
                });
                this.iframeElement.formioContainer = this.component.components;
                this.iframeElement.formioComponent = this;
                this.empty(this.refs.iframeContainer);
                this.appendChild(this.refs.iframeContainer, this.iframeElement);
                this.postMessage({
                    name: 'form',
                    data: this.form
                });
                const submitButton = this.components.find(c => c.element === this.refs.submitButton);
                this.refs.submitButton.classList.toggle('hidden', !submitButton.visible);
                this.addEventListener(this.refs.submitButton, 'click', () => {
                    this.postMessage({ name: 'getErrors' });
                    return this.submit();
                });
                this.addEventListener(this.refs.zoomIn, 'click', event => {
                    event.preventDefault();
                    this.postMessage({ name: 'zoomIn' });
                });
                this.addEventListener(this.refs.zoomOut, 'click', event => {
                    event.preventDefault();
                    this.postMessage({ name: 'zoomOut' });
                });
                const form = a.fastCloneDeep(this.form);
                if (this.formio) {
                    form.projectUrl = this.formio.projectUrl;
                    form.url = this.formio.formUrl;
                    form.base = this.formio.base;
                    this.postMessage({
                        name: 'token',
                        data: this.formio.getToken()
                    });
                }
                this.emit('attach');
            });
        }
        getSubmission() {
            return new NativePromise(resolve => {
                this.once('iframe-submission', resolve);
                this.postMessage({ name: 'getSubmission' });
            });
        }
        submitForm(options = {}) {
            return this.getSubmission().then(() => super.submitForm(options));
        }
        getSrc() {
            if (!this._form || !this._form.settings || !this._form.settings.pdf) {
                return '';
            }
            let iframeSrc = `${ this._form.settings.pdf.src }.html`;
            const params = [`id=${ this.id }`];
            if (this.options.readOnly) {
                params.push('readonly=1');
            }
            if (this.options.zoom) {
                params.push(`zoom=${ this.options.zoom }`);
            }
            if (this.builderMode) {
                params.push('builder=1');
            }
            if (params.length) {
                iframeSrc += `?${ params.join('&') }`;
            }
            return iframeSrc;
        }
        setForm(form) {
            return super.setForm(form).then(() => {
                if (this.formio) {
                    form.projectUrl = this.formio.projectUrl;
                    form.url = this.formio.formUrl;
                    form.base = this.formio.base;
                    this.postMessage({
                        name: 'token',
                        data: this.formio.getToken()
                    });
                }
                this.postMessage({
                    name: 'form',
                    data: form
                });
            });
        }
        setValue(submission, flags = {}) {
            const changed = super.setValue(submission, flags);
            if (!flags || !flags.fromIframe) {
                this.once('iframe-ready', () => {
                    this.postMessage({
                        name: 'submission',
                        data: submission
                    });
                });
            }
            return changed;
        }
        setSubmission(submission) {
            submission.readOnly = !!this.options.readOnly;
            return super.setSubmission(submission).then(() => {
                if (this.formio) {
                    this.formio.getDownloadUrl().then(url => {
                        if (!url) {
                            return;
                        }
                        if (!this.downloadButton) {
                            if (this.options.primaryProject) {
                                url += `&project=${ this.options.primaryProject }`;
                            }
                            this.downloadButton = this.ce('a', {
                                href: url,
                                target: '_blank',
                                style: 'position:absolute;right:10px;top:110px;cursor:pointer;'
                            }, this.ce('img', {
                                src: require('./pdf.image'),
                                style: 'width:3em;'
                            }));
                            this.element.insertBefore(this.downloadButton, this.iframe);
                        }
                    });
                }
            });
        }
        postMessage(message) {
            if (!this.iframeReady) {
                return;
            }
            if (!message.type) {
                message.type = 'iframe-data';
            }
            this.iframeReady.then(() => {
                if (this.iframeElement && this.iframeElement.contentWindow) {
                    this.iframeElement.contentWindow.postMessage(JSON.stringify(message), '*');
                }
            });
        }
        focusOnComponent(key) {
            this.postMessage({
                name: 'focusErroredField',
                data: key
            });
        }
        clear() {
        }
        showErrors(error, triggerEvent) {
            const helpBlock = document.getElementById('submit-error');
            if (!helpBlock) {
                const p = this.ce('p', { class: 'help-block' });
                this.setContent(p, this.t('submitError'));
                p.addEventListener('click', () => {
                    window.scrollTo(0, 0);
                });
                const div = this.ce('div', {
                    id: 'submit-error',
                    class: 'has-error'
                });
                this.appendTo(p, div);
                this.appendTo(div, this.element);
            }
            if (!this.errors.length && helpBlock) {
                helpBlock.remove();
            }
            if (this.errors.length) {
                this.focusOnComponent(this.errors[0].component.key);
            }
            if (this.errors.length) {
                this.focusOnComponent(this.errors[0].component.key);
            }
            super.showErrors(error, triggerEvent);
        }
    };
    window.addEventListener('message', event => {
        let eventData = null;
        try {
            eventData = JSON.parse(event.data);
        } catch (err) {
            eventData = null;
        }
        if (eventData && eventData.name && eventData.formId && Formio.forms.hasOwnProperty(eventData.formId)) {
            Formio.forms[eventData.formId].emit(`iframe-${ eventData.name }`, eventData.data);
        }
    });
});
define('skylark-formio/Wizard',[
    './vendors/getify/npo',
    'skylark-lodash',
    './Webform',
    './Formio',
    './utils/utils'
], function (NativePromise, _, Webform, Formio, a) {
    'use strict';
    return class Wizard extends Webform {
        constructor() {
            let element, options;
            if (arguments[0] instanceof HTMLElement || arguments[1]) {
                element = arguments[0];
                options = arguments[1];
            } else {
                options = arguments[0];
            }
            super(element, options);
            this.pages = [];
            this.prefixComps = [];
            this.suffixComps = [];
            this.components = [];
            this.originalComponents = [];
            this.page = 0;
            this.currentNextPage = 0;
            this._seenPages = [0];
        }
        isLastPage() {
            const next = this.getNextPage();
            if (_.isNumber(next)) {
                return 0 < next && next >= this.pages.length;
            }
            return _.isNull(next);
        }
        getPages(args = {}) {
            const {
                all = false
            } = args;
            const pages = this.pages.filter(all ? _.identity : (p, index) => this._seenPages.includes(index));
            return pages;
        }
        getComponents() {
            return this.submitting ? this.getPages({ all: this.isLastPage() }) : super.getComponents();
        }
        resetValue() {
            this.getPages({ all: true }).forEach(page => page.resetValue());
            this.setPristine(true);
        }
        init() {
            this.options.buttonSettings = _.defaults(this.options.buttonSettings, {
                showPrevious: true,
                showNext: true,
                showSubmit: true,
                showCancel: !this.options.readOnly
            });
            this.options.breadcrumbSettings = _.defaults(this.options.breadcrumbSettings, { clickable: true });
            this.page = 0;
            const onReady = super.init();
            this.setComponentSchema();
            return onReady;
        }
        get wizardKey() {
            return `wizard-${ this.id }`;
        }
        get form() {
            return this.wizard;
        }
        set form(value) {
            super.form = value;
        }
        get buttons() {
            const buttons = {};
            [
                {
                    name: 'cancel',
                    method: 'cancel'
                },
                {
                    name: 'previous',
                    method: 'prevPage'
                },
                {
                    name: 'next',
                    method: 'nextPage'
                },
                {
                    name: 'submit',
                    method: 'submit'
                }
            ].forEach(button => {
                if (this.hasButton(button.name)) {
                    buttons[button.name] = button;
                }
            });
            return buttons;
        }
        get renderContext() {
            return {
                wizardKey: this.wizardKey,
                isBreadcrumbClickable: this.isBreadcrumbClickable(),
                panels: this.pages.map(page => page.component),
                buttons: this.buttons,
                currentPage: this.page
            };
        }
        render() {
            const ctx = this.renderContext;
            return this.renderTemplate('wizard', {
                ...ctx,
                className: super.getClassName(),
                wizardHeader: this.renderTemplate('wizardHeader', ctx),
                wizardNav: this.renderTemplate('wizardNav', ctx),
                components: this.renderComponents([
                    ...this.prefixComps,
                    ...this.currentPage.components,
                    ...this.suffixComps
                ])
            }, this.builderMode ? 'builder' : 'form');
        }
        redrawNavigation() {
            if (this.element) {
                let navElement = this.element.querySelector(`#${ this.wizardKey }-nav`);
                if (navElement) {
                    this.detachNav();
                    navElement.outerHTML = this.renderTemplate('wizardNav', this.renderContext);
                    navElement = this.element.querySelector(`#${ this.wizardKey }-nav`);
                    this.loadRefs(navElement, {
                        [`${ this.wizardKey }-cancel`]: 'single',
                        [`${ this.wizardKey }-previous`]: 'single',
                        [`${ this.wizardKey }-next`]: 'single',
                        [`${ this.wizardKey }-submit`]: 'single'
                    });
                    this.attachNav();
                }
            }
        }
        redrawHeader() {
            if (this.element) {
                let headerElement = this.element.querySelector(`#${ this.wizardKey }-header`);
                if (headerElement) {
                    this.detachHeader();
                    headerElement.outerHTML = this.renderTemplate('wizardHeader', this.renderContext);
                    headerElement = this.element.querySelector(`#${ this.wizardKey }-header`);
                    this.loadRefs(headerElement, { [`${ this.wizardKey }-link`]: 'multiple' });
                    this.attachHeader();
                }
            }
        }
        attach(element) {
            this.element = element;
            this.loadRefs(element, {
                [this.wizardKey]: 'single',
                [`${ this.wizardKey }-cancel`]: 'single',
                [`${ this.wizardKey }-previous`]: 'single',
                [`${ this.wizardKey }-next`]: 'single',
                [`${ this.wizardKey }-submit`]: 'single',
                [`${ this.wizardKey }-link`]: 'multiple'
            });
            const promises = this.attachComponents(this.refs[this.wizardKey], [
                ...this.prefixComps,
                ...this.currentPage.components,
                ...this.suffixComps
            ]);
            this.attachNav();
            this.attachHeader();
            return promises.then(() => this.emit('render'));
        }
        isBreadcrumbClickable() {
            return _.get(this.options, 'breadcrumbSettings.clickable', true);
        }
        attachNav() {
            _.each(this.buttons, button => {
                const buttonElement = this.refs[`${ this.wizardKey }-${ button.name }`];
                this.addEventListener(buttonElement, 'click', event => {
                    event.preventDefault();
                    buttonElement.setAttribute('disabled', 'disabled');
                    this.setLoading(buttonElement, true);
                    this[button.method]().then(() => {
                        buttonElement.removeAttribute('disabled');
                        this.setLoading(buttonElement, false);
                    }).catch(() => {
                        buttonElement.removeAttribute('disabled');
                        this.setLoading(buttonElement, false);
                    });
                });
            });
        }
        attachHeader() {
            if (this.isBreadcrumbClickable()) {
                this.refs[`${ this.wizardKey }-link`].forEach((link, index) => {
                    this.addEventListener(link, 'click', event => {
                        this.emit('wizardNavigationClicked', this.pages[index]);
                        event.preventDefault();
                        return this.setPage(index).then(() => {
                            this.emit('wizardPageSelected', this.pages[index], index);
                        });
                    });
                });
            }
        }
        detachNav() {
            _.each(this.buttons, button => {
                this.removeEventListener(this.refs[`${ this.wizardKey }-${ button.name }`], 'click');
            });
        }
        detachHeader() {
            this.refs[`${ this.wizardKey }-link`].forEach(link => {
                this.removeEventListener(link, 'click');
            });
        }
        establishPages() {
            this.pages = [];
            this.prefixComps = [];
            this.suffixComps = [];
            const visible = [];
            const currentPages = {};
            const pageOptions = _.clone(this.options);
            if (this.components && this.components.length) {
                this.components.map(page => {
                    if (page.component.type === 'panel') {
                        currentPages[page.component.key || page.component.title] = page;
                    }
                });
            }
            if (this.originalComponents) {
                this.originalComponents.forEach(item => {
                    if (item.type === 'panel') {
                        if (!item.key) {
                            item.key = item.title;
                        }
                        let page = currentPages[item.key];
                        const isVisible = a.checkCondition(item, this.data, this.data, this.component, this);
                        if (isVisible) {
                            visible.push(item);
                            if (page) {
                                this.pages.push(page);
                            }
                        }
                        if (!page && isVisible) {
                            page = this.createComponent(item, pageOptions);
                            this.pages.push(page);
                            page.eachComponent(component => {
                                component.page = this.pages.length - 1;
                            });
                        } else if (page && !isVisible) {
                            this.removeComponent(page);
                        }
                    } else if (item.type !== 'button') {
                        if (!this.pages.length) {
                            this.prefixComps.push(this.createComponent(item, pageOptions));
                        } else {
                            this.suffixComps.push(this.createComponent(item, pageOptions));
                        }
                    }
                });
            }
            return visible;
        }
        addComponents() {
            this.establishPages();
        }
        setPage(num) {
            if (num === this.page) {
                return NativePromise.resolve();
            }
            if (!this.wizard.full && num >= 0 && num < this.pages.length) {
                this.page = num;
                this.pageFieldLogic(num);
                this.getNextPage();
                if (!this._seenPages.includes(num)) {
                    this._seenPages = this._seenPages.concat(num);
                }
                this.redraw().then(() => {
                    if (!this.options.readOnly) {
                        this.checkValidity(this.submission.data, false, this.submission.data, true);
                    }
                });
                return NativePromise.resolve();
            } else if (this.wizard.full || !this.pages.length) {
                this.redraw();
                return NativePromise.resolve();
            }
            return NativePromise.reject('Page not found');
        }
        pageFieldLogic(page) {
            this.component = this.pages[page].component;
            this.originalComponent = a.fastCloneDeep(this.component);
            this.fieldLogic(this.data);
            this.disabled = this.shouldDisabled;
        }
        get currentPage() {
            return this.pages && this.pages.length >= this.page ? this.pages[this.page] : { components: [] };
        }
        getNextPage() {
            const data = this.submission.data;
            const form = this.pages[this.page].component;
            if (form) {
                const page = this.pages.length > this.page + 1 ? this.page + 1 : -1;
                if (form.nextPage) {
                    const next = this.evaluate(form.nextPage, {
                        next: page,
                        data,
                        page,
                        form
                    }, 'next');
                    if (next === null) {
                        this.currentNextPage = null;
                        return null;
                    }
                    const pageNum = parseInt(next, 10);
                    if (!isNaN(parseInt(pageNum, 10)) && isFinite(pageNum)) {
                        this.currentNextPage = pageNum;
                        return pageNum;
                    }
                    this.currentNextPage = this.getPageIndexByKey(next);
                    return this.currentNextPage;
                }
                this.currentNextPage = page;
                return page;
            }
            this.currentNextPage = null;
            return null;
        }
        getPreviousPage() {
            return this.page - 1;
        }
        beforeSubmit() {
            return NativePromise.all(this.getPages().map(page => {
                page.options.beforeSubmit = true;
                return page.beforeSubmit();
            }));
        }
        beforePage(next) {
            return new NativePromise((resolve, reject) => {
                this.hook(next ? 'beforeNext' : 'beforePrev', this.currentPage, this.submission, err => {
                    if (err) {
                        this.showErrors(err, true);
                        reject(err);
                    }
                    const form = this.currentPage;
                    if (form) {
                        form.beforePage(next).then(resolve).catch(reject);
                    } else {
                        resolve();
                    }
                });
            });
        }
        nextPage() {
            if (this.options.readOnly) {
                return this.setPage(this.getNextPage()).then(() => {
                    this.emit('nextPage', {
                        page: this.page,
                        submission: this.submission
                    });
                });
            }
            if (this.checkValidity(this.submission.data, true, this.submission.data, true)) {
                this.checkData(this.submission.data);
                return this.beforePage(true).then(() => {
                    return this.setPage(this.getNextPage()).then(() => {
                        this.emit('nextPage', {
                            page: this.page,
                            submission: this.submission
                        });
                    });
                });
            } else {
                this.currentPage.components.forEach(comp => comp.setPristine(false));
                return NativePromise.reject(this.showErrors([], true));
            }
        }
        prevPage() {
            return this.beforePage().then(() => {
                return this.setPage(this.getPreviousPage()).then(() => {
                    this.emit('prevPage', {
                        page: this.page,
                        submission: this.submission
                    });
                });
            });
        }
        cancel(noconfirm) {
            if (super.cancel(noconfirm)) {
                this.setPristine(true);
                return this.setPage(0).then(() => {
                    this.redraw();
                    return this.page;
                });
            }
            return NativePromise.resolve();
        }
        getPageIndexByKey(key) {
            let pageIndex = this.page;
            this.pages.forEach((page, index) => {
                if (page.component.key === key) {
                    pageIndex = index;
                    return false;
                }
            });
            return pageIndex;
        }
        get schema() {
            return this.wizard;
        }
        setComponentSchema() {
            const pageKeys = {};
            this.originalComponents = [];
            this.component.components.map(item => {
                if (item.type === 'panel') {
                    item.key = a.uniqueKey(pageKeys, item.key || 'panel');
                    pageKeys[item.key] = true;
                }
                this.originalComponents.push(_.clone(item));
            });
            if (!Object.keys(pageKeys).length) {
                const newPage = {
                    type: 'panel',
                    title: 'Page 1',
                    label: 'Page 1',
                    key: 'page1',
                    components: this.component.components
                };
                this.component.components = [newPage];
                this.originalComponents.push(_.clone(newPage));
            }
        }
        setForm(form) {
            if (!form) {
                return;
            }
            this.wizard = form;
            this.component.components = form.components || [];
            this.setComponentSchema();
            return super.setForm(form);
        }
        setValue(submission, flags = {}) {
            const changed = super.setValue(submission, flags);
            this.pageFieldLogic(this.page);
            return changed;
        }
        isClickable(page, index) {
            return this.page !== index && a.firstNonNil([
                _.get(page, 'breadcrumbClickable'),
                this.options.breadcrumbSettings.clickable
            ]);
        }
        hasButton(name, nextPage) {
            const currentPage = this.currentPage;
            if (name === 'previous') {
                const show = a.firstNonNil([
                    _.get(currentPage, 'buttonSettings.previous'),
                    this.options.buttonSettings.showPrevious
                ]);
                return this.getPreviousPage() > -1 && show;
            }
            nextPage = nextPage === undefined ? this.getNextPage() : nextPage;
            if (name === 'next') {
                const show = a.firstNonNil([
                    _.get(currentPage, 'buttonSettings.next'),
                    this.options.buttonSettings.showNext
                ]);
                return nextPage !== null && nextPage !== -1 && show;
            }
            if (name === 'cancel') {
                return a.firstNonNil([
                    _.get(currentPage, 'buttonSettings.cancel'),
                    this.options.buttonSettings.showCancel
                ]);
            }
            if (name === 'submit') {
                const show = a.firstNonNil([
                    _.get(currentPage, 'buttonSettings.submit'),
                    this.options.buttonSettings.showSubmit
                ]);
                return show && !this.options.readOnly && (nextPage === null || this.page === this.pages.length - 1);
            }
            return true;
        }
        pageId(page) {
            if (page.key) {
                return `${ page.key }-${ page.title }`;
            } else if (page.components && page.components.length > 0) {
                return this.pageId(page.components[0]);
            } else {
                return page.title;
            }
        }
        onChange(flags, changed, modified) {
            super.onChange(flags, changed, modified);
            if (this.alert && !this.submitted) {
                this.checkValidity(this.submission.data, false, this.submission.data, true);
                this.showErrors([], true);
            }
            const currentPanels = this.pages.map(page => page.component.key);
            const panels = this.establishPages().map(panel => panel.key);
            const currentNextPage = this.currentNextPage;
            if (!_.isEqual(panels, currentPanels)) {
                this.redrawHeader();
            }
            if (currentNextPage !== this.getNextPage()) {
                this.redrawNavigation();
            }
        }
        checkValidity(data, dirty, row, currentPageOnly) {
            if (!this.undefined(row, data)) {
                this.setCustomValidity('');
                return true;
            }
            const components = !currentPageOnly || this.isLastPage() ? this.getComponents() : this.currentPage.components;
            return components.reduce((check, comp) => comp.checkValidity(data, dirty, row) && check, true);
        }
        get errors() {
            if (!this.isLastPage()) {
                return this.currentPage.errors;
            }
            return super.errors;
        }
        focusOnComponent(key) {
            let pageIndex = 0;
            const [page] = this.pages.filter((page, index) => {
                if (page.getComponent(key)) {
                    pageIndex = index;
                    return true;
                }
                return false;
            });
            if (page && page !== this.currentPage) {
                return this.setPage(pageIndex).then(() => {
                    this.checkValidity(this.submission.data, true, this.submission.data);
                    this.showErrors();
                    super.focusOnComponent(key);
                });
            }
            return super.focusOnComponent(key);
        }
    };
    Wizard.setBaseUrl = Formio.setBaseUrl;
    Wizard.setApiUrl = Formio.setApiUrl;
    Wizard.setAppUrl = Formio.setAppUrl;
});
define('skylark-formio/displays/Displays',[
    'skylark-lodash',
    '../PDF',
    '../Webform',
    '../Wizard'
], function (_, pdf, webform, wizard) {
    'use strict';
    return class Displays {
        static addDisplay(name, display) {
            Displays.displays[name] = display;
        }
        static addDisplays(displays) {
            Displays.displays = _.merge(Displays.displays, displays);
        }
        static getDisplay(name) {
            return Displays.displays[name];
        }
        static getDisplays() {
            return Displays.displays;
        }
    };
    Displays.displays = {
        pdf,
        webform,
        wizard
    };
});
define('skylark-formio/displays/index',['./Displays'], function (Displays) {
    'use strict';
    return Displays;
});
define('skylark-formio/Form',[
    './Element',
    './Formio',
    './displays/index',
    './templates/index',
    './utils/utils',
    './vendors/getify/npo'
], function (Element, Formio, Displays, templates, FormioUtils, NativePromise) {
    'use strict';
    return class Form extends Element {
        constructor(...args) {
            let options = args[0] instanceof HTMLElement ? args[2] : args[1];
            if (Formio.options && Formio.options.form) {
                options = Object.assign(options, Formio.options.form);
            }
            super(options);
            this.ready = new NativePromise((resolve, reject) => {
                this.readyResolve = resolve;
                this.readyReject = reject;
            });
            this.instance = null;
            if (args[0] instanceof HTMLElement) {
                this.element = args[0];
                this.options = args[2] || {};
                this.options.events = this.events;
                this.setForm(args[1]).then(() => this.readyResolve(this.instance)).catch(this.readyReject);
            } else if (args[0]) {
                this.element = null;
                this.options = args[1] || {};
                this.options.events = this.events;
                this.setForm(args[0]).then(() => this.readyResolve(this.instance)).catch(this.readyReject);
            } else {
                this.element = null;
                this.options = {};
                this.options.events = this.events;
            }
            this.display = '';
        }
        create(display) {
            if (this.options && (this.options.flatten || this.options.renderMode === 'flat')) {
                display = 'form';
            }
            this.display = display;
            if (Displays.displays[display]) {
                return new Displays.displays[display](this.element, this.options);
            } else {
                return new Displays.displays['webform'](this.element, this.options);
            }
        }
        set form(formParam) {
            return this.setForm(formParam);
        }
        errorForm(err) {
            return {
                components: [{
                        'label': 'HTML',
                        'tag': 'div',
                        'className': 'error error-message alert alert-danger ui red message',
                        'attrs': [{
                                'attr': 'role',
                                'value': 'alert'
                            }],
                        'key': 'errorMessage',
                        'type': 'htmlelement',
                        'input': false,
                        'content': typeof err === 'string' ? err : err.message
                    }]
            };
        }
        setForm(formParam) {
            let result;
            formParam = formParam || this.form;
            if (typeof formParam === 'string') {
                const formio = new Formio(formParam);
                let error;
                result = this.getSubmission(formio).catch(err => {
                    error = err;
                }).then(submission => {
                    return formio.loadForm().catch(err => {
                        error = err;
                    }).then(form => {
                        if (error) {
                            form = this.errorForm(error);
                        }
                        this.instance = this.instance || this.create(form.display);
                        this.instance.url = formParam;
                        this.instance.nosubmit = false;
                        this._form = this.instance.form = form;
                        if (submission) {
                            this.instance.submission = submission;
                        }
                        if (error) {
                            throw error;
                        }
                        return this.instance;
                    });
                });
            } else {
                this.instance = this.instance || this.create(formParam.display);
                this._form = this.instance.form = formParam;
                result = this.instance.ready;
            }
            return result.then(() => {
                this.element = this.instance.element;
                return this.instance;
            });
        }
        getSubmission(formio) {
            if (formio.submissionId) {
                return formio.loadSubmission();
            }
            return NativePromise.resolve();
        }
        get form() {
            return this._form;
        }
        setDisplay(display) {
            if (this.display === display && this.instance) {
                return NativePromise.resolve(this.instance);
            }
            this.form.display = display;
            this.instance.destroy();
            this.instance = this.create(display);
            return this.setForm(this.form);
        }
        empty() {
            if (this.element) {
                while (this.element.firstChild) {
                    this.element.removeChild(this.element.firstChild);
                }
            }
        }
        static embed(embed) {
            return new NativePromise(resolve => {
                if (!embed || !embed.src) {
                    resolve();
                }
                const id = this.id || `formio-${ Math.random().toString(36).substring(7) }`;
                const className = embed.class || 'formio-form-wrapper';
                let code = embed.styles ? `<link rel="stylesheet" href="${ embed.styles }">` : '';
                code += `<div id="${ id }" class="${ className }"></div>`;
                document.write(code);
                let attempts = 0;
                const wait = setInterval(() => {
                    attempts++;
                    const formElement = document.getElementById(id);
                    if (formElement || attempts > 10) {
                        resolve(new Form(formElement, embed.src).ready);
                        clearInterval(wait);
                    }
                }, 10);
            });
        }
        sanitize(dirty) {
            return FormioUtils.sanitize(dirty, this.options);
        }
        setContent(element, content) {
            if (element instanceof HTMLElement) {
                element.innerHTML = this.sanitize(content);
                return true;
            }
            return false;
        }
        build() {
            if (!this.instance) {
                return NativePromise.reject('Form not ready. Use form.ready promise');
            }
            if (!this.element) {
                return NativePromise.reject('No DOM element for form.');
            }
            const template = this.options && this.options.template ? this.options.template : 'bootstrap';
            const loader = templates[template].loader || templates.bootstrap.loader;
            this.setContent(this.element, loader.form);
            return this.render().then(html => {
                this.setContent(this.element, html);
                return this.attach(this.element).then(() => this.instance);
            }).then(param => {
                this.emit('build', param);
                return param;
            });
        }
        render() {
            if (!this.instance) {
                return NativePromise.reject('Form not ready. Use form.ready promise');
            }
            return NativePromise.resolve(this.instance.render()).then(param => {
                this.emit('render', param);
                return param;
            });
        }
        attach(element) {
            if (!this.instance) {
                return NativePromise.reject('Form not ready. Use form.ready promise');
            }
            this.element = element;
            return this.instance.attach(this.element).then(param => {
                this.emit('attach', param);
                return param;
            });
        }
    };
    Formio.embedForm = embed => Form.embed(embed);
    Formio.createForm = (...args) => {
        return new Form(...args).ready;
    };
    Formio.Form = Form;
});
/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.3.1
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

define('skylark-formio/vendors/tooltip-js/tooltip',["skylark-popper"],function(Popper){



  /**
   * Check if the given variable is a function
   * @method
   * @memberof Popper.Utils
   * @argument {Any} functionToCheck - variable to check
   * @returns {Boolean} answer to: is a function?
   */
  function isFunction(functionToCheck) {
    const getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  const DEFAULT_OPTIONS = {
    container: false,
    delay: 0,
    html: false,
    placement: 'top',
    title: '',
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    offset: 0,
    arrowSelector: '.tooltip-arrow, .tooltip__arrow',
    innerSelector: '.tooltip-inner, .tooltip__inner'
  };

  class Tooltip {
    /**
     * Create a new Tooltip.js instance
     * @class Tooltip
     * @param {HTMLElement} reference - The DOM node used as reference of the tooltip (it can be a jQuery element).
     * @param {Object} options
     * @param {String} options.placement='top'
     *      Placement of the popper accepted values: `top(-start, -end), right(-start, -end), bottom(-start, -end),
     *      left(-start, -end)`
     * @param {String} options.arrowSelector='.tooltip-arrow, .tooltip__arrow' - className used to locate the DOM arrow element in the tooltip.
     * @param {String} options.innerSelector='.tooltip-inner, .tooltip__inner' - className used to locate the DOM inner element in the tooltip.
     * @param {HTMLElement|String|false} options.container=false - Append the tooltip to a specific element.
     * @param {Number|Object} options.delay=0
     *      Delay showing and hiding the tooltip (ms) - does not apply to manual trigger type.
     *      If a number is supplied, delay is applied to both hide/show.
     *      Object structure is: `{ show: 500, hide: 100 }`
     * @param {Boolean} options.html=false - Insert HTML into the tooltip. If false, the content will inserted with `textContent`.
     * @param {String} [options.template='<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>']
     *      Base HTML to used when creating the tooltip.
     *      The tooltip's `title` will be injected into the `.tooltip-inner` or `.tooltip__inner`.
     *      `.tooltip-arrow` or `.tooltip__arrow` will become the tooltip's arrow.
     *      The outermost wrapper element should have the `.tooltip` class.
     * @param {String|HTMLElement|TitleFunction} options.title='' - Default title value if `title` attribute isn't present.
     * @param {String} [options.trigger='hover focus']
     *      How tooltip is triggered - click, hover, focus, manual.
     *      You may pass multiple triggers; separate them with a space. `manual` cannot be combined with any other trigger.
     * @param {Boolean} options.closeOnClickOutside=false - Close a popper on click outside of the popper and reference element. This has effect only when options.trigger is 'click'.
     * @param {String|HTMLElement} options.boundariesElement
     *      The element used as boundaries for the tooltip. For more information refer to Popper.js'
     *      [boundariesElement docs](https://popper.js.org/popper-documentation.html)
     * @param {Number|String} options.offset=0 - Offset of the tooltip relative to its reference. For more information refer to Popper.js'
     *      [offset docs](https://popper.js.org/popper-documentation.html)
     * @param {Object} options.popperOptions={} - Popper options, will be passed directly to popper instance. For more information refer to Popper.js'
     *      [options docs](https://popper.js.org/popper-documentation.html)
     * @return {Object} instance - The generated tooltip instance
     */
    constructor(reference, options) {
      _initialiseProps.call(this);

      // apply user options over default ones
      options = _extends({}, DEFAULT_OPTIONS, options);

      reference.jquery && (reference = reference[0]);

      // cache reference and options
      this.reference = reference;
      this.options = options;

      // get events list
      const events = typeof options.trigger === 'string' ? options.trigger.split(' ').filter(trigger => ['click', 'hover', 'focus'].indexOf(trigger) !== -1) : [];

      // set initial state
      this._isOpen = false;
      this._popperOptions = {};

      // set event listeners
      this._setEventListeners(reference, events, options);
    }

    //
    // Public methods
    //

    /**
     * Reveals an element's tooltip. This is considered a "manual" triggering of the tooltip.
     * Tooltips with zero-length titles are never displayed.
     * @method Tooltip#show
     * @memberof Tooltip
     */


    /**
     * Hides an element’s tooltip. This is considered a “manual” triggering of the tooltip.
     * @method Tooltip#hide
     * @memberof Tooltip
     */


    /**
     * Hides and destroys an element’s tooltip.
     * @method Tooltip#dispose
     * @memberof Tooltip
     */


    /**
     * Toggles an element’s tooltip. This is considered a “manual” triggering of the tooltip.
     * @method Tooltip#toggle
     * @memberof Tooltip
     */


    /**
     * Updates the tooltip's title content
     * @method Tooltip#updateTitleContent
     * @memberof Tooltip
     * @param {String|HTMLElement} title - The new content to use for the title
     */


    //
    // Private methods
    //

    /**
     * Creates a new tooltip node
     * @memberof Tooltip
     * @private
     * @param {HTMLElement} reference
     * @param {String} template
     * @param {String|HTMLElement|TitleFunction} title
     * @param {Boolean} allowHtml
     * @return {HTMLElement} tooltipNode
     */
    _create(reference, template, title, allowHtml) {
      // create tooltip element
      const tooltipGenerator = window.document.createElement('div');
      tooltipGenerator.innerHTML = template.trim();
      const tooltipNode = tooltipGenerator.childNodes[0];

      // add unique ID to our tooltip (needed for accessibility reasons)
      tooltipNode.id = `tooltip_${Math.random().toString(36).substr(2, 10)}`;

      // set initial `aria-hidden` state to `false` (it's visible!)
      tooltipNode.setAttribute('aria-hidden', 'false');

      // add title to tooltip
      const titleNode = tooltipGenerator.querySelector(this.options.innerSelector);
      this._addTitleContent(reference, title, allowHtml, titleNode);

      // return the generated tooltip node
      return tooltipNode;
    }

    _addTitleContent(reference, title, allowHtml, titleNode) {
      if (title.nodeType === 1 || title.nodeType === 11) {
        // if title is a element node or document fragment, append it only if allowHtml is true
        allowHtml && titleNode.appendChild(title);
      } else if (isFunction(title)) {
        // if title is a function, call it and set textContent or innerHtml depending by `allowHtml` value
        const titleText = title.call(reference);
        allowHtml ? titleNode.innerHTML = titleText : titleNode.textContent = titleText;
      } else {
        // if it's just a simple text, set textContent or innerHtml depending by `allowHtml` value
        allowHtml ? titleNode.innerHTML = title : titleNode.textContent = title;
      }
    }

    _show(reference, options) {
      // don't show if it's already visible
      // or if it's not being showed
      if (this._isOpen && !this._isOpening) {
        return this;
      }
      this._isOpen = true;

      // if the tooltipNode already exists, just show it
      if (this._tooltipNode) {
        this._tooltipNode.style.visibility = 'visible';
        this._tooltipNode.setAttribute('aria-hidden', 'false');
        this.popperInstance.update();
        return this;
      }

      // get title
      const title = reference.getAttribute('title') || options.title;

      // don't show tooltip if no title is defined
      if (!title) {
        return this;
      }

      // create tooltip node
      const tooltipNode = this._create(reference, options.template, title, options.html);

      // Add `aria-describedby` to our reference element for accessibility reasons
      reference.setAttribute('aria-describedby', tooltipNode.id);

      // append tooltip to container
      const container = this._findContainer(options.container, reference);

      this._append(tooltipNode, container);

      this._popperOptions = _extends({}, options.popperOptions, {
        placement: options.placement
      });

      this._popperOptions.modifiers = _extends({}, this._popperOptions.modifiers, {
        arrow: {
          element: this.options.arrowSelector
        },
        offset: {
          offset: options.offset
        }
      });

      if (options.boundariesElement) {
        this._popperOptions.modifiers.preventOverflow = {
          boundariesElement: options.boundariesElement
        };
      }

      this.popperInstance = new Popper(reference, tooltipNode, this._popperOptions);

      this._tooltipNode = tooltipNode;

      return this;
    }

    _hide() /*reference, options*/{
      // don't hide if it's already hidden
      if (!this._isOpen) {
        return this;
      }

      this._isOpen = false;

      // hide tooltipNode
      this._tooltipNode.style.visibility = 'hidden';
      this._tooltipNode.setAttribute('aria-hidden', 'true');

      return this;
    }

    _dispose() {
      // remove event listeners first to prevent any unexpected behaviour
      this._events.forEach(({ func, event }) => {
        this.reference.removeEventListener(event, func);
      });
      this._events = [];

      if (this._tooltipNode) {
        this._hide();

        // destroy instance
        this.popperInstance.destroy();

        // destroy tooltipNode if removeOnDestroy is not set, as popperInstance.destroy() already removes the element
        if (!this.popperInstance.options.removeOnDestroy) {
          this._tooltipNode.parentNode.removeChild(this._tooltipNode);
          this._tooltipNode = null;
        }
      }
      return this;
    }

    _findContainer(container, reference) {
      // if container is a query, get the relative element
      if (typeof container === 'string') {
        container = window.document.querySelector(container);
      } else if (container === false) {
        // if container is `false`, set it to reference parent
        container = reference.parentNode;
      }
      return container;
    }

    /**
     * Append tooltip to container
     * @memberof Tooltip
     * @private
     * @param {HTMLElement} tooltipNode
     * @param {HTMLElement|String|false} container
     */
    _append(tooltipNode, container) {
      container.appendChild(tooltipNode);
    }

    _setEventListeners(reference, events, options) {
      const directEvents = [];
      const oppositeEvents = [];

      events.forEach(event => {
        switch (event) {
          case 'hover':
            directEvents.push('mouseenter');
            oppositeEvents.push('mouseleave');
            break;
          case 'focus':
            directEvents.push('focus');
            oppositeEvents.push('blur');
            break;
          case 'click':
            directEvents.push('click');
            oppositeEvents.push('click');
            break;
        }
      });

      // schedule show tooltip
      directEvents.forEach(event => {
        const func = evt => {
          if (this._isOpening === true) {
            return;
          }
          evt.usedByTooltip = true;
          this._scheduleShow(reference, options.delay, options, evt);
        };
        this._events.push({ event, func });
        reference.addEventListener(event, func);
      });

      // schedule hide tooltip
      oppositeEvents.forEach(event => {
        const func = evt => {
          if (evt.usedByTooltip === true) {
            return;
          }
          this._scheduleHide(reference, options.delay, options, evt);
        };
        this._events.push({ event, func });
        reference.addEventListener(event, func);
        if (event === 'click' && options.closeOnClickOutside) {
          document.addEventListener('mousedown', e => {
            if (!this._isOpening) {
              return;
            }
            const popper = this.popperInstance.popper;
            if (reference.contains(e.target) || popper.contains(e.target)) {
              return;
            }
            func(e);
          }, true);
        }
      });
    }

    _scheduleShow(reference, delay, options /*, evt */) {
      this._isOpening = true;
      // defaults to 0
      const computedDelay = delay && delay.show || delay || 0;
      this._showTimeout = window.setTimeout(() => this._show(reference, options), computedDelay);
    }

    _scheduleHide(reference, delay, options, evt) {
      this._isOpening = false;
      // defaults to 0
      const computedDelay = delay && delay.hide || delay || 0;
      window.setTimeout(() => {
        window.clearTimeout(this._showTimeout);
        if (this._isOpen === false) {
          return;
        }
        if (!document.body.contains(this._tooltipNode)) {
          return;
        }

        // if we are hiding because of a mouseleave, we must check that the new
        // reference isn't the tooltip, because in this case we don't want to hide it
        if (evt.type === 'mouseleave') {
          const isSet = this._setTooltipNodeEvent(evt, reference, delay, options);

          // if we set the new event, don't hide the tooltip yet
          // the new event will take care to hide it if necessary
          if (isSet) {
            return;
          }
        }

        this._hide(reference, options);
      }, computedDelay);
    }

    _updateTitleContent(title) {
      if (typeof this._tooltipNode === 'undefined') {
        if (typeof this.options.title !== 'undefined') {
          this.options.title = title;
        }
        return;
      }
      const titleNode = this._tooltipNode.parentNode.querySelector(this.options.innerSelector);
      this._clearTitleContent(titleNode, this.options.html, this.reference.getAttribute('title') || this.options.title);
      this._addTitleContent(this.reference, title, this.options.html, titleNode);
      this.options.title = title;
      this.popperInstance.update();
    }

    _clearTitleContent(titleNode, allowHtml, lastTitle) {
      if (lastTitle.nodeType === 1 || lastTitle.nodeType === 11) {
        allowHtml && titleNode.removeChild(lastTitle);
      } else {
        allowHtml ? titleNode.innerHTML = '' : titleNode.textContent = '';
      }
    }

  }

  /**
   * Title function, its context is the Tooltip instance.
   * @memberof Tooltip
   * @callback TitleFunction
   * @return {String} placement - The desired title.
   */

  var _initialiseProps = function () {
    this.show = () => this._show(this.reference, this.options);

    this.hide = () => this._hide();

    this.dispose = () => this._dispose();

    this.toggle = () => {
      if (this._isOpen) {
        return this.hide();
      } else {
        return this.show();
      }
    };

    this.updateTitleContent = title => this._updateTitleContent(title);

    this._events = [];

    this._setTooltipNodeEvent = (evt, reference, delay, options) => {
      const relatedreference = evt.relatedreference || evt.toElement || evt.relatedTarget;

      const callback = evt2 => {
        const relatedreference2 = evt2.relatedreference || evt2.toElement || evt2.relatedTarget;

        // Remove event listener after call
        this._tooltipNode.removeEventListener(evt.type, callback);

        // If the new reference is not the reference element
        if (!reference.contains(relatedreference2)) {
          // Schedule to hide tooltip
          this._scheduleHide(reference, options.delay, options, evt2);
        }
      };

      if (this._tooltipNode.contains(relatedreference)) {
        // listen to mouseleave on the tooltip element to be able to hide the tooltip
        this._tooltipNode.addEventListener(evt.type, callback);
        return true;
      }

      return false;
    };
  };

  return Tooltip;

});
define('skylark-formio/utils/builder',[
    'skylark-lodash',
    './utils'
], function (_, a) {
    'use strict';
    return {
        uniquify(container, component) {
            let changed = false;
            const formKeys = {};
            a.eachComponent(container, function (comp) {
                formKeys[comp.key] = true;
            }, true);
            a.eachComponent([component], component => {
                if (!component.key) {
                    return;
                }
                const newKey = a.uniqueKey(formKeys, component.key);
                if (newKey !== component.key) {
                    component.key = newKey;
                    formKeys[newKey] = true;
                    changed = true;
                }
            }, true);
            return changed;
        },
        additionalShortcuts: {
            button: [
                'Enter',
                'Esc'
            ]
        },
        getAlphaShortcuts() {
            return _.range('A'.charCodeAt(), 'Z'.charCodeAt() + 1).map(charCode => String.fromCharCode(charCode));
        },
        getAdditionalShortcuts(type) {
            return this.additionalShortcuts[type] || [];
        },
        getBindedShortcuts(components, input) {
            const result = [];
            a.eachComponent(components, component => {
                if (component === input) {
                    return;
                }
                if (component.shortcut) {
                    result.push(component.shortcut);
                }
                if (component.values) {
                    component.values.forEach(value => {
                        if (value.shortcut) {
                            result.push(value.shortcut);
                        }
                    });
                }
            }, true);
            return result;
        },
        getAvailableShortcuts(form, component) {
            if (!component) {
                return [];
            }
            return [''].concat(_.difference(this.getAlphaShortcuts().concat(this.getAdditionalShortcuts(component.type)), this.getBindedShortcuts(form.components, component))).map(shortcut => ({
                label: shortcut,
                value: shortcut
            }));
        }
    };
});
define('skylark-formio/WebformBuilder',[
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
define('skylark-formio/PDFBuilder',[
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
define('skylark-formio/WizardBuilder',[
    './WebformBuilder',
    './Webform',
    './utils/builder',
    'skylark-lodash'
], function (WebformBuilder, Webform, BuilderUtils, _) {
    'use strict';
    return class WizardBuilder extends WebformBuilder {
        constructor() {
            let element, options;
            if (arguments[0] instanceof HTMLElement || arguments[1]) {
                element = arguments[0];
                options = arguments[1];
            } else {
                options = arguments[0];
            }
            options.skipInit = false;
            super(element, options);
            this._form = { components: [this.getPageConfig(1)] };
            this.page = 0;
            this.options.hooks.attachPanel = (element, component) => {
                if (component.refs.removeComponent) {
                    this.addEventListener(component.refs.removeComponent, 'click', () => {
                        const pageIndex = this.pages.findIndex(page => page.key === component.key);
                        const componentIndex = this._form.components.findIndex(comp => comp.key === component.key);
                        if (pageIndex !== -1) {
                            this.removePage(pageIndex, componentIndex);
                        }
                    });
                }
            };
            const originalRenderComponentsHook = this.options.hooks.renderComponents;
            this.options.hooks.renderComponents = (html, {components, self}) => {
                if (self.type === 'form' && !self.root) {
                    return html;
                } else {
                    return originalRenderComponentsHook(html, {
                        components,
                        self
                    });
                }
            };
            const originalAttachComponentsHook = this.options.hooks.attachComponents;
            this.options.hooks.attachComponents = (element, components, container, component) => {
                if (component.type === 'form' && !component.root) {
                    return element;
                }
                return originalAttachComponentsHook(element, components, container, component);
            };
            this.on('saveComponent', (component, originalComponent) => {
                const webformComponents = this.webform.components.map(({component}) => component);
                if (this._form.components.includes(originalComponent)) {
                    this._form.components[this._form.components.indexOf(originalComponent)] = component;
                    this.rebuild();
                } else if (webformComponents.includes(originalComponent)) {
                    this._form.components.push(component);
                    this.rebuild();
                }
            }, true);
        }
        allowDrop(element) {
            return this.webform && this.webform.refs && this.webform.refs.webform === element ? false : true;
        }
        get pages() {
            return _.filter(this._form.components, { type: 'panel' });
        }
        get currentPage() {
            const pages = this.pages;
            return pages && pages.length >= this.page ? pages[this.page] : null;
        }
        set form(value) {
            this._form = value;
            if (!this._form.components || !Array.isArray(this._form.components)) {
                this._form.components = [];
            }
            if (this.pages.length === 0) {
                const components = this._form.components.filter(component => component.type !== 'button');
                this._form.components = [this.getPageConfig(1, components)];
            }
            this.rebuild();
        }
        get form() {
            return this._form;
        }
        get schema() {
            _.assign(this.currentPage, this.webform._form.components[0]);
            const webform = new Webform(this.options);
            webform.form = this._form;
            return webform.schema;
        }
        render() {
            return this.renderTemplate('builderWizard', {
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
                pages: this.pages,
                form: this.webform.render()
            });
        }
        attach(element) {
            this.loadRefs(element, {
                addPage: 'multiple',
                gotoPage: 'multiple'
            });
            this.refs.addPage.forEach(link => {
                this.addEventListener(link, 'click', event => {
                    event.preventDefault();
                    this.addPage();
                });
            });
            this.refs.gotoPage.forEach((link, index) => {
                this.addEventListener(link, 'click', event => {
                    event.preventDefault();
                    this.setPage(index);
                });
            });
            return super.attach(element);
        }
        rebuild() {
            const page = this.currentPage;
            this.webform.form = {
                display: 'form',
                type: 'form',
                components: page ? [page] : []
            };
            return this.redraw();
        }
        addPage() {
            const pageNum = this.pages.length + 1;
            const newPage = this.getPageConfig(pageNum);
            BuilderUtils.uniquify(this._form.components, newPage);
            this._form.components.push(newPage);
            this.emit('saveComponent', newPage);
            return this.rebuild();
        }
        removePage(pageIndex, componentIndex) {
            this._form.components.splice(componentIndex, 1);
            if (pageIndex === this.pages.length) {
                if (pageIndex === 0) {
                    this._form.components.push(this.getPageConfig(1));
                    return this.rebuild();
                } else {
                    return this.setPage(pageIndex - 1);
                }
            } else {
                return this.rebuild();
            }
        }
        setPage(index) {
            if (index === this.page) {
                return;
            }
            this.page = index;
            return this.rebuild();
        }
        getPageConfig(index, components = []) {
            return {
                title: `Page ${ index }`,
                label: `Page ${ index }`,
                type: 'panel',
                key: `page${ index }`,
                components
            };
        }
        pasteComponent(component) {
            if (component instanceof WizardBuilder) {
                return;
            }
            return super.pasteComponent(component);
        }
    };
});
define('skylark-formio/main',[
	"./Formio",
	"./Form",
	"./Webform",
	"./WebformBuilder",
	"./PDF",
	"./PDFBuilder",
	"./Wizard",
	"./WizardBuilder"

],function(){
	
});
define('skylark-formio', ['skylark-formio/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-formio.js.map
