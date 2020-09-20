/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../PDFBuilder","../WebformBuilder","../WizardBuilder"],function(r,e,d,i){"use strict";class s{static addBuilder(r,e){s.builders[r]=e}static addBuilders(e){s.builders=r.merge(s.builders,e)}static getBuilder(r){return s.builders[r]}static getBuilders(){return s.builders}}return s.builders={pdf:e,webform:d,wizard:i},s});
//# sourceMappingURL=../sourcemaps/builders/Builders.js.map
