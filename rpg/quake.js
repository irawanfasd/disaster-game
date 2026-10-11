/* quake.js — Simulasi gempa client */
const Quake = {
  active: false,
  startTime: 0,
  phase: 'idle', // idle, drop, cover, hold, end
  phaseStart: 0,
  score: 0,
  shakeIntensity: 0,
  particles: [],
  
  init() {
    // Bind socket events
    const iv = setInterval(() => {
      if (typeof Net !== 'undefined' && Net.socket) {
        this.bind(Net.socket);
        clearInterval(iv);
      }
    }, 200);
    
    // Bind keyboard SPACE untuk aksi
    addEventListener('keydown', e => this.onKey(e), true);
    
    // Buat UI overlay
    this.createUI();
  },
  
  createUI() {
    // Overlay warning
    const overlay = document.createElement('div');
    overlay.id = 'quake-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 150;
      display: none;
    `;
    overlay.innerHTML = `
      <div id="quake-flash" style="position:absolute;inset:0;background:rgba(255,0,0,0);transition:background 0.1s"></div>
      <div id="quake-warning" style="
        position:absolute;top:20%;left:50%;transform:translateX(-50%);
        background:rgba(200,0,0,0.95);color:#fff;
        padding:16px 32px;border-radius:12px;
        font:bold 24px monospace;text-align:center;
        border:4px solid #fff;
        box-shadow:0 0 40px rgba(255,0,0,0.8);
        display:none;
        animation:pulse 0.5s infinite alternate;
      ">⚠️ GEMPA! ⚠️</div>
      <div id="quake-action" style="
        position:absolute;bottom:180px;left:50%;transform:translateX(-50%);
        background:rgba(0,0,0,0.9);color:#fff;
        padding:20px 40px;border-radius:12px;
        font:bold 20px monospace;text-align:center;
        border:4px solid #ffd700;
        display:none;
      "></div>
      <div id="quake-timer" style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
        font:bold 120px monospace;color:#fff;
        text-shadow:0 0 20px #000, 0 0 40px #f00;
        display:none;
      "></div>
    `;
    document.body.appendChild(overlay);
    this.overlay = overlay;
    
    // Tambah CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        from { transform: translateX(-50%) scale(1); }
        to { transform: translateX(-50%) scale(1.05); }
      }
      @keyframes shake {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-3px, 1px); }
        20% { transform: translate(2px, -2px); }
        30% { transform: translate(-1px, 3px); }
        40% { transform: translate(3px, 1px); }
        50% { transform: translate(-2px, -3px); }
        60% { transform: translate(1px, 2px); }
        70% { transform: translate(-3px, -1px); }
        80% { transform: translate(2px, 3px); }
        90% { transform: translate(-1px, -2px); }
      }
      .quake-shake {
        animation: shake 0.3s infinite !important;
      }
    `;
    document.head.appendChild(style);
  },
  
  bind(socket) {
    socket.on('quake:start', d => this.start(d));
    socket.on('quake:end', d => this.end(d));
    socket.on('quake:result', d => this.showResult(d));
  },
  
  start(data) {
    console.log('[QUAKE] Started!');
    this.active = true;
    this.startTime = Date.now();
    this.phase = 'drop';
    this.phaseStart = Date.now();
    this.score = 0;
    
    // Show overlay
    this.overlay.style.display = 'block';
    document.getElementById('quake-warning').style.display = 'block';
    
    // Flash effect
    const flash = document.getElementById('quake-flash');
    flash.style.background = 'rgba(255,0,0,0.3)';
    setTimeout(() => flash.style.background = 'rgba(255,0,0,0)', 200);
    
    // Shake canvas
    const canvas = document.getElementById('game');
    if (canvas) canvas.classList.add('quake-shake');
    
    // Sound
    if (typeof Audio !== 'undefined') {
      // Alarm sound
      for (let i = 0; i < 6; i++) {
        setTimeout(() => Audio.tone(880, 0.15, 'sawtooth', 0.1), i * 200);
      }
    }
    
    // Update loop
    this.startLoop();
    this.updateAction();
  },
  
  startLoop() {
    const loop = () => {
      if (!this.active) return;
      
      const elapsed = Date.now() - this.phaseStart;
      const total = Date.now() - this.startTime;
      
      // Update timer
      const timer = document.getElementById('quake-timer');
      const remaining = Math.max(0, 5 - elapsed / 1000);
      timer.textContent = Math.ceil(remaining);
      timer.style.display = 'block';
      
      // Auto phase transition
      if (this.phase === 'drop' && elapsed > 5000) {
        this.nextPhase('cover');
      } else if (this.phase === 'cover' && elapsed > 3000) {
        this.nextPhase('hold');
      } else if (this.phase === 'hold' && elapsed > 4000) {
        this.nextPhase('waiting');
      }
      
      // Particle efek
      this.spawnParticles();
      
      // Update action prompt
      if (this.phase !== 'waiting') this.updateAction();
      
      requestAnimationFrame(loop);
    };
    loop();
  },
  
  nextPhase(newPhase) {
    this.phase = newPhase;
    this.phaseStart = Date.now();
    const timer = document.getElementById('quake-timer');
    if (newPhase === 'waiting') timer.style.display = 'none';
    this.updateAction();
  },
  
  updateAction() {
    const action = document.getElementById('quake-action');
    const phase = this.phase;
    
    let text = '';
    if (phase === 'drop') text = '⬇️ TEKAN SPASI: DROP!';
    else if (phase === 'cover') text = '🛡️ TEKAN SPASI: COVER!';
    else if (phase === 'hold') text = '🤝 TEKAN SPASI: HOLD ON!';
    else if (phase === 'waiting') text = '✅ Selesai — tunggu gempa berhenti';
    else text = '';
    
    action.textContent = text;
    action.style.display = text ? 'block' : 'none';
    action.style.background = phase === 'drop' ? 'rgba(200,0,0,0.95)' :
                              phase === 'cover' ? 'rgba(200,100,0,0.95)' :
                              phase === 'hold' ? 'rgba(0,150,0,0.95)' :
                              'rgba(0,0,0,0.9)';
  },
  
  onKey(e) {
    if (!this.active || this.phase === 'idle' || this.phase === 'waiting') return;
    
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();
      
      // Kirim ke server
      if (Net && Net.socket) {
        if (this.phase === 'drop') Net.socket.emit('quake:drop');
        else if (this.phase === 'cover') Net.socket.emit('quake:cover');
        else if (this.phase === 'hold') Net.socket.emit('quake:hold');
      }
      
      // Visual feedback
      const action = document.getElementById('quake-action');
      action.style.transform = 'translateX(-50%) scale(0.9)';
      setTimeout(() => action.style.transform = 'translateX(-50%) scale(1)', 100);
    }
  },
  
  showResult(d) {
    if (d.ok) {
      this.score += d.score || 0;
      console.log(`[QUAKE] ${d.phase} OK! +${d.score}`);
      if (typeof Audio !== 'undefined') Audio.tone(880, 0.15, 'sine', 0.1);
    } else {
      console.log(`[QUAKE] ${d.phase} FAIL: ${d.reason}`);
      if (typeof Audio !== 'undefined') Audio.tone(200, 0.3, 'sawtooth', 0.1);
    }
  },
  
  end(data) {
    console.log('[QUAKE] Ended');
    this.active = false;
    this.phase = 'idle';
    
    // Hide overlay
    this.overlay.style.display = 'none';
    
    // Stop shake
    const canvas = document.getElementById('game');
    if (canvas) canvas.classList.remove('quake-shake');
    
    // Show results
    this.showResults(data.results || []);
    
    // Reset
    this.score = 0;
  },
  
  showResults(results) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 300;
      font-family: monospace;
    `;
    
    const myId = Net.socket && Net.socket.id;
    let html = `
      <div style="background:#1a1a3a;border:4px solid #fff;border-radius:16px;padding:30px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;color:#fff">
        <h2 style="text-align:center;color:#ffd700;margin-bottom:20px;font-size:24px">🎯 HASIL SIMULASI GEMPA</h2>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="border-bottom:2px solid #444;color:#ffd700">
              <th style="padding:8px;text-align:left">#</th>
              <th style="padding:8px;text-align:left">Nama</th>
              <th style="padding:8px;text-align:center">⬇️</th>
              <th style="padding:8px;text-align:center">🛡️</th>
              <th style="padding:8px;text-align:center">🤝</th>
              <th style="padding:8px;text-align:right">Skor</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    if (results.length === 0) {
      html += '<tr><td colspan="6" style="padding:20px;text-align:center;color:#888">Tidak ada peserta</td></tr>';
    } else {
      results.forEach((r, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        const dropT = r.drop !== null ? r.drop + 's' : '❌';
        const coverT = r.cover !== null ? r.cover + 's' : '❌';
        const holdT = r.hold !== null ? r.hold + 's' : '❌';
        const scoreColor = r.score >= 100 ? '#22c55e' : r.score >= 50 ? '#f59e0b' : '#ef4444';
        html += `
          <tr style="border-bottom:1px solid #333">
            <td style="padding:8px">${medal}</td>
            <td style="padding:8px"><b>${r.name}</b></td>
            <td style="padding:8px;text-align:center;color:${r.drop !== null ? '#22c55e' : '#ef4444'}">${dropT}</td>
            <td style="padding:8px;text-align:center;color:${r.cover !== null ? '#22c55e' : '#ef4444'}">${coverT}</td>
            <td style="padding:8px;text-align:center;color:${r.hold !== null ? '#22c55e' : '#ef4444'}">${holdT}</td>
            <td style="padding:8px;text-align:right;color:${scoreColor};font-weight:bold">${r.score}</td>
          </tr>
        `;
      });
    }
    
    html += `
          </tbody>
        </table>
        <div style="margin-top:20px;padding:12px;background:rgba(255,215,0,0.1);border-left:4px solid #ffd700;border-radius:4px;font-size:12px">
          <b>📖 Pelajaran:</b> DROP-COVER-HOLD ON adalah prosedur standar BNPB saat gempa.
          Jatuhkan diri, lindungi kepala di bawah meja, pegang kaki meja sampai guncangan berhenti.
        </div>
        <div style="text-align:center;margin-top:20px">
          <button onclick="this.closest('div[style*=fixed]').remove()" style="padding:10px 30px;background:#4a4aff;color:#fff;border:none;border-radius:8px;font:bold 14px monospace;cursor:pointer">
            Tutup [Esc]
          </button>
        </div>
      </div>
    `;
    
    modal.innerHTML = html;
    modal.id = 'quake-results-modal';
    document.body.appendChild(modal);
    
    // Esc to close
    const closeHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', closeHandler);
      }
    };
    document.addEventListener('keydown', closeHandler);
  },
  
  spawnParticles() {
    // Partikel debu saat gempa
    if (!this.active) return;
    if (Math.random() > 0.3) return;
    
    const canvas = document.getElementById('game');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 2 + Math.random() * 3;
    
    ctx.fillStyle = `rgba(139, 107, 74, ${0.3 + Math.random() * 0.3})`;
    ctx.fillRect(x, y, size, size);
  }
};

Quake.init();
