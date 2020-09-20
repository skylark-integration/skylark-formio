define(['./Rule'], function (Rule) {
    'use strict';

    class Email extends Rule {
        check(value) {
            if (!value) {
                return true;
            }
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(value);
        }
    };
    Email.prototype.defaultMessage = '{{field}} must be a valid email.';

    return Email;
});