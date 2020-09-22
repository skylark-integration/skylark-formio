define([], function() { return "{% if (ctx.node.isRoot) { %}\n  <div ref=\"root\" class=\"list-group-item\">\n{% } else { %}\n  <li ref=\"node\" class=\"list-group-item col-sm-12 tree__level tree__level_{{ ctx.odd ? 'odd' : 'even' }}\">\n{% } %}\n  {% if (ctx.content) { %}\n    <div ref=\"content\" class=\"tree__node-content\">\n      {{ ctx.content }}\n    </div>\n  {% } %}\n  {% if (ctx.childNodes && ctx.childNodes.length) { %}\n    <ul ref=\"childNodes\" class=\"tree__node-children list-group row\">\n      {{ ctx.childNodes.join('') }}\n    </ul>\n  {% } %}\n{% if (ctx.node.isRoot) { %}\n  </div>\n{% } else { %}\n  </li>\n{% } %}\n"; });