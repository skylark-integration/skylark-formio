define([
    'lodash',
    './utils'
], function (_, a) {
    'use strict';
    return {
        uniquify(form, component) {
            let changed = false;
            const formKeys = {};
            a.eachComponent(form.components, function (comp) {
                formKeys[comp.key] = true;
            });
            a.eachComponent([component], component => {
                if (!component.key) {
                    return;
                }
                const newKey = a.uniqueKey(formKeys, component.key);
                if (newKey !== component.key) {
                    component.key = newKey;
                    changed = true;
                }
            }, true);
            return changed;
        },
        additionalShortcuts: {
            button: [
                'Enter',
                'Esc'
            ]
        },
        getAlphaShortcuts() {
            return _.range('A'.charCodeAt(), 'Z'.charCodeAt() + 1).map(charCode => String.fromCharCode(charCode));
        },
        getAdditionalShortcuts(type) {
            return this.additionalShortcuts[type] || [];
        },
        getBindedShortcuts(components, input) {
            const result = [];
            a.eachComponent(components, function (component) {
                if (component === input) {
                    return;
                }
                if (component.shortcut) {
                    result.push(component.shortcut);
                }
                if (component.values) {
                    component.values.forEach(value => {
                        if (value.shortcut) {
                            result.push(value.shortcut);
                        }
                    });
                }
            }, true);
            return result;
        },
        getAvailableShortcuts(form, component) {
            if (!component) {
                return [];
            }
            return [''].concat(_.difference(this.getAlphaShortcuts().concat(this.getAdditionalShortcuts(component.type)), this.getBindedShortcuts(form.components, component)));
        }
    };
});