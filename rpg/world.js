/* world.js — Tilemap sederhana */
const TILE = 32;
const MAP_COLS = 20;
const MAP_ROWS = 14;
const MAP_W = MAP_COLS * TILE;
const MAP_H = MAP_ROWS * TILE;

// 0 = lantai, 1 = dinding, 2 = meja, 3 = pintu
const MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,2,2,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0,1],
  [1,0,2,2,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,2,2,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0,1],
  [1,0,2,2,0,0,2,2,0,0,2,2,0,0,2,2,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];



/* Dekorasi tambahan */
function drawDecorations(ctx, camX, camY) {
  const items = [
    // Papan tulis (atas)
    { x: 256, y: 32, w: 128, h: 48, type: 'whiteboard' },
    // Meja guru
    { x: 288, y: 96, w: 64, h: 32, type: 'desk' },
    // Pintu (bawah)
    { x: 320, y: 416, w: 64, h: 32, type: 'door' },
    // Rak buku
    { x: 32, y: 32, w: 32, h: 64, type: 'shelf' },
    { x: 576, y: 32, w: 32, h: 64, type: 'shelf' },
    // Tanaman
    { x: 32, y: 400, w: 24, h: 24, type: 'plant' },
    { x: 576, y: 400, w: 24, h: 24, type: 'plant' },
    // Poster
    { x: 160, y: 32, w: 32, h: 48, type: 'poster' },
    { x: 480, y: 32, w: 32, h: 48, type: 'poster' }
  ];
  
  for (const item of items) {
    const x = item.x - camX;
    const y = item.y - camY;
    
    if (x < -100 || x > canvas.width + 100 || y < -100 || y > canvas.height + 100) continue;
    
    if (item.type === 'whiteboard') {
      ctx.fillStyle = '#e8e8e8';
      ctx.fillRect(x, y, item.w, item.h);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, item.w, item.h);
      // Tulisan di papan
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('GEMPA BUMI', x + 12, y + 20);
      ctx.font = '10px monospace';
      ctx.fillText('Drop-Cover-Hold On', x + 12, y + 38);
    } else if (item.type === 'desk') {
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(x, y, item.w, item.h);
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(x, y, item.w, 6);
      // Buku
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x + 8, y + 10, 12, 16);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + 9, y + 11, 10, 14);
    } else if (item.type === 'door') {
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(x, y, item.w, item.h);
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(x + 4, y + 4, item.w - 8, item.h - 8);
      // Handle
      ctx.fillStyle = '#f5b82e';
      ctx.beginPath();
      ctx.arc(x + item.w - 10, y + item.h / 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'shelf') {
      ctx.fillStyle = '#6b4423';
      ctx.fillRect(x, y, item.w, item.h);
      // Buku
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7'];
          ctx.fillStyle = colors[(row * 2 + col) % colors.length];
          ctx.fillRect(x + 4 + col * 12, y + 6 + row * 18, 10, 14);
        }
      }
    } else if (item.type === 'plant') {
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(x + 6, y + 16, 12, 8);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x + 12, y + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(x + 12, y + 8, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'poster') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, item.w, item.h);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, item.w, item.h);
      ctx.fillStyle = '#e0293a';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('⚠️', x + 8, y + 20);
      ctx.fillStyle = '#333';
      ctx.font = '8px monospace';
      ctx.fillText('SIAGA', x + 4, y + 32);
      ctx.fillText('BENCANA', x + 2, y + 42);
    }
  }
}

function isSolid(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= MAP_COLS || ty >= MAP_ROWS) return true;
  return MAP[ty][tx] === 1 || MAP[ty][tx] === 2;
}

function drawWorld(ctx, camX, camY) {
  // Lantai
  for (let ty = 0; ty < MAP_ROWS; ty++) {
    for (let tx = 0; tx < MAP_COLS; tx++) {
      const v = MAP[ty][tx];
      const x = tx * TILE - camX;
      const y = ty * TILE - camY;
      
      if (v === 0) {
        ctx.fillStyle = ((tx + ty) % 2 === 0) ? '#3a4a5a' : '#35424f';
        ctx.fillRect(x, y, TILE, TILE);
      } else if (v === 1) {
        ctx.fillStyle = '#5a3a2a';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#7a5a3a';
        ctx.fillRect(x, y, TILE, 4);
      } else if (v === 2) {
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = '#8a5a2a';
        ctx.fillRect(x + 2, y + 2, TILE - 4, 4);
      } else if (v === 3) {
        ctx.fillStyle = '#2a7a4a';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#3a9a5a';
        ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
      }
    }
  }
}
