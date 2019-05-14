define([
    './base64',
    './dropbox',
    './s3',
    './azure',
    './url'
], function (base64, dropbox, s3, azure, url) {
    'use strict';
    return {
        base64: base64,
        dropbox: dropbox,
        s3: s3,
        url: url,
        azure: azure
    };
});