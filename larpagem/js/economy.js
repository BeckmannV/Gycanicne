/* ============================================================
   THIEGO DOPAMINA FARM — economy.js
   Todos os derivados: produção, clique, crítico, combo, custos,
   prestige, offline, eventos. Funções puras sobre o estado.
   Nenhum número mágico fora do registry (data.js).
   ============================================================ */
(function () {
  'use strict';
  const T = window.TDF;
  const N = window.Num;
  const Econ = window.Econ = {};

  /* ---------- helpers de upgrades ---------- */
  function upLevel(s, id, dflt) { return s.upgrades[id] || dflt || 0; }
  Econ.upLevel = upLevel;

  function upSum(s, type) {
    let total = 0;
    for (const u of T.UPGRADES) {
      if (u.effect.type !== type) continue;
      const lvl = upLevel(s, u.id);
      if (lvl > 0) total += u.effect.value * lvl;
    }
    return total;
  }
  Econ.upSum = upSum;

  function treeLevel(s, id) { return s.tree[id] || 0; }
  Econ.treeLevel = treeLevel;

  function treeSum(s, type) {
    let total = 1;
    for (const tr of T.PRESTIGE_TREE) {
      if (tr.effect.type !== type) continue;
      const lvl = treeLevel(s, tr.id);
      if (lvl > 0) total *= Math.pow(1 + tr.effect.value, lvl);
    }
    return total;
  }
  Econ.treeSum = treeSum;

  /* ---------- multiplicadores estruturais ---------- */
  Econ.evoMult = function (s) {
    let m = 1;
    for (let i = 0; i <= s.tier; i++) m *= T.EVOLUTIONS[i].mult;
    return m;
  };

  Econ.prestigeMult = function (s) {
    const base = N.pow({ m: 1.12, e: 0 }, s.points);
    const bonus = 1 + upSum(s, 'prestigeMult');
    return N.mul(base, N.fromF(bonus));
  };

  const ACH_BONUS = 0.01, ACH_SECRET_BONUS = 0.02;
  Econ.achMult = function (s) {
    let n = 0, sec = 0;
    for (const id of s.achievements) {
      const a = T.ACHIEVEMENTS.find((k) => k.id === id);
      if (!a) continue;
      if (a.secret) sec++; else n++;
    }
    return Math.pow(1 + ACH_BONUS, n) * Math.pow(1 + ACH_SECRET_BONUS, sec);
  };

  Econ.genMult = function (s) {
    const base = 1 + upSum(s, 'genMult');
    const tree = treeSum(s, 'genMult');
    return base * tree;
  };

  Econ.prodBonus = function (s) {
    // upgrades prodMult + meme (prodMult) + árvore poder (prodMult)
    const ups = 1 + upSum(s, 'prodMult');
    const tree = treeSum(s, 'prodMult');
    // perEvo: (1+v)^lvl por evolução possuída (tier+1)
    let perEvo = 1;
    const evoCount = s.tier + 1;
    for (const u of T.UPGRADES) {
      if (u.effect.type === 'perEvo') {
        const lvl = upLevel(s, u.id);
        if (lvl > 0) perEvo *= Math.pow(1 + u.effect.value * lvl, evoCount);
      }
    }
    return ups * tree * perEvo;
  };

  Econ.costRed = function (s) {
    const ups = 1 - upSum(s, 'costRed');
    const tree = treeSum(s, 'costRed'); // 0.93^n multiplicativo
    return Math.max(0.25, ups * tree);
  };

  Econ.evoCostRed = function (s) {
    return Math.max(0.25, (1 - upSum(s, 'evoCost')) * Econ.costRed(s));
  };

  /* ---------- geradores ---------- */
  Econ.milestoneMult = function (level) {
    let m = 1;
    for (const ms of T.MILESTONES) if (level >= ms) m *= T.MILESTONE_MULT;
    return m;
  };

  Econ.genCost = function (s, i, n) {
    const g = T.GENERATORS[i];
    const owned = s.gens[i];
    const single = N.fromF(g.baseCost);
    if (n === 1) {
      const c = N.mul(single, N.pow({ m: g.growth, e: 0 }, owned));
      return N.mul(c, N.fromF(Econ.costRed(s)));
    }
    // soma geométrica: cost * (g^n - 1)/(g - 1)
    const gr = N.pow({ m: g.growth, e: 0 }, owned);
    const grN = N.pow({ m: g.growth, e: 0 }, n);
    const sum = N.div(N.sub(grN, N.one), N.sub({ m: g.growth, e: 0 }, N.one));
    return N.mul(N.mul(single, gr), N.mul(sum, N.fromF(Econ.costRed(s))));
  };

  Econ.maxGenBuy = function (s, i) {
    const g = T.GENERATORS[i];
    const owned = s.gens[i];
    const dop = s.dopamine;
    const cost = N.mul(N.fromF(g.baseCost), N.pow({ m: g.growth, e: 0 }, owned));
    const red = N.fromF(Econ.costRed(s));
    const c = N.mul(cost, red);
    if (N.lte(dop, c)) return 0;
    // n = floor( log_g( 1 + dop*(g-1)/c ) )
    const g1 = g.growth - 1;
    const ratio = N.div(N.mul(dop, N.fromF(g1)), c);
    const inner = N.add(N.one, ratio);
    const n = Math.floor(N.log10(inner) / Math.log10(g.growth));
    return Math.max(0, Math.min(1e6, n));
  };

  Econ.genDps = function (s) {
    const gm = Econ.genMult(s);
    let total = N.zero;
    T.GENERATORS.forEach((g, i) => {
      const lvl = s.gens[i];
      if (lvl <= 0) return;
      const prod = N.mul(N.fromF(g.baseProd * Econ.milestoneMult(lvl)), N.fromF(lvl));
      total = N.add(total, prod);
    });
    return N.mul(total, N.fromF(gm));
  };

  // dps por unidade de um gerador específico (para exibição)
  Econ.genUnitDps = function (s, i) {
    const g = T.GENERATORS[i];
    const lvl = s.gens[i];
    const prod = N.fromF(g.baseProd * Econ.milestoneMult(lvl));
    return N.mul(prod, N.fromF(Econ.genMult(s)));
  };

  /* ---------- eventos (runtime) ---------- */
  Econ.eventProdMult = function (runtime) {
    let m = 1;
    if (!runtime || !runtime.events) return m;
    const now = Date.now();
    for (const ev of runtime.events) {
      if (ev.end > now && ev.prod) m *= ev.prod;
    }
    return m;
  };
  Econ.eventClickMult = function (runtime) {
    let m = 1;
    if (!runtime || !runtime.events) return m;
    const now = Date.now();
    for (const ev of runtime.events) {
      if (ev.end > now && ev.click) m *= ev.click;
    }
    return m;
  };
  Econ.eventGlitch = function (runtime) {
    if (!runtime || !runtime.events) return false;
    const now = Date.now();
    return runtime.events.some((ev) => ev.end > now && ev.glitch);
  };

  /* ---------- produção global ---------- */
  Econ.globalMult = function (s, runtime) {
    const evo = N.fromF(Econ.evoMult(s));
    const pres = Econ.prestigeMult(s);
    const ach = N.fromF(Econ.achMult(s));
    const bonus = N.fromF(Econ.prodBonus(s));
    const evt = N.fromF(Econ.eventProdMult(runtime));
    let m = N.mul(evo, pres);
    m = N.mul(m, ach);
    m = N.mul(m, bonus);
    m = N.mul(m, evt);
    return m;
  };

  Econ.dps = function (s, runtime) {
    const gen = Econ.genDps(s);
    return N.mul(gen, Econ.globalMult(s, runtime));
  };

  /* ---------- clique ---------- */
  Econ.comboWindow = function (s) { return 2600 + upSum(s, 'comboTime'); };
  Econ.comboCap = function (s) { return 25 + upSum(s, 'comboCap'); };
  Econ.comboMult = function (s, combo) {
    const cap = Econ.comboCap(s);
    const m = 1 + Math.max(0, (combo || 0) - 1) * 0.1;
    return Math.min(cap, m);
  };
  Econ.critChance = function (s) {
    return Math.min(0.6, 0.05 + upSum(s, 'critChance') + 0.02 * treeLevel(s, 'transcendencia'));
  };
  Econ.critMult = function (s) {
    return 3 + upSum(s, 'critMult');
  };
  Econ.clickPower = function (s, runtime, combo) {
    const base = 1 + upSum(s, 'clickMult');
    const treeClick = Math.pow(1.4, treeLevel(s, 'transcendencia'));
    let power = N.fromF(base * treeClick);
    power = N.mul(power, N.fromF(Econ.comboMult(s, combo)));
    power = N.mul(power, N.fromF(Econ.eventClickMult(runtime)));
    power = N.mul(power, Econ.globalMult(s, runtime));
    // share do dps no clique
    const share = upSum(s, 'clickShare');
    if (share > 0) {
      power = N.add(power, N.mul(Econ.dps(s, runtime), N.fromF(share)));
    }
    return power;
  };

  /* ---------- evolução ---------- */
  Econ.evoCost = function (s, tierIndex) {
    const c = T.EVOLUTIONS[tierIndex].cost;
    if (c === 0) return N.zero;
    return N.mul(N.fromF(c), N.fromF(Econ.evoCostRed(s)));
  };
  Econ.nextTier = function (s) {
    const t = s.tier + 1;
    return t < T.EVOLUTIONS.length ? t : null;
  };

  /* ---------- prestige ---------- */
  // Ganho LINEAR no log10 do que a RUN atual produziu (runEarned): cada
  // década de dopamina na run rende PRESTIGE_EXP pontos fixos. Sub-linear.
  // Para convergir (nada de Infinity), o limiar de ascensão cresce MAIS
  // rápido que o multiplicador: precisa de runEarned ≥ 1e12 × mult^1.5,
  // então cada ciclo exige uma run progressivamente mais funda e o total
  // de pontos se estabiliza num valor finito.
  const PRESTIGE_BASE_LOG = 12;      // 1e12 dopamina na run
  const PRESTIGE_EXP = 0.6;
  const PRESTIGE_THRESHOLD_EXP = 1.5; // expoente do mult no limiar (deve ser > 1)
  let MULT_PER_POINT = 1.12;
  Econ.PRESTIGE_BASE_LOG = PRESTIGE_BASE_LOG;
  Econ.prestigeGain = function (s) {
    const src = s.runEarned || s.totalEarned;
    const logT = N.log10(src);
    if (logT < PRESTIGE_BASE_LOG) return N.zero;
    const raw = PRESTIGE_EXP * (logT - PRESTIGE_BASE_LOG);
    const mult = 1 + upSum(s, 'prestigeGain');
    return N.floor(N.fromF(raw * mult));
  };
  // dopamina da run necessária para ascender: 1e12 × mult^PRESTIGE_THRESHOLD_EXP
  Econ.prestigeNeed = function (s) {
    const multLog = N.log10(Econ.prestigeMult(s));
    const needLog = PRESTIGE_BASE_LOG + PRESTIGE_THRESHOLD_EXP * multLog;
    return N.fromF(Math.pow(10, Math.min(Math.max(needLog, 0), 300)));
  };
  Econ.canPrestige = function (s) {
    return N.gte(s.runEarned, Econ.prestigeNeed(s)) && N.gte(Econ.prestigeGain(s), N.one);
  };
  Econ.multWithPoints = function (points) { return N.pow({ m: MULT_PER_POINT, e: 0 }, points); };

  // mult resultante se o jogador ascender ganhando gainedPoints pontos
  Econ.prestigeMultAfter = function (s, gainedPoints) {
    return N.mul(Econ.prestigeMult(s), Econ.multWithPoints(Math.max(1, Math.floor(gainedPoints))));
  };

  // segundos até ascender (Infinity se impossível) — calculado em log-space
  Econ.secsToPrestige = function (s, runtime) {
    const upMult = Math.max(0.01, PRESTIGE_EXP * (1 + upSum(s, 'prestigeGain')));
    const g = N.toF(Econ.prestigeGain(s));
    const cur = Math.max(0, N.log10(s.runEarned || s.totalEarned));
    let needLog;
    if (!(g >= 1)) {
      needLog = PRESTIGE_BASE_LOG + 1 / upMult; // log10 para ganhar o 1º ponto
    } else {
      needLog = Math.max(
        PRESTIGE_BASE_LOG + (Math.floor(g) + 1) / upMult,                     // próximo ponto
        PRESTIGE_BASE_LOG + PRESTIGE_THRESHOLD_EXP * N.log10(Econ.prestigeMult(s)) // limiar
      );
    }
    if (needLog <= cur) return 0;
    const dps = N.toF(Econ.dps(s, runtime));
    if (!(dps > 0)) return Infinity;
    const step = Math.pow(10, needLog - cur);
    return Math.max(0, (step - 1) * Math.pow(10, cur) / dps);
  };

  /* ---------- offline ---------- */
  Econ.offlineEff = function (s) {
    return Math.min(1, 0.35 + upSum(s, 'offlineEff') + 0.1 * treeLevel(s, 'offline'));
  };
  Econ.offlineCap = function (s) {
    return (8 + 4 * treeLevel(s, 'offline')) * 3600 + upSum(s, 'offlineCap') * 3600;
  };

  /* ---------- eventos (frequência) ---------- */
  Econ.eventInterval = function (s, baseMin, baseMax) {
    let freq = Math.max(0.2, 1 - upSum(s, 'eventFreq'));
    const evtTree = treeLevel(s, 'eventos');
    freq *= Math.pow(0.85, evtTree);
    return [baseMin * freq, baseMax * freq];
  };
  Econ.eventDurMult = function (s) {
    return 1 + upSum(s, 'eventDur') + 0.15 * treeLevel(s, 'eventos');
  };
  Econ.eventRewardMult = function (s) {
    return 1 + upSum(s, 'eventReward') + 0.25 * treeLevel(s, 'eventos');
  };

  /* ---------- breakdown (tooltip) ---------- */
  Econ.breakdown = function (s, runtime) {
    return {
      base: Econ.genDps(s),
      evo: N.fromF(Econ.evoMult(s)),
      prestige: Econ.prestigeMult(s),
      achievements: N.fromF(Econ.achMult(s)),
      upgrades: N.fromF(Econ.prodBonus(s)),
      event: N.fromF(Econ.eventProdMult(runtime)),
      total: Econ.dps(s, runtime),
    };
  };
})();