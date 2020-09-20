/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="mb-2 card border">\n  <div class="card-header {{ctx.transform(\'class\', \'bg-\' + ctx.component.theme)}}" ref="header">\n    <span class="mb-0 card-title">\n      {% if (ctx.component.collapsible) { %}\n        <i class="formio-collapse-icon {{ctx.iconClass(ctx.collapsed ? \'plus-square-o\' : \'minus-square-o\')}} text-muted" data-title="Collapse Panel"></i>\n      {% } %}\n      {{ctx.t(ctx.component.title)}}\n      {% if (ctx.component.tooltip) { %}\n        <i ref="tooltip" class="{{ctx.iconClass(\'question-sign\')}} text-muted"></i>\n      {% } %}\n    </span>\n  </div>\n  {% if (!ctx.collapsed || ctx.builder) { %}\n  <div class="card-body" ref="{{ctx.nestedKey}}">\n    {{ctx.children}}\n  </div>\n  {% } %}\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/panel/form.ejs.js.map
