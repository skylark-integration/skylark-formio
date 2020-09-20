/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<table class="table table-striped table-bordered">\n  <thead>\n    <tr>\n      <th></th>\n      {% ctx.component.values.forEach(function(value) { %}\n      <th style="text-align: center;">{{ctx.t(value.label)}}</th>\n      {% }) %}\n    </tr>\n  </thead>\n  <tbody>\n    {% ctx.component.questions.forEach(function(question) { %}\n    <tr>\n      <td>{{ctx.t(question.label)}}</td>\n      {% ctx.component.values.forEach(function(value) { %}\n      <td style="text-align: center;">\n        <input type="radio" name="{{ ctx.self.getInputName(question) }}" value="{{value.value}}" id="{{ctx.key}}-{{question.value}}-{{value.value}}" ref="input">\n      </td>\n      {% }) %}\n    </tr>\n    {% }) %}\n  </tbody>\n</table>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/survey/form.ejs.js.map