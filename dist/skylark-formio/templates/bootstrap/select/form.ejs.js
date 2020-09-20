/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<select\n  ref="{{ctx.input.ref ? ctx.input.ref : \'selectContainer\'}}"\n  {{ ctx.input.multiple ? \'multiple\' : \'\' }}\n  {% for (var attr in ctx.input.attr) { %}\n  {{attr}}="{{ctx.input.attr[attr]}}"\n  {% } %}\n>{{ctx.selectOptions}}</select>\n<input type="text"\n       class="formio-select-autocomplete-input"\n       ref="autocompleteInput"\n       {% if (ctx.input.attr.autocomplete) { %}\n       autocomplete="{{ctx.input.attr.autocomplete}}"\n       {% } %}\n       tabindex="-1"\n/>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/select/form.ejs.js.map
