// Simple EN/ES toggle: elements carry data-es="..." (Spanish HTML). English stays in the markup.
(function(){
  var KEY='sss-lang';
  function apply(lang){
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-es]').forEach(function(el){
      if(el.dataset.en===undefined) el.dataset.en=el.innerHTML;
      el.innerHTML = lang==='es' ? el.dataset.es : el.dataset.en;
    });
    document.querySelectorAll('[data-es-alt]').forEach(function(el){
      if(el.dataset.enAlt===undefined) el.dataset.enAlt=el.alt;
      el.alt = lang==='es' ? el.dataset.esAlt : el.dataset.enAlt;
    });
    var b=document.getElementById('lang-toggle');
    if(b){b.textContent = lang==='es' ? 'English' : 'Español'; b.setAttribute('aria-label', lang==='es'?'Switch to English':'Cambiar a español');}
    try{localStorage.setItem(KEY,lang);}catch(e){}
  }
  var q=new URLSearchParams(location.search).get('lang');
  var saved=null; try{saved=localStorage.getItem(KEY);}catch(e){}
  var start=(q==='es'||q==='en')?q:(saved||((navigator.language||'').toLowerCase().indexOf('es')===0?'es':'en'));
  document.addEventListener('DOMContentLoaded',function(){
    apply(start);
    var b=document.getElementById('lang-toggle');
    if(b) b.addEventListener('click',function(){apply(document.documentElement.lang==='es'?'en':'es');});
  });
})();
