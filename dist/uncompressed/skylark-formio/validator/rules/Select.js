define([
    '../../utils/utils',
    '../../vendors/getify/npo',
    'fetch-ponyfill',
    'skylark-lodash'
], function (a, NativePromise, fetchPonyfill, _) {
    'use strict';
    const {fetch, Headers, Request} = fetchPonyfill({ Promise: NativePromise });
    const Rule = require('./Rule');
    module.exports = class Select extends Rule {
        check(value, data, row, async) {
            if (!value || _.isEmpty(value)) {
                return true;
            }
            if (!async) {
                return true;
            }
            const schema = this.component.component;
            const requestOptions = {
                url: this.settings.url,
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
            requestOptions.url = a.interpolate(requestOptions.url, { data: this.component.data });
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
    };
    Select.prototype.defaultMessage = '{{field}} contains an invalid selection';
});