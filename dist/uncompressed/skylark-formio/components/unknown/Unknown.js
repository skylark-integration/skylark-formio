define(['../_classes/component/Component'], function (Component) {
    'use strict';
    return class UnknownComponent extends Component {
        static schema() {
            return {
                type: 'custom',
                key: 'custom',
                protected: false,
                persistent: true
            };
        }
        static get builderInfo() {
            return {
                title: 'Custom',
                icon: 'cubes',
                group: 'premium',
                documentation: 'https://help.form.io/userguide/form-components/#custom',
                weight: 120,
                schema: UnknownComponent.schema()
            };
        }
        get defaultSchema() {
            return UnknownComponent.schema();
        }
    };
});