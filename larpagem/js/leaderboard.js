/* ============================================================
   THIEGO DOPAMINA FARM — leaderboard.js
   Ranking GLOBAL real via api/ranking.php (sessão Gycanic).
   Sem login → MODO LOCAL explícito (localStorage), nunca finge
   que está online. Métrica: DOPAMINA TOTAL PRODUZIDA (log10).
   ============================================================ */
(function () {
  'use strict';
  const N = window.Num;
  const AC = window.AC;
  const LB = window.Leaderboard = {
    online: false,       // servidor respondeu?
    logged: false,       // usuário logado no Gycanic?
    list: [],
    me: null,
    bestRank: null,      // melhor posição global já vista (persistido)
    localRank: null,     // posição no modo local
    mode: 'global',
    sort: 'score',
    _lastSubmitAt: 0,
    _lastFetch: 0,
  };

  const LOCAL_KEY = 'tdf_rank_local';

  function localEntries() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function saveLocal(entries) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, 500))); } catch (e) {}
  }

  LB.refresh = function (opts) {
    if (opts) {
      LB.mode = opts.mode || LB.mode;
      LB.sort = opts.sort || LB.sort;
    }
    const q = 'api/ranking.php?mode=' + encodeURIComponent(LB.mode) + '&sort=' + encodeURIComponent(LB.sort);
    return fetch(q, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('http_' + r.status);
        return r.json();
      })
      .then((data) => {
        if (!data || !data.ok) throw new Error('bad');
        LB.online = true;
        LB.logged = !!data.logged;
        LB.list = Array.isArray(data.list) ? data.list : [];
        LB.me = data.me && data.me.rank ? data.me : null;
        if (LB.me) {
          if (!LB.bestRank || LB.me.rank < LB.bestRank) LB.bestRank = LB.me.rank;
          try { localStorage.setItem('tdf_best_rank', String(LB.bestRank)); } catch (e) {}
        }
        window.Game && window.Game.checkAchievements(true);
        window.UI && window.UI.renderRanking();
        return data;
      })
      .catch(() => {
        LB.online = false;
        LB.logged = false;
        const entries = localEntries();
        const my = N.fromF(window.Game.state.totalEarned);
        const myLog = N.log10(my);
        const better = entries.filter((e) => e.log10 > myLog).length;
        LB.localRank = better + 1;
        LB.list = entries.slice(0, 50).map((e, i) => ({ rank: i + 1, name: e.name, log10: e.log10, prestige: e.prestige, evolution: e.evolution, local: true }));
        // posiciona "você" na lista local
        LB.me = { rank: LB.localRank, name: 'Você', log10: myLog, prestige: window.Game.state.prestige, evolution: window.Game.state.tier, local: true };
        window.UI && window.UI.renderRanking();
        return { ok: true, online: false };
      });
  };

  LB.submit = function (force) {
    const s = window.Game && window.Game.state;
    if (!s) return Promise.resolve(null);
    const now = Date.now();
    if (!force && now - LB._lastSubmitAt < 90000) return Promise.resolve(null);
    LB._lastSubmitAt = now;

    const myLog = N.log10(s.totalEarned);
    AC.sample(myLog);

    const payload = {
      log10: myLog,
      prestige: s.prestige,
      evolution: s.tier,
      playtime: Math.max(0, s.playTime),
      flags: AC.flags > 0 ? Math.min(10, AC.flags) : 0,
    };

    // Modo local: salva em localStorage claramente rotulado como local.
    if (!LB.online || !LB.logged) {
      const entries = localEntries();
      entries.unshift({
        name: 'Você', log10: payload.log10, prestige: payload.prestige,
        evolution: payload.evolution, t: now,
      });
      const seen = new Set();
      const uniq = [];
      for (const e of entries) {
        const k = e.log10 + '|' + e.prestige;
        if (seen.has(k)) continue;
        seen.add(k);
        uniq.push(e);
      }
      uniq.sort((a, b) => b.log10 - a.log10);
      saveLocal(uniq);
      LB.list = uniq.slice(0, 50).map((e, i) => ({ rank: i + 1, name: e.name, log10: e.log10, prestige: e.prestige, evolution: e.evolution, local: true }));
      const better = uniq.filter((e) => e.log10 > payload.log10).length;
      LB.localRank = better + 1;
      LB.me = { rank: LB.localRank, name: 'Você', log10: payload.log10, prestige: payload.prestige, evolution: payload.evolution, local: true };
      window.UI && window.UI.renderRanking();
      return Promise.resolve({ ok: true, local: true });
    }

    return fetch('api/ranking.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    })
      .then((r) => (r.ok ? r.json() : r.json().then((j) => { throw new Error(j.error || 'http'); })))
      .then((data) => data)
      .catch((err) => {
        // servidor recusou: cai para modo local honesto
        if (!LB._failedOnce) {
          LB._failedOnce = true;
          LB.online = false; LB.logged = false;
        }
        return { ok: false, error: String(err && err.message || err) };
      });
  };

  LB.bestRankFromStorage = function () {
    try {
      const v = parseInt(localStorage.getItem('tdf_best_rank'), 10);
      LB.bestRank = isFinite(v) && v > 0 ? v : null;
    } catch (e) {}
  };

  // formata um score log10 para exibição
  LB.fmtScore = function (log10) {
    if (!isFinite(log10) || log10 <= 0) return '0';
    const v = N.fromLog10(log10);
    return N.fmt(v);
  };
})();