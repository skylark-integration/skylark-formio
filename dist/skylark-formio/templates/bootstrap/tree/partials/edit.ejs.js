/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="node-edit">\n  <div ref="nodeEdit">{{ ctx.children }}</div>\n  {% if (!ctx.readOnly) { %}\n    <div class="node-actions">\n      <button ref="saveNode" class="btn btn-primary saveNode">{{ ctx.t(\'Save\') }}</button>\n      <button ref="cancelNode" class="btn btn-danger cancelNode">{{ ctx.t(\'Cancel\') }}</button>\n    </div>\n  {% } %}\n</div>\n'});
//# sourceMappingURL=../../../../sourcemaps/templates/bootstrap/tree/partials/edit.ejs.js.map
