/* ============================================================
   THIEGO DOPAMINA FARM — game.js
   Ações do jogador, loop principal, combo, crítico, eventos,
   encontros, prestige, misses, conquistas, títulos e
   offline. Toda a mutação do estado passa por aqui.
   ============================================================ */
(function () {
  'use strict';
  const T = window.TDF;
  const N = window.Num;
  const Econ = window.Econ;
  const G = window.Game = {};

  const RUNTIME = {
    events: [],          // eventos ativos
    lastEventAt: 0,
    nextEventIn: 30000,
    encCooldown: {},     // id -> próxima vez permitida
    idleSince: Date.now(),
    offline: null,       // {elapsed, gain} do retorno
    combo: 0,
    comboT: 0,
    humor: null,
    humorT: 0,
    hist: [],            // histórico curto {t, d, m} p/ gráfico de produção
  };
  G.runtime = RUNTIME;

  /* ============================================================
     UTILIDADES de ganho
     ============================================================ */
function earn(state, amount) {
    if (amount.m === 0) return;
    state.dopamine = N.add(state.dopamine, amount);
    state.totalEarned = N.add(state.totalEarned, amount);
    state.runEarned = N.add(state.runEarned, amount);
    state.counters.earned = N.add(state.counters.earned, amount);
    if (N.gt(state.dopamine, state.bestRun)) state.bestRun = state.dopamine;
    if (N.gt(state.dopamine, state.stats.bigDopaminaAtOnce)) state.stats.bigDopaminaAtOnce = state.dopamine;
  }

  G.earn = earn;

  /* ============================================================
     CLIQUE
     ============================================================ */
  G.click = function () {
    const s = G.s;
    RUNTIME.comboT = Econ.comboWindow(s);
    RUNTIME.combo = (RUNTIME.combo || 0) + 1;
    if (RUNTIME.combo > 1e6) RUNTIME.combo = 1e6;

    const ch = Econ.critChance(s);
    const crit = Math.random() < ch;
    let gain = Econ.clickPower(s, RUNTIME, RUNTIME.combo);
    if (crit) {
      gain = N.mul(gain, N.fromF(Econ.critMult(s)));
      s.counters.crits++;
      s.counters.critStreak++;
      if (s.counters.critStreak > s.counters.critStreakMax) s.counters.critStreakMax = s.counters.critStreak;
    } else {
      s.counters.critStreak = 0;
    }

    earn(s, gain);
    s.counters.clicks++;
    if (RUNTIME.combo > s.counters.maxCombo) s.counters.maxCombo = RUNTIME.combo;
    if (N.gt(gain, s.stats.biggestClick)) s.stats.biggestClick = gain;

    // encontro BRAVO: cliques extras durante o evento
    for (const ev of RUNTIME.events) {
      if (ev.end > Date.now() && ev.clickBoost) {
        const extra = N.mul(Econ.clickPower(s, RUNTIME, RUNTIME.combo), N.fromF(ev.clickBoost));
        earn(s, extra);
        gain = N.add(gain, extra);
      }
    }

    RUNTIME.idleSince = Date.now();
    return { gain, crit, combo: RUNTIME.combo, critStreak: s.counters.critStreak };
  };

  /* ============================================================
     GERADORES / UPGRADES
     ============================================================ */
  G.buyGen = function (i, n) {
    const s = G.s;
    if (i < 0 || i >= T.GENERATORS.length) return false;
    n = Math.max(1, Math.floor(n));
    const cost = Econ.genCost(s, i, n);
    if (N.lt(s.dopamine, cost)) return false;
    s.dopamine = N.sub(s.dopamine, cost);
    s.gens[i] += n;
    s.counters.buys += n;
    return true;
  };

  G.buyUpgrade = function (id) {
    const s = G.s;
    const u = T.UPGRADES.find((k) => k.id === id);
    if (!u) return false;
    const lvl = s.upgrades[id] || 0;
    if (lvl >= (u.effect.maxLevel || 1)) return false;
    const cost = N.mul(N.fromF(u.cost), N.fromF(Econ.costRed(s)));
    if (N.lt(s.dopamine, cost)) return false;
    s.dopamine = N.sub(s.dopamine, cost);
    s.upgrades[id] = lvl + 1;
    s.counters.buys++;
    return true;
  };

  G.canBuyUpgrade = function (id) {
    const s = G.s;
    const u = T.UPGRADES.find((k) => k.id === id);
    if (!u) return { ok: false, reason: 'none' };
    const lvl = s.upgrades[id] || 0;
    if (lvl >= (u.effect.maxLevel || 1)) return { ok: false, reason: 'max' };
    const cost = N.mul(N.fromF(u.cost), N.fromF(Econ.costRed(s)));
    if (N.lt(s.dopamine, cost)) return { ok: false, reason: 'cost', cost };
    return { ok: true, cost };
  };

  /* ============================================================
     EVOLUÇÃO
     ============================================================ */
  G.evolve = function () {
    const s = G.s;
    const t = Econ.nextTier(s);
    if (t === null) return null;
    const cost = Econ.evoCost(s, t);
    if (N.lt(s.dopamine, cost)) return null;
    s.dopamine = N.sub(s.dopamine, cost);
    s.tier = t;
    return t;
  };

  /* ============================================================
     PRESTIGE (infinito, fórmula genérica)
     ============================================================ */
  G.prestige = function () {
    const s = G.s;
    if (!Econ.canPrestige(s)) return null;
    const gain = Econ.prestigeGain(s);
    const g = N.toF(gain);
    const multBefore = Econ.prestigeMult(s);
    s.points += Math.max(1, Math.floor(g));
    s.pointsSpent += 0;
    s.prestige++;
    s.counters.prestiges++;
    s.dopamine = N.zero;
    s.bestRun = N.zero;
    s.runEarned = N.zero;
    s.gens = T.GENERATORS.map(() => 0);
    s.upgrades = {};
    s.tier = 0;
    RUNTIME.combo = 0; RUNTIME.comboT = 0;
    RUNTIME.events = [];
    s.timestamps.lastPrestigeAt = Date.now();
    const multAfter = Econ.prestigeMult(s);
    const r = {
      gained: g,
      multBefore,
      multAfter,
      perPoint: 1.12,
      quote: T.HUMOR_PRESTIGE[(Math.random() * T.HUMOR_PRESTIGE.length) | 0],
    };
    G.save();
    return r;
  };

  /* ============================================================
     ÁRVORE DE PRESTIGE
     ============================================================ */
  G.buyTree = function (id) {
    const s = G.s;
    const tr = T.PRESTIGE_TREE.find((k) => k.id === id);
    if (!tr) return false;
    const lvl = s.tree[id] || 0;
    if (lvl >= tr.max) return false;
    const cost = tr.levels[lvl];
    if (s.points < cost) return false;
    s.points -= cost;
    s.pointsSpent += cost;
    s.tree[id] = lvl + 1;
    return true;
  };

  /* ============================================================
     TÍTULO
     ============================================================ */
  G.equipTitle = function (id) {
    const s = G.s;
    if (id === null) { s.title = null; return true; }
    const t = T.TITLES.find((k) => k.id === id);
    if (!t) return false;
    const ctx = G.buildCtx();
    if (!t.check(s, ctx)) return false;
    s.title = id;
    return true;
  };

  /* ============================================================
     CONQUISTAS
     ============================================================ */
  G.buildCtx = function () {
    const s = G.s;
    const lb = window.Leaderboard || {};
    return {
      evoMult: Econ.evoMult(s),
      dps: Econ.dps(s, RUNTIME),
      rankBest: lb.bestRank || 9999,
      lbOnline: !!lb.online,
      localTop: lb.localRank || 9999,
      missionsClaimed: s.missionClaims || 0,
      achAll: T.ACHIEVEMENTS.every((a) => s.achievements.includes(a.id)),
    };
  };

  G.checkAchievements = function (silent) {
    const s = G.s;
    const ctx = G.buildCtx();
    const fresh = [];
    for (const a of T.ACHIEVEMENTS) {
      if (s.achievements.includes(a.id)) continue;
      let ok = false;
      try { ok = a.check(s, ctx); } catch (e) { ok = false; }
      if (ok) {
        s.achievements.push(a.id);
        fresh.push(a);
      }
    }
    if (fresh.length && !silent) {
      window.UI && window.UI.achievementToasts(fresh);
      try { window.AudioFX && AudioFX.sfx.achievement(); } catch (e) {}
    }
    return fresh;
  };

  /* ============================================================
     MISSÕES
     ============================================================ */
  function dayKey() {
    const d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function weekKey() {
    const d = new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return d.getFullYear() + '-W' + d.getMonth() + '-' + d.getDate();
  }

  function pickMissions(s, pool, n) {
    const arr = pool.slice();
    const out = [];
    while (arr.length && out.length < n) {
      const i = (Math.random() * arr.length) | 0;
      out.push(arr.splice(i, 1)[0]);
    }
    return out;
  }

  function prepMissions(s) {
    if (!s.missions || s.missions.dailyKey !== dayKey() || s.missions.weekKey !== weekKey()) {
      const base = G.buildCtx();
      s.missions = {
        dailyKey: dayKey(), weekKey: weekKey(),
        daily: pickMissions(s, T.MISSION_POOL.daily, 3).map((m) => ({ id: m.id, baseline: paddedBase(base), claimed: false })),
        weekly: pickMissions(s, T.MISSION_POOL.weekly, 2).map((m) => ({ id: m.id, baseline: paddedBase(base), claimed: false })),
        special: null,
      };
    }
    if (!s.missions.special || s.missions.specialKey !== dayKey()) {
      const sp = pickMissions(s, T.MISSION_POOL.special, 1)[0];
      s.missions.specialKey = dayKey();
      s.missions.special = { id: sp.id, baseline: paddedBase(G.buildCtx()), claimed: false };
    }
  }
  function paddedBase(ctx) {
    return {
      clicks: 0, earned: N.zero, buys: 0, crits: 0, events: 0,
      prestiges: 0, encDourado: 0, combo: 0, gens: 0,
    };
  }

  G.missionProgress = function (m, s) {
    const def = findMissionDef(m.id);
    if (!def) return { cur: 0, target: 1, done: false };
    const track = def.track;
    let cur = 0;
    if (track === 'clicks') cur = s.counters.clicks - (m.baseline && m.baseline.clicks || 0);
    else if (track === 'earned') cur = N.toF(N.sub(s.counters.earned, m.baseline.earned));
    else if (track === 'buys') cur = s.counters.buys - (m.baseline && m.baseline.buys || 0);
    else if (track === 'crits') cur = s.counters.crits - (m.baseline && m.baseline.crits || 0);
    else if (track === 'events') cur = s.counters.events - (m.baseline && m.baseline.events || 0);
    else if (track === 'prestiges') cur = s.counters.prestiges - (m.baseline && m.baseline.prestiges || 0);
    else if (track === 'encDourado') cur = s.counters.encDourado - (m.baseline && m.baseline.encDourado || 0);
    else if (track === 'combo') cur = s.counters.maxCombo;
    else if (track === 'gens') cur = s.gens.reduce((a, b) => a + b, 0) - (m.baseline && m.baseline.gens || 0);
    cur = Math.max(0, Math.floor(cur));
    const target = def.target;
    return { cur, target, done: cur >= target };
  };
  function findMissionDef(id) {
    for (const poolKey of ['daily', 'weekly', 'special']) {
      const f = T.MISSION_POOL[poolKey].find((m) => m.id === id);
      if (f) return f;
    }
    return null;
  }

  G.claimMission = function (kind, idx) {
    const s = G.s;
    prepMissions(s);
    const group = s.missions[kind];
    const m = group && (kind === 'special' ? group : group[idx]);
    if (!m || m.claimed) return false;
    const prog = G.missionProgress(m, s);
    if (!prog.done) return false;
    const def = findMissionDef(m.id);
    m.claimed = true;
    s.missionClaims++;
    const rewardDopa = def.reward && def.reward.dopa !== undefined
      ? N.mul(Econ.dps(s, RUNTIME), N.fromF(def.reward.dopa))
      : null;
    if (rewardDopa) earn(s, rewardDopa);
    if (def.reward && def.reward.points !== undefined) s.points += def.reward.points;
    G.checkAchievements();
    return { dopa: rewardDopa, points: def.reward && def.reward.points };
  };

  /* ============================================================
     EVENTOS E ENCONTROS
     ============================================================ */
  function spawnEvent() {
    const s = G.s;
    const pool = T.EVENTS;
    const ev = pool[(Math.random() * pool.length) | 0];
    const now = Date.now();
    const durMult = Econ.eventDurMult(s);
    const rewardMult = Econ.eventRewardMult(s);
    const active = { id: ev.id, text: ev.text, icon: ev.icon, start: now, end: now + ev.time * 1000 * durMult, evt: ev };
    if (ev.instant) {
      const fx = N.mul(Econ.dps(s, RUNTIME), N.fromF(ev.instant * rewardMult));
      earn(s, fx);
      active.instantGain = fx;
    }
    if (ev.time > 0) RUNTIME.events.push(active);
    if (RUNTIME.events.length > 8) RUNTIME.events = RUNTIME.events.slice(-6);
    s.counters.events++;
    G.checkAchievements();
    try { window.AudioFX && AudioFX.sfx.event(); } catch (e) {}
    return active;
  }

  function canNight(time, chance, cd) {
    if (Date.now() < cd) return false;
    if (chance <= 0) return false;
    return Math.random() < chance / 100;
  }

  function spawnEncounter(force) {
    const s = G.s;
    const now = Date.now();
    const candidates = [];
    // dormindo: só se idle ≥ 5min
    if (now - RUNTIME.idleSince >= 300000) {
      const d = T.ENCOUNTERS.find((e) => e.id === 'dormindo');
      if (canNight(now, d.chance * 40, RUNTIME.encCooldown.dormindo || 0)) candidates.push(d);
    }
    // pig: gated por cliques
    if (s.counters.clicks >= 2_500_000) {
      const p = T.ENCOUNTERS.find((e) => e.id === 'pig');
      candidates.push(p);
    }
    const normal = T.ENCOUNTERS.filter((e) => e.id !== 'dormindo' && e.id !== 'pig');
    for (const e of normal) {
      if (canNight(now, e.chance, RUNTIME.encCooldown[e.id] || 0)) candidates.push(e);
    }
    if (force) {
      const any = T.ENCOUNTERS.filter((e) => e.id !== 'dormindo');
      if (candidates.length === 0) candidates.push(any[(Math.random() * any.length) | 0]);
    }
    if (candidates.length === 0) return null;
    const enc = candidates[(Math.random() * candidates.length) | 0];
    RUNTIME.encCooldown[enc.id] = now + enc.cooldown * 1000;
    const durMult = Econ.eventDurMult(s);
    const rewardMult = Econ.eventRewardMult(s);
    const active = {
      id: enc.id, encounter: enc, name: enc.name, img: T.asset(enc.img),
      start: now, end: now + (enc.time ? enc.time * 1000 * durMult : 0),
      quote: enc.quote,
    };
    if (enc.instant) {
      const fx = N.mul(Econ.dps(s, RUNTIME), N.fromF(enc.instant * rewardMult));
      earn(s, fx);
      active.instantGain = fx;
    }
    if (enc.time > 0) RUNTIME.events.push(active);
    s.counters.encounters++;
    if (enc.id === 'dourado') s.counters.encDourado++;
    if (enc.id === 'bravo') s.counters.encBravo++;
    if (enc.id === 'skibidi') s.counters.encSkibidi++;
    if (enc.id === 'pig') s.counters.encPig++;

    // segredos especiais
    if (enc.id === 'skibidi') { s.secrets.skibidi = true; G.addSecret('skibidi'); }
    if (enc.id === 'pig') { s.secrets.pig = true; G.addSecret('pig'); }
    if (enc.id === 'dormindo') { s.secrets.dormindo = true; }
    G.checkAchievements();
    try { window.AudioFX && AudioFX.sfx.encounter(); } catch (e) {}
    return active;
  }

  G.addSecret = function (flag) {
    const s = G.s;
    if (s.secrets[flag]) return;
    s.secrets[flag] = true;
    G.checkAchievements();
  };

  /* ============================================================
     LOOP PRINCIPAL
     ============================================================ */
  G.tick = function (dt) {
    const s = G.s;
    if (!s) return;

    const dps = Econ.dps(s, RUNTIME);
    const gain = N.mul(dps, N.fromF(dt));
    earn(s, gain);
    s.playTime += dt;
    s.timestamps.savedAt = Date.now();

    // combo decay
    RUNTIME.comboT -= dt * 1000;
    if (RUNTIME.comboT <= 0) { RUNTIME.comboT = 0; RUNTIME.combo = 0; }

    // eventos
    RUNTIME.nextEventIn -= dt * 1000;
    if (RUNTIME.nextEventIn <= 0) {
      const [mn, mx] = Econ.eventInterval(s, 40000, 80000);
      RUNTIME.nextEventIn = mn + Math.random() * (mx - mn);
      if (Math.random() < 0.35) {
        const enc = spawnEncounter(false);
        if (enc) window.UI && window.UI.showEncounter(enc);
        else spawnEvent();
      } else {
        spawnEvent();
      }
    }

    // humor
    RUNTIME.humorT -= dt;
    if (RUNTIME.humorT <= 0) {
      RUNTIME.humorT = 6 + Math.random() * 4;
      const pool = N.gte(dps, 1e12) ? T.HUMOR_ABSURD : T.HUMOR;
      RUNTIME.humor = pool[(Math.random() * pool.length) | 0];
    }

    // check periódico
    G._checkT = (G._checkT || 0) + dt;
    if (G._checkT >= 2) {
      G._checkT = 0;
      G.checkAchievements();
      prepMissions(s);
    }
  };

  /* ============================================================
     OFFLINE — calculado na carga
     ============================================================ */
  G.applyOffline = function (state, elapsed) {
    const cap = Econ.offlineCap(state);
    const eff = Econ.offlineEff(state);
    const clamped = Math.min(cap, Math.max(0, elapsed));
    if (clamped < 5) return null;
    try {
      const gain = N.mul(Econ.dps(state, []), N.fromF(clamped * eff));
      if (gain.m > 0) {
        earn(state, gain);
        state.offlineTime += clamped;
        RUNTIME.offline = { elapsed: clamped, gain, eff };
        G.save();
        return RUNTIME.offline;
      }
    } catch (e) {}
    return null;
  };

  /* ============================================================
     CONFIG
     ============================================================ */
  G.setSetting = function (key, value) {
    G.s.settings[key] = value;
    if (key === 'perfMode') document.body.classList.toggle('perf', !!value);
    if (key === 'reducedMotion') document.body.classList.toggle('reduce-motion', !!value);
    if (key === 'particles') { try { window.Fx.setParticles(!!value); } catch (e) {} }
    G.save();
    return true;
  };

  /* ---------- persistência ---------- */
  G.state = null;
  Object.defineProperty(G, 's', { get: () => G.state });

  G.save = function () { window.Save.save(G.state); };
  G.load = function () {
    G.state = window.Save.load();
    if (G.state && G.state._tooNew) return 'tooNew';
    prepMissions(G.state);
    G.checkAchievements(true);
    return G.state;
  };
})();