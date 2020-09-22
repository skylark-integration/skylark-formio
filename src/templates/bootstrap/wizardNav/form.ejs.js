define([], function() { return "<ul class=\"list-inline\" id=\"{{ ctx.wizardKey }}-nav\">\n  {% if (ctx.buttons.cancel) { %}\n  <li class=\"list-inline-item\">\n    <button class=\"btn btn-secondary btn-wizard-nav-cancel\" ref=\"{{ctx.wizardKey}}-cancel\">{{ctx.t('cancel')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.previous) { %}\n  <li class=\"list-inline-item\">\n    <button class=\"btn btn-primary btn-wizard-nav-previous\" ref=\"{{ctx.wizardKey}}-previous\">{{ctx.t('previous')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.next) { %}\n  <li class=\"list-inline-item\">\n    <button class=\"btn btn-primary btn-wizard-nav-next\" ref=\"{{ctx.wizardKey}}-next\">{{ctx.t('next')}}</button>\n  </li>\n  {% } %}\n  {% if (ctx.buttons.submit) { %}\n  <li class=\"list-inline-item\">\n    <button class=\"btn btn-primary btn-wizard-nav-submit\" ref=\"{{ctx.wizardKey}}-submit\">{{ctx.t('submit')}}</button>\n  </li>\n  {% } %}\n</ul>\n"; });