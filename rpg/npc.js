/* npc.js — NPC + dialog bercabang */
const NPC = {
  list: [],
  active: null,
  dialogActive: false,
  selectedChoice: 0,
  promptShown: false,
  loaded: false,
  
  async init() {
    try {
      const r = await fetch('dialogue.json');
      const data = await r.json();
      this.list = data.npc || [];
      this.loaded = true;
      console.log('[NPC] Loaded', this.list.length, 'NPC');
    } catch (e) {
      console.error('[NPC] Gagal load dialogue.json:', e);
    }
    
    // Bind keyboard untuk dialog
    addEventListener('keydown', e => this.onKey(e), true);
  },
  
  onKey(e) {
    if (!this.dialogActive) return;
    
    // Navigasi pilihan
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      e.stopPropagation();
      this.selectedChoice = Math.max(0, this.selectedChoice - 1);
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      e.preventDefault();
      e.stopPropagation();
      this.selectedChoice = Math.min(this.currentChoices.length - 1, this.selectedChoice + 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      this.pick();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    }
  },
  
  // Cek NPC terdekat dari player
  findNearest(player) {
    if (!this.loaded) return null;
    let nearest = null, minDist = 60; // radius 60px
    
    for (const npc of this.list) {
      const dx = (player.x + player.w / 2) - (npc.x + 16);
      const dy = (player.y + player.h / 2) - (npc.y + 24);
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = npc;
      }
    }
    return nearest;
  },
  
  update(player) {
    if (this.dialogActive) return;
    
    const nearest = this.findNearest(player);
    
    if (nearest && !this.promptShown) {
      this.promptShown = true;
      this.showPrompt(nearest);
    } else if (!nearest && this.promptShown) {
      this.promptShown = false;
      this.hidePrompt();
    }
    
    // SPACE untuk buka dialog
    if (nearest && window.keys && (window.keys[' '] || window.keys['Space'])) {
      // Debounce — hanya trigger sekali per tekan
      if (!this.spacePressed) {
        this.spacePressed = true;
        this.open(nearest);
      }
    } else {
      this.spacePressed = false;
    }
  },
  
  showPrompt(npc) {
    this.promptEl = document.getElementById('npc-prompt');
    if (!this.promptEl) {
      this.promptEl = document.createElement('div');
      this.promptEl.id = 'npc-prompt';
      this.promptEl.style.cssText = `
        position: fixed;
        left: 50%;
        top: 60px;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: #fff;
        padding: 10px 20px;
        border-radius: 8px;
        font: 14px monospace;
        z-index: 20;
        text-align: center;
        border: 2px solid #fff;
      `;
      document.body.appendChild(this.promptEl);
    }
    this.promptEl.innerHTML = `
      <div style="font-size:11px;color:#ffd700">${npc.role}</div>
      <div style="font-weight:bold">${npc.name}</div>
      <div style="margin-top:6px;font-size:12px">Tekan <kbd style="background:#333;padding:2px 6px;border-radius:3px">SPACE</kbd> untuk bicara</div>
    `;
    this.promptEl.style.display = 'block';
  },
  
  hidePrompt() {
    if (this.promptEl) this.promptEl.style.display = 'none';
  },
  
  open(npc) {
    if (!npc.dialog || !npc.dialog.start) return;
    if (typeof Audio !== 'undefined') Audio.dialogOpen();
    
    this.active = npc;
    this.dialogActive = true;
    this.selectedChoice = 0;
    this.hidePrompt();
    
    // Buat dialog box
    let box = document.getElementById('dialog-box');
    if (!box) {
      box = document.createElement('div');
      box.id = 'dialog-box';
      box.style.cssText = `
        position: fixed;
        left: 50%;
        bottom: 20px;
        transform: translateX(-50%);
        width: min(92vw, 600px);
        background: rgba(20, 20, 40, 0.95);
        border: 3px solid #fff;
        border-radius: 12px;
        padding: 20px;
        color: #fff;
        font: 14px monospace;
        z-index: 30;
        box-shadow: 0 8px 32px rgba(0,0,0,0.6);
      `;
      document.body.appendChild(box);
    }
    this.boxEl = box;
    
    this.showNode('start');
  },
  
  showNode(nodeId) {
    const npc = this.active;
    const node = npc.dialog[nodeId];
    if (!node) {
      this.close();
      return;
    }
    
    this.currentNode = nodeId;
    this.currentChoices = node.choices || [];
    this.selectedChoice = 0;
    
    let html = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #444">
        <div style="width:40px;height:40px;border-radius:50%;background:${npc.color};display:flex;align-items:center;justify-content:center;font-size:24px">👨‍🏫</div>
        <div>
          <div style="font-weight:bold;color:#ffd700">${npc.name}</div>
          <div style="font-size:11px;color:#aaa">${npc.role}</div>
        </div>
      </div>
      <div style="margin-bottom:16px;line-height:1.6">${node.text}</div>
    `;
    
    if (this.currentChoices.length > 0) {
      html += '<div style="border-top:1px solid #444;padding-top:12px">';
      this.currentChoices.forEach((c, i) => {
        const sel = i === this.selectedChoice;
        html += `
          <div style="padding:8px 12px;margin:4px 0;border-radius:6px;cursor:pointer;
                      background:${sel ? '#4a4aff' : 'rgba(255,255,255,0.05)'};
                      border:2px solid ${sel ? '#fff' : 'transparent'};
                      transition:all 0.15s"
               onclick="NPC.selectChoice(${i})">
            <span style="color:#ffd700;font-weight:bold">${i + 1}.</span> ${c.text}
          </div>
        `;
      });
      html += '</div>';
      html += '<div style="margin-top:8px;font-size:11px;color:#888;text-align:center">↑↓ pilih · Enter konfirmasi · Esc keluar</div>';
    } else {
      html += '<div style="text-align:center;margin-top:12px"><button onclick="NPC.close()" style="padding:8px 20px;background:#4a4aff;color:#fff;border:none;border-radius:6px;font:inherit;cursor:pointer">Tutup [Esc]</button></div>';
    }
    
    this.boxEl.innerHTML = html;
    this.boxEl.style.display = 'block';
  },
  
  selectChoice(i) {
    this.selectedChoice = i;
    this.pick();
  },
  
  pick() {
    if (this.currentChoices.length === 0) {
      this.close();
      return;
    }
    const choice = this.currentChoices[this.selectedChoice];
    if (choice && choice.next) {
      if (choice.next === 'end') {
        this.close();
      } else {
        this.showNode(choice.next);
      }
    }
  },
  
  close() {
    this.dialogActive = false;
    this.active = null;
    if (this.boxEl) this.boxEl.style.display = 'none';
  },
  
  // Draw NPC sprite
  draw(ctx, camX, camY) {
    for (const npc of this.list) {
      const x = npc.x - camX;
      const y = npc.y - camY;
      
      // Skip kalau di luar layar
      if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) continue;
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + 16, y + 48, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      ctx.fillStyle = npc.color;
      ctx.fillRect(x + 4, y + 24, 24, 24);
      
      // Head
      ctx.fillStyle = '#f5c9a0';
      ctx.fillRect(x + 6, y + 4, 20, 20);
      
      // Eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 10, y + 12, 2, 2);
      ctx.fillRect(x + 20, y + 12, 2, 2);
      
      // Name tag
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(npc.name, x + 16, y - 6);
      ctx.fillText(npc.name, x + 16, y - 6);
      
      // Role tag (kecil)
      ctx.fillStyle = '#aaa';
      ctx.font = '8px monospace';
      ctx.strokeText(npc.role, x + 16, y + 60);
      ctx.fillText(npc.role, x + 16, y + 60);
      
      // Highlight kalau dekat
      if (this.promptShown && this.findNearest({ x: npc.x, y: npc.y, w: 32, h: 48 })) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - 4, y - 4, 40, 60);
        ctx.setLineDash([]);
      }
      
      ctx.textAlign = 'left';
    }
  }
};

// Init
NPC.init();

// Override Net.drawAll untuk gambar NPC di bawah player
const _origDrawAll = Net.drawAll.bind(Net);
Net.drawAll = (ctx, camX, camY, me) => {
  NPC.draw(ctx, camX, camY);
  _origDrawAll(ctx, camX, camY, me);
};

// Update NPC dari engine
const _origEngineUpdate = window.updateNPC || null;
