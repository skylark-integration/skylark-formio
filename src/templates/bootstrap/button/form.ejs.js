define([], function() { return "<{{ctx.input.type}}\n  ref=\"button\"\n  {% for (var attr in ctx.input.attr) { %}\n  {{attr}}=\"{{ctx.input.attr[attr]}}\"\n  {% } %}\n>\n{% if (ctx.component.leftIcon) { %}<span class=\"{{ctx.component.leftIcon}}\"></span>&nbsp;{% } %}\n{{ctx.input.content}}\n{% if (ctx.component.tooltip) { %}\n  <i ref=\"tooltip\" class=\"{{ctx.iconClass('question-sign')}} text-muted\"></i>\n{% } %}\n{% if (ctx.component.rightIcon) { %}&nbsp;<span class=\"{{ctx.component.rightIcon}}\"></span>{% } %}\n</{{ctx.input.type}}>\n<div ref=\"buttonMessageContainer\">\n  <span class=\"help-block\" ref=\"buttonMessage\"></span>\n</div>\n"; });