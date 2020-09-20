/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../component/Component","../nesteddata/NestedDataComponent"],function(t,e,o){"use strict";return class extends o{componentContext(t){return this.iteratableRows[t.rowIndex].data}get iteratableRows(){throw new Error("Getter #iteratableRows() is not implemented")}get rowIndex(){return super.rowIndex}set rowIndex(t){this._rowIndex=t}checkData(t,o,n){return t=t||this.rootValue,o=o||{},n=n||this.data,this.checkRows("checkData",t,o,e.prototype.checkData.call(this,t,o,n))}checkRows(t,e,o,n){return this.iteratableRows.reduce((n,s)=>this.checkRow(t,e,o,s.data,s.components)&&n,n)}checkRow(e,o,n,s,a){return t.reduce(a,(t,a)=>a[e](o,n,s)&&t,!0)}hasAddButton(){const e=t.get(this.component,"validate.maxLength"),o=t.get(this.component,"conditionalAddButton");return!this.component.disableAddingRemovingRows&&!this.options.readOnly&&!this.disabled&&this.fullMode&&!this.options.preview&&(!e||this.iteratableRows.length<e)&&(!o||this.evaluate(o,{value:this.dataValue},"show"))}}});
//# sourceMappingURL=../../../sourcemaps/components/_classes/nestedarray/NestedArrayComponent.js.map
