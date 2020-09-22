/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="row">\n  {% ctx.util.eachComponent(ctx.components, function(component) { %}\n    {% if (!component.hasOwnProperty(\'tableView\') || component.tableView) { %}\n      <div class="col-sm-2">{{ component.label }}</div>\n    {% } %}\n  {% }) %}\n</div>'});
//# sourceMappingURL=../../../sourcemaps/components/editgrid/templates/header.ejs.js.map
