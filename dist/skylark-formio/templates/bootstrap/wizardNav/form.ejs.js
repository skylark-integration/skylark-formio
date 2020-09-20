/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<ul class="list-inline" id="{{ ctx.wizardKey }}-nav">\n  {% if (ctx.buttons.cancel) { %}\n  <li class="list-inline-item">\n    <button class="btn btn-secondary btn-wizard-nav-cancel" ref="{{ctx.wizardKey}}-cancel">{{ctx.t(\'cancel\')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.previous) { %}\n  <li class="list-inline-item">\n    <button class="btn btn-primary btn-wizard-nav-previous" ref="{{ctx.wizardKey}}-previous">{{ctx.t(\'previous\')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.next) { %}\n  <li class="list-inline-item">\n    <button class="btn btn-primary btn-wizard-nav-next" ref="{{ctx.wizardKey}}-next">{{ctx.t(\'next\')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.submit) { %}\n  <li class="list-inline-item">\n    <button class="btn btn-primary btn-wizard-nav-submit" ref="{{ctx.wizardKey}}-submit">{{ctx.t(\'submit\')}}</button>\n  </li>\n  {% } %}\n</ul>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/wizardNav/form.ejs.js.map
