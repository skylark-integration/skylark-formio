define([
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