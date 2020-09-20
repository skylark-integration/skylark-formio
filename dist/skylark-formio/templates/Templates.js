/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./index","skylark-lodash"],function(t,e){"use strict";return class r{static get templates(){return r._templates||(r._templates=t),r._templates}static addTemplate(t,e){r.templates[t]=e}static extendTemplate(t,a){r.templates[t]=e.merge({},r.templates[t],a)}static setTemplate(t,e){r.addTemplate(t,e)}static set current(t){const a=r.current;r._current=e.merge({},a,t)}static get current(){return r._current?r._current:r.defaultTemplates}static get defaultTemplates(){return r.templates.bootstrap}static set framework(t){r.templates.hasOwnProperty(t)&&(r._framework=t,r._current=r.templates[t])}static get framework(){return r._framework}}});
//# sourceMappingURL=../sourcemaps/templates/Templates.js.map
