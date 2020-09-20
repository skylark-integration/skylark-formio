/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div id="{{ctx.id}}" class="{{ctx.classes}}"{% if (ctx.styles) { %} styles="{{ctx.styles}}"{% } %} ref="component">\n  {% if (ctx.visible) { %}\n  {{ctx.children}}\n  <div ref="messageContainer" class="formio-errors invalid-feedback"></div>\n  {% } %}\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/component/form.ejs.js.map
