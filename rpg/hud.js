/* hud.js — HUD dengan skor, waktu, online */
const HUD = {
  startTime: Date.now(),
  score: 0,
  init() {
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.style.cssText = `
      position: fixed;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      z-index: 100;
      font: 11px monospace;
      pointer-events: none;
    `;
    document.body.appendChild(hud);
    this.el = hud;
    this.update();
    setInterval(() => this.update(), 1000);
  },
  
  update() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    const time = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    
    const online = (typeof Net !== 'undefined' && Net.remotes) 
      ? Object.keys(Net.remotes).length + 1 
      : 1;
    
    this.el.innerHTML = `
      <div style="background:rgba(0,0,0,0.7);padding:6px 12px;border-radius:6px;color:#fff;border:1px solid #444">
        ⏱️ ${time}
      </div>
      <div style="background:rgba(0,0,0,0.7);padding:6px 12px;border-radius:6px;color:#fff;border:1px solid #444">
        🎮 ${online} pemain
      </div>
      <div style="background:rgba(0,0,0,0.7);padding:6px 12px;border-radius:6px;color:#ffd700;border:1px solid #444">
        ⭐ ${this.score}
      </div>
    `;
  },
  
  addScore(n) {
    this.score += n;
    this.update();
  }
};

HUD.init();
