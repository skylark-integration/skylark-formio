/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return"<table class=\"table\n    {{ ctx.component.striped ? 'table-striped' : ''}}\n    {{ ctx.component.bordered ? 'table-bordered' : ''}}\n    {{ ctx.component.hover ? 'table-hover' : ''}}\n    {{ ctx.component.condensed ? 'table-sm' : ''}}\n  \">\n  {% if (ctx.component.header && ctx.component.header.length > 0) { %}\n  <thead>\n    <tr>\n      {% ctx.component.header.forEach(function(header) { %}\n      <th>{{ctx.t(header)}}</th>\n      {% }) %}\n    </tr>\n  </thead>\n  {% } %}\n  <tbody>\n    {% ctx.tableComponents.forEach(function(row, rowIndex) { %}\n    <tr ref=\"row-{{ctx.id}}\">\n      {% row.forEach(function(column, colIndex) { %}\n      <td ref=\"{{ctx.tableKey}}-{{rowIndex}}\"{% if (ctx.cellClassName) { %} class=\"{{ctx.cellClassName}}\"{% } %}>{{column}}</td>\n      {% }) %}\n    </tr>\n    {% }) %}\n  </tbody>\n</table>\n"});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/table/form.ejs.js.map
