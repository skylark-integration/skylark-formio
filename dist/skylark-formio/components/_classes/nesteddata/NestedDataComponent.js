/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["../component/Component","../nested/NestedComponent","skylark-lodash"],function(e,t,a){"use strict";return class extends t{hasChanged(e,t){return void 0!==e&&null!==e&&!this.hasValue()||!a.isEqual(e,t)}get allowData(){return!0}getValueAsString(){return"[Complex Data]"}getValue(){return this.dataValue}updateValue(t,a={}){return e.prototype.updateValue.call(this,t,a)}}});
//# sourceMappingURL=../../../sourcemaps/components/_classes/nesteddata/NestedDataComponent.js.map
