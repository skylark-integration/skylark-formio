/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../Element","../vendors/getify/npo"],function(t,e,i){"use strict";return class extends e{static get defaultSettings(){return{type:"input"}}constructor(e,i){super(e),this.namespace="formio.widget",this.component=i||{},this.settings=t.merge({},this.defaultSettings,e||{})}attach(t){return this._input=t,i.resolve()}get defaultSettings(){return{}}set disabled(t){t?this._input.setAttribute("disabled","disabled"):this._input.removeAttribute("disabled")}get input(){return this._input}getValue(){return this._input.value}getValueAsString(t){return t}validationValue(t){return t}addPrefix(){return null}addSuffix(){return null}setValue(t){this._input.value=t}}});
//# sourceMappingURL=../sourcemaps/widgets/InputWidget.js.map
