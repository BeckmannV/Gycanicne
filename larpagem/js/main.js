/* ============================================================
   THIEGO DOPAMINA FARM — main.js
   Boot: carrega save, aplica offline/settings, inicia loop e
   atalhos. Códigos secretos: konami, "cotaprice", "thiega",
   "gestante". Space = clique no Thiego.
   ============================================================ */
(function () {
  'use strict';
  const T = window.TDF;
  const N = window.Num;
  const G = window.Game;
  const UI = window.UI;
  const Fx = window.Fx;

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  const CODES = {
    'cotaprice': 'code',
    'thiega': 'thiega',
    'gestante': 'gestante',
  };
  let seq = [];
  let typed = '';

  function boot() {
    const res = G.load();
    if (res && res._tooNew) {
      document.getElementById('app').innerHTML =
        '<div class="boot-error"><h1>SAVE MUITO NOVO</h1><p>Seu save é de uma versão futura do jogo.</p>' +
        '<button class="btn" onclick="localStorage.removeItem(window.Save.KEY);location.reload()">APAGAR E RECOMEÇAR</button></div>';
      return;
    }

    applySettings();
    Fx.init(document.body);
    UI.init();

    // offline
    const last = (G.state.timestamps && G.state.timestamps.savedAt) || Date.now();
    const elapsed = (Date.now() - last) / 1000;
    const off = G.applyOffline(G.state, elapsed);
    if (off) UI.showOffline(off);
    G.save();

    // ranking: restaura melhor posição e atualiza em silêncio
    window.Leaderboard.bestRankFromStorage();
    window.Leaderboard.refresh().catch(() => {});

    // desbloqueio de áudio no primeiro gesto
    const unlockOnce = () => {
      window.AudioFX.unlock();
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
    window.addEventListener('pointerdown', unlockOnce);
    window.addEventListener('keydown', unlockOnce);

    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', () => {
      G.save();
      beaconRank();
    });
    window.addEventListener('visibilitychange', () => {
      if (document.hidden) { G.save(); beaconRank(); }
    });

    lastT = performance.now();
    requestAnimationFrame(loop);
  }

  function applySettings() {
    const st = G.state.settings || {};
    document.body.classList.toggle('perf', !!st.perfMode);
    document.body.classList.toggle('reduce-motion', !!st.reducedMotion);
    window.AudioFX.setVolume(st.volume !== undefined ? st.volume : 0.65);
    window.AudioFX.enabled = !st.muted;
    window.AudioFX.setMusic(!!st.music && !st.muted);
  }

  /* ---------- loop ---------- */
  let lastT = 0;
  let autosaveAcc = 0;
  let lbAcc = 0;
  let lbTimer = 90000 + Math.random() * 30000;

  function loop(now) {
    const dt = Math.min(1, (now - lastT) / 1000 || 0);
    lastT = now;

    G.tick(dt);
    UI.tick(dt);
    Fx.update(dt);
    Fx.draw();
    UI.flush();

    autosaveAcc += dt;
    if (autosaveAcc >= 15) { autosaveAcc = 0; G.save(); }

    lbAcc += dt;
    if (lbAcc >= lbTimer) {
      lbAcc = 0;
      lbTimer = 90000 + Math.random() * 30000;
      window.Leaderboard.submit(false).then(() => {
        // atualiza lista a cada ~3min sem sobrecarregar
        if (window.Leaderboard._lastFetch < Date.now() - 150000) {
          window.Leaderboard._lastFetch = Date.now();
          window.Leaderboard.refresh().catch(() => {});
        }
      });
    }

    requestAnimationFrame(loop);
  }

  /* ---------- teclado ---------- */
  function onKey(e) {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '');
    if (!typing && (e.code === 'Space' || e.code === 'Enter')) {
      e.preventDefault();
      const btn = document.getElementById('farm-btn');
      if (btn) {
        const r = btn.getBoundingClientRect();
        btn.dispatchEvent(new PointerEvent('pointerdown', {
          clientX: r.left + r.width / 2, clientY: r.top + r.height / 2, bubbles: true,
        }));
      }
    }

    // códigos secretos
    if (!typing) {
      const k = e.key;
      seq.push(k);
      if (seq.length > KONAMI.length) seq.shift();
      if (seq.join('|').toLowerCase() === KONAMI.join('|').toLowerCase()) {
        seq = [];
        G.addSecret('konami');
        UI.toast('CÓDIGO KONAMI! +1 segredo', 'secret', 5000);
        Fx.flash('#ff0000', 400);
        window.AudioFX.sfx.secret();
      }
      if (/^[a-z]$/i.test(k)) {
        typed += k.toLowerCase();
        if (typed.length > 10) typed = typed.slice(-10);
        for (const code in CODES) {
          if (typed.endsWith(code)) {
            typed = '';
            G.addSecret(CODES[code]);
            UI.toast('SEGREDO DESCOBERTO: "' + code + '"', 'secret', 5000);
            Fx.flash('#ffd700', 400);
            window.AudioFX.sfx.secret();
          }
        }
      }
    }
  }

  /* ---------- beacon do ranking no unload ---------- */
  function beaconRank() {
    const lb = window.Leaderboard;
    if (!lb || !lb.online || !lb.logged) return;
    const s = G.state;
    if (!s) return;
    const payload = JSON.stringify({
      log10: N.log10(s.totalEarned),
      prestige: s.prestige,
      evolution: s.tier,
      playtime: Math.max(0, s.playTime),
      flags: window.AC ? Math.min(10, window.AC.flags) : 0,
      departing: true,
    });
    try {
      navigator.sendBeacon('api/ranking.php', new Blob([payload], { type: 'application/json' }));
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();