/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<{{ctx.tag}} class="{{ ctx.component.className }}" ref="html"\n  {% ctx.attrs.forEach(function(attr) { %}\n    {{attr.attr}}="{{attr.value}}"\n  {% }) %}\n>{{ctx.content}}{% if (!ctx.singleTags || ctx.singleTags.indexOf(ctx.tag) === -1) { %}</{{ctx.tag}}>{% } %}\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/html/form.ejs.js.map
