/* sprites-char.js — Sprite generator pixel art */
const CharSprites = {
  cache: {},
  
  // Generate sprite 16x20 dengan animasi
  get(name, color, dir, frame) {
    const key = `${name}-${color}-${dir}-${frame}`;
    if (this.cache[key]) return this.cache[key];
    
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 20;
    const ctx = c.getContext('2d');
    
    // Warna
    const skin = '#f5c9a0';
    const skinDark = '#d4a880';
    const hair = name === 'Siswa' ? '#3b2f1f' : '#4a2c1a';
    const shirt = color;
    const shirtDark = this.darken(color, 0.7);
    const pants = '#2a3a5a';
    
    // Head (4x4)
    ctx.fillStyle = skin;
    ctx.fillRect(5, 2, 6, 6);
    
    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(5, 1, 6, 3);
    
    // Eyes (berdasarkan arah)
    ctx.fillStyle = '#1a1a1a';
    if (dir === 'down') {
      ctx.fillRect(6, 4, 1, 1);
      ctx.fillRect(9, 4, 1, 1);
    } else if (dir === 'left') {
      ctx.fillRect(6, 4, 1, 1);
    } else if (dir === 'right') {
      ctx.fillRect(9, 4, 1, 1);
    }
    
    // Body (6x6)
    ctx.fillStyle = shirt;
    ctx.fillRect(4, 8, 8, 6);
    ctx.fillStyle = shirtDark;
    ctx.fillRect(4, 8, 8, 1);
    
    // Arms (animasi)
    ctx.fillStyle = skin;
    if (frame === 0) {
      ctx.fillRect(2, 9, 2, 4);
      ctx.fillRect(12, 9, 2, 4);
    } else if (frame === 1) {
      ctx.fillRect(3, 9, 2, 4);
      ctx.fillRect(11, 10, 2, 4);
    } else {
      ctx.fillRect(2, 10, 2, 4);
      ctx.fillRect(12, 9, 2, 4);
    }
    
    // Legs (animasi walk)
    ctx.fillStyle = pants;
    if (frame === 0) {
      ctx.fillRect(5, 14, 3, 5);
      ctx.fillRect(8, 14, 3, 5);
    } else if (frame === 1) {
      ctx.fillRect(4, 14, 3, 5);
      ctx.fillRect(9, 14, 3, 5);
    } else {
      ctx.fillRect(6, 14, 3, 5);
      ctx.fillRect(9, 15, 3, 4);
    }
    
    // Shoes
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(5, 18, 3, 1);
    ctx.fillRect(8, 18, 3, 1);
    
    this.cache[key] = c;
    return c;
  },
  
  darken(hex, factor) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return '#' + [r, g, b].map(x => Math.floor(x * factor).toString(16).padStart(2, '0')).join('');
  }
};
