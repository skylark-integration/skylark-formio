define(function () {
    'use strict';
    return {
        label: 'Datagrid',
        key: 'comp3',
        type: 'datagrid',
        input: true,
        disabled: true,
        components: [
            {
                label: 'First Name',
                key: 'firstName',
                type: 'textfield',
                input: true
            },
            {
                label: 'Second Name',
                key: 'secondName',
                type: 'textfield',
                input: true
            }
        ]
    };
});