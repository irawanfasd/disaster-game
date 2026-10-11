/* trigger-btn.js — Tombol trigger gempa (untuk demo) */
(function() {
  const btn = document.createElement('button');
  btn.id = 'quake-trigger';
  btn.innerHTML = '🚨 MULAI GEMPA';
  btn.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #c00, #800);
    color: #fff;
    border: 3px solid #fff;
    border-radius: 12px;
    font: bold 14px monospace;
    cursor: pointer;
    z-index: 200;
    box-shadow: 0 4px 20px rgba(255, 0, 0, 0.6);
    transition: all 0.2s;
  `;
  
  btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
  btn.onmouseleave = () => btn.style.transform = 'scale(1)';
  
  btn.onclick = () => {
    if (typeof Net !== 'undefined' && Net.socket) {
      Net.socket.emit('quake:trigger');
      btn.disabled = true;
      btn.innerHTML = '⏳ GEMPA AKTIF...';
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = '🚨 MULAI GEMPA';
      }, 16000);
    }
  };
  
  document.body.appendChild(btn);
  console.log('[QUAKE] Trigger button ready');
})();
