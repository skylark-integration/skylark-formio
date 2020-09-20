import NativePromise from 'native-promise-only';
import Formio from './Formio';
import Webform from './Webform';
import { fastCloneDeep } from './utils/utils';

export default class PDF extends Webform {
  constructor(element, options) {
    super(element, options);
    this.components = [];
  }

  init() {
    super.init();

    // Handle an iframe submission.
    this.on('iframe-submission', (submission) => this.setValue(submission, {
      fromIframe: true
    }), true);

    this.on('iframe-change', (submission) => this.setValue(submission, {
      fromIframe: true
    }), true);

    this.on('iframe-getIframePositions', () => {
      const iframeBoundingClientRect = document.querySelector('iframe').getBoundingClientRect();
      this.postMessage({
        name: 'iframePositions',
        data: {
          iframe: {
            top: iframeBoundingClientRect.top
          },
          scrollY: window.scrollY || window.pageYOffset
        }
      });
    });

    // Trigger when this form is ready.
    this.on('iframe-ready', () => this.iframeReadyResolve(), true);
  }

  render() {
    return this.renderTemplate('pdf', {
      classes: 'formio-form-pdf',
      children: this.renderComponents()
    });
  }

  redraw() {
    return super.redraw();
  }

  attach(element) {
    return super.attach(element).then(() => {
      this.loadRefs(element, {
        submitButton: 'single',
        zoomIn: 'single',
        zoomOut: 'single',
        iframeContainer: 'single'
      });

      // Reset the iframeReady promise.
      this.iframeReady = new NativePromise((resolve, reject) => {
        this.iframeReadyResolve = resolve;
        this.iframeReadyReject = reject;
      });

      // iframes cannot be in the template so manually create it
      this.iframeElement = this.ce('iframe', {
        src: this.getSrc(),
        id: `iframe-${this.id}`,
        seamless: true,
        class: 'formio-iframe'
      });

      this.iframeElement.formioContainer = this.component.components;
      this.iframeElement.formioComponent = this;

      // Append the iframe to the iframeContainer in the template
      this.empty(this.refs.iframeContainer);
      this.appendChild(this.refs.iframeContainer, this.iframeElement);

      // Post the form to the iframe
      this.postMessage({ name: 'form', data: this.form });

      // Hide the submit button if the associated component is hidden
      const submitButton = this.components.find(c => c.element === this.refs.submitButton);
      this.refs.submitButton.classList.toggle('hidden', !submitButton.visible);

      // Submit the form if they click the submit button.
      this.addEventListener(this.refs.submitButton, 'click', () => {
        this.postMessage({ name: 'getErrors' });
        return this.submit();
      });

      this.addEventListener(this.refs.zoomIn, 'click', (event) => {
        event.preventDefault();
        this.postMessage({ name: 'zoomIn' });
      });

      this.addEventListener(this.refs.zoomOut, 'click', (event) => {
        event.preventDefault();
        this.postMessage({ name: 'zoomOut' });
      });

      const form = fastCloneDeep(this.form);
      if (this.formio) {
        form.projectUrl = this.formio.projectUrl;
        form.url = this.formio.formUrl;
        form.base = this.formio.base;
        this.postMessage({ name: 'token', data: this.formio.getToken() });
      }

      this.emit('attach');
    });
  }

  /**
   * Get the submission from the iframe.
   *
   * @return {Promise<any>}
   */
  getSubmission() {
    return new NativePromise((resolve) => {
      this.once('iframe-submission', resolve);
      this.postMessage({ name: 'getSubmission' });
    });
  }

  /**
   * Ensure we have the submission from the iframe before we submit the form.
   *
   * @param options
   * @return {*}
   */
  submitForm(options = {}) {
    return this.getSubmission().then(() => super.submitForm(options));
  }

