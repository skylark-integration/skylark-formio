/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<tr ref="row">\n  <td>\n    {{ctx.element}}\n  </td>\n  {% if (!ctx.disabled) { %}\n  <td>\n    <button type="button" class="btn btn-secondary" ref="removeRow">\n      <i class="{{ctx.iconClass(\'remove-circle\')}}"></i>\n    </button>\n  </td>\n  {% } %}\n</tr>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/multiValueRow/form.ejs.js.map
