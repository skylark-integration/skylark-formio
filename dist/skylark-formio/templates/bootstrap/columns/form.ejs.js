/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'{% ctx.component.columns.forEach(function(column, index) { %}\n<div class="\n    col-{{column.size}}-{{column.width}}\n    col-{{column.size}}-offset-{{column.offset}}\n    col-{{column.size}}-push-{{column.push}}\n    col-{{column.size}}-pull-{{column.pull}}\n  " ref="{{ctx.columnKey}}">\n  {{ctx.columnComponents[index]}}\n</div>\n{% }) %}\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/columns/form.ejs.js.map
