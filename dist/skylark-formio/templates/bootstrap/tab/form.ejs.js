/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="card">\n  <div class="card-header">\n    <ul class="nav nav-tabs card-header-tabs">\n      {% ctx.component.components.forEach(function(tab, index) { %}\n      <li class="nav-item{{ ctx.currentTab === index ? \' active\' : \'\'}}" role="presentation" ref="{{ctx.tabLikey}}">\n        <a class="nav-link{{ ctx.currentTab === index ? \' active\' : \'\'}}" href="#{{tab.key}}" ref="{{ctx.tabLinkKey}}">{{ctx.t(tab.label)}}</a>\n      </li>\n      {% }) %}\n    </ul>\n  </div>\n  {% ctx.component.components.forEach(function(tab, index) { %}\n  <div\n    role="tabpanel"\n    class="card-body tab-pane{{ ctx.currentTab === index ? \' active\' : \'\'}}"\n    style="display: {{ctx.currentTab === index ? \'block\' : \'none\'}}"\n    ref="{{ctx.tabKey}}"\n  >\n    {{ctx.tabComponents[index]}}\n  </div>\n  {% }) %}\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/tab/form.ejs.js.map