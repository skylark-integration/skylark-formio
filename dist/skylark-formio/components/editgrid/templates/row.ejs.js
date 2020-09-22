/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="row">\n  {% ctx.util.eachComponent(ctx.components, function(component) { %}\n    {% if (!component.hasOwnProperty(\'tableView\') || component.tableView) { %}\n      <div class="col-sm-2">\n        {{ ctx.getView(component, ctx.row[component.key]) }}\n      </div>\n    {% } %}\n  {% }) %}\n  {% if (!ctx.self.options.readOnly) { %}\n    <div class="col-sm-2">\n      <div class="btn-group pull-right">\n        <button class="btn btn-default btn-light btn-sm editRow"><i class="{{ ctx.iconClass(\'edit\') }}"></i></button>\n        <button class="btn btn-danger btn-sm removeRow"><i class="{{ ctx.iconClass(\'trash\') }}"></i></button>\n      </div>\n    </div>\n  {% } %}\n</div>'});
//# sourceMappingURL=../../../sourcemaps/components/editgrid/templates/row.ejs.js.map
