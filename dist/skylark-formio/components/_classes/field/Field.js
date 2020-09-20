/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../component/Component"],function(e){"use strict";return class extends e{render(e){return this.noField?super.render(e):this.isAdvancedLabel?super.render(this.renderTemplate("field",{...this.getLabelInfo(),labelMarkup:this.renderTemplate("label"),element:e},"align")):super.render(this.renderTemplate("field",{labelMarkup:this.renderTemplate("label"),element:e}))}}});
//# sourceMappingURL=../../../sourcemaps/components/_classes/field/Field.js.map
