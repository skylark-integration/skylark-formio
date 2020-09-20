/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return"{% if (!ctx.label.hidden && ctx.label.labelPosition !== 'bottom') { %}\n  {{ ctx.labelMarkup }}\n{% } %}\n\n{% if (ctx.label.hidden && ctx.label.className && ctx.component.validate.required) { %}\n  <label class=\"{{ctx.label.className}}\"></label>\n{% } %}\n\n{{ctx.element}}\n\n{% if (!ctx.label.hidden && ctx.label.labelPosition === 'bottom') { %}\n  {{ ctx.labelMarkup }}\n{% } %}\n{% if (ctx.component.description) { %}\n  <div class=\"form-text text-muted\">{{ctx.t(ctx.component.description)}}</div>\n{% } %}\n"});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/field/form.ejs.js.map
