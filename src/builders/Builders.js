define([
    'skylark-lodash',
    '../PDFBuilder',
    '../WebformBuilder',
    '../WizardBuilder'
], function (_, pdf, webform, wizard) {
    'use strict';
    class Builders {
        static addBuilder(name, builder) {
            Builders.builders[name] = builder;
        }
        static addBuilders(builders) {
            Builders.builders = _.merge(Builders.builders, builders);
        }
        static getBuilder(name) {
            return Builders.builders[name];
        }
        static getBuilders() {
            return Builders.builders;
        }
    };
    Builders.builders = {
        pdf,
        webform,
        wizard
    };

    return Builders;
});