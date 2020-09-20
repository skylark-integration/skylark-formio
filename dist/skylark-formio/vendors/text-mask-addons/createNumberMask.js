/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){const e="$",t="",n=",",c=".",l="-",i=/-/,s=/\D+/g,a="number",o=/\d/,r="[]";function u(e){return e.split(t).map(e=>o.test(e)?o:e)}return function({prefix:p=e,suffix:f=t,includeThousandsSeparator:g=!0,thousandsSeparatorSymbol:h=n,allowDecimal:m=!1,decimalSymbol:d=c,decimalLimit:b=2,requireDecimal:S=!1,allowNegative:w=!1,allowLeadingZeroes:x=!1,integerLimit:y=null}={}){const $=p&&p.length||0,D=f&&f.length||0,L=h&&h.length||0;function N(e=t){const n=e.length;if(e===t||e[0]===p[0]&&1===n)return p.split(t).concat([o]).concat(f.split(t));if(e===d&&m)return p.split(t).concat(["0",d,o]).concat(f.split(t));const c=e[0]===l&&w;c&&(e=e.toString().substr(1));const N=e.lastIndexOf(d),O=-1!==N;let k,q,v;if(e.slice(-1*D)===f&&(e=e.slice(0,-1*D)),O&&(m||S)?(k=e.slice(e.slice(0,$)===p?$:0,N),q=u((q=e.slice(N+1,n)).replace(s,t))):k=e.slice(0,$)===p?e.slice($):e,y&&typeof y===a){const e="."===h?"[.]":`${h}`,t=(k.match(new RegExp(e,"g"))||[]).length;k=k.slice(0,y+t*L)}return k=k.replace(s,t),x||(k=k.replace(/^0+(0$|[^0])/,"$1")),v=u(k=g?function(e,t){return e.replace(/\B(?=(\d{3})+(?!\d))/g,t)}(k,h):k),(O&&m||!0===S)&&(e[N-1]!==d&&v.push(r),v.push(d,r),q&&(typeof b===a&&(q=q.slice(0,b)),v=v.concat(q)),!0===S&&e[N-1]===d&&v.push(o)),$>0&&(v=p.split(t).concat(v)),c&&(v.length===$&&v.push(o),v=[i].concat(v)),f.length>0&&(v=v.concat(f.split(t))),v}return N.instanceOf="createNumberMask",N}});
//# sourceMappingURL=../../sourcemaps/vendors/text-mask-addons/createNumberMask.js.map
