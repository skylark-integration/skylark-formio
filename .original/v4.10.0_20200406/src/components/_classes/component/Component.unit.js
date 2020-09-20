'use strict';
import assert from 'power-assert';
import { expect } from 'chai';
import Component from './Component';
import Harness from '../../../../test/harness';
import { comp1 } from './fixtures';
import _merge from 'lodash/merge';

describe('Component', () => {
  it('Should create a Component', (done) => {
    const component = new Component();

    // Test that we have a proper constructed component.
    assert.equal(component.options.renderMode, 'form');
    assert.equal(component.options.attachMode, 'full');
    assert.equal(component.attached, false);
    assert.equal(component.rendered, false);
    done();
  });

  it('Should build a base component', () => {
    return Harness.testCreate(Component, { type: 'base' }).then((component) => {
      const element = component.element.querySelector('[ref="component"]');
      assert.equal(element.textContent.trim(), 'Unknown component: base');
    });
  });

  it('Should provide required validation', (done) => {
    Harness.testCreate(Component, _merge({}, comp1, {
      validate: { required: true }
    })).then((component) => Harness.testComponent(component, {
      bad: {
        value: '',
        field: 'firstName',
        error: 'First Name is required'
      },
      good: {
        value: 'te'
      }
    }, done));
  });

  it('Should provide minLength validation', (done) => {
    Harness.testCreate(Component, _merge({}, comp1, {
      validate: { minLength: 2 }
    })).then((component) => Harness.testComponent(component, {
      bad: {
        value: 't',
        field: 'firstName',
        error: 'First Name must have at least 2 characters.'
      },
      good: {
        value: 'te'
      }
    }, done));
  });

  it('Should provide maxLength validation', (done) => {
    Harness.testCreate(Component, _merge({}, comp1, {
      validate: { maxLength: 5 }
    })).then((component) => Harness.testComponent(component, {
      bad: {
        value: 'testte',
        field: 'firstName',
        error: 'First Name must have no more than 5 characters.'
      },
      good: {
        value: 'te'
      }
    }, done));
  });

  it('Should provide maxWords validation', (done) => {
    Harness.testCreate(Component, _merge({}, comp1, {
      validate: { maxWords: 2 }
    })).then((component) => Harness.testComponent(component, {
      bad: {
        value: 'test test test',
        field: 'firstName',
        error: 'First Name must have no more than 2 words.'
      },
      good: {
        value: 'te st'
      }
    }, done));
  });

  it('Should provide minWords validation', (done) => {
    Harness.testCreate(Component, _merge({}, comp1, {
      validate: { minWords: 2 }
    })).then((component) => Harness.testComponent(component, {
      bad: {
        value: 'test',
        field: 'firstName',
        error: 'First Name must have at least 2 words.'
      },
      good: {
        value: 'te st'
      }
    }, done));
  });

  it('Should provide custom validation', (done) => {
    Harness.testCreate(Component, _merge({}, comp1, {
      validate: {
        custom: 'valid = (input !== "Joe") ? true : "You cannot be Joe"'
      }
    })).then((component) => Harness.testComponent(component, {
      bad: {
        value: 'Joe',
        field: 'firstName',
        error: 'You cannot be Joe'
      },
      good: {
        value: 'Tom'
      }
    }, done));
  });

  it('Should provide json validation', (done) => {
    Harness.testCreate(Component, _merge({}, comp1, {
      validate: {
        json: {
          'if': [
            {
              '===': [
                { var: 'data.firstName' },
                'Joe'
              ]
            },
            true,
            'You must be Joe'
          ]
        }
      }
    })).then((component) => Harness.testComponent(component, {
      bad: {
        value: 'Tom',
        field: 'firstName',
        error: 'You must be Joe'
      },
      good: {
        value: 'Joe'
      }
    }, done));
  });

  describe('shouldSkipValidation', () => {
    it('should return true if component is hidden', done => {
      Harness.testCreate(Component, comp1)
        .then(cmp => {
          cmp.visible = false;
          cmp.checkCondition = () => true;
          expect(cmp.visible).to.be.false;
          expect(cmp.checkCondition()).to.be.true;
          expect(cmp.shouldSkipValidation()).to.be.true;
          done();
        }, done)
        .catch(done);
    });

    it('should return true if component is conditionally hidden', done => {
      Harness.testCreate(Component, comp1)
        .then(cmp => {
          cmp.visible = true;
          cmp.checkCondition = () => false;
          expect(cmp.visible).to.be.true;
          expect(cmp.checkCondition()).to.be.false;
          expect(cmp.shouldSkipValidation()).to.be.true;
          done();
        }, done)
        .catch(done);
    });

    it('should return false if not hidden', done => {
      Harness.testCreate(Component, comp1)
        .then(cmp => {
          cmp.visible = true;
          cmp.checkCondition = () => true;
          expect(cmp.visible).to.be.true;
          expect(cmp.checkCondition()).to.be.true;
          expect(cmp.shouldSkipValidation()).to.be.false;
          done();
        }, done)
        .catch(done);
    });
  });
});

it('Should return value for HTML mode', () => {
  return Harness.testCreate(Component, comp1).then((component) => {
    assert.equal(component.itemValueForHTMLMode(['option 1', 'option 2', 'option 3']), 'option 1, option 2, option 3');
    assert.equal(component.itemValueForHTMLMode(['option 1', ['option 2', 'option 3']]), 'option 1, option 2, option 3');
    assert.equal(component.itemValueForHTMLMode(['2020-03-18T15:00:00.000Z', '2020-03-31T09:05:00.000Z']), '2020-03-18T15:00:00.000Z, 2020-03-31T09:05:00.000Z');
    assert.equal(component.itemValueForHTMLMode('test'), 'test');
  });
});
