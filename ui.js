/* ui.js — helper minimal */
(function(){
  'use strict';
  
  window.dzLoading = function(btn, text){
    if(!btn) return;
    if(!btn.__orig) btn.__orig = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<span class="spinner"></span>' + (text || 'Memuat...');
  };
  
  window.dzLoaded = function(btn){
    if(!btn) return;
    btn.disabled = false;
    btn.classList.remove('loading');
    if(btn.__orig) btn.innerHTML = btn.__orig;
  };
  
  window.dzToast = function(msg, type){
    console.log('[TOAST]', type || 'info', msg);
  };
  
  window.dzShake = function(el){
    if(!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(function(){ el.classList.remove('shake'); }, 500);
  };
  
  console.log('[UI] Loaded');
})();
