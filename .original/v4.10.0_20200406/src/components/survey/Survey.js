import _ from 'lodash';
import Field from '../_classes/field/Field';
import { boolValue } from '../../utils/utils';

export default class SurveyComponent extends Field {
  static schema(...extend) {
    return Field.schema({
      type: 'survey',
      label: 'Survey',
      key: 'survey',
      questions: [],
      values: []
    }, ...extend);
  }

  static get builderInfo() {
    return {
      title: 'Survey',
      group: 'advanced',
      icon: 'list',
      weight: 110,
      documentation: 'http://help.form.io/userguide/#survey',
      schema: SurveyComponent.schema()
    };
  }

  get defaultSchema() {
    return SurveyComponent.schema();
  }

  render() {
    return super.render(this.renderTemplate('survey'));
  }

  attach(element) {
    this.loadRefs(element, { input: 'multiple' });
    const superAttach = super.attach(element);
    this.refs.input.forEach((input) => {
      if (this.disabled) {
        input.setAttribute('disabled', 'disabled');
      }
      else {
        this.addEventListener(input, 'change', () => this.updateValue(null, {
          modified: true
        }));
      }
    });
    this.setValue(this.dataValue);
    return superAttach;
  }

  setValue(value, flags = {}) {
    if (!value) {
      return false;
    }

    _.each(this.component.questions, (question) => {
      _.each(this.refs.input, (input) => {
        if (input.name === this.getInputName(question)) {
          input.checked = (input.value === value[question.value]);
        }
      });
    });
    return this.updateValue(value, flags);
  }

  get emptyValue() {
    return {};
  }

  getValue() {
    if (this.viewOnly || !this.refs.input || !this.refs.input.length) {
      return this.dataValue;
    }
    const value = {};
    _.each(this.component.questions, (question) => {
      _.each(this.refs.input, (input) => {
        if (input.checked && (input.name === this.getInputName(question))) {
          value[question.value] = input.value;
          return false;
        }
      });
    });
    return value;
  }

  set disabled(disabled) {
    super.disabled = disabled;
    _.each(this.refs.input, (input) => {
      input.disabled = true;
    });
  }

  get disabled() {
    return super.disabled;
  }

  validateRequired(setting, value) {
    if (!boolValue(setting)) {
      return true;
    }
    return this.component.questions.reduce((result, question) =>
      result && Boolean(value[question.value]), true);
  }

  getInputName(question) {
    return `${this.options.name}[${question.value}]`;
  }
}
