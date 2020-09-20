/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return"<table class=\"table datagrid-table table-bordered\n    {{ ctx.component.striped ? 'table-striped' : ''}}\n    {{ ctx.component.hover ? 'table-hover' : ''}}\n    {{ ctx.component.condensed ? 'table-sm' : ''}}\n    \">\n  {% if (ctx.hasHeader) { %}\n  <thead>\n    <tr>\n      {% ctx.columns.forEach(function(col) { %}\n        <th class=\"{{col.validate && col.validate.required ? 'field-required' : ''}}\">\n          {{ col.hideLabel ? '' : ctx.t(col.label || col.title) }}\n          {% if (col.tooltip) { %} <i ref=\"tooltip\" data-title=\"{{col.tooltip}}\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>{% } %}\n        </th>\n      {% }) %}\n    </tr>\n  </thead>\n  {% } %}\n  <tbody>\n    {% ctx.rows.forEach(function(row) { %}\n    <tr>\n      {% ctx.columns.forEach(function(col) { %}\n        <td ref=\"{{ctx.datagridKey}}\">\n          {{row[col.key]}}\n        </td>\n      {% }) %}\n    </tr>\n    {% }) %}\n  </tbody>\n</table>\n"});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/datagrid/html.ejs.js.map
