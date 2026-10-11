/* engine.js — Game loop + input + camera */
const canvas = window.canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Resize canvas
function resize() {
  canvas.width = Math.min(window.innerWidth - 20, 960);
  canvas.height = Math.min(window.innerHeight - 20, Math.floor(canvas.width * MAP_H / MAP_W));
}
window.addEventListener('resize', resize);
resize();

// Input keyboard
const keys = window.keys = {};
window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// Joystick untuk mobile
const joystick = { x: 0, y: 0, active: false };
const joyEl = document.getElementById('joy');
const knobEl = document.getElementById('knob');
let joyCenter = { x: 0, y: 0 };

if (joyEl) {
  joyEl.addEventListener('touchstart', e => {
    e.preventDefault();
    const r = joyEl.getBoundingClientRect();
    joyCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    joystick.active = true;
  });
  
  window.addEventListener('touchmove', e => {
    if (!joystick.active) return;
    const t = e.touches[0];
    let dx = t.clientX - joyCenter.x;
    let dy = t.clientY - joyCenter.y;
    const dist = Math.hypot(dx, dy);
    const maxDist = 50;
    if (dist > maxDist) {
      dx = dx / dist * maxDist;
      dy = dy / dist * maxDist;
    }
    joystick.x = dx / maxDist;
    joystick.y = dy / maxDist;
    if (knobEl) {
      knobEl.style.left = (35 + dx) + 'px';
      knobEl.style.top = (35 + dy) + 'px';
    }
  });
  
  window.addEventListener('touchend', () => {
    joystick.active = false;
    joystick.x = 0;
    joystick.y = 0;
    if (knobEl) {
      knobEl.style.left = '35px';
      knobEl.style.top = '35px';
    }
  });
}

// Buat player lokal (setelah world.js & player.js load)
let player;
let lastTime = 0;

function initGame() {
  player = Net.createLocalPlayer();
  console.log('[GAME] Player created:', player.name);
  requestAnimationFrame(loop);
}

// Game loop
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  
  // Input
  let vx = 0, vy = 0;
  if (keys['w'] || keys['arrowup']) vy -= 1;
  if (keys['s'] || keys['arrowdown']) vy += 1;
  if (keys['a'] || keys['arrowleft']) vx -= 1;
  if (keys['d'] || keys['arrowright']) vx += 1;
  
  // Update player
  player.update(dt, vx, vy, joystick.active ? joystick : null);
  
  // Update NPC (cek jarak, prompt, dialog)
  if (typeof NPC !== 'undefined') NPC.update(player);
  
  // PENTING: sync tx/ty untuk local player biar tidak balik ke spawn
  player.tx = player.x;
  player.ty = player.y;
  
  // Update network
  Net.update(dt, player);
  
  // Camera follow
  const camX = Math.max(0, Math.min(MAP_W - canvas.width, player.x + player.w / 2 - canvas.width / 2));
  const camY = Math.max(0, Math.min(MAP_H - canvas.height, player.y + player.h / 2 - canvas.height / 2));
  
  // Draw
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawWorld(ctx, camX, camY);
  drawDecorations(ctx, camX, camY);
  Net.drawAll(ctx, camX, camY, player);
  
  // Status
  const status = document.getElementById('status');
  if (status) {
    status.textContent = Net.connected
      ? `Online · ${Object.keys(Net.remotes).length + 1} pemain`
      : 'Menghubungkan...';
  }
  
  requestAnimationFrame(loop);
}

// Mulai setelah DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  setTimeout(initGame, 100);
}
