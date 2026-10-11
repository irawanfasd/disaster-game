/* fx.js v4.0 — BGM lebih enak, auto-start setelah interaksi pertama */
(function() {
  'use strict';

  // ============ AUDIO ============
  var AC = window.AudioContext || window.webkitAudioContext;
  var ac = null;
  var muted = localStorage.dq_mute === '1';
  var bgmOn = localStorage.dq_bgm !== '0';
  var bt = null;
  var bs = 0;
  var audioUnlocked = false;

  function getCtx() {
    try {
      if (!ac) ac = new AC();
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) { return null; }
  }

  // Unlock audio saat user interaksi pertama
  function unlockAudio() {
    try {
      var a = getCtx();
      if (a && a.state === 'suspended') {
        a.resume().then(function() {
          console.log('[BGM] Unlock resume OK, state:', a.state);
          audioUnlocked = true;
          // Auto-start BGM kalau di halaman play dan BGM belum jalan
          var playSec = document.querySelector('#play');
          if (playSec && !playSec.hidden && !bt && typeof L !== 'undefined' && L) {
            window.bgmStart(L.id);
          }
        });
      } else if (a && a.state === 'running') {
        audioUnlocked = true;
      }
    } catch (e) {}
  }
  ['click', 'touchstart', 'keydown'].forEach(function(ev) {
    document.addEventListener(ev, unlockAudio, { once: false, passive: true });
  });

  function note(f, d, ty, v) {
    try {
      var a = getCtx();
      if (!a) return;
      var o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
      o.type = ty || 'square';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(v || 0.07, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, t + d);
      o.connect(g); g.connect(a.destination);
      o.start(t); o.stop(t + d + 0.05);
    } catch (e) {}
  }

  function tone(seq) {
    if (muted || !AC) return;
    var w = 0;
    seq.forEach(function(item) {
      (function(f, d, ty) {
        setTimeout(function() { note(f, d, ty, 0.08); }, w * 1000);
      })(item[0], item[1], item[2]);
      w += item[1];
    });
  }

  window.sfx = {
    good: function() { tone([[660, 0.1], [880, 0.1], [1046, 0.18]]); },
    bad: function() { tone([[220, 0.15, 'sawtooth'], [165, 0.15, 'sawtooth'], [130, 0.25, 'sawtooth']]); },
    end: function() { tone([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.4]]); }
  };

  // ============ BGM TRACKS (lebih merdu) ============
  // Setiap track = pola melodi + bass + tempo
  var TR = {
    1: { // GEMPA - tegang, dramatis
      ms: 300,
      melody: [330, 392, 330, 294, 262, 294, 330, 262, 330, 294, 262, 220, 262, 294, 330, 294],
      bass: [110, 110, 98, 98, 87, 87, 98, 98],
      ty: 'triangle',
      bassTy: 'sine'
    },
    2: { // ERUPSI - misterius, dalam
      ms: 400,
      melody: [220, 262, 294, 262, 220, 196, 175, 196, 220, 262, 220, 196, 175, 165, 147, 165],
      bass: [73, 73, 65, 65, 73, 73, 82, 82],
      ty: 'sawtooth',
      bassTy: 'triangle'
    },
    3: { // TSUNAMI - cepat, urgent
      ms: 220,
      melody: [392, 440, 494, 440, 392, 349, 330, 349, 392, 440, 392, 349, 330, 294, 330, 349],
      bass: [131, 131, 147, 147, 165, 165, 147, 147],
      ty: 'square',
      bassTy: 'triangle'
    },
    4: { // BANJIR - tenang, melankolis
      ms: 350,
      melody: [294, 330, 392, 330, 294, 262, 294, 330, 294, 330, 349, 392, 349, 330, 294, 262],
      bass: [98, 98, 110, 110, 131, 131, 110, 110],
      ty: 'sine',
      bassTy: 'sine'
    }
  };

  var pendingBgm = null;

  window.bgmStart = function(lv) {
    window.bgmStop();
    if (muted || !bgmOn || !AC) return;
    var T = TR[lv];
    if (!T) return;
    bs = 0;
    try {
      var a = getCtx();
      if (!a) return;
      if (a.state !== 'running') {
        console.log('[BGM] Audio suspended (state: ' + a.state + '), coba resume...');
        pendingBgm = lv;
        a.resume().then(function() {
          console.log('[BGM] Resume OK, state: ' + a.state);
          if (pendingBgm !== null) {
            var l = pendingBgm;
            pendingBgm = null;
            window.bgmStart(l);
          }
        }).catch(function(e) {
          console.warn('[BGM] Resume gagal:', e);
        });
        return;
      }
    } catch (e) { console.error('[BGM] Error:', e); return; }

    console.log('[BGM] Start track', lv);

    bt = setInterval(function() {
      if (muted || !bgmOn) return;
      // Melodi utama
      var idx = bs % T.melody.length;
      note(T.melody[idx], T.ms / 1000 * 0.85, T.ty, T.ty === 'sawtooth' ? 0.018 : 0.028);
      // Bass setiap 2 ketukan
      if (bs % 2 === 0) {
        note(T.bass[(bs >> 1) % T.bass.length], T.ms / 1000 * 1.5, T.bassTy, 0.04);
      }
      // Hi-hat setiap ketukan ganjil
      if (bs % 2 === 1) {
        note(2000 + Math.random() * 200, 0.02, 'square', 0.008);
      }
      bs++;
    }, T.ms);
  };

  window.bgmStop = function() {
    if (bt) { clearInterval(bt); bt = null; console.log('[BGM] Stop'); }
  };

  window.toggleMute = function() {
    muted = !muted;
    localStorage.dq_mute = muted ? '1' : '0';
    var el = document.querySelector('#mu');
    if (el) el.textContent = muted ? '🔇' : '🔊';
    if (muted) window.bgmStop();
    else {
      var playSec = document.querySelector('#play');
      if (playSec && !playSec.hidden && typeof L !== 'undefined' && L) window.bgmStart(L.id);
    }
  };

  window.toggleBgm = function() {
    bgmOn = !bgmOn;
    localStorage.dq_bgm = bgmOn ? '1' : '0';
    var el = document.querySelector('#bg');
    if (el) el.style.opacity = bgmOn ? 1 : 0.4;
    if (!bgmOn) {
      window.bgmStop();
    } else {
      var playSec = document.querySelector('#play');
      if (typeof L !== 'undefined' && L && playSec && !playSec.hidden) {
        window.bgmStart(L.id);
      }
    }
  };

  // Set ikon awal
  var bgEl = document.querySelector('#bg');
  if (bgEl) bgEl.style.opacity = bgmOn ? 1 : 0.4;
  var muEl = document.querySelector('#mu');
  if (muEl) muEl.textContent = muted ? '🔇' : '🔊';

  // Expose audio state
  window.isMuted = function() { return muted; };
  window.isBgmOn = function() { return bgmOn; };

  // ============ SPRITE ============
  var IMGS = {};
  function charImg(id, g) {
    var k = id + '-' + g;
    if (!IMGS[k]) {
      var im = new Image();
      im.src = '/assets/costumes/' + k + '.png?v=6';
      IMGS[k] = im;
    }
    return IMGS[k];
  }

  window.drawChar = function(cx, x, y, s, id, g) {
    var im = charImg(id, g);
    cx.imageSmoothingEnabled = false;
    if (im.complete && im.naturalWidth) {
      cx.drawImage(im, x, y, 16 * s, 24 * s);
      return;
    }
    cx.fillStyle = '#888';
    cx.fillRect(x, y, 16 * s, 24 * s);
  };

  window.spriteCanvas = function(id, g, s) {
    var c = document.createElement('canvas');
    c.width = 16 * s;
    c.height = 24 * s;
    c.style.imageRendering = 'pixelated';
    var cx = c.getContext('2d');
    window.drawChar(cx, 0, 0, s, id, g);
    var im = charImg(id, g);
    if (!im.complete) {
      im.addEventListener('load', function() {
        cx.clearRect(0, 0, c.width, c.height);
        window.drawChar(cx, 0, 0, s, id, g);
      });
    }
    return c;
  };

  // ============ SCENE (Canvas animasi) ============
  var raf = null, mood = 0, jump = 0, prog = 0;

  window.stopScene = function() {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  };

  window.scene = function(cv, lv, P) {
    if (!cv) return;
    window.stopScene();
    var cx = cv.getContext('2d');
    var W = cv.width, H = cv.height, G = H - 24, CX = W / 2 + 30;
    var f = 0;
    var pr = [];
    for (var i = 0; i < 50; i++) {
      pr.push({ x: Math.random() * W, y: Math.random() * H, v: 1 + Math.random() * 2, s: Math.random() });
    }
    var sky = ['#cfe8ff', '#3b2733', '#9fd8ee', '#6b7b8c'][lv - 1];
    var grd = ['#7a9a5a', '#4a4038', '#e8d7a0', '#6b7f5a'][lv - 1];

    function loop() {
      f++;
      cx.fillStyle = sky;
      cx.fillRect(0, 0, W, H);

      var q = lv === 1 ? (f % 240 < 90 ? 3 : 0.5) : 0;
      var sh = (q + (mood > 0 ? 5 : 0)) * (Math.random() - 0.5) * 2;

      cx.save();
      cx.translate(Math.round(sh), Math.round(sh / 2));

      if (lv === 1) {
        var w = Math.sin(f / 3) * q * 0.7;
        cx.fillStyle = '#d9895a';
        cx.fillRect(10 + w, 24, 96, G - 24);
        cx.fillStyle = '#8fc4f0';
        for (var a = 0; a < 3; a++) for (var b = 0; b < 2; b++) cx.fillRect(22 + a * 28 + w, 38 + b * 28, 14, 16);
      }
      if (lv === 2) {
        cx.fillStyle = 'rgba(255,106,26,' + (0.15 + (0.5 + 0.5 * Math.sin(f / 15)) * 0.2) + ')';
        cx.fillRect(0, 0, W, H);
        cx.fillStyle = '#2a1a1a';
        cx.beginPath(); cx.moveTo(150, G); cx.lineTo(230, 26); cx.lineTo(320, G); cx.fill();
      }

      cx.fillStyle = grd;
      cx.fillRect(0, G, W, H - G);

      if (lv > 2) {
        var wl = (lv === 3 ? 8 + prog * 46 : 4 + prog * 30) + Math.sin(f / 40) * 2;
        cx.fillStyle = lv === 3 ? '#2b7de0' : '#8a6a44';
        for (var x = 0; x < W; x += 4) cx.fillRect(x, G - wl + Math.sin((x + f * 2) / 16) * 3, 4, H);
      }

      var h = lv > 2 ? prog * 18 : 0;
      if (h) {
        cx.fillStyle = '#7a9a5a';
        cx.fillRect(CX - 8, G - h, 64, h + 24);
      }

      var jy = jump > 0 ? -Math.sin((1 - jump / 14) * Math.PI) * 14 : 0;
      if (P && P.costume) {
        window.drawChar(cx, CX, G - h - 72 + Math.round(Math.sin(f / 8) * 2 + jy), 3, P.costume, P.gender || 'm');
      }

      pr.forEach(function(p) {
        if (lv === 1) {
          p.y += p.v * 2;
          if (q > 2) { cx.fillStyle = '#8b6b4a'; cx.fillRect(p.x, p.y, 2 + p.s * 2, 2 + p.s * 2); }
        } else if (lv === 4) {
          p.y += p.v * 4; p.x -= 1;
          cx.fillStyle = '#9ec5ff'; cx.fillRect(p.x, p.y, 1, 6);
        }
        if (p.y > H) p.y = -6;
        if (p.x < 0) p.x = W;
      });

      cx.restore();

      if (mood > 0) {
        cx.fillStyle = 'rgba(224,41,58,' + mood / 50 + ')';
        cx.fillRect(0, 0, W, H);
        mood--;
      }
      if (jump > 0) jump--;

      raf = requestAnimationFrame(loop);
    }
    loop();
  };

  window.setMood = function(v) { mood = v; };
  window.setJump = function(v) { jump = v; };
  window.setProg = function(v) { prog = v; };

  console.log('[FX] Loaded OK — toggleBgm:', typeof window.toggleBgm);
})();
