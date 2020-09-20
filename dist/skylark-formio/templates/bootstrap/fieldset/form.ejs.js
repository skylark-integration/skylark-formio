/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<fieldset>\n  {% if (ctx.component.legend) { %}\n  <legend ref="header" class="{{ctx.component.collapsible ? \'formio-clickable\' : \'\'}}">\n    {{ctx.t(ctx.component.legend)}}\n    {% if (ctx.component.tooltip) { %}\n      <i ref="tooltip" class="{{ctx.iconClass(\'question-sign\')}} text-muted"></i>\n    {% } %}\n  </legend>\n  {% } %}\n  {% if (!ctx.collapsed) { %}\n  <div class="fieldset-body" ref="{{ctx.nestedKey}}">\n    {{ctx.children}}\n  </div>\n  {% } %}\n</fieldset>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/fieldset/form.ejs.js.map
