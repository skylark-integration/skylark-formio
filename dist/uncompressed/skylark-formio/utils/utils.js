define([
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