/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="form-radio radio">\n  {% ctx.values.forEach(function(item) { %}\n  <div class="form-check{{ctx.inline ? \'-inline\' : \'\'}}" ref="wrapper">\n    <label class="form-check-label label-position-{{ ctx.component.optionsLabelPosition }}" for="{{ctx.id}}{{ctx.row}}-{{item.value}}">\n      {% if (ctx.component.optionsLabelPosition === \'left\' || ctx.component.optionsLabelPosition === \'top\') { %}\n      <span>{{ctx.t(item.label)}}</span>\n      {% } %}\n      <{{ctx.input.type}}\n        ref="input"\n        {% for (var attr in ctx.input.attr) { %}\n        {{attr}}="{{ctx.input.attr[attr]}}"\n        {% } %}\n        value="{{item.value}}"\n        {% if (ctx.value && (ctx.value === item.value || (typeof ctx.value === \'object\' && ctx.value.hasOwnProperty(item.value) && ctx.value[item.value]))) { %}\n          checked=true\n        {% } %}\n        {% if (item.disabled) { %}\n          disabled=true\n        {% } %}\n        id="{{ctx.id}}{{ctx.row}}-{{item.value}}"\n      >\n      {% if (!ctx.component.optionsLabelPosition || ctx.component.optionsLabelPosition === \'right\' || ctx.component.optionsLabelPosition === \'bottom\') { %}\n      <span>{{ctx.t(item.label)}}</span>\n      {% } %}\n    </label>\n  </div>\n  {% }) %}\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/radio/form.ejs.js.map