/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<table class="table table-bordered">\n  <tbody>\n  {{ctx.rows}}\n  {% if (!ctx.disabled) { %}\n  <tr>\n    <td colspan="2">\n      <button class="btn btn-primary formio-button-add-another" ref="addButton"><i class="{{ctx.iconClass(\'plus\')}}"></i> {{ctx.t(ctx.addAnother)}}</button>\n    </td>\n  </tr>\n  {% } %}\n  </tbody>\n</table>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/multiValueTable/form.ejs.js.map
