/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./vendors/eventemitter2/EventEmitter2","./utils/utils"],function(e,t){"use strict";return class extends e{constructor(e={}){const{loadLimit:i=50,eventsSafeInterval:s=300,pause:n=500,...o}=e;super(o);const[r,c]=t.withSwitch(!1,!0),l=t.observeOverload(()=>{console.warn("Infinite loop detected",this.id,n),c(),setTimeout(c,n)},{limit:i,delay:s});this.emit=((...e)=>{r()||(super.emit(...e),l())})}}});
//# sourceMappingURL=sourcemaps/EventEmitter.js.map
