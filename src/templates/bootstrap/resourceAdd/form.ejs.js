define([], function() { return "<table class=\"table table-bordered\">\n  <tbody>\n    <tr>\n      <td>\n        {{ctx.element}}\n      </td>\n    </tr>\n    <tr>\n      <td colspan=\"2\">\n        <button class=\"btn btn-primary formio-button-add-resource\" ref=\"addResource\">\n          <i class=\"{{ctx.iconClass('plus')}}\"></i>\n          {{ctx.t(ctx.component.addResourceLabel || 'Add Resource')}}\n        </button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n"; });