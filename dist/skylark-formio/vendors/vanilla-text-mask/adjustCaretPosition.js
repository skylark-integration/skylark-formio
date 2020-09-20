/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){const e=[],t="";return function({previousConformedValue:l=t,previousPlaceholder:n=t,currentCaretPosition:r=0,conformedValue:i,rawValue:f,placeholderChar:o,placeholder:s,indexesOfPipedChars:h=e,caretTrapIndexes:g=e}){if(0===r||!f.length)return 0;const d=f.length,u=l.length,a=s.length,c=i.length,p=d-u,x=p>0;if(p>1&&!x&&0!==u)return r;let O,C,v=0;if(!x||l!==i&&i!==s){const e=i.toLowerCase(),l=f.toLowerCase().substr(0,r).split(t).filter(t=>-1!==e.indexOf(t));C=l[l.length-1];const g=n.substr(0,l.length).split(t).filter(e=>e!==o).length,d=s.substr(0,l.length).split(t).filter(e=>e!==o).length!==g,u=void 0!==n[l.length-1]&&void 0!==s[l.length-2]&&n[l.length-1]!==o&&n[l.length-1]!==s[l.length-1]&&n[l.length-1]===s[l.length-2];!x&&(d||u)&&g>0&&s.indexOf(C)>-1&&void 0!==f[r]&&(O=!0,C=f[r]);const a=h.map(t=>e[t]).filter(e=>e===C).length,p=l.filter(e=>e===C).length,b=s.substr(0,s.indexOf(o)).split(t).filter((e,t)=>e===C&&f[t]!==e).length+p+a+(O?1:0);let m=0;for(let t=0;t<c&&(v=t+1,e[t]===C&&m++,!(m>=b));t++);}else v=r-p;if(x){let e=v;for(let t=v;t<=a;t++)if(s[t]===o&&(e=t),s[t]===o||-1!==g.indexOf(t)||t===a)return e}else if(O){for(let e=v-1;e>=0;e--)if(i[e]===C||-1!==g.indexOf(e)||0===e)return e}else for(let e=v;e>=0;e--)if(s[e-1]===o||-1!==g.indexOf(e)||0===e)return e}});
//# sourceMappingURL=../../sourcemaps/vendors/vanilla-text-mask/adjustCaretPosition.js.map
