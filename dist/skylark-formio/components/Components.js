/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./_classes/component/Component","./_classes/nested/NestedComponent","skylark-lodash"],function(e,t,n){"use strict";return class o{static get components(){return o._components||(o._components={}),o._components}static setComponents(e){e.base&&(e.base.tableView=function(e,t){return o.create(t.component,t.options||{},t.data||{},!0).getView(e)}),n.assign(o.components,e)}static addComponent(e,t){return o.setComponent(e,t)}static setComponent(e,t){o.components[e]=t}static create(n,s,c){let a=null;return a=n.type&&o.components.hasOwnProperty(n.type)?new o.components[n.type](n,s,c):Array.isArray(n.components)?new t(n,s,c):new e(n,s,c)}}});
//# sourceMappingURL=../sourcemaps/components/Components.js.map
