/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Formio","./builders/index","./Form"],function(e,i,s){"use strict";class t extends s{constructor(i,s,o){s=s||{},o=o||{},super(i,s,Object.assign(o,t.options,e.options&&e.options.builder?e.options.builder:{}))}create(e){return i.builders[e]?new i.builders[e](this.element,this.options):new i.builders.webform(this.element,this.options)}}return t.options={},e.builder=((...e)=>new t(...e).ready),e.FormBuilder=t});
//# sourceMappingURL=sourcemaps/FormBuilder.js.map
