define([
    'skylark-lodash',
    '../PDF',
    '../Webform',
    '../Wizard'
], function (_, pdf, webform, wizard) {
    'use strict';
    return class Displays {
        static addDisplay(name, display) {
            Displays.displays[name] = display;
        }
        static addDisplays(displays) {
            Displays.displays = _.merge(Displays.displays, displays);
        }
        static getDisplay(name) {
            return Displays.displays[name];
        }
        static getDisplays() {
            return Displays.displays;
        }
    };
    Displays.displays = {
        pdf,
        webform,
        wizard
    };
});