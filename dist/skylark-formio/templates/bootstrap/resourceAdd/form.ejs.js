/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<table class="table table-bordered">\n  <tbody>\n    <tr>\n      <td>\n        {{ctx.element}}\n      </td>\n    </tr>\n    <tr>\n      <td colspan="2">\n        <button class="btn btn-primary formio-button-add-resource" ref="addResource">\n          <i class="{{ctx.iconClass(\'plus\')}}"></i>\n          {{ctx.t(ctx.component.addResourceLabel || \'Add Resource\')}}\n        </button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/resourceAdd/form.ejs.js.map
