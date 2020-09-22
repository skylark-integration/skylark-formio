/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./Rule"],function(e){"use strict";class s extends e{check(e){if(!e)return!0;if("string"!=typeof e)return!1;const[s,t,a]=this.component.dayFirst?[0,1,2]:[1,0,2],n=e.split("/").map(e=>parseInt(e,10)),r=n[s],c=n[t],i=n[a],u=function(e,s){switch(e){case 1:case 3:case 5:case 7:case 8:case 10:case 12:return 31;case 4:case 6:case 9:case 11:return 30;case 2:return function(e){return!(e%400&&(!(e%100)||e%4))}(s)?29:28;default:return 31}}(c,i);return!(isNaN(r)||r<0||r>u)&&(!(isNaN(c)||c<0||c>12)&&!(isNaN(i)||i<0||i>9999))}}return s.prototype.defaultMessage="{{field}} is not a valid day.",s});
//# sourceMappingURL=../../sourcemaps/validator/rules/Day.js.map
