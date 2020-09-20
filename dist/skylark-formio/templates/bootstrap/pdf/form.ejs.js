/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="{{ctx.classes}}" ref="webform">\n\t<span data-noattach="true" ref="zoomIn" style="position:absolute;right:10px;top:10px;cursor:pointer;" class="btn btn-default btn-secondary no-disable">\n\t\t<i class="{{ ctx.iconClass(\'zoom-in\') }}"></i>\n\t</span>\n\t<span data-noattach="true" ref="zoomOut" style="position:absolute;right:10px;top:60px;cursor:pointer;" class="btn btn-default btn-secondary no-disable">\n\t\t<i class="{{ ctx.iconClass(\'zoom-out\') }}"></i>\n\t</span>\n  <div data-noattach="true" ref="iframeContainer"></div>\n  <button type="button" class="btn btn-primary" ref="submitButton">{{ctx.t(\'Submit\')}}</button>\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/pdf/form.ejs.js.map
