define([
    '../base/Base.form',
    './editForm/Survey.edit.display'
], function (baseEditForm, SurveyEditDisplay) {
    'use strict';
    return function (...extend) {
        return baseEditForm([{
                key: 'display',
                components: SurveyEditDisplay
            }], ...extend);
    };
});