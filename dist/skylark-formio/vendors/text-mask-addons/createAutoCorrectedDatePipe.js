/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){const n=[31,31,29,31,30,31,30,31,31,30,31,30,31],t=["yyyy","yy","mm","dd","HH","MM","SS"];return function(e="mm dd yyyy",{minYear:r=1,maxYear:s=9999}={}){const y=e.split(/[^dmyHMS]+/).sort((n,e)=>t.indexOf(n)-t.indexOf(e));return function(t){const i=[],d={dd:31,mm:12,yy:99,yyyy:s,HH:23,MM:59,SS:59},o={dd:1,mm:1,yy:0,yyyy:r,HH:0,MM:0,SS:0},m=t.split("");y.forEach(n=>{const t=e.indexOf(n),r=parseInt(d[n].toString().substr(0,1),10);parseInt(m[t],10)>r&&(m[t+1]=m[t],m[t]=0,i.push(t))});let u=0;return!y.some(y=>{const i=e.indexOf(y),m=y.length,a=t.substr(i,m).replace(/\D/g,""),c=parseInt(a,10);"mm"===y&&(u=c||0);const f="dd"===y?n[u]:d[y];if("yyyy"===y&&(1!==r||9999!==s)){const n=parseInt(d[y].toString().substring(0,a.length),10);return c<parseInt(o[y].toString().substring(0,a.length),10)||c>n}return c>f||a.length===m&&c<o[y]})&&{value:m.join(""),indexesOfPipedChars:i}}}});
//# sourceMappingURL=../../sourcemaps/vendors/text-mask-addons/createAutoCorrectedDatePipe.js.map
