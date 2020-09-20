define([
    '../_classes/component/Component.form',
    './editForm/Survey.edit.data',
    './editForm/Survey.edit.display',
    './editForm/Survey.edit.validation'
], function (baseEditForm, SurveyEditData, SurveyEditDisplay, SurveyEditValidation) {
    'use strict';
    return function (...extend) {
        return baseEditForm([
            {
                key: 'display',
                components: SurveyEditDisplay
            },
            {
                key: 'data',
                components: SurveyEditData
            },
            {
                key: 'validation',
                components: SurveyEditValidation
            }
        ], ...extend);
    };
});