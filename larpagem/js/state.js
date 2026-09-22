/* ============================================================
   THIEGO DOPAMINA FARM — state.js
   Schema do save v4, migração do save v1 (jogo antigo),
   autosave, export/import e sanitização. Código não é
   executado a partir de saves importados (JSON apenas).
   ============================================================ */
(function () {
  'use strict';
  const T = window.TDF;
  const N = window.Num;
  const Save = window.Save = {};

  const KEY = 'thiego_dopamina_farm_v4';
  const OLD_KEY = 'thiego_dopamina_farm_v1';
  const VERSION = 4;

  /* ---------- estado inicial ---------- */
  function freshState() {
    return {
      version: VERSION,
      dopamine: { m: 0, e: 0 },
      totalEarned: { m: 0, e: 0 },
      runEarned: { m: 0, e: 0 },
      bestRun: { m: 0, e: 0 },
      gens: T.GENERATORS.map(() => 0),
      upgrades: {},        // id -> nível comprado
      tree: {},            // id -> nível
      tier: 0,
      prestige: 0,
      points: 0,           // pontos de Dopamina Ascendida disponíveis
      pointsSpent: 0,
      achievements: [],
      title: null,
      secrets: { code: false, konami: false, thiega: false, gestante: false },
      counters: {
        clicks: 0, crits: 0, critStreak: 0, critStreakMax: 0,
        maxCombo: 0, buys: 0, prestiges: 0,
        earned: { m: 0, e: 0 },
        events: 0, encounters: 0,
        encDourado: 0, encBravo: 0, encSkibidi: 0, encPig: 0,
      },
      offlineTime: 0,
      playTime: 0,
      missionClaims: 0,
      stats: {
        biggestClick: { m: 0, e: 0 },
        bestDps: { m: 0, e: 0 },
        bigDopamineAtOnce: { m: 0, e: 0 },
      },
      missions: null,
      settings: {
        volume: 0.65, muted: false, music: false,
        particles: true, animations: true, perfMode: false,
        numStyle: 'auto',           // auto | sci | full
        confirmPrestige: true, confirmReset: true,
        notifications: true, reducedMotion: false,
      },
      timestamps: { startedAt: Date.now(), savedAt: Date.now() },
      migrated: false,
    };
  }

  /* ---------- sanitização (também serve para import) ---------- */
  function wrapMoney(x) { return N.fromF(x); }

  Save.sanitize = function (d) {
    const need = freshState();
    if (!d || typeof d !== 'object') return null;

    const c = d.counters = d.counters || {};
    const needC = need.counters;
    for (const k in needC) if (typeof c[k] !== 'number') c[k] = 0;
    c.earned = wrapMoney(c.earned);

    d.dopamine = wrapMoney(d.dopamine);
    d.totalEarned = wrapMoney(d.totalEarned);
    d.runEarned = wrapMoney(d.runEarned);
    d.bestRun = wrapMoney(d.bestRun);
    d.stats = d.stats || {};
    d.stats.biggestClick = wrapMoney(d.stats.biggestClick);
    d.stats.bestDps = wrapMoney(d.stats.bestDps);
    d.stats.bigDopamineAtOnce = wrapMoney(d.stats.bigDopamineAtOnce);

    if (!Array.isArray(d.gens) || d.gens.length !== T.GENERATORS.length) {
      d.gens = T.GENERATORS.map(() => 0);
    }
    d.gens = d.gens.map((g) => Math.max(0, Math.min(1e9, Math.floor(g) || 0)));

    d.upgrades = d.upgrades && typeof d.upgrades === 'object' ? d.upgrades : {};
    d.tree = d.tree && typeof d.tree === 'object' ? d.tree : {};
    for (const key of Object.keys(d.upgrades)) {
      if (!T.UPGRADES.find((u) => u.id === key)) delete d.upgrades[key];
    }
    for (const key of Object.keys(d.tree)) {
      if (!T.PRESTIGE_TREE.find((tr) => tr.id === key)) delete d.tree[key];
    }

    d.tier = Math.max(0, Math.min(T.EVOLUTIONS.length - 1, Math.floor(d.tier) || 0));
    d.prestige = Math.max(0, Math.floor(d.prestige) || 0);
    d.points = Math.max(0, Math.floor(d.points) || 0);
    d.pointsSpent = Math.max(0, Math.floor(d.pointsSpent) || 0);
    d.offlineTime = Math.max(0, d.offlineTime || 0);
    d.playTime = Math.max(0, d.playTime || 0);
    d.missionClaims = Math.max(0, Math.floor(d.missionClaims) || 0);

    if (!Array.isArray(d.achievements)) d.achievements = [];
    d.secrets = Object.assign({ code: false, konami: false, thiega: false, gestante: false }, d.secrets || {});

    d.settings = Object.assign({}, need.settings, d.settings || {});
    d.timestamps = Object.assign({}, need.timestamps, d.timestamps || {});
    return d;
  };

  /* ---------- migração do save antigo v1 ---------- */
  const LEGACY_GENS_BASE = [0.5, 4, 25, 130, 700, 4000, 22000, 110000, 550000, 3100000, 17000000];

  function migrateV1(old) {
    const s = freshState();
    s.dopamine = N.fromF(old.dopamine || 0);
    s.totalEarned = N.fromF(old.totalEarned || 0);
    // migração justa: a run atual conta como o total acumulado
    s.runEarned = N.fromF(old.totalEarned || 0);
    s.tier = Math.min(6, Math.floor(old.tier) || 0);
    s.prestige = Math.max(0, Math.floor(old.prestige) || 0);
    // 2^P antigo ≈ 1.12^N → N = P·ln2/ln1.12 ≈ 6.116P (compensa a fórmula nova)
    s.points = Math.round((Math.max(0, old.prestigePoints || 0)) * 6.116);
    s.playTime = Math.max(0, old.playTime || 0);
    s.counters.clicks = Math.max(0, Math.floor(old.clicks) || 0);
    s.counters.events = Math.max(0, Math.floor(old.eventsSeen) || 0);
    // Compensação: 1h da produção antiga vira dopamina (não destrói progresso)
    if (Array.isArray(old.owned)) {
      let comp = 0;
      old.owned.forEach((n, i) => {
        if (n > 0 && LEGACY_GENS_BASE[i]) comp += n * LEGACY_GENS_BASE[i];
      });
      comp = Math.min(1e15, comp * 60);
      if (comp > 0) {
        const bonus = N.fromF(comp);
        s.dopamine = N.add(s.dopamine, bonus);
        s.totalEarned = N.add(s.totalEarned, bonus);
        s._migrationBonus = comp;
      }
    }
    s.migrated = true;
    s.timestamps.savedAt = old.lastSave || Date.now();
    return s;
  }

  /* ---------- save / load ---------- */
  Save.save = function (state) {
    if (state._resetting) return;
    try {
      state.timestamps.savedAt = Date.now();
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) { /* quota ou privado */ }
  };

  Save.load = function () {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) {}
    if (!raw) {
      // tenta migrar do jogo antigo
      let oldRaw = null;
      try { oldRaw = localStorage.getItem(OLD_KEY); } catch (e) {}
      if (oldRaw) {
        try {
          const old = JSON.parse(oldRaw);
          const st = Save.sanitize(migrateV1(old));
          try { localStorage.removeItem(OLD_KEY); } catch (e2) {}
          return st;
        } catch (e) { return freshState(); }
      }
      return freshState();
    }
    try {
      const d = JSON.parse(raw);
      if (!d || typeof d !== 'object') return freshState();
      if (!d.version || d.version > VERSION) {
        return { _tooNew: true };
      }
      if (d.version < VERSION && d.version > 0) {
        d.version = VERSION; // migrações futuras ficariam aqui
      }
      return Save.sanitize(d);
    } catch (e) {
      return freshState();
    }
  };

  Save.export = function (state) {
    try {
      Save.save(state);
      return localStorage.getItem(KEY) || '';
    } catch (e) { return ''; }
  };

  Save.import = function (txt) {
    try {
      if (typeof txt !== 'string' || txt.length > 2_000_000) return false;
      const d = JSON.parse(txt);
      if (!d || typeof d !== 'object') return false;
      if (d.version === undefined || typeof d.version !== 'number' || d.version > VERSION) return false;
      if (d.dopamine === undefined && d.gens === undefined && d.counters === undefined) return false;
      const st = Save.sanitize(d);
      try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { return false; }
      return true;
    } catch (e) { return false; }
  };

  Save.reset = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
  };

  Save.KEY = KEY;
  Save.fresh = freshState;
})();