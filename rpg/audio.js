/* audio.js — SFX + BGM untuk RPG */
const Audio = {
  ctx: null,
  bgmOn: true,
  sfxOn: true,
  bgmTimer: null,
  
  init() {
    // Setup tombol
    const btn = document.createElement('button');
    btn.id = 'audio-btn';
    btn.innerHTML = '🔊';
    btn.style.cssText = `
      position: fixed;
      top: 8px;
      right: 8px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0,0,0,0.7);
      border: 2px solid #fff;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      z-index: 200;
    `;
    btn.onclick = () => this.toggle();
    document.body.appendChild(btn);
    this.btn = btn;
    
    // Unlock audio saat interaksi
    const unlock = () => {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    
    // Start BGM
    setTimeout(() => this.startBGM(), 2000);
  },
  
  toggle() {
    this.bgmOn = !this.bgmOn;
    this.btn.innerHTML = this.bgmOn ? '🔊' : '🔇';
    if (this.bgmOn) this.startBGM();
    else this.stopBGM();
  },
  
  tone(freq, dur, type, vol) {
    if (!this.sfxOn || !this.ctx) return;
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'square';
      o.frequency.value = freq;
      const t = this.ctx.currentTime;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol || 0.06, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g);
      g.connect(this.ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    } catch(e) {}
  },
  
  footstep() {
    this.tone(80 + Math.random() * 40, 0.08, 'triangle', 0.03);
  },
  
  chat() {
    this.tone(660, 0.1, 'sine', 0.08);
    setTimeout(() => this.tone(880, 0.1, 'sine', 0.06), 80);
  },
  
  emote() {
    this.tone(440, 0.08, 'square', 0.05);
    setTimeout(() => this.tone(660, 0.08, 'square', 0.05), 60);
  },
  
  dialogOpen() {
    this.tone(330, 0.1, 'square', 0.06);
    setTimeout(() => this.tone(440, 0.15, 'square', 0.06), 100);
  },
  
  // BGM sederhana — chord loop
  startBGM() {
    if (!this.bgmOn || !this.ctx) return;
    this.stopBGM();
    
    const chords = [
      [220, 277, 330],  // A minor
      [196, 247, 294],  // G major
      [175, 220, 262],  // F major
      [196, 247, 294]   // G major
    ];
    
    let idx = 0;
    const playChord = () => {
      if (!this.bgmOn || !this.ctx) return;
      const chord = chords[idx % chords.length];
      chord.forEach((f, i) => {
        setTimeout(() => this.tone(f, 1.5, 'sine', 0.015), i * 100);
      });
      idx++;
    };
    
    playChord();
    this.bgmTimer = setInterval(playChord, 2000);
  },
  
  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
};

Audio.init();
