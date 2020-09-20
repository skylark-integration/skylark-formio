/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="form-check checkbox">\n  <label class="{{ctx.input.labelClass}} form-check-label">\n    <{{ctx.input.type}}\n      ref="input"\n      {% for (var attr in ctx.input.attr) { %}\n      {{attr}}="{{ctx.input.attr[attr]}}"\n      {% } %}\n      {% if (ctx.checked) { %}checked=true{% } %}\n      >\n    {% if (!ctx.self.labelIsHidden()) { %}<span>{{ctx.input.label}}</span>{% } %}\n    {% if (ctx.component.tooltip) { %}\n      <i ref="tooltip" class="{{ctx.iconClass(\'question-sign\')}} text-muted"></i>\n    {% } %}\n    {{ctx.input.content}}\n    </{{ctx.input.type}}>\n  </label>\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/checkbox/form.ejs.js.map
