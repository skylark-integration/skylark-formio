define([], function() { return "<div\n  class=\"input-group formio-multiple-mask-container\"\n  ref=\"{{ctx.input.ref ? ctx.input.ref : 'input'}}\"\n>\n  <select\n    class=\"form-control formio-multiple-mask-select\"\n    id=\"{{ctx.key}}-mask\"\n    ref=\"select\">\n    {% ctx.selectOptions.forEach(function(option) { %}\n    <option value=\"{{option.value}}\">{{option.label}}</option>\n    {% }); %}\n  </select>\n  <input\n    ref=\"mask\"\n    {% for (var attr in ctx.input.attr) { %}\n    {{attr}}=\"{{ctx.input.attr[attr]}}\"\n    {% } %}\n  >\n</div>\n"; });