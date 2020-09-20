define([
    './components',
    './builders/Builders',
    './components/Components',
    './displays/Displays',
    './templates/Templates',
    './providers/index',
    './validator/Rules',
    './Formio',
    './Form',
    './utils/index'
], function (AllComponents, Builders, Components, Displays, Templates, Providers, Rules, Formio, Form, Utils) {
    'use strict';
    Components.setComponents(AllComponents);
    const registerPlugin = plugin => {
        if (typeof plugin !== 'object') {
            return;
        }
        for (const key of Object.keys(plugin)) {
            const current = plugin.framework || Templates.framework || 'bootstrap';
            switch (key) {
            case 'options':
                Formio.options = plugin.options;
                break;
            case 'templates':
                for (const framework of Object.keys(plugin.templates)) {
                    Templates.extendTemplate(framework, plugin.templates[framework]);
                }
                if (plugin.templates[current]) {
                    Templates.current = plugin.templates[current];
                }
                break;
            case 'components':
                Components.setComponents(plugin.components);
                break;
            case 'framework':
                Templates.framework = plugin.framework;
                break;
            case 'fetch':
                for (const name of Object.keys(plugin.fetch)) {
                    Formio.registerPlugin(plugin.fetch[name], name);
                }
                break;
            case 'providers':
                for (const type of Object.keys(plugin.providers)) {
                    Providers.addProviders(type, plugin.providers[type]);
                }
                break;
            case 'displays':
                Displays.addDisplays(plugin.displays);
                break;
            case 'builders':
                Builders.addBuilders(plugin.builders);
                break;
            case 'rules':
                Rules.addRules(plugin.rules);
                break;
            default:
                console.log('Unknown plugin option', key);
            }
        }
    };
    Formio.use = (...plugins) => {
        plugins.forEach(plugin => {
            if (Array.isArray(plugin)) {
                plugin.forEach(p => registerPlugin(p));
            } else {
                registerPlugin(plugin);
            }
        });
    };
    Formio.loadModules = (path = `${ Formio.getApiUrl() }/externalModules.js`, name = 'externalModules') => {
        Formio.requireLibrary(name, name, path, true).then(modules => {
            Formio.use(modules);
        });
    };
    Formio.Components = Components;
    Formio.Templates = Templates;
    Formio.Builders = Builders;
    Formio.Utils = Utils;
    Formio.Form = Form;
    Formio.Displays = Displays;
    Formio.Providers = Providers;
    Formio.Formio = Formio;
    return {
        Builders,
        Components,
        Displays,
        Providers,
        Templates,
        Utils,
        Form,
        Formio
    };
});