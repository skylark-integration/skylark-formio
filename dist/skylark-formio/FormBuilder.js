/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Formio","./builders","./Form"],function(e,s,t){"use strict";return class i extends t{constructor(s,t,o){t=t||{},o=o||{},super(s,t,Object.assign(o,i.options,e.options&&e.options.builder?e.options.builder:{}))}create(e){return s.builders[e]?new s.builders[e](this.element,this.options):new s.builders.webform(this.element,this.options)}}});
//# sourceMappingURL=sourcemaps/FormBuilder.js.map
