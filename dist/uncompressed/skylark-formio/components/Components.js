define([
    './_classes/component/Component',
    './_classes/nested/NestedComponent',
    'skylark-lodash'
], function (Component, NestedComponent, _) {
    'use strict';
    return class Components {
        static get components() {
            if (!Components._components) {
                Components._components = {};
            }
            return Components._components;
        }
        static setComponents(comps) {
            if (comps.base) {
                comps.base.tableView = function (value, options) {
                    const comp = Components.create(options.component, options.options || {}, options.data || {}, true);
                    return comp.getView(value);
                };
            }
            _.assign(Components.components, comps);
        }
        static addComponent(name, comp) {
            return Components.setComponent(name, comp);
        }
        static setComponent(name, comp) {
            Components.components[name] = comp;
        }
        static create(component, options, data) {
            let comp = null;
            if (component.type && Components.components.hasOwnProperty(component.type)) {
                comp = new Components.components[component.type](component, options, data);
            } else if (Array.isArray(component.components)) {
                comp = new NestedComponent(component, options, data);
            } else {
                comp = new Component(component, options, data);
            }
            return comp;
        }
    };
});