  getSrc() {
    if (!this._form || !this._form.settings || !this._form.settings.pdf) {
      return '';
    }

    let iframeSrc = `${this._form.settings.pdf.src}.html`;
    const params = [`id=${this.id}`];

    if (this.options.readOnly) {
      params.push('readonly=1');
    }

    if (this.options.zoom) {
      params.push(`zoom=${this.options.zoom}`);
    }

    if (this.builderMode) {
      params.push('builder=1');
    }

    if (params.length) {
      iframeSrc += `?${params.join('&')}`;
    }

    return iframeSrc;
  }

  setForm(form) {
    return super.setForm(form).then(() => {
      if (this.formio) {
        form.projectUrl = this.formio.projectUrl;
        form.url = this.formio.formUrl;
        form.base = this.formio.base;
        this.postMessage({ name: 'token', data: this.formio.getToken() });
      }
      this.postMessage({ name: 'form', data: form });
    });
  }

  /**
   * Set's the value of this form component.
   *
   * @param submission
   * @param flags
   */
  setValue(submission, flags = {}) {
    const changed = super.setValue(submission, flags);
    if (!flags || !flags.fromIframe) {
      this.once('iframe-ready', () => {
        this.postMessage({ name: 'submission', data: submission });
      });
    }
    return changed;
  }

  setSubmission(submission) {
    submission.readOnly = !!this.options.readOnly;
    return super.setSubmission(submission).then(() => {
      if (this.formio) {
        this.formio.getDownloadUrl().then((url) => {
          // Add a download button if it has a download url.
          if (!url) {
            return;
          }
          if (!this.downloadButton) {
            if (this.options.primaryProject) {
              url += `&project=${this.options.primaryProject}`;
            }
            this.downloadButton = this.ce('a', {
              href: url,
              target: '_blank',
              style: 'position:absolute;right:10px;top:110px;cursor:pointer;'
            }, this.ce('img', {
              src: require('./pdf.image'),
              style: 'width:3em;'
            }));
            this.element.insertBefore(this.downloadButton, this.iframe);
          }
        });
      }
    });
  }

  postMessage(message) {
    // If we get here before the iframeReady promise is set up, it's via the superclass constructor
    if (!this.iframeReady) {
      return;
    }

    if (!message.type) {
      message.type = 'iframe-data';
    }

    this.iframeReady.then(() => {
      if (this.iframeElement && this.iframeElement.contentWindow) {
        this.iframeElement.contentWindow.postMessage(JSON.stringify(message), '*');
      }
    });
  }

  focusOnComponent(key) {
    this.postMessage({
      name: 'focusErroredField',
      data: key,
    });
  }

  // Do not clear the iframe.
  clear() {}

  showErrors(error, triggerEvent) {
    const helpBlock = document.getElementById('submit-error');

    if (!helpBlock) {
      const p = this.ce('p', { class: 'help-block' });

      this.setContent(p, this.t('submitError'));
      p.addEventListener('click', () => {
        window.scrollTo(0, 0);
      });

      const div = this.ce('div', { id: 'submit-error', class: 'has-error' });

      this.appendTo(p, div);
      this.appendTo(div, this.element);
    }

    if (!this.errors.length && helpBlock) {
      helpBlock.remove();
    }

    if (this.errors.length) {
      this.focusOnComponent(this.errors[0].component.key);
    }

    if (this.errors.length) {
      this.focusOnComponent(this.errors[0].component.key);
    }

    super.showErrors(error, triggerEvent);
  }
}

/**
 * Listen for window messages.
 */
window.addEventListener('message', (event) => {
  let eventData = null;
  try {
    eventData = JSON.parse(event.data);
  }
  catch (err) {
    eventData = null;
  }

  // If this form exists, then emit the event within this form.
  if (
    eventData &&
    eventData.name &&
    eventData.formId &&
    Formio.forms.hasOwnProperty(eventData.formId)
  ) {
    Formio.forms[eventData.formId].emit(`iframe-${eventData.name}`, eventData.data);
  }
});
