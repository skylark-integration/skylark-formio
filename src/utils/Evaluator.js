define([
    'skylark-lodash'
], function (_) {
    'use strict';

    function stringHash(str) {
      var hash = 5381,
          i    = str.length;

      while(i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
      }

      /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
       * integers. Since we want the results to be always positive, convert the
       * signed int to an unsigned by doing an unsigned bitshift. */
      return hash >>> 0;
    }

    const Evaluator = {
        noeval: false,
        cache: {},
        templateSettings: {
            evaluate: /\{%([\s\S]+?)%\}/g,
            interpolate: /\{\{([\s\S]+?)\}\}/g,
            escape: /\{\{\{([\s\S]+?)\}\}\}/g
        },
        evaluator(func, ...params) {
            if (Evaluator.noeval) {
                console.warn('No evaluations allowed for this renderer.');
                return _.noop;
            }
            if (typeof params[0] === 'object') {
                params = _.keys(params[0]);
            }
            return new Function(...params, func);
        },
        template(template, hash) {
            hash = hash || stringHash(template);
            try {
                template = template.replace(/ctx\./g, '');
                return Evaluator.cache[hash] = _.template(template, Evaluator.templateSettings);
            } catch (err) {
                console.warn('Error while processing template', err, template);
            }
        },
        interpolate(rawTemplate, data) {
            if (typeof rawTemplate === 'function') {
                try {
                    return rawTemplate(data);
                } catch (err) {
                    console.warn('Error interpolating template', err, data);
                    return err.message;
                }
            }
            rawTemplate = String(rawTemplate);
            const hash = stringHash(rawTemplate);
            let template;
            if (Evaluator.cache[hash]) {
                template = Evaluator.cache[hash];
            } else if (Evaluator.noeval) {
                return rawTemplate.replace(/({{\s*(.*?)\s*}})/g, (match, $1, $2) => _.get(data, $2));
            } else {
                template = Evaluator.template(rawTemplate, hash);
            }
            if (typeof template === 'function') {
                try {
                    return template(data);
                } catch (err) {
                    console.warn('Error interpolating template', err, rawTemplate, data);
                    return err.message;
                }
            }
            return template;
        },
        evaluate(func, args) {
            return Array.isArray(args) ? func(...args) : func(args);
        }
    };
    return Evaluator;
});