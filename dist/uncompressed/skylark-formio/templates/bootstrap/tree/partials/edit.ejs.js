define([], function() { return "<div class=\"node-edit\">\n  <div ref=\"nodeEdit\">{{ ctx.children }}</div>\n  {% if (!ctx.readOnly) { %}\n    <div class=\"node-actions\">\n      <button ref=\"saveNode\" class=\"btn btn-primary saveNode\">{{ ctx.t('Save') }}</button>\n      <button ref=\"cancelNode\" class=\"btn btn-danger cancelNode\">{{ ctx.t('Cancel') }}</button>\n    </div>\n  {% } %}\n</div>\n"; });