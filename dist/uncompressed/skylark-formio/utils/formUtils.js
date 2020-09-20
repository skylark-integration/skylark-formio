define([
    "skylark-lodash",
    '../vendors/fast-json-patch/duplex'
], function (_, a) {
    'use strict';
    const {
        get, set, has, clone, forOwn, isString, isNaN, isNil, isPlainObject, round, chunk, pad
    } = _;


    function isLayoutComponent(component) {
        return Boolean(component.columns && Array.isArray(component.columns) || component.rows && Array.isArray(component.rows) || component.components && Array.isArray(component.components));
    }
    function eachComponent(components, fn, includeAll, path, parent) {
        if (!components)
            return;
        path = path || '';
        components.forEach(component => {
            if (!component) {
                return;
            }
            const hasColumns = component.columns && Array.isArray(component.columns);
            const hasRows = component.rows && Array.isArray(component.rows);
            const hasComps = component.components && Array.isArray(component.components);
            let noRecurse = false;
            const newPath = component.key ? path ? `${ path }.${ component.key }` : component.key : '';
            if (parent) {
                component.parent = clone(parent);
                delete component.parent.components;
                delete component.parent.componentMap;
                delete component.parent.columns;
                delete component.parent.rows;
            }
            if (includeAll || component.tree || !hasColumns && !hasRows && !hasComps) {
                noRecurse = fn(component, newPath);
            }
            const subPath = () => {
                if (component.key && ![
                        'panel',
                        'table',
                        'well',
                        'columns',
                        'fieldset',
                        'tabs',
                        'form'
                    ].includes(component.type) && ([
                        'datagrid',
                        'container',
                        'editgrid'
                    ].includes(component.type) || component.tree)) {
                    return newPath;
                } else if (component.key && component.type === 'form') {
                    return `${ newPath }.data`;
                }
                return path;
            };
            if (!noRecurse) {
                if (hasColumns) {
                    component.columns.forEach(column => eachComponent(column.components, fn, includeAll, subPath(), parent ? component : null));
                } else if (hasRows) {
                    component.rows.forEach(row => {
                        if (Array.isArray(row)) {
                            row.forEach(column => eachComponent(column.components, fn, includeAll, subPath(), parent ? component : null));
                        }
                    });
                } else if (hasComps) {
                    eachComponent(component.components, fn, includeAll, subPath(), parent ? component : null);
                }
            }
        });
    }
    function matchComponent(component, query) {
        if (isString(query)) {
            return component.key === query || component.path === query;
        } else {
            let matches = false;
            forOwn(query, (value, key) => {
                matches = get(component, key) === value;
                if (!matches) {
                    return false;
                }
            });
            return matches;
        }
    }
    function getComponent(components, key, includeAll) {
        let result;
        eachComponent(components, (component, path) => {
            if (path === key || component.path === key) {
                result = component;
                return true;
            }
        }, includeAll);
        return result;
    }
    function searchComponents(components, query) {
        const results = [];
        eachComponent(components, component => {
            if (matchComponent(component, query)) {
                results.push(component);
            }
        }, true);
        return results;
    }
    function findComponents(components, query) {
        console.warn('formio.js/utils findComponents is deprecated. Use searchComponents instead.');
        return searchComponents(components, query);
    }
    function findComponent(components, key, path, fn) {
        if (!components)
            return;
        path = path || [];
        if (!key) {
            return fn(components);
        }
        components.forEach(function (component, index) {
            var newPath = path.slice();
            newPath.push(index);
            if (!component)
                return;
            if (component.hasOwnProperty('columns') && Array.isArray(component.columns)) {
                newPath.push('columns');
                component.columns.forEach(function (column, index) {
                    var colPath = newPath.slice();
                    colPath.push(index);
                    colPath.push('components');
                    findComponent(column.components, key, colPath, fn);
                });
            }
            if (component.hasOwnProperty('rows') && Array.isArray(component.rows)) {
                newPath.push('rows');
                component.rows.forEach(function (row, index) {
                    var rowPath = newPath.slice();
                    rowPath.push(index);
                    row.forEach(function (column, index) {
                        var colPath = rowPath.slice();
                        colPath.push(index);
                        colPath.push('components');
                        findComponent(column.components, key, colPath, fn);
                    });
                });
            }
            if (component.hasOwnProperty('components') && Array.isArray(component.components)) {
                newPath.push('components');
                findComponent(component.components, key, newPath, fn);
            }
            if (component.key === key) {
                fn(component, newPath);
            }
        });
    }
    function removeComponent(components, path) {
        var index = path.pop();
        if (path.length !== 0) {
            components = get(components, path);
        }
        components.splice(index, 1);
    }
    function generateFormChange(type, data) {
        let change;
        switch (type) {
        case 'add':
            change = {
                op: 'add',
                key: data.component.key,
                container: data.parent.key,
                path: data.path,
                index: data.index,
                component: data.component
            };
            break;
        case 'edit':
            change = {
                op: 'edit',
                key: data.originalComponent.key,
                patches: duplex.compare(data.originalComponent, data.component)
            };
            if (!change.patches.length) {
                change = null;
            }
            break;
        case 'remove':
            change = {
                op: 'remove',
                key: data.component.key
            };
            break;
        }
        return change;
    }
    function applyFormChanges(form, changes) {
        const failed = [];
        changes.forEach(function (change) {
            var found = false;
            switch (change.op) {
            case 'add':
                var newComponent = change.component;
                findComponent(form.components, change.container, null, function (parent) {
                    if (!change.container) {
                        parent = form;
                    }
                    findComponent(form.components, change.key, null, function (component, path) {
                        newComponent = component;
                        removeComponent(form.components, path);
                    });
                    found = true;
                    var container = get(parent, change.path);
                    container.splice(change.index, 0, newComponent);
                });
                break;
            case 'remove':
                findComponent(form.components, change.key, null, function (component, path) {
                    found = true;
                    const oldComponent = get(form.components, path);
                    if (oldComponent.key !== component.key) {
                        path.pop();
                    }
                    removeComponent(form.components, path);
                });
                break;
            case 'edit':
                findComponent(form.components, change.key, null, function (component, path) {
                    found = true;
                    try {
                        const oldComponent = get(form.components, path);
                        const newComponent = duplex.applyPatch(component, change.patches).newDocument;
                        if (oldComponent.key !== newComponent.key) {
                            path.pop();
                        }
                        set(form.components, path, newComponent);
                    } catch (err) {
                        failed.push(change);
                    }
                });
                break;
            case 'move':
                break;
            }
            if (!found) {
                failed.push(change);
            }
        });
        return {
            form,
            failed
        };
    }
    function flattenComponents(components, includeAll) {
        const flattened = {};
        eachComponent(components, (component, path) => {
            flattened[path] = component;
        }, includeAll);
        return flattened;
    }
    function hasCondition(component) {
        return Boolean(component.customConditional || component.conditional && component.conditional.when || component.conditional && component.conditional.json);
    }
    function parseFloatExt(value) {
        return parseFloat(isString(value) ? value.replace(/[^\de.+-]/gi, '') : value);
    }
    function formatAsCurrency(value) {
        const parsedValue = parseFloatExt(value);
        if (isNaN(parsedValue)) {
            return '';
        }
        const parts = round(parsedValue, 2).toString().split('.');
        parts[0] = chunk(Array.from(parts[0]).reverse(), 3).reverse().map(part => part.reverse().join('')).join(',');
        parts[1] = pad(parts[1], 2, '0');
        return parts.join('.');
    }
    function escapeRegExCharacters(value) {
        return value.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    }
    function getValue(submission, key) {
        const search = data => {
            if (isPlainObject(data)) {
                if (has(data, key)) {
                    return data[key];
                }
                let value = null;
                forOwn(data, prop => {
                    const result = search(prop);
                    if (!isNil(result)) {
                        value = result;
                        return false;
                    }
                });
                return value;
            } else {
                return null;
            }
        };
        return search(submission.data);
    }
    function getStrings(form) {
        const properties = [
            'label',
            'title',
            'legend',
            'tooltip',
            'description',
            'placeholder',
            'prefix',
            'suffix',
            'errorLabel',
            'content',
            'html'
        ];
        const strings = [];
        eachComponent(form.components, component => {
            properties.forEach(property => {
                if (component.hasOwnProperty(property) && component[property]) {
                    strings.push({
                        key: component.key,
                        type: component.type,
                        property,
                        string: component[property]
                    });
                }
            });
            if ((!component.dataSrc || component.dataSrc === 'values') && component.hasOwnProperty('values') && Array.isArray(component.values) && component.values.length) {
                component.values.forEach((value, index) => {
                    strings.push({
                        key: component.key,
                        property: `value[${ index }].label`,
                        string: component.values[index].label
                    });
                });
            }
            if (component.type === 'day') {
                [
                    'day',
                    'month',
                    'year',
                    'Day',
                    'Month',
                    'Year',
                    'january',
                    'february',
                    'march',
                    'april',
                    'may',
                    'june',
                    'july',
                    'august',
                    'september',
                    'october',
                    'november',
                    'december'
                ].forEach(string => {
                    strings.push({
                        key: component.key,
                        property: 'day',
                        string
                    });
                });
                if (component.fields.day.placeholder) {
                    strings.push({
                        key: component.key,
                        property: 'fields.day.placeholder',
                        string: component.fields.day.placeholder
                    });
                }
                if (component.fields.month.placeholder) {
                    strings.push({
                        key: component.key,
                        property: 'fields.month.placeholder',
                        string: component.fields.month.placeholder
                    });
                }
                if (component.fields.year.placeholder) {
                    strings.push({
                        key: component.key,
                        property: 'fields.year.placeholder',
                        string: component.fields.year.placeholder
                    });
                }
            }
            if (component.type === 'editgrid') {
                const string = component.addAnother || 'Add Another';
                if (component.addAnother) {
                    strings.push({
                        key: component.key,
                        property: 'addAnother',
                        string
                    });
                }
            }
            if (component.type === 'select') {
                [
                    'loading...',
                    'Type to search'
                ].forEach(string => {
                    strings.push({
                        key: component.key,
                        property: 'select',
                        string
                    });
                });
            }
        }, true);
        return strings;
    }
    return {
        isLayoutComponent: isLayoutComponent,
        eachComponent: eachComponent,
        matchComponent: matchComponent,
        getComponent: getComponent,
        searchComponents: searchComponents,
        findComponents: findComponents,
        findComponent: findComponent,
        removeComponent: removeComponent,
        generateFormChange: generateFormChange,
        applyFormChanges: applyFormChanges,
        flattenComponents: flattenComponents,
        hasCondition: hasCondition,
        parseFloatExt: parseFloatExt,
        formatAsCurrency: formatAsCurrency,
        escapeRegExCharacters: escapeRegExCharacters,
        getValue: getValue,
        getStrings: getStrings
    };
});