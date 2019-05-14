define(function () {
    'use strict';
    return {
        lng: 'en',
        resources: {
            en: {
                translation: {
                    complete: 'Submission Complete',
                    error: 'Please fix the following errors before submitting.',
                    required: '{{field}} is required',
                    pattern: '{{field}} does not match the pattern {{pattern}}',
                    minLength: '{{field}} must be longer than {{length}} characters.',
                    maxLength: '{{field}} must be shorter than {{length}} characters.',
                    min: '{{field}} cannot be less than {{min}}.',
                    max: '{{field}} cannot be greater than {{max}}.',
                    maxDate: '{{field}} should not contain date after {{- maxDate}}',
                    minDate: '{{field}} should not contain date before {{- minDate}}',
                    invalid_email: '{{field}} must be a valid email.',
                    invalid_url: '{{field}} must be a valid url.',
                    invalid_regex: '{{field}} does not match the pattern {{regex}}.',
                    invalid_date: '{{field}} is not a valid date.',
                    invalid_day: '{{field}} is not a valid day.',
                    mask: '{{field}} does not match the mask.',
                    stripe: '{{stripe}}',
                    month: 'Month',
                    day: 'Day',
                    year: 'Year',
                    january: 'January',
                    february: 'February',
                    march: 'March',
                    april: 'April',
                    may: 'May',
                    june: 'June',
                    july: 'July',
                    august: 'August',
                    september: 'September',
                    october: 'October',
                    november: 'November',
                    december: 'December',
                    next: 'Next',
                    previous: 'Previous',
                    cancel: 'Cancel',
                    submit: 'Submit Form'
                }
            }
        }
    };
});