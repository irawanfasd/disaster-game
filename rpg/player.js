/* player.js v3 — gerak lancar */
const SPEED = 150;

class Player {
  constructor(name, x, y, color) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.tx = x;
    this.ty = y;
    this.color = color || '#3b82f6';
    this.dir = 'down';
    this.moving = false;
    this.w = 20;
    this.h = 26;
  }
  
  update(dt, vx, vy, joystick) {
    let dx = vx, dy = vy;
    
    if (joystick && (Math.abs(joystick.x) > 0.15 || Math.abs(joystick.y) > 0.15)) {
      dx = joystick.x;
      dy = joystick.y;
    }
    
    const len = Math.hypot(dx, dy);
    if (len > 0.1) {
      // Footstep sound
      this.stepTimer = (this.stepTimer || 0) + dt;
      if (this.stepTimer > 0.35) {
        this.stepTimer = 0;
        if (typeof Audio !== 'undefined') Audio.footstep();
      }
      const nx = dx / len;
      const ny = dy / len;
      const step = SPEED * Math.min(dt, 0.05);
      
      // Coba gerak X dan Y terpisah
      const newX = this.x + nx * step;
      const newY = this.y + ny * step;
      
      // Gerak X (kalau tidak nabrak)
      if (this.canMove(newX, this.y)) {
        this.x = newX;
      }
      // Gerak Y (kalau tidak nabrak)
      if (this.canMove(this.x, newY)) {
        this.y = newY;
      }
      
      if (Math.abs(dx) > Math.abs(dy)) {
        this.dir = dx > 0 ? 'right' : 'left';
      } else {
        this.dir = dy > 0 ? 'down' : 'up';
      }
      this.moving = true;
    } else {
      this.moving = false;
    }
    
    // Interpolasi di-handle di network.js untuk remote player
    // Local player tidak perlu interpolasi
  }
  
  // Collision check: cek tile di bawah kaki + padding
  canMove(newX, newY) {
    // 4 titik: kiri-atas, kanan-atas, kiri-bawah, kanan-bawah
    // tapi hanya bagian "badan" (bukan kepala)
    const padding = 4;
    const x1 = newX + padding;
    const x2 = newX + this.w - padding;
    const y1 = newY + this.h / 2;  // badan
    const y2 = newY + this.h;      // kaki
    
    const tx1 = Math.floor(x1 / TILE);
    const tx2 = Math.floor(x2 / TILE);
    const ty1 = Math.floor(y1 / TILE);
    const ty2 = Math.floor(y2 / TILE);
    
    return !isSolid(tx1, ty1) &&
           !isSolid(tx2, ty1) &&
           !isSolid(tx1, ty2) &&
           !isSolid(tx2, ty2);
  }
  
  draw(ctx, camX, camY, isLocal) {
    const x = Math.round(this.x - camX);
    const y = Math.round(this.y - camY);
    
    // Animasi walk (frame 0,1,2)
    this.animTime = (this.animTime || 0) + 0.016;
    const frame = this.moving ? Math.floor(this.animTime * 8) % 3 : 0;
    
    // Shadow (lebih bagus)
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(x + this.w / 2, y + this.h - 2, this.w / 2 + 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Sprite (pakai generator)
    if (typeof CharSprites !== 'undefined') {
      const sprite = CharSprites.get(this.name, this.color, this.dir, frame);
      // Skala 1.5x biar lebih besar
      const scale = 1.5;
      const w = 16 * scale;
      const h = 20 * scale;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite, x + (this.w - w) / 2, y + this.h - h, w, h);
    } else {
      // Fallback: kotak lama
      ctx.fillStyle = this.color;
      ctx.fillRect(x, y + this.h / 2, this.w, this.h / 2);
      ctx.fillStyle = '#f5c9a0';
      ctx.fillRect(x + 2, y, this.w - 4, this.h / 2);
    }
    
    // Nama dengan background
    const nameY = y - 8;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    
    const textW = ctx.measureText(this.name).width;
    ctx.fillStyle = isLocal ? 'rgba(50, 100, 200, 0.85)' : 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(x + this.w / 2 - textW / 2 - 4, nameY - 9, textW + 8, 12, 3);
    ctx.fill();
    
    ctx.fillStyle = isLocal ? '#fff' : '#ffd700';
    ctx.fillText(this.name, x + this.w / 2, nameY);
    ctx.textAlign = 'left';
  }
}

function collides(x, y, w, h) {
  return !new Player('', x, y, '').canMove(x, y);
}
