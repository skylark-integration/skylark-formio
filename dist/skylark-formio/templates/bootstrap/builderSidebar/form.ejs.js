/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div id="{{ctx.groupId}}" class="accordion builder-sidebar{{ctx.scrollEnabled ? \' builder-sidebar_scroll\' : \'\'}}" ref="sidebar">\n  {% ctx.groups.forEach(function(group) { %}\n    {{ group }}\n  {% }) %}\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/builderSidebar/form.ejs.js.map
