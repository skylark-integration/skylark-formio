define([], function() { return "<div ref=\"container\" class=\"formio-modaledit-view-container\">\n  <button\n    ref=\"edit\"\n    type=\"button\"\n    role=\"button\"\n    class=\"btn btn-xxs btn-warning formio-modaledit-edit\">\n    <i class=\"{{ctx.iconClass('edit')}}\"></i>\n  </button>\n  <div ref=\"input\" class=\"modaledit-view-inner reset-margins\">{{ctx.content}}</div>\n</div>\n"; });