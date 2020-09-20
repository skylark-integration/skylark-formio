/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<label class="col-form-label {{ctx.label.className}}">\n  {{ ctx.t(ctx.component.label) }}\n  {% if (ctx.component.tooltip) { %}\n    <i ref="tooltip" class="{{ctx.iconClass(\'question-sign\')}} text-muted"></i>\n  {% } %}\n</label>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/label/form.ejs.js.map
