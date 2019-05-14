define([
    'lodash',
    './editForm/Base.edit.conditional',
    './editForm/Base.edit.data',
    './editForm/Base.edit.api',
    './editForm/Base.edit.display',
    './editForm/Base.edit.logic',
    './editForm/Base.edit.validation',
    './editForm/utils'
], function (_, BaseEditConditional, BaseEditData, BaseEditAPI, BaseEditDisplay, BaseEditLogic, BaseEditValidation, EditFormUtils) {
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
                        components: BaseEditDisplay
                    },
                    {
                        label: 'Data',
                        key: 'data',
                        weight: 10,
                        components: BaseEditData
                    },
                    {
                        label: 'Validation',
                        key: 'validation',
                        weight: 20,
                        components: BaseEditValidation
                    },
                    {
                        label: 'API',
                        key: 'api',
                        weight: 30,
                        components: BaseEditAPI
                    },
                    {
                        label: 'Conditional',
                        key: 'conditional',
                        weight: 40,
                        components: BaseEditConditional
                    },
                    {
                        label: 'Logic',
                        key: 'logic',
                        weight: 50,
                        components: BaseEditLogic
                    }
                ]
            }]).concat(extend.map(items => ({
            type: 'tabs',
            key: 'tabs',
            components: items
        })));
        return {
            components: _.unionWith(components, EditFormUtils.unifyComponents).concat({
                type: 'hidden',
                key: 'type'
            })
        };
    };
});