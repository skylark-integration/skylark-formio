/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<option {{ ctx.selected ? \'selected="selected"\' : \'\' }}\n  value="{{ctx.useId ? ctx.id : ctx.option.value}}"\n  {% for (var attr in ctx.attrs) { %}\n  {{attr}}="{{ctx.attrs[attr]}}"\n  {% } %}\n  >\n  {{ctx.t(ctx.option.label)}}\n</option>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/selectOption/form.ejs.js.map
