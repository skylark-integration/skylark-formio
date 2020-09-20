/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<table class="table table-striped table-bordered">\n  <tbody>\n    {% ctx.component.questions.forEach(function(question) { %}\n    <tr>\n      <th>{{ctx.t(question.label)}}</th>\n      <td>\n      {% ctx.component.values.forEach(function(item) { %}\n        {% if (ctx.value && ctx.value.hasOwnProperty(question.value) && ctx.value[question.value] === item.value) { %}\n          {{ctx.t(item.label)}}\n        {% } %}\n      {% }) %}\n      </td>\n    </tr>\n    {% }) %}\n  </tbody>\n</table>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/survey/html.ejs.js.map
