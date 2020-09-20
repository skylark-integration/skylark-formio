/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define(["./utilities","./constants","./adjustCaretPosition","./conformToMask"],function(e,r,o,t){const{convertMaskToPlaceholder:n,isArray:i,processCaretTraps:a}=e,{strFunction:s}=r,u=r.placeholderChar,l="",d="none",p="object",c="undefined"!=typeof navigator&&/Android/i.test(navigator.userAgent),f="undefined"!=typeof requestAnimationFrame?requestAnimationFrame:setTimeout;return function(e){const r={previousConformedValue:void 0,previousPlaceholder:void 0};return{state:r,update(i,{inputElement:v,mask:h,guide:m,pipe:C,placeholderChar:P=u,keepCharPositions:g=!1,showMask:V=!1}=e){if(void 0===i&&(i=v.value),i===r.previousConformedValue)return;let k,T;if(typeof h===p&&void 0!==h.pipe&&void 0!==h.mask&&(C=h.pipe,h=h.mask),h instanceof Array&&(k=n(h,P)),!1===h)return;const y=function(e){if(isString(e))return e;if(isNumber(e))return String(e);if(void 0===e||null===e)return l;throw new Error("The 'value' provided to Text Mask needs to be a string or a number. The value "+`received was:\n\n ${JSON.stringify(e)}`)}(i),{selectionEnd:w}=v,{previousConformedValue:A,previousPlaceholder:S}=r;let x;if(typeof h===s){if(!1===(T=h(y,{currentCaretPosition:w,previousConformedValue:A,placeholderChar:P})))return;const{maskWithoutCaretTraps:e,indexes:r}=a(T);x=r,k=n(T=e,P)}else T=h;const b={previousConformedValue:A,guide:m,placeholderChar:P,pipe:C,placeholder:k,currentCaretPosition:w,keepCharPositions:g},{conformedValue:E}=t(y,T,b),M=typeof C===s;let j={};M&&(!1===(j=C(E,{rawValue:y,...b}))?j={value:A,rejected:!0}:isString(j)&&(j={value:j}));const F=M?j.value:E,O=o({previousConformedValue:A,previousPlaceholder:S,conformedValue:F,placeholder:k,rawValue:y,currentCaretPosition:w,placeholderChar:P,indexesOfPipedChars:j.indexesOfPipedChars,caretTrapIndexes:x}),q=F===k&&0===O?V?k:l:F;var N,R;r.previousConformedValue=q,r.previousPlaceholder=k,v.value!==q&&(v.value=q,N=v,R=O,document.activeElement===N&&(c?f(()=>N.setSelectionRange(R,R,d),0):N.setSelectionRange(R,R,d)))}}}});
//# sourceMappingURL=../../sourcemaps/vendors/vanilla-text-mask/createTextMaskInputElement.js.map