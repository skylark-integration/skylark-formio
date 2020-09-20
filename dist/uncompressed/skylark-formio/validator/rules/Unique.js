define([
    '../../utils/utils',
    'skylark-lodash',
    '../../vendors/getify/npo'
], function (a, _, NativePromise) {
    'use strict';
    const Rule = require('./Rule');
    module.exports = class Unique extends Rule {
        check(value) {
            if (!value || _.isEmpty(value)) {
                return true;
            }
            if (!this.config.db) {
                return true;
            }
            return new NativePromise(resolve => {
                const form = this.config.form;
                const submission = this.config.submission;
                const path = `data.${ this.component.path }`;
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
    };
    Unique.prototype.defaultMessage = '{{field}} must be unique';
});