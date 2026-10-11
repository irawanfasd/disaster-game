/* network.js v4 — multiplayer sync */
const Net = {
  socket: null,
  remotes: {},
  connected: false,
  lastSent: { x: 0, y: 0, dir: '', t: 0 },
  palette: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'],
  
  createLocalPlayer() {
    let name = localStorage.getItem('dq_name');
    if (!name) name = prompt('Nama kamu?') || 'Siswa';
    name = name.trim().slice(0, 12) || 'Siswa';
    localStorage.setItem('dq_name', name);
    const color = this.palette[Math.floor(Math.random() * this.palette.length)];
    const p = new Player(name, 8 * TILE, 11 * TILE, color);
    this.connect(p);
    return p;
  },
  
  connect(localPlayer) {
    if (typeof io === 'undefined') {
      console.warn('[NET] Socket.IO belum loaded, retry...');
      setTimeout(() => this.connect(localPlayer), 500);
      return;
    }
    
    const s = this.socket = io({ path: '/rpg-socket' });
    
    s.on('connect', () => {
      console.log('[NET] ✅ Connected:', s.id);
      this.connected = true;
      s.emit('join', {
        name: localPlayer.name,
        color: localPlayer.color,
        x: localPlayer.x,
        y: localPlayer.y,
        dir: localPlayer.dir
      });
    });
    
    s.on('disconnect', (reason) => {
      console.log('[NET] ❌ Disconnected:', reason);
      this.connected = false;
      this.remotes = {};
    });
    
    s.on('connect_error', (err) => {
      console.error('[NET] ❌ Connect error:', err.message);
    });
    
    s.on('init', (data) => {
      console.log('[NET] Init:', data.players.length, 'players');
      this.remotes = {};
      data.players.forEach(o => this.add(o));
    });
    
    s.on('player:join', (o) => {
      console.log('[NET] Player join:', o.name);
      this.add(o);
    });
    
    s.on('player:leave', (id) => {
      console.log('[NET] Player leave:', id);
      delete this.remotes[id];
    });
    
    s.on('player:move', (d) => {
      const r = this.remotes[d.id];
      if (!r) return;
      r.tx = d.x;
      r.ty = d.y;
      r.dir = d.dir || r.dir;
      r.moving = d.moving;
    });
  },
  
  add(o) {
    const p = new Player(o.name, o.x, o.y, o.color);
    p.id = o.id;
    p.tx = o.x;
    p.ty = o.y;
    p.dir = o.dir || 'down';
    p.isRemote = true;
    this.remotes[o.id] = p;
    console.log('[NET] Added remote:', o.name, 'at', o.x, o.y);
  },
  
  update(dt, localPlayer) {
    // === 1. Update REMOTE players (interpolasi) ===
    for (const id in this.remotes) {
      const r = this.remotes[id];
      const factor = Math.min(1, dt * 15);
      r.x += (r.tx - r.x) * factor;
      r.y += (r.ty - r.y) * factor;
      
      if (Math.abs(r.tx - r.x) < 0.5) r.x = r.tx;
      if (Math.abs(r.ty - r.y) < 0.5) r.y = r.ty;
    }
    
    // === 2. Kirim posisi LOCAL ke server ===
    if (!this.connected || !this.socket) return;
    
    const now = performance.now();
    if (now - this.lastSent.t < 16) return; // 60 fps
    
    const dx = Math.abs(localPlayer.x - this.lastSent.x);
    const dy = Math.abs(localPlayer.y - this.lastSent.y);
    const moved = dx > 0.5 || dy > 0.5;
    const dirChanged = this.lastSent.dir !== localPlayer.dir;
    
    if (!moved && !dirChanged) return;
    
    this.lastSent = {
      x: localPlayer.x,
      y: localPlayer.y,
      dir: localPlayer.dir,
      t: now
    };
    
    this.socket.emit('move', {
      x: localPlayer.x,
      y: localPlayer.y,
      dir: localPlayer.dir,
      moving: localPlayer.moving
    });
  },
  
  drawAll(ctx, camX, camY, localPlayer) {
    for (const id in this.remotes) {
      this.remotes[id].draw(ctx, camX, camY, false);
    }
    if (localPlayer) localPlayer.draw(ctx, camX, camY, true);
  }
};
