define([
    'lodash',
    'fetch-ponyfill',
    'json-logic-js',
    'moment-timezone/moment-timezone',
    'jstimezonedetect',
    './jsonlogic/operators',
    'native-promise-only',
    './formUtils',
    'string-hash'
], function (_, fetchPonyfill, jsonLogic, moment, jtz, a, Promise, b, stringHash) {
    'use strict';
    const {fetch} = fetchPonyfill({ Promise: Promise });
    export * from './formUtils';
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
        args.component = args.component ? _.cloneDeep(args.component) : { key: 'unknown' };
        if (!args.form && args.instance) {
            args.form = _.get(args.instance, 'root._form', {});
        }
        args.form = _.cloneDeep(args.form);
        const componentKey = args.component.key;
        if (typeof func === 'string') {
            if (ret) {
                func += `;return ${ ret }`;
            }
            const params = _.keys(args);
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
                func = new Function(...params, func);
                args = _.values(args);
            } catch (err) {
                console.warn(`An error occured within the custom function for ${ componentKey }`, err);
                returnVal = null;
                func = false;
            }
        }
        if (typeof func === 'function') {
            try {
                returnVal = Array.isArray(args) ? func(...args) : func(args);
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
            value = b.getValue({ data: row }, condition.when);
        }
        if (data && _.isNil(value)) {
            value = b.getValue({ data }, condition.when);
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
            return checkSimpleConditional(component, component.conditional, row, data, true);
        } else if (component.conditional && component.conditional.json) {
            return checkJsonConditional(component, component.conditional.json, row, data, form, instance);
        }
        return true;
    }
    function checkTrigger(component, trigger, row, data, form, instance) {
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
    function setActionProperty(component, action, row, data, result, instance) {
        switch (action.property.type) {
        case 'boolean':
            if (_.get(component, action.property.value, false).toString() !== action.state.toString()) {
                _.set(component, action.property.value, action.state.toString() === 'true');
            }
            break;
        case 'string': {
                const evalData = {
                    data,
                    row,
                    component,
                    result
                };
                const textValue = action.property.component ? action[action.property.component] : action.text;
                const newValue = instance && instance.interpolate ? instance.interpolate(textValue, evalData) : interpolate(textValue, evalData);
                if (newValue !== _.get(component, action.property.value, '')) {
                    _.set(component, action.property.value, newValue);
                }
                break;
            }
        }
        return component;
    }
    const templateCache = {};
    const templateHashCache = {};
    function interpolateTemplate(template) {
        const templateSettings = {
            evaluate: /\{%([\s\S]+?)%\}/g,
            interpolate: /\{\{([\s\S]+?)\}\}/g,
            escape: /\{\{\{([\s\S]+?)\}\}\}/g
        };
        try {
            return _.template(template, templateSettings);
        } catch (err) {
            console.warn('Error while processing template', err, template);
        }
    }
    function addTemplateHash(template) {
        const hash = stringHash(template);
        templateHashCache[hash] = interpolateTemplate(template);
        return hash;
    }
    function interpolate(rawTemplate, data) {
        const template = _.isNumber(rawTemplate) ? templateHashCache[rawTemplate] : templateCache[rawTemplate] = templateCache[rawTemplate] || interpolateTemplate(rawTemplate);
        if (typeof template === 'function') {
            try {
                return template(data);
            } catch (err) {
                console.warn('Error interpolating template', err, rawTemplate, data);
            }
        }
        return template;
    }
    function uniqueName(name) {
        const parts = name.toLowerCase().replace(/[^0-9a-z.]/g, '').split('.');
        const fileName = parts[0];
        const ext = parts.length > 1 ? `.${ _.last(parts) }` : '';
        return `${ fileName.substr(0, 10) }-${ guid() }${ ext }`;
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
            const value = new Function('moment', `return ${ date };`)(moment);
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
            return new Promise(_.noop);
        }
        if (moment.zonesPromise) {
            return moment.zonesPromise;
        }
        return moment.zonesPromise = fetch('https://formio.github.io/formio.js/resources/latest.json').then(resp => resp.json().then(zones => {
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
        return format.replace(/Z/g, '').replace(/y/g, 'Y').replace('YYYY', 'Y').replace('YY', 'y').replace('MMMM', 'F').replace(/M/g, 'n').replace('nnn', 'M').replace('nn', 'm').replace(/d/g, 'j').replace(/jj/g, 'd').replace('EEEE', 'l').replace('EEE', 'D').replace('HH', 'H').replace('hh', 'h').replace('mm', 'i').replace('ss', 'S').replace(/a/g, 'K');
    }
    function convertFormatToMoment(format) {
        return format.replace(/y/g, 'Y').replace(/d/g, 'D').replace(/E/g, 'd').replace(/a/g, 'A');
    }
    function convertFormatToMask(format) {
        return format.replace(/(MMM|MMMM)/g, 'MM').replace(/[ydhmsHM]/g, '9').replace(/a/g, 'AA');
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
    function getNumberDecimalLimit(component) {
        let decimalLimit = 20;
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
            return `${ key }2`;
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
        addTemplateHash: addTemplateHash,
        interpolate: interpolate,
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
        observeOverload: observeOverload
    };
});