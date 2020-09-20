/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'{{ctx.element}}\n<div\n  class="signature-pad-body"\n  style="width: {{ctx.component.width}};height: {{ctx.component.height}};padding:0;margin:0;"\n  tabindex="{{ctx.component.tabindex || 0}}"\n  ref="padBody"\n>\n  <a class="btn btn-sm btn-light signature-pad-refresh" ref="refresh">\n    <i class="{{ctx.iconClass(\'refresh\')}}"></i>\n  </a>\n  <canvas class="signature-pad-canvas" height="{{ctx.component.height}}" ref="canvas"></canvas>\n  {% if (ctx.required) { %}\n  <span class="form-control-feedback field-required-inline text-danger">\n    <i class="{{ctx.iconClass(\'asterisk\')}}"></i>\n  </span>\n  {% } %}\n  <img style="width: 100%;display: none;" ref="signatureImage">\n</div>\n{% if (ctx.component.footer) { %}\n  <div class="signature-pad-footer">\n    {{ctx.t(ctx.component.footer)}}\n  </div>\n{% } %}\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/signature/form.ejs.js.map