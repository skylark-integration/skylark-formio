/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["skylark-moment","skylark-lodash"],function(e,t){"use strict";const n={INVALID:"You entered the Invalid Date",INCOMPLETE:"You entered an incomplete date.",greater:(e,t)=>`The entered date is greater than ${e.format(t)}`,less:(e,t)=>`The entered date is less than ${e.format(t)}`};function r(e,t){return{message:e,result:t}}function s(t,r,s,i){let a="",l=!0;if(s&&t.isValid()){const i=e(s,r);t>i&&(a=n.greater(i,r),l=!1)}if(i&&t.isValid()){const s=e(i,r);t<s&&(a=n.less(s,r),l=!1)}return{message:a,result:l}}return{CALENDAR_ERROR_MESSAGES:n,lessOrGreater:s,checkInvalidDate:function(i,a,l,u){const o=e(i,a,!0),c=o.isValid();if(!c){const o=i.match(/[^a-z0-9_]/gi),c=new RegExp(o.join("|"),"gi"),d=i.replace(/_*/gi,"").split(c),f=a[1]?a[1].split(c):a[0].split(c),g=t.findIndex(f,(e,t)=>1===e.length&&t===f.length-1);if(d[t.findIndex(f,e=>e.match(/yyyy/gi))]/1e3<1)return r(n.INVALID,!1);if(d[0].length===f[0].length){const t=d.map((e,t)=>{let n=e;return e||t!==g?e||(n="01"):n="AM",o[t]&&(n=`${n}${o[t]}`),n}),i=e(t.join(""),a,!0);if(i.isValid()){const e=s(i,a[0],u,l);if(!e.result){const{message:t,result:n}=e;return r(t,n)}return r(n.INCOMPLETE,!1)}return r(n.INVALID,!1)}return r(n.INVALID,!1)}if(c&&-1===i.indexOf("_")){const e=s(o,a[0],u,l);if(!e.result){const{message:t,result:n}=e;return r(t,n)}}return r("",!0)}}});
//# sourceMappingURL=../sourcemaps/utils/calendarUtils.js.map
