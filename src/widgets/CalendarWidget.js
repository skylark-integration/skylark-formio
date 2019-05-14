define([
    'flatpickr',
    './InputWidget',
    '../utils/utils',
    'moment',
    'lodash'
], function (Flatpickr, InputWidget, a, moment, _) {
    'use strict';
    const DEFAULT_FORMAT = 'yyyy-MM-dd hh:mm a';
    const ISO_8601_FORMAT = 'yyyy-MM-ddTHH:mm:ssZ';
    return class CalendarWidget extends InputWidget {
        static get defaultSettings() {
            return {
                type: 'calendar',
                altInput: true,
                allowInput: true,
                clickOpens: true,
                enableDate: true,
                enableTime: true,
                mode: 'single',
                noCalendar: false,
                format: DEFAULT_FORMAT,
                dateFormat: ISO_8601_FORMAT,
                useLocaleSettings: false,
                language: 'us-en',
                defaultDate: null,
                hourIncrement: 1,
                minuteIncrement: 5,
                time_24hr: false,
                saveAs: 'date',
                displayInTimezone: '',
                timezone: '',
                minDate: '',
                maxDate: ''
            };
        }
        constructor(settings, component) {
            super(settings, component);
            if (this.settings.noCalendar) {
                this.settings.format = this.settings.format.replace(/yyyy-MM-dd /g, '');
            }
            if (!this.settings.enableTime) {
                this.settings.format = this.settings.format.replace(/ hh:mm a$/g, '');
            } else if (this.settings.time_24hr) {
                this.settings.format = this.settings.format.replace(/hh:mm a$/g, 'HH:mm');
            }
            this.component.suffix = true;
        }
        a.loadZones() {
            const timezone = this.timezone;
            if (!a.zonesLoaded() && a.shouldLoadZones(timezone)) {
                a.loadZones(timezone).then(() => this.emit('redraw'));
                return true;
            }
            return false;
        }
        attach(input) {
            super.attach(input);
            if (input && !input.getAttribute('placeholder')) {
                input.setAttribute('placeholder', this.settings.format);
            }
            const dateFormatInfo = a.getLocaleDateFormatInfo(this.settings.language);
            this.defaultFormat = {
                date: dateFormatInfo.dayFirst ? 'd/m/Y ' : 'm/d/Y ',
                time: 'h:i K'
            };
            this.closedOn = 0;
            this.valueFormat = this.settings.dateFormat || ISO_8601_FORMAT;
            this.valueMomentFormat = a.convertFormatToMoment(this.valueFormat);
            this.settings.minDate = a.getDateSetting(this.settings.minDate);
            this.settings.maxDate = a.getDateSetting(this.settings.maxDate);
            this.settings.defaultDate = a.getDateSetting(this.settings.defaultDate);
            this.settings.altFormat = a.convertFormatToFlatpickr(this.settings.format);
            this.settings.dateFormat = a.convertFormatToFlatpickr(this.settings.dateFormat);
            this.settings.onChange = () => this.emit('update');
            this.settings.onClose = () => this.closedOn = Date.now();
            this.settings.undefined = (date, format) => {
                if (this.settings.readOnly && format === this.settings.altFormat) {
                    if (this.settings.saveAs === 'text' || this.undefined()) {
                        return Flatpickr.undefined(date, format);
                    }
                    return a.formatOffset(Flatpickr.undefined.bind(Flatpickr), date, format, this.timezone);
                }
                return Flatpickr.undefined(date, format);
            };
            if (this._input) {
                this.calendar = new Flatpickr(this._input, this.settings);
                this.setInputMask(this.calendar._input, a.convertFormatToMask(this.settings.format));
                this.addEventListener(this.calendar._input, 'blur', () => this.calendar.setDate(this.calendar._input.value, true, this.settings.altFormat));
            }
        }
        get timezone() {
            if (this.settings.timezone) {
                return this.settings.timezone;
            }
            if (this.settings.displayInTimezone === 'submission' && this.settings.submissionTimezone) {
                return this.settings.submissionTimezone;
            }
            if (this.settings.displayInTimezone === 'utc') {
                return 'UTC';
            }
            return a.currentTimezone();
        }
        get defaultSettings() {
            return CalendarWidget.defaultSettings;
        }
        addSuffix(container) {
            const suffix = this.ce('span', {
                class: 'input-group-addon',
                style: 'cursor: pointer'
            });
            suffix.appendChild(this.getIcon(this.settings.enableDate ? 'calendar' : 'time'));
            this.addEventListener(suffix, 'click', () => {
                if (this.calendar && !this.calendar.isOpen && Date.now() - this.closedOn > 200) {
                    this.calendar.open();
                }
            });
            container.appendChild(suffix);
            return suffix;
        }
        set disabled(disabled) {
            super.disabled = disabled;
            if (this.calendar) {
                if (disabled) {
                    this.calendar._input.setAttribute('disabled', 'disabled');
                } else {
                    this.calendar._input.removeAttribute('disabled');
                }
                this.calendar.close();
                this.calendar.redraw();
            }
        }
        get input() {
            return this.calendar ? this.calendar.altInput : null;
        }
        get localeFormat() {
            let format = '';
            if (this.settings.enableDate) {
                format += this.defaultFormat.date;
            }
            if (this.settings.enableTime) {
                format += this.defaultFormat.time;
            }
            return format;
        }
        get dateTimeFormat() {
            return this.settings.useLocaleSettings ? this.localeFormat : a.convertFormatToFlatpickr(this.dateFormat);
        }
        get dateFormat() {
            return _.get(this.settings, 'format', DEFAULT_FORMAT);
        }
        get defaultDate() {
            return a.getDateSetting(this.settings.defaultDate);
        }
        get defaultValue() {
            const defaultDate = this.defaultDate;
            return defaultDate ? defaultDate.toISOString() : '';
        }
        getDateValue(date, format) {
            return moment(date).format(a.convertFormatToMoment(format));
        }
        getValue() {
            if (!this.calendar) {
                return super.getValue();
            }
            const dates = this.calendar.selectedDates;
            if (!dates || !dates.length) {
                return super.getValue();
            }
            if (!(dates[0] instanceof Date)) {
                return 'Invalid Date';
            }
            return this.getDateValue(dates[0], this.valueFormat);
        }
        setValue(value) {
            if (!this.calendar) {
                return super.setValue(value);
            }
            if (value) {
                if (this.settings.saveAs !== 'text' && this.settings.readOnly && !this.undefined()) {
                    this.calendar.setDate(a.momentDate(value, this.valueFormat, this.timezone).toDate(), false);
                } else {
                    this.calendar.setDate(moment(value, this.valueMomentFormat).toDate(), false);
                }
            } else {
                this.calendar.clear(false);
            }
        }
        getView(value, format) {
            format = format || this.dateFormat;
            if (this.settings.saveAs === 'text') {
                return this.getDateValue(value, format);
            }
            return a.formatDate(value, format, this.timezone);
        }
        validationValue(value) {
            if (typeof value === 'string') {
                return new Date(value);
            }
            return value.map(val => new Date(val));
        }
        destroy() {
            super.destroy();
            this.calendar.destroy();
        }
    };
});