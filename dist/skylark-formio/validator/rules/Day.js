/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
const Rule=require("./Rule");module.exports=class extends Rule{check(e){if(!e)return!0;if("string"!=typeof e)return!1;const[s,t,a]=this.component.dayFirst?[0,1,2]:[1,0,2],r=e.split("/").map(e=>parseInt(e,10)),c=r[s],n=r[t],u=r[a],i=function(e,s){switch(e){case 1:case 3:case 5:case 7:case 8:case 10:case 12:return 31;case 4:case 6:case 9:case 11:return 30;case 2:return function(e){return!(e%400&&(!(e%100)||e%4))}(s)?29:28;default:return 31}}(n,u);return!(isNaN(c)||c<0||c>i)&&(!(isNaN(n)||n<0||n>12)&&!(isNaN(u)||u<0||u>9999))}},Day.prototype.defaultMessage="{{field}} is not a valid day.";
//# sourceMappingURL=../../sourcemaps/validator/rules/Day.js.map
