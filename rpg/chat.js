/* chat.js v2 — client chat + emote (fixed) */
const Chat = {
  EMOTES: ['😀', '😨', '🆘', '👍'],
  bubbles: {},
  emotes: {},
  log: [],
  typing: false,
  bound: false,

  init() {
    // Polyfill roundRect untuk browser lama
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
        r = r || { tl: 5, tr: 5, br: 5, bl: 5 };
        this.beginPath();
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
        return this;
      };
    }

    const css = document.createElement('style');
    css.textContent = `
      #chatlog{position:fixed;left:8px;bottom:160px;max-width:min(80vw,360px);font:12px monospace;color:#fff;
               text-shadow:1px 1px 2px #000;pointer-events:none;z-index:5}
      #chatlog div{background:rgba(0,0,0,.45);padding:2px 6px;margin-top:2px;border-radius:4px}
      #chatbar{position:fixed;left:50%;bottom:12px;transform:translateX(-50%);width:min(92vw,420px);
               display:none;z-index:10}
      #chatbar input{width:100%;box-sizing:border-box;padding:10px;font:16px monospace;border-radius:8px;border:2px solid #fff}
      #hint{position:fixed;left:50%;bottom:4px;transform:translateX(-50%);font:11px monospace;color:#ccc;z-index:5}
      #btns{position:fixed;right:10px;bottom:10px;display:none;gap:6px;z-index:6}
      #btns button{width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,255,255,.5);
                   background:rgba(0,0,0,.4);font-size:22px;color:#fff;cursor:pointer}
      @media (pointer:coarse){#btns{display:flex}#hint{display:none}}
    `;
    document.head.appendChild(css);

    this.logEl = Object.assign(document.createElement('div'), { id: 'chatlog' });
    this.bar = Object.assign(document.createElement('div'), { id: 'chatbar' });
    this.input = Object.assign(document.createElement('input'), {
      maxLength: 60,
      placeholder: 'Ketik pesan, Enter kirim, Esc batal',
      autocomplete: 'off'
    });
    this.bar.appendChild(this.input);

    const hint = Object.assign(document.createElement('div'), {
      id: 'hint',
      textContent: 'T = chat · 1-4 = emote'
    });
    const btns = Object.assign(document.createElement('div'), { id: 'btns' });
    const mk = (label, fn) => {
      const b = document.createElement('button');
      b.textContent = label;
      b.addEventListener('pointerdown', e => { e.preventDefault(); fn(); });
      btns.appendChild(b);
    };
    mk('💬', () => this.open());
    this.EMOTES.forEach((em, i) => mk(em, () => this.emote(i)));
    document.body.append(this.logEl, this.bar, hint, btns);

    // Capture phase — jalan lebih dulu dari engine
    addEventListener('keydown', e => {
      if (this.typing) {
        e.stopPropagation();
        if (e.key === 'Enter') this.send();
        else if (e.key === 'Escape') this.close();
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        this.open();
        return;
      }
      if (['1', '2', '3', '4'].includes(e.key)) this.emote(Number(e.key) - 1);
    }, true);

    addEventListener('keyup', e => {
      if (this.typing) e.stopPropagation();
    }, true);

    // Override Net.drawAll dengan signature LENGKAP
    const orig = Net.drawAll.bind(Net);
    Net.drawAll = (ctx, camX, camY, me) => {
      orig(ctx, camX, camY, me);
      this.draw(ctx, camX, camY, me);
    };

    // Tunggu socket siap
    const iv = setInterval(() => {
      if (Net.socket) {
        this.bind(Net.socket);
        clearInterval(iv);
      }
    }, 200);

    setInterval(() => this.renderLog(), 1000);
  },

  bind(s) {
    s.on('chat', d => {
      if (typeof Audio !== 'undefined') Audio.chat();
      this.bubbles[d.id] = { text: d.text, until: Date.now() + 4500 };
      this.log.push({ name: d.name, text: d.text, t: Date.now() });
      if (this.log.length > 8) this.log.shift();
      this.renderLog();
    });

    s.on('emote', d => {
      if (typeof Audio !== 'undefined') Audio.emote();
      this.emotes[d.id] = { e: d.e, until: Date.now() + 2000 };
    });
  },

  renderLog() {
    const now = Date.now();
    this.logEl.innerHTML = '';
    this.log.filter(l => now - l.t < 10000).forEach(l => {
      const row = document.createElement('div');
      row.textContent = l.name + ': ' + l.text;
      this.logEl.appendChild(row);
    });
  },

  open() {
    if (this.typing) return;
    this.typing = true;
    // Lepas semua tombol gerak
    if (window.keys) for (const k in window.keys) window.keys[k] = false;
    this.bar.style.display = 'block';
    this.input.value = '';
    this.input.focus();
  },

  close() {
    this.typing = false;
    this.bar.style.display = 'none';
    this.input.blur();
  },

  send() {
    const text = this.input.value.trim();
    if (text && Net.connected) Net.socket.emit('chat', { text });
    this.close();
  },

  emote(i) {
    if (Net.connected && !this.typing) Net.socket.emit('emote', { e: i });
  },

  draw(ctx, camX, camY, me) {
    const now = Date.now();
    const myId = Net.socket && Net.socket.id;
    const find = id => (id === myId ? me : Net.remotes[id]);

    ctx.textAlign = 'center';

    for (const id in this.emotes) {
      const em = this.emotes[id], p = find(id);
      if (now > em.until || !p) {
        if (now > em.until) delete this.emotes[id];
        continue;
      }
      ctx.font = '22px sans-serif';
      ctx.fillStyle = '#000';
      ctx.fillText(this.EMOTES[em.e], p.x + p.w / 2 - camX, p.y + p.h - 48 - camY);
    }

    for (const id in this.bubbles) {
      const b = this.bubbles[id], p = find(id);
      if (now > b.until || !p) {
        if (now > b.until) delete this.bubbles[id];
        continue;
      }
      const offsetY = this.emotes[id] ? 22 : 0;
      this.bubble(ctx, b.text, p.x + p.w / 2 - camX, p.y + p.h - 50 - camY - offsetY);
    }
  },

  bubble(ctx, text, cx, bottom) {
    ctx.font = '10px monospace';
    const lines = [];
    let cur = '';
    text.split(' ').forEach(w => {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > 120 && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = t;
      }
    });
    lines.push(cur);

    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 10;
    const h = lines.length * 12 + 6;
    const x = Math.min(Math.max(cx - w / 2, 2), canvas.width - w - 2);
    const y = bottom - h;

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 5);
    ctx.fill();
    ctx.stroke();

    // Tail
    ctx.beginPath();
    ctx.moveTo(cx - 4, bottom);
    ctx.lineTo(cx, bottom + 5);
    ctx.lineTo(cx + 4, bottom);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Text
    ctx.fillStyle = '#000';
    ctx.textAlign = 'left';
    lines.forEach((l, i) => ctx.fillText(l, x + 5, y + 13 + i * 12));
    ctx.textAlign = 'center';
  }
};

Chat.init();
