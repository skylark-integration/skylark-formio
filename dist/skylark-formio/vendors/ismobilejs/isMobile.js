/**
 * skylark-formio - A version of formio.js that ported to running on skylarkjs.
 * @author Hudaokeji, Inc.
 * @version v0.9.0
 * @link https://github.com/skylark-integration/skylark-formio/
 * @license MIT
 */
define([],function(){var e=/iPhone/i,i=/iPod/i,o=/iPad/i,n=/\biOS-universal(?:.+)Mac\b/i,t=/\bAndroid(?:.+)Mobile\b/i,r=/Android/i,a=/(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i,d=/Silk/i,l=/Windows Phone/i,p=/\bWindows(?:.+)ARM\b/i,b=/BlackBerry/i,u=/BB10/i,c=/Opera Mini/i,s=/\b(CriOS|Chrome)(?:.+)Mobile/i,h=/Mobile(?:.+)Firefox\b/i,v=function(e){return void 0!==e&&"MacIntel"===e.platform&&"number"==typeof e.maxTouchPoints&&e.maxTouchPoints>1&&"undefined"==typeof MSStream};return function(f){var m={userAgent:"",platform:"",maxTouchPoints:0};f||"undefined"==typeof navigator?"string"==typeof f?m.userAgent=f:f.userAgent&&(m={userAgent:f.userAgent,platform:f.platform,maxTouchPoints:f.maxTouchPoints||0}):m={userAgent:navigator.userAgent,platform:navigator.platform,maxTouchPoints:navigator.maxTouchPoints||0};var g=m.userAgent,A=g.split("[FBAN");void 0!==A[1]&&(g=A[0]),void 0!==(A=g.split("Twitter"))[1]&&(g=A[0]);var w=function(e){return function(i){return i.test(e)}}(g),P={apple:{phone:w(e)&&!w(l),ipod:w(i),tablet:!w(e)&&(w(o)||v(m))&&!w(l),universal:w(n),device:(w(e)||w(i)||w(o)||w(n)||v(m))&&!w(l)},amazon:{phone:w(a),tablet:!w(a)&&w(d),device:w(a)||w(d)},android:{phone:!w(l)&&w(a)||!w(l)&&w(t),tablet:!w(l)&&!w(a)&&!w(t)&&(w(d)||w(r)),device:!w(l)&&(w(a)||w(d)||w(t)||w(r))||w(/\bokhttp\b/i)},windows:{phone:w(l),tablet:w(p),device:w(l)||w(p)},other:{blackberry:w(b),blackberry10:w(u),opera:w(c),firefox:w(h),chrome:w(s),device:w(b)||w(u)||w(c)||w(h)||w(s)},any:!1,phone:!1,tablet:!1};return P.any=P.apple.device||P.android.device||P.windows.device||P.other.device,P.phone=P.apple.phone||P.android.phone||P.windows.phone,P.tablet=P.apple.tablet||P.android.tablet||P.windows.tablet,P}});
//# sourceMappingURL=../../sourcemaps/vendors/ismobilejs/isMobile.js.map
