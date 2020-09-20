/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="row">\n  {% ctx.values.forEach(function(value) { %}\n    <div class="col-sm-2">\n      {{ value }}\n    </div>\n  {% }) %}\n  <div class="col-sm-3">\n    <div class="btn-group pull-right">\n      {% if (ctx.node.hasChildren) { %}\n        <button ref="toggleNode" class="btn btn-default btn-sm toggleNode">{{ ctx.t(ctx.node.collapsed ? \'Expand\' : \'Collapse\') }}</button>\n      {% } %}\n      {% if (!ctx.readOnly) { %}\n        <button ref="addChild" class="btn btn-default btn-sm addChild">{{ ctx.t(\'Add\') }}</button>\n        <button ref="editNode" class="btn btn-default btn-sm editNode">{{ ctx.t(\'Edit\') }}</button>\n        <button ref="removeNode" class="btn btn-danger btn-sm removeNode">{{ ctx.t(\'Delete\') }}</button>\n        {% if (ctx.node.revertAvailable) { %}\n          <button ref="revertNode" class="btn btn-danger btn-sm revertNode">{{ ctx.t(\'Revert\') }}</button>\n        {% } %}\n      {% } %}\n    </div>\n  </div>\n</div>\n'});
//# sourceMappingURL=../../../../sourcemaps/templates/bootstrap/tree/partials/view.ejs.js.map
