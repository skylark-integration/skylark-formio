import assert from 'power-assert';

import Harness from '../../../test/harness';
import ButtonComponent from './Button';
import Formio from './../../Formio';
import sinon from 'sinon';

import {
  comp1
} from './fixtures';

describe('Button Component', () => {
  it('Should build a button component', () => {
    return Harness.testCreate(ButtonComponent, comp1).then((component) => {
      const buttons = Harness.testElements(component, 'button[type="submit"]', 1);
      for (const button of buttons) {
        assert.equal(button.name, `data[${comp1.key}]`);
        assert.equal(button.innerHTML.trim(), comp1.label);
      }
    });
  });

  it('POST to URL button should pass URL and headers', (done) => {
    const formJson = {
      'type': 'form',
      'components': [
        {
          'label': 'Some Field',
          'type': 'textfield',
          'input': true,
          'key': 'someField'
        },
        {
          'label': 'POST to URL',
          'action': 'url',
          'url': 'someUrl',
          'headers': [
            {
              'header': 'testHeader',
              'value': 'testValue'
            }
          ],
          'type': 'button',
          'input': true,
          'key': 'postToUrl'
        }
      ]
    };
    const element = document.createElement('div');
    Formio.createForm(element, formJson)
      .then(form => {
        const spy = sinon.spy(Formio, 'makeStaticRequest');
        form.getComponent('postToUrl').refs.button.click();
        const passedUrl = spy.firstCall.args[0];
        const passedHeaders = spy.firstCall.lastArg.headers;
        spy.restore();
        assert.deepEqual(passedHeaders, { 'testHeader': 'testValue' });
        assert.equal(passedUrl, 'someUrl');
        done();
      })
      .catch(done);
  });

  it('Should disable on invalid', (done) => {
    const element = document.createElement('div');
    Formio.createForm(element, {
      components: [
        {
          type: 'textfield',
          key: 'a',
          label: 'A',
          validate: {
            required: true
          }
        },
        {
          type: 'button',
          action: 'submit',
          key: 'submit',
          disableOnInvalid: true,
          input: true
        }
      ]
    }).then(form => {
      form.on('change', () => {
        const button = form.getComponent('submit');
        assert(button.disabled, 'Button should be disabled');
        done();
      });
      form.submission = { data: {} };
    }).catch(done);
  });

  it('POST to URL button should perform URL interpolation', (done) => {
    const formJson = {
      'type': 'form',
      'components': [
        {
          'label': 'Some Field',
          'type': 'textfield',
          'input': true,
          'key': 'someField'
        },
        {
          'label': 'URL',
          'type': 'textfield',
          'input': true,
          'key': 'url'
        },
        {
          'label': 'POST to URL',
          'action': 'url',
          'url': '{{data.url}}/submission',
          'type': 'button',
          'input': true,
          'key': 'postToUrl'
        }
      ]
    };
    const element = document.createElement('div');
    Formio.createForm(element, formJson)
      .then(form => {
        form.submission = {
          data: {
            url: 'someUrl'
          }
        };
        return form.submissionReady
          .then(() => {
            const spy = sinon.spy(Formio, 'makeStaticRequest');
            form.getComponent('postToUrl').refs.button.click();
            const passedUrl = spy.firstCall.args[0];
            spy.restore();
            assert.equal(passedUrl, 'someUrl/submission');
            done();
          });
      })
      .catch(done);
  });

  it('POST to URL button should perform headers interpolation', (done) => {
    const formJson = {
      'type': 'form',
      'components': [
        {
          'label': 'Some Field',
          'type': 'textfield',
          'input': true,
          'key': 'someField'
        },
        {
          'label': 'Header',
          'type': 'textfield',
          'input': true,
          'key': 'header'
        },
        {
          'label': 'POST to URL',
          'action': 'url',
          'url': 'someUrl',
          'headers': [
            {
              'header': 'testHeader',
              'value': 'Value {{data.header}}'
            }
          ],
          'type': 'button',
          'input': true,
          'key': 'postToUrl'
        }
      ]
    };
    const element = document.createElement('div');
    Formio.createForm(element, formJson)
      .then(form => {
        form.submission = {
          data: {
            someField: 'some value',
            header: 'some header'
          }
        };
        return form.submissionReady
          .then(() => {
            const spy = sinon.spy(Formio, 'makeStaticRequest');
            form.getComponent('postToUrl').refs.button.click();
            const passedHeaders = spy.firstCall.lastArg.headers;
            spy.restore();
            assert.deepEqual(passedHeaders, {
              'testHeader': 'Value some header'
            });
            done();
          });
      })
      .catch(done);
  });
});
