/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'<div class="formio-component-modal-wrapper" ref="componentModalWrapper">\n  <div ref="openModalWrapper"></div>\n\n  <div class="formio-dialog formio-dialog-theme-default component-rendering-hidden" ref="modalWrapper">\n    <div class="formio-dialog-overlay" ref="modalOverlay"></div>\n    <div class="formio-dialog-content" ref="modalContents">\n      <div ref="modalContents">\n        {% if (ctx.visible) { %}\n        {{ctx.children}}\n        {% } %}\n        <div class="formio-dialog-buttons">\n          <button class="btn btn-success formio-dialog-button" ref="modalSave">Save</button>\n        </div>\n      </div>\n      <button class="formio-dialog-close float-right btn btn-secondary btn-sm" aria-label="close" ref="modalClose"></button>\n    </div>\n  </div>\n</div>\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/componentModal/form.ejs.js.map
