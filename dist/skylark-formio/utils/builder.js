/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-lodash","./utils"],function(t,e){"use strict";return{uniquify(t,o){let n=!1;const r={};return e.eachComponent(t,function(t){r[t.key]=!0},!0),e.eachComponent([o],t=>{if(!t.key)return;const o=e.uniqueKey(r,t.key);o!==t.key&&(t.key=o,r[o]=!0,n=!0)},!0),n},additionalShortcuts:{button:["Enter","Esc"]},getAlphaShortcuts:()=>t.range("A".charCodeAt(),"Z".charCodeAt()+1).map(t=>String.fromCharCode(t)),getAdditionalShortcuts(t){return this.additionalShortcuts[t]||[]},getBindedShortcuts(t,o){const n=[];return e.eachComponent(t,t=>{t!==o&&(t.shortcut&&n.push(t.shortcut),t.values&&t.values.forEach(t=>{t.shortcut&&n.push(t.shortcut)}))},!0),n},getAvailableShortcuts(e,o){return o?[""].concat(t.difference(this.getAlphaShortcuts().concat(this.getAdditionalShortcuts(o.type)),this.getBindedShortcuts(e.components,o))).map(t=>({label:t,value:t})):[]}}});
//# sourceMappingURL=../sourcemaps/utils/builder.js.map
