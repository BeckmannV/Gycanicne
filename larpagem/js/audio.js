/* ============================================================
   THIEGO DOPAMINA FARM — audio.js
   Todos os SFX sintetizados com WebAudio (zero arquivos).
   Desbloqueia no primeiro gesto do usuário.
   ============================================================ */
(function () {
  'use strict';
  const AU = window.TDF.Audio = {
    enabled: true,
    volume: 0.7,
    musicOn: true,
    _ctx: null,
    _unlocked: false,
  };

  let master, musicGain;
  let musicTimer = null, musicStep = 0;
  const tracks = ['penta', 'minor', 'major'];
  let trackIdx = 0;

  function ctx() {
    if (!AU._ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      AU._ctx = new AC();
      master = AU._ctx.createGain();
      master.gain.value = AU.volume;
      master.connect(AU._ctx.destination);
      musicGain = AU._ctx.createGain();
      musicGain.gain.value = 0.0;
      musicGain.connect(master);
    }
    if (AU._ctx.state === 'suspended') AU._ctx.resume();
    return AU._ctx;
  }
  AU.unlock = function () {
    const c = ctx();
    if (c) { c.resume(); AU._unlocked = true; }
    if (AU.musicOn && !musicTimer) startMusic();
  };

  function tone(freq, dur, type, vol, when, slideTo) {
    const c = ctx(); if (!c || !AU.enabled) return;
    const t0 = c.currentTime + (when || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol || 0.2, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, vol, freq) {
    const c = ctx(); if (!c || !AU.enabled) return;
    const t0 = c.currentTime;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      if (freq) data[i] *= 0.5 + 0.5 * Math.sin(i / (c.sampleRate / freq) * Math.PI * 2);
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = vol || 0.2;
    const f = c.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 2000;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t0);
  }

  const SFX = {
    click: () => tone(660 + Math.random() * 80, 0.06, 'square', 0.10),
    crit: () => { tone(880, 0.09, 'square', 0.16); tone(1320, 0.12, 'sawtooth', 0.10, 0.02); noise(0.08, 0.06); },
    buy: () => { tone(520, 0.07, 'triangle', 0.14); tone(780, 0.1, 'triangle', 0.10, 0.06); },
    denied: () => tone(180, 0.12, 'sawtooth', 0.12, 0, 110),
    evolve: () => { [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'triangle', 0.16, i * 0.07)); noise(0.3, 0.05, 400); },
    prestige: () => { [262, 330, 392, 523, 659, 784].forEach((f, i) => tone(f, 0.25, 'sawtooth', 0.12, i * 0.09)); noise(0.5, 0.06, 200); },
    achievement: () => { tone(1046, 0.12, 'triangle', 0.16); tone(1318, 0.18, 'triangle', 0.14, 0.1); },
    encounter: () => { tone(330, 0.15, 'sawtooth', 0.14, 0, 660); noise(0.15, 0.08, 300); },
    event: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.1, 'square', 0.10, i * 0.05)); },
    secret: () => { [200, 300, 450, 340, 510].forEach((f, i) => tone(f, 0.2, 'sine', 0.14, i * 0.12)); },
    morph: () => { tone(300, 0.4, 'sawtooth', 0.1, 0, 800); tone(600, 0.4, 'square', 0.08, 0.1, 1200); noise(0.4, 0.04, 300); },
    levelup: () => { tone(700, 0.08, 'triangle', 0.12, 0, 900); },
  };

  AU.play = function (name) {
    if (!AU.enabled || !AU._unlocked) return;
    const fn = SFX[name];
    if (fn) try { fn(); } catch (e) {}
  };

  /* ---------- música ambiente (seq simple) ---------- */
  const SCALES = {
    penta: [261.6, 293.7, 329.6, 392, 440, 523.3, 587.3],
    minor: [220, 261.6, 311.1, 349.2, 415.3, 466.2, 523.3],
    major: [261.6, 293.7, 329.6, 349.2, 392, 440, 493.9, 523.3],
  };
  function startMusic() {
    musicTimer = setInterval(() => {
      if (!AU.musicOn) return;
      const c = ctx(); if (!c) return;
      const scale = SCALES[trackIdx ? 'minor' : 'penta'];
      const f = scale[Math.floor(Math.random() * scale.length)] * 0.5;
      tone(f, 0.8, 'sine', 0.05, 0, f * 1.001);
      musicStep++;
      if (musicStep % 8 === 0) { trackIdx = (trackIdx + 1) % 2; }
    }, 900);
  }
  AU.setMusic = function (on) {
    AU.musicOn = !!on;
    if (on) { if (!musicTimer) startMusic(); }
    else if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  };
  AU.setVolume = function (v) {
    AU.volume = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = AU.volume;
  };

  /* ---------- fachada usada por game.js ---------- */
  window.AudioFX = {
    sfx: SFX,
    play: AU.play,
    unlock: AU.unlock,
    setMusic: AU.setMusic,
    setVolume: AU.setVolume,
    enabled: AU.enabled,
    volume: AU.volume,
    musicOn: AU.musicOn,
  };
})();