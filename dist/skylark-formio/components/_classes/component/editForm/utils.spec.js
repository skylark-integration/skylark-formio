/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["chai","skylark-lodash","./utils"],function(e,o,t){"use strict";describe("Edit Form Utils",function(){describe("unifyComponents",()=>{it("should merge all objects with the same key",()=>{e.expect(o.unionWith([{key:"a",label:1,input:!0},{key:"a",one:1,two:2},{key:"b",one:1,two:2}],t.unifyComponents)).to.deep.equal([{key:"a",label:1,input:!0,one:1,two:2},{key:"b",one:1,two:2}])}),it('should not merge objects with "skipMerge" flag',()=>{e.expect(o.unionWith([{key:"a",label:1},{key:"a",label:2,skipMerge:!0},{key:"b",one:1,two:2},{key:"b",one:1},{key:"b",one:1,ok:!0}],t.unifyComponents)).to.deep.equal([{key:"a",label:1},{key:"a",label:2,skipMerge:!0},{key:"b",one:1,two:2,ok:!0}])})})})});
//# sourceMappingURL=../../../../sourcemaps/components/_classes/component/editForm/utils.spec.js.map
