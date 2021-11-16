/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../PDF","../Webform","../Wizard"],function(s,a,i,t){"use strict";class d{static addDisplay(s,a){d.displays[s]=a}static addDisplays(a){d.displays=s.merge(d.displays,a)}static getDisplay(s){return d.displays[s]}static getDisplays(){return d.displays}}return d.displays={pdf:a,webform:i,wizard:t},d});
//# sourceMappingURL=../sourcemaps/displays/Displays.js.map
