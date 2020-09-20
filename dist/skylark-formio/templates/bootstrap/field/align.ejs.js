/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="field-wrapper\n  {{ctx.isRightPosition ? \'field-wrapper--reverse\' : \'\'}}">\n  {% if (!ctx.label.hidden) { %}\n    <div class="field-label\n      {{ctx.isRightAlign ? \'field-label--right\' : \'\'}}"\n      style="{{ctx.labelStyles}}">\n    {{ ctx.labelMarkup }}\n    </div>\n  {% } %}\n\n  {% if (ctx.label.hidden && ctx.label.className && ctx.component.validate.required) { %}\n    <div class="field-label\n      {{ctx.isRightAlign ? \'field-label--right\' : \'\'}}"\n      style="{{ctx.labelStyles}}">\n      <label class="{{ctx.label.className}}"></label>\n    </div>\n  {% } %}\n\n  <div class="filed-content" style="{{ctx.contentStyles}}">\n    {{ctx.element}}\n  </div>\n</div>\n\n{% if (ctx.component.description) { %}\n  <div class="form-text text-muted">{{ctx.t(ctx.component.description)}}</div>\n{% } %}\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/field/align.ejs.js.map
