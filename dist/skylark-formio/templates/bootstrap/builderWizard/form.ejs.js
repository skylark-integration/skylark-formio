/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="formio builder row formbuilder">\n  <div class="col-xs-4 col-sm-3 col-md-2 formcomponents">\n    {{ctx.sidebar}}\n  </div>\n  <div class="col-xs-8 col-sm-9 col-md-10 formarea">\n    <ol class="breadcrumb">\n      {% ctx.pages.forEach(function(page, pageIndex) { %}\n      <li>\n        <span title="{{page.title}}" class="mr-2 badge {% if (pageIndex === ctx.self.page) { %}badge-primary{% } else { %}badge-info{% } %} wizard-page-label" ref="gotoPage">{{page.title}}</span>\n      </li>\n      {% }) %}\n      <li>\n        <span title="{{ctx.t(\'Create Page\')}}" class="mr-2 badge badge-success wizard-page-label" ref="addPage">\n          <i class="{{ctx.iconClass(\'plus\')}}"></i> {{ctx.t(\'Page\')}}\n        </span>\n      </li>\n    </ol>\n    <div ref="form">\n      {{ctx.form}}\n    </div>\n  </div>\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/builderWizard/form.ejs.js.map
