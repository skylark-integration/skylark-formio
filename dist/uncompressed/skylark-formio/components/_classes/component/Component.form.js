define([
    'skylark-lodash',
    './editForm/Component.edit.conditional',
    './editForm/Component.edit.data',
    './editForm/Component.edit.api',
    './editForm/Component.edit.display',
    './editForm/Component.edit.logic',
    './editForm/Component.edit.validation',
    './editForm/Component.edit.layout',
    './editForm/utils'
], function (_, ComponentEditConditional, ComponentEditData, ComponentEditAPI, ComponentEditDisplay, ComponentEditLogic, ComponentEditValidation, ComponentEditLayout, EditFormUtils) {
    'use strict';
    return function (...extend) {
        const components = _.cloneDeep([{
                type: 'tabs',
                key: 'tabs',
                components: [
                    {
                        label: 'Display',
                        key: 'display',
                        weight: 0,
                        components: ComponentEditDisplay
                    },
                    {
                        label: 'Data',
                        key: 'data',
                        weight: 10,
                        components: ComponentEditData
                    },
                    {
                        label: 'Validation',
                        key: 'validation',
                        weight: 20,
                        components: ComponentEditValidation
                    },
                    {
                        label: 'API',
                        key: 'api',
                        weight: 30,
                        components: ComponentEditAPI
                    },
                    {
                        label: 'Conditional',
                        key: 'conditional',
                        weight: 40,
                        components: ComponentEditConditional
                    },
                    {
                        label: 'Logic',
                        key: 'logic',
                        weight: 50,
                        components: ComponentEditLogic
                    },
                    {
                        label: 'Layout',
                        key: 'layout',
                        weight: 60,
                        components: ComponentEditLayout
                    }
                ]
            }]).concat(extend.map(items => ({
            type: 'tabs',
            key: 'tabs',
            components: _.cloneDeep(items)
        })));
        return {
            components: _.unionWith(components, EditFormUtils.unifyComponents).concat({
                type: 'hidden',
                key: 'type'
            })
        };
    };
});