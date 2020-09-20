/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){function t(t,n,o,i){this.startPoint=t,this.control1=n,this.control2=o,this.endPoint=i}return t.prototype.length=function(){let t,n,o=0;for(let i=0;i<=10;i+=1){const s=i/10,r=this._point(s,this.startPoint.x,this.control1.x,this.control2.x,this.endPoint.x),h=this._point(s,this.startPoint.y,this.control1.y,this.control2.y,this.endPoint.y);if(i>0){const i=r-t,s=h-n;o+=Math.sqrt(i*i+s*s)}t=r,n=h}return o},t.prototype._point=function(t,n,o,i,s){return n*(1-t)*(1-t)*(1-t)+3*o*(1-t)*(1-t)*t+3*i*(1-t)*t*t+s*t*t*t},t});
//# sourceMappingURL=../../sourcemaps/vendors/signature_pad/Bezier.js.map
