(function(){
var C=window.SSS_CONFIG||{};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
// videos
document.querySelectorAll('[data-videos]').forEach(function(box){
  var list=(C.videos||{})[box.getAttribute('data-videos')]||[];
  if(!list.length)return;
  box.innerHTML=list.map(function(f){return '<video controls playsinline preload="metadata" src="videos/'+esc(f)+'"></video>';}).join('');
  box.hidden=false;
});
// reviews
if(!C.reviewFormUrl||!C.reviewCsvUrl)return;
document.querySelectorAll('[data-reviews]').forEach(function(b){b.hidden=false;});
document.querySelectorAll('.review-link').forEach(function(a){a.href=C.reviewFormUrl;});
function parseCSV(t){var r=[],row=[],f='',q=false;for(var i=0;i<t.length;i++){var c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++;}else q=false;}else f+=c;}else if(c=='"')q=true;else if(c==','){row.push(f);f='';}else if(c=='\n'){row.push(f);r.push(row);row=[];f='';}else if(c!='\r')f+=c;}if(f||row.length){row.push(f);r.push(row);}return r;}
fetch(C.reviewCsvUrl,{cache:'no-store'}).then(function(r){return r.text();}).then(function(t){
  var rows=parseCSV(t),h=rows.shift().map(function(x){return x.trim().toLowerCase();});
  function col(k){for(var i=0;i<h.length;i++)if(h[i].indexOf(k)>-1)return i;return -1;}
  var G=col('game'),S=col('star'),N=col('name'),M=col('comment'),A=col('approved');
  var by={};
  rows.forEach(function(r){
    if(A<0||String(r[A]).trim().toUpperCase()!=='Y')return;
    var g=/critter/i.test(r[G])?'critter':(/sudoku/i.test(r[G])?'sudoku':null);if(!g)return;
    var s=Math.max(1,Math.min(5,parseInt(r[S],10)||0));
    (by[g]=by[g]||[]).push({s:s,n:(r[N]||'Player').slice(0,40),m:(r[M]||'').slice(0,600)});
  });
  document.querySelectorAll('[data-reviews]').forEach(function(b){
    var L=by[b.getAttribute('data-reviews')]||[],out=b.querySelector('.review-list');
    if(!L.length){out.innerHTML='<p class="muted">No reviews yet. Be the first!</p>';return;}
    var avg=L.reduce(function(a,x){return a+x.s;},0)/L.length;
    out.innerHTML='<p class="avg">'+'★'.repeat(Math.round(avg))+'☆'.repeat(5-Math.round(avg))+' '+avg.toFixed(1)+' ('+L.length+')</p>'+
      L.slice().reverse().map(function(x){return '<div class="review"><span class="stars">'+'★'.repeat(x.s)+'☆'.repeat(5-x.s)+'</span> <strong>'+esc(x.n)+'</strong><p>'+esc(x.m)+'</p></div>';}).join('');
  });
}).catch(function(){});
})();
