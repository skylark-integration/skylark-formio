/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","../_classes/component/Component","../_classes/nesteddata/NestedDataComponent"],function(e,t,a){"use strict";return class n extends a{static schema(...e){return a.schema({label:"Container",type:"container",key:"container",clearOnHide:!0,input:!0,tree:!0,hideLabel:!0,components:[]},...e)}static get builderInfo(){return{title:"Container",icon:"folder-open",group:"data",documentation:"http://help.form.io/userguide/#container",weight:10,schema:n.schema()}}constructor(...e){super(...e),this.type="container"}addComponents(e,t){return super.addComponents(this.dataValue,t)}get defaultSchema(){return n.schema()}get emptyValue(){return{}}get templateName(){return"container"}componentContext(){return this.dataValue}setValue(t,a={}){let n=!1;const s=this.hasValue();return s&&e.isEmpty(this.dataValue)&&(a.noValidate=!0),t&&e.isObject(t)&&s||(n=!0,this.dataValue=this.defaultValue),n=super.setValue(t,a)||n,this.updateOnChange(a,n),n}checkData(e,a,n,s){return e=e||this.rootValue,a=a||{},n=n||this.data,(s=s||this.getComponents()).reduce((t,n)=>n.checkData(e,a,this.dataValue)&&t,t.prototype.checkData.call(this,e,a,n))}}});
//# sourceMappingURL=../../sourcemaps/components/container/Container.js.map
