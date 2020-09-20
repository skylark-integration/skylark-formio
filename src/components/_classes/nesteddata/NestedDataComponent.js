define([
    '../component/Component',
    '../nested/NestedComponent',
    'skylark-lodash'
], function (Component, NestedComponent, _) {
    'use strict';
    'use strict';
    return class NestedDataComponent extends NestedComponent {
        hasChanged(newValue, oldValue) {
            if (newValue !== undefined && newValue !== null && !this.hasValue()) {
                return true;
            }
            return !_.isEqual(newValue, oldValue);
        }
        get allowData() {
            return true;
        }
        getValueAsString() {
            return '[Complex Data]';
        }
        getValue() {
            return this.dataValue;
        }
        updateValue(value, flags = {}) {
            return Component.prototype.updateValue.call(this, value, flags);
        }
    };
});