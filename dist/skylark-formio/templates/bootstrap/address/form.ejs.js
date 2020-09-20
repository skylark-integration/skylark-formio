/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){return'{% if (ctx.mode.autocomplete) { %}\n  <div class="address-autocomplete-container">\n    <input\n      ref="{{ ctx.ref.searchInput }}"\n      {% for (var attr in ctx.inputAttributes) { %}\n        {{attr}}="{{ctx.inputAttributes[attr]}}"\n      {% } %}\n      value="{{ ctx.displayValue }}"\n      autocomplete="off"\n    >\n    {% if (!ctx.component.disableClearIcon) { %}\n      <i\n        class="address-autocomplete-remove-value-icon fa fa-times"\n        tabindex="{{ ctx.inputAttributes.tabindex }}"\n        ref="{{ ctx.ref.removeValueIcon }}"\n      ></i>\n    {% } %}\n  </div>\n{% } %}\n{% if (ctx.self.manualModeEnabled) { %}\n  <div class="form-check checkbox">\n    <label class="form-check-label">\n      <input\n        ref="{{ ctx.ref.modeSwitcher }}"\n        type="checkbox"\n        class="form-check-input"\n        tabindex="{{ ctx.inputAttributes.tabindex }}"\n        {% if (ctx.mode.manual) { %}checked=true{% } %}\n        {% if (ctx.disabled) { %}disabled=true{% } %}\n      >\n      <span>{{ ctx.component.switchToManualModeLabel }}</span>\n    </label>\n  </div>\n{% } %}\n{% if (ctx.self.manualMode) { %}\n  <div ref="{{ ctx.nestedKey }}">\n    {{ ctx.children }}\n  </div>\n{% } %}\n'});
//# sourceMappingURL=../../../sourcemaps/templates/bootstrap/address/form.ejs.js.map
