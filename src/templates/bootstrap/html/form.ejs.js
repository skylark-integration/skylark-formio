define([], function() { return "<{{ctx.tag}} class=\"{{ ctx.component.className }}\" ref=\"html\"\n  {% ctx.attrs.forEach(function(attr) { %}\n    {{attr.attr}}=\"{{attr.value}}\"\n  {% }) %}\n>{{ctx.content}}{% if (!ctx.singleTags || ctx.singleTags.indexOf(ctx.tag) === -1) { %}</{{ctx.tag}}>{% } %}\n"; });