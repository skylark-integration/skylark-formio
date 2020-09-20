define([
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