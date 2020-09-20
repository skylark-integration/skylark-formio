/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./utilities","./constants"],function(e,t){const{convertMaskToPlaceholder:r,isArray:o,processCaretTraps:s}=e,{strFunction:n}=t,l=t.placeholderChar,i=[],a="";return function(e=a,t=i,c={}){if(!o(t)){if(typeof t!==n)throw new Error("Text-mask:conformToMask; The mask property must be an array.");t=t(e,c),t=s(t).maskWithoutCaretTraps}const{guide:h=!0,previousConformedValue:f=a,placeholderChar:u=l,placeholder:p=r(t,u),currentCaretPosition:d,keepCharPositions:m}=c,g=!1===h&&void 0!==f,k=e.length,C=f.length,b=p.length,T=t.length,w=k-C,y=w>0,v=d+(y?-w:0),M=v+Math.abs(w);if(!0===m&&!y){let t=a;for(let e=v;e<M;e++)p[e]===u&&(t+=u);e=e.slice(0,v)+t+e.slice(v,k)}const N=e.split(a).map((e,t)=>({char:e,isNew:t>=v&&t<M}));for(let e=k-1;e>=0;e--){const{char:t}=N[e];t!==u&&t===p[e>=v&&C===T?e-w:e]&&N.splice(e,1)}let P=a,V=!1;e:for(let e=0;e<b;e++){const r=p[e];if(r===u){if(N.length>0)for(;N.length>0;){const{char:r,isNew:o}=N.shift();if(r===u&&!0!==g){P+=u;continue e}if(t[e].test(r)){if(!0===m&&!1!==o&&f!==a&&!1!==h&&y){const t=N.length;let o=null;for(let e=0;e<t;e++){const t=N[e];if(t.char!==u&&!1===t.isNew)break;if(t.char===u){o=e;break}}null!==o?(P+=r,N.splice(o,1)):e--}else P+=r;continue e}V=!0}!1===g&&(P+=p.substr(e,b));break}P+=r}if(g&&!1===y){let e=null;for(let t=0;t<P.length;t++)p[t]===u&&(e=t);P=null!==e?P.substr(0,e+1):a}return{conformedValue:P,meta:{someCharsRejected:V}}}});
//# sourceMappingURL=../../sourcemaps/vendors/vanilla-text-mask/conformToMask.js.map
