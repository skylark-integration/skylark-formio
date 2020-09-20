/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="row">\n  {% if (ctx.dayFirst && ctx.showDay) { %}\n  <div class="col col-xs-3">\n    {% if (!ctx.component.hideInputLabels) { %}\n    <label for="{{ctx.component.key}}-day" class="{% if(ctx.component.fields.day.required) { %}field-required{% } %}">{{ctx.t(\'Day\')}}</label>\n    {% } %}\n    <div>{{ctx.day}}</div>\n  </div>\n  {% } %}\n  {% if (ctx.showMonth) { %}\n  <div class="col col-xs-4">\n    {% if (!ctx.component.hideInputLabels) { %}\n    <label for="{{ctx.component.key}}-month" class="{% if(ctx.component.fields.month.required) { %}field-required{% } %}">{{ctx.t(\'Month\')}}</label>\n    {% } %}\n    <div>{{ctx.month}}</div>\n  </div>\n  {% } %}\n  {% if (!ctx.dayFirst && ctx.showDay) { %}\n  <div class="col col-xs-3">\n    {% if (!ctx.component.hideInputLabels) { %}\n    <label for="{{ctx.component.key}}-day" class="{% if(ctx.component.fields.day.required) { %}field-required{% } %}">{{ctx.t(\'Day\')}}</label>\n    {% } %}\n    <div>{{ctx.day}}</div>\n  </div>\n  {% } %}\n  {% if (ctx.showYear) { %}\n  <div class="col col-xs-5">\n    {% if (!ctx.component.hideInputLabels) { %}\n    <label for="{{ctx.component.key}}-year" class="{% if(ctx.component.fields.year.required) { %}field-required{% } %}">{{ctx.t(\'Year\')}}</label>\n    {% } %}\n    <div>{{ctx.year}}</div>\n  </div>\n  {% } %}\n</div>\n<input name="ctx.data[day]" type="hidden" class="form-control" lang="en" value="" ref="input">\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/day/form.ejs.js.map
