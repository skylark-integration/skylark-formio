/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./_classes/component/Component","skylark-lodash"],function(t,n){"use strict";class e{static get components(){return e._components||(e._components={}),e._components}static setComponents(t){t.base&&(t.base.tableView=function(t,n){return e.create(n.component,n.options||{},n.data||{},!0).getView(t)}),n.assign(e.components,t)}static addComponent(t,n){return e.setComponent(t,n)}static setComponent(t,n){e.components[t]=n}static create(n,o,s){let c=null;return c=n.type&&e.components.hasOwnProperty(n.type)?new e.components[n.type](n,o,s):Array.isArray(n.components)?new e.NestedComponent(n,o,s):new t(n,o,s)}}return e});
//# sourceMappingURL=../sourcemaps/components/Components.js.map
