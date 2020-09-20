/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<nav aria-label="navigation" id="{{ ctx.wizardKey }}-header">\n  <ul class="pagination">\n    {% ctx.panels.forEach(function(panel, index) { %}\n    <li class="page-item{{ctx.currentPage === index ? \' active\' : \'\'}}" style="">\n      <span class="page-link" ref="{{ctx.wizardKey}}-link">{{panel.title}}</span>\n    </li>\n    {% }) %}\n  </ul>\n</nav>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/wizardHeader/form.ejs.js.map
