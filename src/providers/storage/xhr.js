define([
    'native-promise-only',
    'lodash/trim'
], function (Promise, _trim) {
    'use strict';
    const XHR = {
        trim(text) {
            return _trim(text, '/');
        },
        path(items) {
            return items.filter(item => !!item).map(XHR.trim).join('/');
        },
        upload(formio, type, xhrCb, file, fileName, dir, progressCallback) {
            return new Promise((resolve, reject) => {
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