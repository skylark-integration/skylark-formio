/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'{% ctx.component.components.forEach(function(tab, index) { %}\n  <div class="mb-2 card border">\n    <div class="card-header bg-default">\n      <h4 class="mb-0 card-title">{{ ctx.t(tab.label) }}</h4>\n    </div>\n    <div class="card-body">\n      {{ ctx.tabComponents[index] }}\n    </div>\n  </div>\n{% }) %}\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/tab/flat.ejs.js.map
