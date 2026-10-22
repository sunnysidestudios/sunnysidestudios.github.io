"use strict";
window.__canPay=false;
document.addEventListener("gesturestart",function(e){e.preventDefault()},{passive:false});
document.addEventListener("gesturechange",function(e){e.preventDefault()},{passive:false});
document.addEventListener("dblclick",function(e){e.preventDefault()},{passive:false});
(function(){function unlock(){try{if(typeof audioInit==="function")audioInit();if(typeof AC!=="undefined"&&AC&&AC.state==="suspended")AC.resume()}catch(e){}}
["touchend","click","keydown"].forEach(function(t){addEventListener(t,unlock,{passive:true,capture:true})});})();
