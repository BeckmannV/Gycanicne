/* ============================================================
   THIEGO DOPAMINA FARM — ui.js
   Toda a interface: 11 abas, HUD, modais, toasts, overlay de
   encontros, ranking. Re-render é leve: HUD em ~10fps, demais
   listas somente quando mudam (ou ao trocar de aba).
   ============================================================ */
(function () {
  'use strict';
  const T = window.TDF;
  const N = window.Num;
  const Econ = window.Econ;
  const G = window.Game;
  const Fx = window.Fx;
  const UI = window.UI = {};

  const TABS = [
    ['farm', 'FARMAR'], ['upgrades', 'UPGRADES'], ['generators', 'GERADORES'],
    ['evolutions', 'EVOLUÇÕES'], ['prestige', 'PRESTIGE'], ['achievements', 'CONQUISTAS'],
    ['missions', 'MISSÕES'], ['ranking', 'RANKING'], ['profile', 'PERFIL'],
    ['stats', 'ESTATÍSTICAS'], ['settings', 'CONFIG'],
  ];

  let root, hud, content;
  let selectedTab = 'farm';
  let lastHud = {};

  /* ============================================================
     MONTAGEM
     ============================================================ */
  UI.init = function () {
    root = document.getElementById('app');
    root.innerHTML = '';
    root.appendChild(buildHeader());
    root.appendChild(buildTabs());
    root.appendChild(buildContent());
    for (const [id, label] of TABS) buildTab(id, label);
    UI.switchTab(selectedTab);
  };

  function buildHeader() {
    const h = el('div', 'tdf-header');
    h.innerHTML =
      '<div class="hud-top">' +
      '  <div class="hud-money"><span class="hud-label">DOPAMINA</span>' +
      '    <div class="hud-value" id="hud-dopa">0</div>' +
      '    <div class="hud-dps-wrap" tabindex="0" role="tooltip" aria-label="detalhes da produção por segundo">' +
      '      <span class="hud-sub" id="hud-dps">0/s</span>' +
      '      <div class="tip-box" id="dps-tip" role="region" aria-label="quebra da produção"></div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="hud-topright" id="hud-topright"></div>' +
      '</div>' +
      '<div class="hud-meters">' +
      '  <div class="meter-slot" id="meter-prestige"></div>' +
      '  <div class="meter-slot" id="meter-evo"></div>' +
      '  <div class="meter-slot" id="meter-combo"></div>' +
      '</div>' +
      '<div class="hud-goal" id="hud-goal" role="status"></div>';
    hud = h;
    const wrap = h.querySelector('.hud-dps-wrap');
    const openTip = () => {
      const tip = document.getElementById('dps-tip');
      if (tip) { tip.innerHTML = dpsTooltipHTML(G.s); tip.classList.add('open'); }
    };
    const closeTip = () => {
      const tip = document.getElementById('dps-tip');
      if (tip) tip.classList.remove('open');
    };
    wrap.addEventListener('mouseenter', openTip);
    wrap.addEventListener('mouseleave', closeTip);
    wrap.addEventListener('focus', openTip);
    wrap.addEventListener('blur', closeTip);
    return h;
  }

  function buildTabs() {
    const nav = el('nav', 'tdf-tabs');
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'seções do jogo');
    for (const [id, label] of TABS) {
      const b = el('button', 'tab-btn' + (id === selectedTab ? ' active' : ''));
      b.dataset.tab = id;
      b.textContent = label;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', id === selectedTab ? 'true' : 'false');
      b.addEventListener('click', () => UI.switchTab(id));
      nav.appendChild(b);
    }
    return nav;
  }

  function buildContent() {
    const c = el('main', 'tdf-content');
    const view = el('div', 'tdf-view');
    view.id = 'tdf-view';
    c.appendChild(view);
    return c;
  }

  function tabEl(id) {
    const view = document.getElementById('tdf-view');
    let t = document.getElementById('tab-' + id);
    if (!t) {
      t = el('section', 'tab');
      t.id = 'tab-' + id;
      t.dataset.tab = id;
      t.setAttribute('role', 'tabpanel');
      t.setAttribute('aria-label', TABS.find((x) => x[0] === id)[1]);
      view.appendChild(t);
    }
    return t;
  }

  function buildTab(id, label) {
    const t = tabEl(id);
    switch (id) {
      case 'farm': buildFarm(t); break;
      case 'upgrades': buildUpgrades(t); break;
      case 'generators': buildGenerators(t); break;
      case 'evolutions': buildEvolutions(t); break;
      case 'prestige': buildPrestige(t); break;
      case 'achievements': buildAchievements(t); break;
      case 'missions': buildMissions(t); break;
      case 'ranking': buildRanking(t); break;
      case 'profile': buildProfile(t); break;
      case 'stats': buildStats(t); break;
      case 'settings': buildSettings(t); break;
    }
  }

  UI.switchTab = function (id) {
    if (!TABS.find((t) => t[0] === id)) return;
    selectedTab = id;
    document.querySelectorAll('.tab-btn').forEach((b) => {
      const on = b.dataset.tab === id;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === 'tab-' + id));
    renderTab(id);
  };
  UI.getTab = function () { return selectedTab; };

  function renderTab(id) {
    if (id === 'farm') renderFarm();
    else if (id === 'upgrades') renderUpgrades();
    else if (id === 'generators') renderGenerators();
    else if (id === 'evolutions') renderEvolutions();
    else if (id === 'prestige') renderPrestige();
    else if (id === 'achievements') renderAchievements();
    else if (id === 'missions') renderMissions();
    else if (id === 'ranking') { UI.renderRanking(); }
    else if (id === 'profile') renderProfile();
    else if (id === 'stats') renderStats();
    else if (id === 'settings') renderSettings();
  }

  /* ============================================================
     HELPERS
     ============================================================ */
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function fmtMoney(v) {
    const st = G.s.settings;
    if (st.numStyle === 'full' && N.toF(v) < 1e15 && N.toF(v) >= 0) {
      return Math.floor(N.toF(v)).toLocaleString('pt-BR');
    }
    return N.fmt(v);
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const d = Math.floor(sec / 86400), h = Math.floor((sec % 86400) / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (d > 0) return d + 'd ' + h + 'h';
    if (h > 0) return h + 'h ' + m + 'm';
    if (m > 0) return m + 'm ' + s + 's';
    return s + 's';
  }
  function num(v) { return N.toF(v); }
  function img(src, cls) {
    const im = document.createElement('img');
    im.className = cls || '';
    im.loading = 'lazy';
    mutateOnError(im);
    im.src = T.asset(src);
    im.alt = '';
    im.draggable = false;
    return im;
  }
  function mutateOnError(im) {
    im.addEventListener('error', () => {
      im.src = T.asset('thiego normal 2.jpeg');
    }, { once: true });
  }

  /* ============================================================
     HUD (rápido, ~10fps)
     ============================================================ */
  UI.tick = function (dt) {
    const s = G.s;
    if (!s || !hud) return;
    // throttling: atualiza HUD a ~10fps
    UI._tickA = (UI._tickA || 0) + dt;
    if (UI._tickA < 0.1) return;
    UI._tickA = 0;

    const now = Date.now();
    const dps = Econ.dps(s, G.runtime);
    const hd = document.getElementById('hud-dopa');
    const hdps = document.getElementById('hud-dps');
    if (hd && !lastHud.dopa) lastHud.dopa = '';
    const dopaStr = fmtMoney(s.dopamine);
    const dpsStr = fmtMoney(dps) + '/s';
    if (hd && hd.textContent !== dopaStr) { hd.textContent = dopaStr; }
    if (hdps && hdps.textContent !== dpsStr) { hdps.textContent = dpsStr; }

    // multiplicador ativo
    const top = document.getElementById('hud-topright');
    if (top) {
      const mult = Econ.prestigeMult(s);
      const parts = [];
      if (N.gt(mult, N.one)) parts.push('ASC ' + N.fmt(mult) + '×');
      const evo = N.fromF(Econ.evoMult(s));
      if (N.gt(evo, N.one)) parts.push('EVO ' + N.fmt(evo) + '×');
      const gl = Econ.globalMult(s, G.runtime);
      if (N.gt(gl, N.one)) parts.push('MULT ' + N.fmt(gl) + '×');
      top.innerHTML = parts.map((p) => '<span class="hud-chip">' + p + '</span>').join('');
      if (s.points > 0) top.insertAdjacentHTML('afterbegin', '<span class="hud-chip chip-points">' + s.points + ' PTS</span>');
    }

    // imagem do Thiego acompanha a evolução atual (e re-sincroniza no prestige)
    const fi = document.getElementById('farm-img');
    if (fi) {
      const evoT = activeEvo();
      const relE = T.asset(evoT.img);
      if (fi.getAttribute('src') !== relE) { fi.src = relE; fi.classList.remove('fresh'); void fi.offsetWidth; fi.classList.add('fresh'); }
    }

    // meter prestige
    const mp = document.getElementById('meter-prestige');
    if (mp) {
      const g = num(Econ.prestigeGain(s));
      const can = Econ.canPrestige(s);
      const eta = Econ.secsToPrestige(s, G.runtime);
      mp.innerHTML = can
        ? '<div class="meter-label">ASCENSÃO DISPONÍVEL +' + (Math.max(1, Math.floor(g))) + ' pts</div><div class="meter-bar"><div class="meter-fill" style="width:100%"></div></div>'
        : '<div class="meter-label">ASCENSÃO: +' + Math.floor(g) + ' pts' + (isFinite(eta) ? ' (' + fmtTime(eta) + ')' : '') + '</div><div class="meter-bar"><div class="meter-fill" style="width:' + Math.min(100, 100 * g / Math.max(1, Math.floor(g) + 1)) + '%"></div></div>';
    }

    // meter evolução
    const me = document.getElementById('meter-evo');
    if (me) {
      const next = Econ.nextTier(s);
      if (next === null) me.innerHTML = '<div class="meter-label">EVOLUÇÃO MÁXIMA</div>';
      else {
        const cost = Econ.evoCost(s, next);
        const have = s.dopamine;
        const pct = N.gte(have, cost) ? 100 : Math.max(0, Math.min(99, 100 * num(have) / num(cost)));
        me.innerHTML = '<div class="meter-label">EVOLUÇÃO: ' + T.EVOLUTIONS[next].name + '</div>' +
          '<div class="meter-bar"><div class="meter-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="meter-sub">' + fmtMoney(have) + ' / ' + fmtMoney(cost) + '</div>';
      }
    }

    // combo meter
    const mc = document.getElementById('meter-combo');
    if (mc) {
      const combo = G.runtime.combo || 0;
      const cap = Econ.comboCap(s);
      const pct = Math.min(100, 100 * combo / cap);
      const mult = Econ.comboMult(G.s, combo);
      mc.innerHTML = '<div class="meter-label">COMBO ' + combo + '×' + N.fmt(mult) + '</div>' +
        '<div class="meter-bar"><div class="meter-fill fill-combo" style="width:' + pct + '%"></div></div>';
    }

    // tooltip de produção (só preenche quando aberto — hover ou foco)
    const dwWrap = hud && hud.querySelector('.hud-dps-wrap');
    if (dwWrap && (dwWrap.matches(':hover') || document.activeElement === dwWrap)) {
      const tip = document.getElementById('dps-tip');
      if (tip && !tip.classList.contains('open')) {
        tip.innerHTML = dpsTooltipHTML(s);
        tip.classList.add('open');
      }
    }

    // humor contextual (§53)
    const fh = document.getElementById('farm-humor');
    if (fh && G.runtime.humor) {
      if (fh.textContent !== G.runtime.humor) {
        fh.textContent = G.runtime.humor;
        fh.classList.remove('humor-fresh');
        void fh.offsetWidth;
        fh.classList.add('humor-fresh');
      }
    }

    // linha do Thiego acima do botão (evolução atual + frase)
    const ml = document.getElementById('farm-multiline');
    if (ml) {
      const ev = T.EVOLUTIONS[Math.min(s.tier, T.EVOLUTIONS.length - 1)];
      const line = ev.name + (ev.quote ? ' ' + ev.quote : '');
      if (ml.textContent !== line) ml.textContent = line;
    }

    // badges de eventos ativos
    const fa = document.getElementById('farm-active');
    if (fa) {
      const evts = G.runtime.events || [];
      const html = evts.map((e) => {
        const left = Math.max(0, Math.ceil((e.end - Date.now()) / 1000));
        return '<span class="evt-badge">' + e.icon + ' ' + e.text + ' <i>' + fmtTime(left) + '</i></span>';
      }).join('');
      if (fa.innerHTML !== html) fa.innerHTML = html;
    }

    // próximo objetivo — só quando nada é comprável (dead zone)
    const gz = document.getElementById('hud-goal');
    if (gz) {
      const gh = nextGoalHTML();
      if (gz.innerHTML !== gh) gz.innerHTML = gh;
    }

    // amostragem do gráfico de produção
    UI._histT = (UI._histT || 0) + dt;
    if (UI._histT >= 5) {
      UI._histT = 0;
      sampleHist();
      if (selectedTab === 'stats') drawGraph();
    }
  };

  /* ---------- tooltip: quebra da produção (§50) ---------- */
  function dpsTooltipHTML(s) {
    const bd = Econ.breakdown(s, G.runtime);
    const labels = {
      base: 'Geradores', evo: 'Evolução', prestige: 'Ascensão',
      achievements: 'Conquistas', upgrades: 'Upgrades', event: 'Eventos',
    };
    let html = '<div class="tip-title">PRODUÇÃO POR SEGUNDO</div>';
    for (const k of Object.keys(bd)) {
      const isTot = k === 'total';
      const v = isTot ? fmtMoney(bd[k]) + '/s' : N.fmt(bd[k]) + '×';
      html += '<div class="tip-row' + (isTot ? ' total' : '') + '"><span>' + (labels[k] || k) + '</span><b>' + v + '</b></div>';
    }
    return html;
  }

  /* ---------- próximo objetivo (§52) ---------- */
  function nextGoalHTML() {
    const s = G.s;
    if (Econ.canPrestige(s)) return '<span class="goal-go">⚠ ASCENSÃO DISPONÍVEL — prestigie agora!</span>';
    const dps = Econ.dps(s, G.runtime);
    let best = null;
    for (const u of T.UPGRADES) {
      const lvl = s.upgrades[u.id] || 0;
      if (lvl >= (u.effect.maxLevel || 1)) continue;
      const cost = N.mul(N.fromF(u.cost), N.fromF(Econ.costRed(s)));
      if (!best || N.lt(cost, best.cost)) best = { label: 'UPGRADE: ' + u.name, cost };
    }
    for (let i = 0; i < T.GENERATORS.length; i++) {
      const cost = Econ.genCost(s, i, 1);
      if (!best || N.lt(cost, best.cost)) best = { label: 'GERADOR: ' + T.GENERATORS[i].name, cost };
    }
    if (!best) return '<span>EVOLUÇÃO MÁXIMA — só resta ascender… ou dormir.</span>';
    if (N.gte(s.dopamine, best.cost)) return ''; // algo comprável: a própria loja guia
    const rem = N.sub(best.cost, s.dopamine);
    let eta = null;
    if (dps.m > 0) {
      const t = N.toF(N.div(rem, dps));
      if (isFinite(t) && t > 0 && t < 3.6e6) eta = fmtTime(t);
    }
    return '<span>PRÓXIMO: ' + best.label + ' — falta ' + fmtMoney(rem) +
      (eta ? ' (~' + eta + ')' : '') + '</span>';
  }

  /* ---------- gráfico de produção (§33) ---------- */
  function sampleHist() {
    const s = G.s;
    const dps = Econ.dps(s, G.runtime);
    const hist = G.runtime.hist;
    if (!hist) return;
    hist.push({
      t: Date.now(),
      d: dps.m === 0 ? 0 : N.log10(dps),
      m: s.dopamine.m === 0 ? 0 : N.log10(s.dopamine),
    });
    if (hist.length > 60) hist.shift();
  }

  function drawGraph() {
    const cv = document.getElementById('prod-graph');
    if (!cv) return;
    const hist = G.runtime.hist || [];
    const dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const pad = 6;
    if (hist.length < 2) {
      ctx.fillStyle = '#9b8ab8';
      ctx.font = '11px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText('coletando histórico de produção…', w / 2, h / 2);
      return;
    }
    const plot = (key) => {
      const vals = hist.map((p) => p[key]);
      let lo = Math.min.apply(null, vals);
      let hi = Math.max.apply(null, vals);
      if (!isFinite(lo)) lo = 0;
      if (!isFinite(hi) || hi <= lo) hi = lo + 1;
      ctx.beginPath();
      hist.forEach((p, i) => {
        const x = pad + (i / (hist.length - 1)) * (w - 2 * pad);
        const y = h - pad - ((p[key] - lo) / (hi - lo)) * (h - 2 * pad);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = key === 'm' ? '#ffd700' : '#5effb1';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
    };
    plot('m');
    plot('d');
    ctx.fillStyle = '#9b8ab8';
    ctx.font = '10px Segoe UI';
    ctx.textAlign = 'left';
    ctx.fillText('DOPAMINA', pad + 2, 12);
    ctx.fillStyle = '#5effb1';
    ctx.fillText('DPS (log10)', pad + 72, 12);
  }

  /* ============================================================
     ABA FARM
     ============================================================ */
  function buildFarm(t) {
    const evo = activeEvo();
    t.innerHTML =
      '<div class="farm-wrap">' +
      '  <div class="farm-multiline" id="farm-multiline"></div>' +
      '  <button class="farm-thiego" id="farm-btn" aria-label="Clique no Thiego">' +
      '    <img id="farm-img" src="' + T.asset(evo.img) + '" alt="Thiego">' +
      '    <div class="farm-title" id="farm-title"></div>' +
      '  </button>' +
      '  <div class="farm-info" id="farm-info"></div>' +
      '  <div class="farm-humor" id="farm-humor" aria-live="polite"></div>' +
      '  <div class="farm-active" id="farm-active"></div>' +
      '</div>';
    const btn = t.querySelector('#farm-btn');
    btn.addEventListener('pointerdown', (e) => onFarmPointer(e));
    t.querySelector('#farm-img').addEventListener('error', () => {
      t.querySelector('#farm-img').src = T.asset('thiego normal 2.jpeg');
    });
  }

  function activeEvo() {
    const s = G.s;
    return T.EVOLUTIONS[Math.max(0, Math.min(s.tier, T.EVOLUTIONS.length - 1))];
  }

  function onFarmPointer(e) {
    if (!G.s) return;
    const r = G.click();
    if (!r) return;
    const rect = document.getElementById('farm-btn').getBoundingClientRect();
    const x = e.clientX, y = e.clientY;
    const gainStr = fmtMoney(r.gain);
    Fx.float(x, y - 10, gainStr, {
      size: r.crit ? 30 : 20,
      color: r.crit ? '#ff8c42' : '#ffd700',
      crit: r.crit, life: 0.9,
    });
    if (r.crit) {
      Fx.burst(x, y, { count: 20, color: '#ff8c42', speed: 260, life: 0.6 });
      window.AudioFX.sfx.crit();
    } else {
      window.AudioFX.sfx.click();
    }
    G.checkAchievements();
    // escala visual
    const btn = document.getElementById('farm-btn');
    btn.classList.remove('pressed');
    void btn.offsetWidth;
    btn.classList.add('pressed');
  }

  function renderFarm() {
    const s = G.s;
    const evo = activeEvo();
    const im = document.getElementById('farm-img');
    const rel = T.asset(evo.img);
    if (im && im.getAttribute('src') !== rel) { im.src = rel; im.classList.remove('fresh'); void im.offsetWidth; im.classList.add('fresh'); }
    const ft = document.getElementById('farm-title');
    if (ft) ft.textContent = s.title ? (T.TITLES.find((x) => x.id === s.title) || {}).name : 'THIEGO';
    if (!G.runtime.humor) {
      const pool = Econ.dps(s, G.runtime).e >= 12 ? T.HUMOR_ABSURD : T.HUMOR;
      G.runtime.humor = pool[(Math.random() * pool.length) | 0];
    }
    const info = document.getElementById('farm-info');
    if (info) {
      info.innerHTML =
        '<span>CLIQUE: <b>' + fmtMoney(Econ.clickPower(s, G.runtime, Math.max(1, G.runtime.combo || 1))) + '</b></span>' +
        '<span>CRÍTICO: <b>' + (Econ.critChance(s) * 100).toFixed(1) + '%</b> ×' + N.fmt(N.fromF(Econ.critMult(s))) + '</span>' +
        '<span>DPS: <b>' + fmtMoney(Econ.dps(s, G.runtime)) + '</b></span>';
    }
  }

  /* ============================================================
     ABA UPGRADES
     ============================================================ */
  let upFilter = 'todas';
  function buildUpgrades(t) {
    const cats = ['todas', 'clique', 'auto', 'evo', 'prestige', 'offline', 'event', 'meme'];
    const labels = { todas: 'TODAS', clique: 'CLIQUE', auto: 'AUTOMAÇÃO', evo: 'EVOLUÇÃO', prestige: 'ASCENSÃO', offline: 'OFFLINE', event: 'EVENTOS', meme: 'MEME' };
    const bar = el('div', 'up-filter');
    for (const c of cats) {
      const b = el('button', 'chip-btn' + (c === upFilter ? ' active' : ''), labels[c]);
      b.addEventListener('click', () => { upFilter = c; renderUpgrades(); });
      bar.appendChild(b);
    }
    t.appendChild(bar);
    t.appendChild(el('div', 'up-list', '<div class="notice">carregando…</div>'));
  }
  function renderUpgrades() {
    const s = G.s;
    const list = tList('upgrades');
    list.innerHTML = '';
    const filtered = T.UPGRADES.filter((u) => upFilter === 'todas' || u.cat === upFilter);
    if (!filtered.length) { list.appendChild(el('div', 'notice', 'nada por aqui.')); return; }
    for (const u of filtered) {
      const lvl = s.upgrades[u.id] || 0;
      const max = u.effect.maxLevel || 1;
      const can = G.canBuyUpgrade(u.id);
      const card = el('div', 'up-card' + (can.ok ? ' buyable' : '') + (lvl >= max ? ' maxed' : ''));
      const isImg = u.icon && /\.(png|jpe?g|gif|webp)$/i.test(u.icon);
      const icon = isImg ? '<img class="up-icon" src="' + T.asset(u.icon) + '" alt="" loading="lazy">' : '<div class="up-icon placeholder">' + (u.icon || '⬆') + '</div>';
      card.innerHTML =
        icon +
        '<div class="up-body">' +
        '  <div class="up-name">' + u.name + '</div>' +
        '  <div class="up-desc">' + effectDesc(u) + '</div>' +
        '  <div class="up-lvl">NÍVEL ' + lvl + '/' + max + '</div>' +
        '</div>' +
        '<div class="up-buy">' +
        (lvl >= max
          ? '<span class="up-max">MÁX</span>'
          : '<button class="btn buy" ' + (can.ok ? '' : 'disabled') + '>COMPRAR<br><small>' + fmtMoney(can.cost || 0) + '</small></button>') +
        '</div>';
      const btn = card.querySelector('button');
      if (btn) btn.addEventListener('click', () => {
        if (G.buyUpgrade(u.id)) {
          window.AudioFX.sfx.buy();
          renderUpgrades();
          G.checkAchievements();
        } else { if (!can.ok) denied(); }
      });
      list.appendChild(card);
    }
  }
  function effectDesc(u) {
    const e = u.effect;
    switch (e.type) {
      case 'clickMult': return '+' + Math.round((e.val * 100) - 100) + '% ao clique';
      case 'critChance': return '+' + Math.round(e.val * 100) + '% chance de crítico';
      case 'critMult': return 'crítico ×' + N.fmt(N.fromF(1 + e.val));
      case 'comboTime': return '+' + Math.round(e.val / 1000) + 's na janela de combo';
      case 'comboCap': return 'combo máximo +' + e.val;
      case 'clickShare': return 'clique ganha ' + Math.round(e.val * 100) + '% do DPS (lvl ' + (u.effect.maxLevel || 1) + ')';
      case 'genMult': return '+25% a todos os geradores';
      case 'costRed': return 'custos -' + Math.round(e.val * 100) + '%';
      case 'prodMult': return 'produção +' + Math.round(e.val * 100) + '%';
      case 'evoCost': return 'evolução -' + Math.round(e.val * 100) + '%';
      case 'perEvo': return '+8% por nível de evolução';
      case 'prestigeGain': return 'ganho de ascensão +' + Math.round(e.val * 100) + '%';
      case 'prestigeMult': return 'multiplicador de ascensão +' + Math.round(e.val * 100) + '%';
      case 'offlineEff': return 'ganho offline +' + Math.round(e.val * 100) + '%';
      case 'offlineCap': return 'offline +' + e.val + 'h';
      case 'eventFreq': return 'eventos ' + Math.round((1 - e.val) * 100) + '% mais frequentes';
      case 'eventDur': return 'eventos duram +' + Math.round(e.val * 100) + '%';
      case 'eventReward': return 'recompensas de eventos +' + Math.round(e.val * 100) + '%';
      default: return u.desc || '';
    }
  }

  /* ============================================================
     ABA GERADORES
     ============================================================ */
  function buildGenerators(t) {
    t.appendChild(el('div', 'gen-list', '<div class="notice">carregando…</div>'));
  }
  function renderGenerators() {
    const s = G.s;
    const list = tList('generators');
    list.innerHTML = '';
    const n = 1;
    for (let i = 0; i < T.GENERATORS.length; i++) {
      const g = T.GENERATORS[i];
      const owned = s.gens[i];
      const cost = Econ.genCost(s, i, 1);
      const dps1 = Econ.genUnitDps(s, i);
      const card = el('div', 'gen-card' + (N.gte(s.dopamine, cost) ? ' buyable' : ''));
      const mil = milestoneInfo(i, owned);
      const gIsImg = g.img && /\.(png|jpe?g|gif|webp)$/i.test(g.img);
      card.innerHTML =
        '<div class="gen-head">' +
        (gIsImg ? '<img class="gen-img" src="' + T.asset(g.img) + '" alt="" loading="lazy">'
          : '<div class="gen-img placeholder">' + (g.icon || '⚙️') + '</div>') +
        '<div class="gen-info"><div class="gen-name">' + g.name + '</div>' +
        '<div class="gen-meta">' + owned + ' · ' + fmtMoney(N.mul(dps1, N.fromF(owned))) + '/s total · cada: ' + fmtMoney(dps1) + '</div></div>' +
        '<div class="gen-cost">' + fmtMoney(cost) + '</div>' +
        '</div>' +
        '<div class="gen-buys">' +
        [1, 10, 25].map((nn) => '<button class="btn small' + (N.gte(s.dopamine, Econ.genCost(s, i, nn)) ? '' : ' disabled') + '" data-n="' + nn + '">×' + nn + '</button>').join('') +
        '<button class="btn small max">MAX</button>' +
        '</div>' +
        (mil ? '<div class="gen-milestone">' + mil + '</div>' : '');
      card.querySelector('.gen-buys').addEventListener('click', (ev) => {
        const b = ev.target.closest('button');
        if (!b) return;
        const n = b.dataset.n ? parseInt(b.dataset.n, 10) : null;
        const count = n ? n : Math.max(1, Econ.maxGenBuy(s, i));
        if (G.buyGen(i, count)) {
          window.AudioFX.sfx.buy();
          renderGenerators();
          G.checkAchievements();
        } else {
          denied();
        }
      });
      list.appendChild(card);
    }
  }
  function milestoneInfo(i, owned) {
    const next = T.MILESTONES.find((mv) => owned < mv);
    if (next === undefined) return 'MILESTONE FINAL ATINGIDO';
    return 'próximo milestone ×' + next + ' (' + (owned) + '/' + next + ')';
  }

  /* ============================================================
     ABA EVOLUÇÕES
     ============================================================ */
  function buildEvolutions(t) {
    t.appendChild(el('div', 'evo-list', '<div class="notice">carregando…</div>'));
  }
  function renderEvolutions() {
    const s = G.s;
    const list = tList('evolutions');
    list.innerHTML = '';
    const cur = T.EVOLUTIONS[s.tier];
    const head = el('div', 'evo-current');
    head.innerHTML =
      '<div class="evo-now">EVOLUÇÃO ATUAL</div>' +
      '<div class="evo-now-img"><img src="' + T.asset(cur.img) + '" alt=""></div>' +
      '<div class="evo-now-name">' + cur.name + '</div>' +
      '<div class="evo-now-mult">MULTIPLICADOR TOTAL: ' + N.fmt(N.fromF(Econ.evoMult(s))) + '×</div>';
    list.appendChild(head);
    for (let i = 0; i < T.EVOLUTIONS.length; i++) {
      const ev = T.EVOLUTIONS[i];
      const card = el('div', 'evo-card' + (i === s.tier ? ' current' : (i < s.tier ? ' done' : '')));
      const cost = i === 0 ? N.zero : Econ.evoCost(s, i);
      const dps = Econ.dps(s, G.runtime);
      const eta = N.gte(dps, N.fromF(0.1)) && N.gt(cost, N.zero) ? fmtTime(num(N.div(cost, dps))) : '—';
      card.innerHTML =
        '<img class="evo-img" src="' + T.asset(ev.img) + '" alt="" loading="lazy">' +
        '<div class="evo-body">' +
        '<div class="evo-name">' + ev.name + '</div>' +
        '<div class="evo-mult">' + (i === 0 ? 'base' : '×' + N.fmt(N.fromF(ev.mult))) + ' prod</div>' +
        (i < s.tier ? '<div class="evo-done">EVOLUÍDO</div>'
          : i === s.tier ? '<div class="evo-active">ATUAL</div>'
          : '<div class="evo-cost">' + fmtMoney(cost) + (eta !== '—' ? ' · ETA ' + eta : '') + '</div>') +
        '</div>';
      if (i > s.tier) {
        card.classList.add('locked');
        card.addEventListener('click', () => {
          const r = G.evolve();
          if (r) {
            const evT = T.EVOLUTIONS[r];
            window.AudioFX.sfx.evolve();
            Fx.flash('#ffd700', 500);
            showTransformOverlay(evT);
            renderAllSoon();
          } else denied();
        });
      }
      list.appendChild(card);
    }
  }

  let transformQueued = false;
  function renderAllSoon() { transformQueued = true; }
  // chamado do loop principal
  UI.flush = function () { if (transformQueued) { transformQueued = false; renderTab(selectedTab); } };

  function showTransformOverlay(ev) {
    const ov = Fx.overlay('evo', T.asset(ev.img), ev.name + '!', 'EVOLUÇÃO COMPLETA');
    setTimeout(() => ov.done(), 1800);
  }

  /* ============================================================
     ABA PRESTIGE
     ============================================================ */
  function buildPrestige(t) {
    const box = el('div', 'pres-view');
    box.innerHTML =
      '<div class="pres-head" id="pres-head"></div>' +
      '<div class="pres-gain" id="pres-gain"></div>' +
      '<button class="btn pres-btn" id="pres-btn">ASCENDER</button>' +
      '<div class="pres-quote" id="pres-quote"></div>' +
      '<div class="pres-tree" id="pres-tree"></div>';
    box.querySelector('#pres-btn').addEventListener('click', () => tryPrestige());
    t.appendChild(box);
  }
  function tryPrestige() {
    const s = G.s;
    const gain = Econ.prestigeGain(s);
    if (!Econ.canPrestige(s)) { denied(); return; }
    const done = (ok) => {
      window.AudioFX.sfx.prestige();
      Fx.flash('#c86bff', 600);
      Fx.shake(8);
      if (ok) showPrestigeOverlay(ok.gained, ok.multAfter);
      renderAllSoon();
      G.checkAchievements();
      if (window.Leaderboard) Leaderboard.submit(true);
    };
    if (s.settings.confirmPrestige) {
      openModal('ASCENSÃO DOPAMÍNICA', prestigeModalBody(gain), [
        { label: 'CANCELAR', cls: 'btn' },
        { label: 'ASCENDER!', cls: 'btn primary', cb: () => done(G.prestige()) },
      ]);
    } else {
      done(G.prestige());
    }
  }
  function prestigeModalBody(gain) {
    return '<p>Você vai ganhar <b class="hl">+' + Math.max(1, Math.floor(num(gain))) + ' pontos</b> de Dopamina Ascendida.</p>' +
      '<p>Multiplicador atual: <b>' + N.fmt(Econ.prestigeMult(G.s)) + '×</b> → novo: <b>' + N.fmt(Econ.prestigeMultAfter(G.s, num(gain))) + '×</b></p>' +
      '<p class="warn">Seus geradores, upgrades e dopamina serão <b>resetados</b> por uma ascensão. Evolução e conquistas permanecem.</p>';
  }
  function showPrestigeOverlay(gained, multAfter) {
    const ov = Fx.overlay('prestige', null, 'ASCENSÃO TOTAL!', '+' + Math.max(1, Math.floor(gained)) + ' PONTOS · MULT ' + N.fmt(multAfter) + '×');
    setTimeout(() => ov.done(), 2400);
  }
  function renderPrestige() {
    const s = G.s;
    const head = document.getElementById('pres-head');
    if (head) head.innerHTML = 'ASCENSÕES: <b>' + s.prestige + '</b> · PONTOS: <b>' + s.points + '</b> · MULT GLOBAL: <b>' + N.fmt(Econ.prestigeMult(s)) + '×</b>';
    const gain = Econ.prestigeGain(s);
    const gs = document.getElementById('pres-gain');
    if (gs) {
      const can = Econ.canPrestige(s);
      gs.innerHTML = can
        ? 'PRONTO: +' + Math.max(1, Math.floor(num(gain))) + ' pts ao ascender!'
        : 'GANHO ATUAL: ' + Math.floor(num(gain)) + ' pts <small>(ganhe mais dopamina pra subir)</small>';
    }
    const q = document.getElementById('pres-quote');
    if (q && s.counters.prestiges > 0) q.innerHTML = '🗿 <i>' + (T.HUMOR_PRESTIGE[(s.counters.prestiges - 1) % T.HUMOR_PRESTIGE.length]) + '</i>';
    const tree = document.getElementById('pres-tree');
    if (tree) {
      tree.innerHTML = '';
      for (const tr of T.PRESTIGE_TREE) {
        const lvl = s.tree[tr.id] || 0;
        const card = el('div', 'tree-card');
        card.innerHTML = '<div class="tree-name">' + tr.name + '</div><div class="tree-desc">' + tr.desc + '</div>';
        const lv = el('div', 'tree-levels');
        for (let i = 0; i < tr.max; i++) {
          const b = el('button', 'tree-level' + (i < lvl ? ' owned' : ''));
          const cost = tr.levels[i];
          b.textContent = i < lvl ? '✓' : cost;
          b.title = 'Nível ' + (i + 1) + ': ' + fmtTreeEffect(tr, i + 1);
          if (i >= lvl && tr.levels[i] <= s.points) b.classList.add('buyable');
          if (i === lvl) {
            b.addEventListener('click', () => {
              if (G.buyTree(tr.id)) {
                window.AudioFX.sfx.buy();
                renderPrestige();
                G.checkAchievements();
              } else denied();
            });
          }
          lv.appendChild(b);
        }
        lv.querySelectorAll('.tree-level.owned').forEach((b) => b.disabled = true);
        card.appendChild(lv);
        tree.appendChild(card);
      }
    }
  }
  function fmtTreeEffect(tr, lvl) {
    return tr.desc + ' (nível ' + lvl + ')';
  }

  /* ============================================================
     ABA CONQUISTAS
     ============================================================ */
  let achFilter = 'todas';
  function buildAchievements(t) {
    const bar = el('div', 'ach-filter');
    for (const [k, label] of [['todas', 'TODAS'], ['normal', 'NORMais'], ['secret', 'SECRETAS']]) {
      const b = el('button', 'chip-btn' + (k === achFilter ? ' active' : ''), label);
      b.addEventListener('click', () => { achFilter = k; renderAchievements(); });
      bar.appendChild(b);
    }
    t.appendChild(bar);
    t.appendChild(el('div', 'ach-grid', '<div class="notice">carregando…</div>'));
  }
  function renderAchievements() {
    const s = G.s;
    const grid = tList('achievements');
    grid.innerHTML = '';
    const ctx = G.buildCtx();
    const list = T.ACHIEVEMENTS.filter((a) =>
      achFilter === 'todas' ? true
      : achFilter === 'secret' ? !!a.secret
      : !a.secret);
    for (const a of list) {
      const got = s.achievements.includes(a.id);
      const card = el('div', 'ach-card' + (got ? ' got' : '') + (a.secret ? ' secret' : ''));
      card.innerHTML =
        '<div class="ach-icon">' + (a.icon || (a.secret ? '🔥' : '🏆')) + '</div>' +
        '<div class="ach-name">' + a.name + '</div>' +
        '<div class="ach-desc">' + a.desc + '</div>' +
        (a.secret && !got ? '<div class="ach-secret">???</div>' : '');
      card.title = (ctx['achAll'] ? 'todas coletadas' : '');
      grid.appendChild(card);
    }
  }

  /* ============================================================
     ABA MISSÕES
     ============================================================ */
  function buildMissions(t) {
    t.appendChild(el('div', 'miss-list', '<div class="notice">carregando…</div>'));
  }
  function renderMissions() {
    const s = G.s;
    const list = tList('missions');
    list.innerHTML = '';
    const groups = [['daily', 'MISSÕES DIÁRIAS'], ['weekly', 'MISSÕES SEMANAIS'], ['special', 'MISSÃO ESPECIAL']];
    for (const [kind, label] of groups) {
      list.appendChild(el('div', 'miss-group-title', label));
      const group = s.missions[kind];
      if (!group) continue;
      const items = kind === 'special' ? [group] : group;
      for (let i = 0; i < items.length; i++) {
        const m = items[i];
        const def = findMissionDef(kind, m.id);
        if (!def) continue;
        const prog = G.missionProgress(m, s);
        const card = el('div', 'miss-card' + (prog.done ? ' done' : '') + (m.claimed ? ' claimed' : ''));
        card.innerHTML =
          '<div class="miss-name">' + def.name + '</div>' +
          '<div class="miss-bar"><div class="miss-fill" style="width:' + Math.min(100, 100 * prog.cur / Math.max(1, prog.target)) + '%"></div></div>' +
          '<div class="miss-meta"><span>' + Math.min(prog.cur, prog.target) + '/' + prog.target + '</span>' +
          '<span class="miss-reward">' + missReward(def) + '</span></div>' +
          (m.claimed ? '<div class="miss-claim">ENTREGUE</div>'
            : '<button class="btn small claim" ' + (prog.done ? '' : 'disabled') + '>RECEBER</button>');
        if (!m.claimed) {
          const btn = card.querySelector('button');
          btn.addEventListener('click', () => {
            const r = G.claimMission(kind, i);
            if (r) {
              window.AudioFX.sfx.achievement();
              UI.toast(r.points ? 'RECEBIU ' + r.points + ' PTS' : 'RECEBIU +' + fmtMoney(r.dopa), 'achievement', 4000);
              renderMissions();
            }
          });
        }
        list.appendChild(card);
      }
    }
  }
  function findMissionDef(kind, id) {
    const pool = T.MISSION_POOL[kind] || [];
    return pool.find((m) => m.id === id);
  }
  function missReward(def) {
    if (def.reward == null) return 'recompensa?';
    if (def.reward.dopa != null) return '⏱ ' + def.reward.dopa + 's de DPS';
    if (def.reward.points != null) return '⛰ ' + def.reward.points + ' PTS';
    return 'recompensa?';
  }

  /* ============================================================
     ABA RANKING
     ============================================================ */
  function buildRanking(t) {
    t.appendChild(el('div', 'rank-view', '<div class="notice">carregando…</div>'));
  }
  UI.renderRanking = function () {
    const view = tList('ranking');
    view.innerHTML = '';
    const lb = window.Leaderboard || {};
    const online = !!lb.online && !!lb.logged;
    const bar = el('div', 'rank-bar');
    bar.innerHTML = '<span class="rank-mode">' + (online ? '🌍 RANKING GLOBAL (GYCANIC)' : '📦 RANKING LOCAL — SEM SESSÃO') + '</span>';
    const modes = [['global', 'GERAL'], ['today', 'HOJE'], ['week', 'SEMANA'], ['month', 'MÊS']];
    for (const [k, label] of modes) {
      const b = el('button', 'chip-btn' + (lb.mode === k ? ' active' : ''), label);
      b.addEventListener('click', () => { Leaderboard.refresh({ mode: k }); });
      bar.appendChild(b);
    }
    const sorts = [['score', 'DOPAMINA'], ['prestige', 'ASCENSÃO']];
    for (const [k, label] of sorts) {
      const b = el('button', 'chip-btn' + (lb.sort === k ? ' active' : ''), label);
      b.addEventListener('click', () => { Leaderboard.refresh({ sort: k }); });
      bar.appendChild(b);
    }
    const sub = el('button', 'btn small', 'ATUALIZAR / ENVIAR');
    sub.addEventListener('click', () => { Leaderboard.submit(true).then(() => Leaderboard.refresh()); });
    bar.appendChild(sub);
    view.appendChild(bar);

    if (lb.me) {
      const me = el('div', 'rank-me');
      me.innerHTML = '<b>VOCÊ:</b> posição ' + lb.me.rank + ' · ' + (lb.me.name || '') + ' · ' + Leaderboard.fmtScore(lb.me.log10) +
        (lb.bestRank ? ' <small>· melhor: #' + lb.bestRank + '</small>' : '');
      view.appendChild(me);
    }
    const list = el('div', 'rank-list');
    if (!lb.list || !lb.list.length) list.appendChild(el('div', 'notice', online ? 'sem dados ainda.' : 'jogue offline e volte!'));

    const rows = (lb.list || []).slice(0, 50);
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const row = el('div', 'rank-row' + (lb.me && lb.me.rank === r.rank ? ' me' : ''));
      const medal = i < 3 ? '🥇🥈🥉'[i] : r.rank;
      const evo = (r.evolution !== undefined && r.evolution > 0) ? ' · evo ' + T.EVOLUTIONS[Math.min(r.evolution, T.EVOLUTIONS.length - 1)].name : '';
      row.innerHTML =
        '<span class="rank-medal">' + medal + '</span>' +
        '<span class="rank-name">' + esc(r.name || 'Anônimo') + evo + '</span>' +
        '<span class="rank-score">' + Leaderboard.fmtScore(r.log10) + '</span>';
      list.appendChild(row);
    }
    view.appendChild(list);
    const note = el('div', 'rank-note', online
      ? 'Envio automático a cada 90s. Métrica: dopamina total produzida (escala log).'
      : 'Sem login do Gycanic → seu progresso fica salvo apenas neste navegador.');
    view.appendChild(note);
  };
  function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  /* ============================================================
     ABA PERFIL
     ============================================================ */
  function buildProfile(t) {
    t.appendChild(el('div', 'prof-view', '<div class="notice">carregando…</div>'));
  }
  function renderProfile() {
    const s = G.s;
    const view = tList('profile');
    view.innerHTML = '';
    const evo = activeEvo();
    const myTitle = s.title ? (T.TITLES.find((x) => x.id === s.title) || {}).name : null;
    const hero = el('div', 'prof-hero');
    hero.innerHTML =
      '<img class="prof-img" src="' + T.asset(evo.img) + '" alt="">' +
      '<div class="prof-name">' + (myTitle ? myTitle + ' ' : '') + 'THIEGO</div>' +
      '<div class="prof-meta">evo ' + T.EVOLUTIONS[s.tier].name + ' · ' + s.prestige + ' ascensões · ' + s.achievements.length + '/' + T.ACHIEVEMENTS.length + ' conquistas</div>';
    view.appendChild(hero);

    // títulos
    const tt = el('div', 'prof-sec');
    tt.appendChild(el('div', 'sec-title', 'TÍTULOS'));
    const tgrid = el('div', 'title-grid');
    for (const tit of T.TITLES) {
      const ok = s.title === tit.id;
      const can = tit.check(s, G.buildCtx());
      const b = el('button', 'title-card' + (ok ? ' equipped' : '') + (can ? '' : ' locked'));
      b.textContent = tit.name;
      if (can) b.addEventListener('click', () => { G.equipTitle(tit.id); window.AudioFX.sfx.evolve(); renderProfile(); });
      tgrid.appendChild(b);
    }
    tt.appendChild(tgrid);
    view.appendChild(tt);

    // conquistas (resumo; grade completa na aba CONQUISTAS)
    const ach = el('div', 'prof-sec');
    const pct = Math.round(100 * s.achievements.length / Math.max(1, T.ACHIEVEMENTS.length));
    ach.appendChild(el('div', 'sec-title', 'CONQUISTAS (' + s.achievements.length + '/' + T.ACHIEVEMENTS.length + ')'));
    const bar = el('div', 'ach-bar');
    bar.innerHTML = '<div class="ach-bar-fill" style="width:' + pct + '%"></div>';
    ach.appendChild(bar);
    view.appendChild(ach);
  }

  /* ============================================================
     ABA ESTATÍSTICAS
     ============================================================ */
  function buildStats(t) {
    t.appendChild(el('div', 'stats-view', '<div class="notice">carregando…</div>'));
  }
  function renderStats() {
    const s = G.s;
    const v = tList('stats');
    v.innerHTML = '';
    const lb = window.Leaderboard || {};
    const rows = [
      ['⏱ Tempo jogado', fmtTime(s.playTime)],
      ['🕹 Cliques', s.counters.clicks.toLocaleString('pt-BR')],
      ['💥 Críticos', s.counters.crits.toLocaleString('pt-BR')],
      ['🔥 Maior combo', s.counters.maxCombo.toLocaleString('pt-BR')],
      ['🛒 Compras', s.counters.buys.toLocaleString('pt-BR')],
      ['⚡ Eventos vistos', s.counters.events.toLocaleString('pt-BR')],
      ['👾 Encontros', s.counters.encounters.toLocaleString('pt-BR')],
      ['💰 Maior clique', fmtMoney(s.stats.biggestClick)],
      ['🏭 Melhor DPS', fmtMoney(s.stats.bestDps)],
      ['🦄 Máx dopamina de uma vez', fmtMoney(s.stats.bigDopaminaAtOnce)],
      ['🌌 Ascensões', s.counters.prestiges.toLocaleString('pt-BR')],
      ['⛰ Pontos gastos', s.pointsSpent.toLocaleString('pt-BR')],
      ['📦 Offline acumulado', fmtTime(s.offlineTime)],
      ['🏆 Melhor posição global', lb.bestRank ? '#' + lb.bestRank : '—'],
      ['✅ Missões entregues', s.missionClaims.toLocaleString('pt-BR')],
    ];
    const table = el('div', 'stats-table');
    for (const [k, val] of rows) {
      const r = el('div', 'stat-row');
      r.innerHTML = '<span>' + k + '</span><b>' + val + '</b>';
      table.appendChild(r);
    }
    v.appendChild(table);
    const br = el('div', 'stat-break');
    br.innerHTML = '<div class="sec-title">PRODUÇÃO</div>';
    const bd = Econ.breakdown(s, G.runtime);
    const labels = { base: 'Geradores', evo: 'Evolução', prestige: 'Ascensão', achievements: 'Conquistas', upgrades: 'Upgrades', event: 'Eventos', total: 'TOTAL' };
    for (const k of Object.keys(bd)) {
      const r = el('div', 'stat-row' + (k === 'total' ? ' total' : ''));
      const vv = k === 'total' ? fmtMoney(bd[k]) : N.fmt(bd[k]) + '×';
      r.innerHTML = '<span>' + (labels[k] || k) + '</span><b>' + vv + '</b>';
      br.appendChild(r);
    }
    v.appendChild(br);
    const gr = el('div', 'graph-box');
    gr.innerHTML = '<div class="sec-title">PRODUÇÃO (últimos ~5 min, log10)</div>' +
      '<canvas id="prod-graph" role="img" aria-label="gráfico de produção de dopamina e DPS ao longo do tempo"></canvas>';
    v.appendChild(gr);
    drawGraph();
  }

  /* ============================================================
     ABA CONFIG
     ============================================================ */
  function buildSettings(t) {
    const v = el('div', 'set-view');
    t.appendChild(v);
  }
  function renderSettings() {
    const s = G.s;
    const v = tList('settings');
    v.innerHTML = '';
    const rows = [
      ['particles', 'Partículas', 'poeira de dopamina nas animações', () => s.settings.particles],
      ['animations', 'Animações', 'efeitos visuais de interface', () => s.settings.animations],
      ['perfMode', 'Modo performance', 'desliga partículas e pesados (celular fraco)', () => s.settings.perfMode],
      ['reducedMotion', 'Movimento reduzido', 'menos tremores e zooms', () => s.settings.reducedMotion],
      ['notifications', 'Notificações', 'toasts de conquistas', () => s.settings.notifications],
      ['confirmPrestige', 'Confirmar ascensão', 'pede confirmação antes de ascender', () => s.settings.confirmPrestige],
      ['confirmReset', 'Confirmar reset', 'pede digitar THIEGO para resetar', () => s.settings.confirmReset],
      ['muted', 'Som ligado', 'SFX sintetizados', () => !s.settings.muted],
      ['music', 'Música ambiente', 'melodia simples de fundo', () => s.settings.music],
    ];
    for (const [key, name, desc, get] of rows) {
      const label = el('label', 'set-row');
      label.innerHTML = '<div><b>' + name + '</b><small>' + desc + '</small></div>';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = get();
      input.addEventListener('change', () => {
        const on = input.checked;
        if (key === 'muted') G.setSetting('muted', !on);
        else if (key === 'music') { G.setSetting('music', on); AudioFX.setMusic(on); }
        else G.setSetting(key, on);
      });
      label.appendChild(input);
      v.appendChild(label);
    }
    // volume
    const vol = el('label', 'set-row');
    vol.innerHTML = '<div><b>Volume</b><small>' + Math.round(s.settings.volume * 100) + '%</small></div>';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = 0; slider.max = 100; slider.value = Math.round(s.settings.volume * 100);
    slider.addEventListener('input', () => {
      G.setSetting('volume', slider.value / 100);
      AudioFX.setVolume(slider.value / 100);
      slider.parentElement.querySelector('small').textContent = Math.round(slider.value) + '%';
      if (+slider.value > 0) { G.setSetting('muted', false); AudioFX.enabled = true; }
    });
    vol.appendChild(slider);
    v.appendChild(vol);
    // numStyle
    const ns = el('label', 'set-row');
    ns.innerHTML = '<div><b>Formato de números</b><small>auto · científico · completo</small></div>';
    const sel = document.createElement('select');
    for (const [k, label] of [['auto', 'AUTO'], ['sci', 'CIENTÍFICO'], ['full', 'COMPLETO']]) {
      const o = document.createElement('option');
      o.value = k; o.textContent = label;
      if (k === s.settings.numStyle) o.selected = true;
      sel.appendChild(o);
    }
    sel.addEventListener('change', () => { G.setSetting('numStyle', sel.value); renderSettings(); });
    ns.appendChild(sel);
    v.appendChild(ns);
    // export/import/reset
    const acts = el('div', 'set-actions');
    const exp = el('button', 'btn', 'EXPORTAR SAVE');
    exp.addEventListener('click', () => exportSave());
    const imp = el('button', 'btn', 'IMPORTAR SAVE');
    imp.addEventListener('click', () => importSave());
    const rst = el('button', 'btn danger', 'RESETAR TUDO');
    rst.addEventListener('click', () => resetGame());
    acts.append(exp, imp, rst);
    v.appendChild(acts);
    v.appendChild(el('div', 'set-foot', 'v4 · save local · ranking via Gycanic (se logado)'));
  }

  function exportSave() {
    const txt = Save.export(G.s);
    if (!txt) { UI.toast('falha ao exportar', 'error'); return; }
    UI.toast('save copiado! cole em um arquivo .txt', 'info');
    navigator.clipboard && navigator.clipboard.writeText(txt).catch(() => {});
    openModal('EXPORTAR SAVE', '<textarea class="imp-box" readonly>' + esc(txt) + '</textarea>', [
      { label: 'FECHAR', cls: 'btn' },
    ]);
  }
  function importSave() {
    openModal('IMPORTAR SAVE', '<textarea class="imp-box" placeholder="cole o JSON do save aqui"></textarea>', [
      { label: 'CANCELAR', cls: 'btn' },
      {
        label: 'IMPORTAR', cls: 'btn primary', cb: () => {
          const ta = document.querySelector('#ui-modal textarea');
          if (!ta) return;
          if (Save.import(ta.value.trim())) {
            window.location.reload();
          } else {
            UI.toast('save inválido ou de versão mais nova', 'error');
          }
        },
      },
    ]);
  }
  function resetGame() {
    const doIt = () => {
      Save.reset();
      window.location.reload();
    };
    if (G.s.settings.confirmReset) {
      openModal('RESETAR TUDO', '<p>Digite <b>THIEGO</b> para confirmar. Isso apaga o save v4 deste navegador para sempre.</p>' +
        '<input class="imp-box" id="reset-conf" maxlength="20" placeholder="THIEGO">', [
        { label: 'CANCELAR', cls: 'btn' },
        { label: 'APAGAR TUDO', cls: 'btn danger', cb: () => { if ((document.getElementById('reset-conf') || {}).value === 'THIEGO') doIt(); else UI.toast('digite THIEGO', 'warn'); } },
      ]);
    } else doIt();
  }

  /* ============================================================
     TOASTS (conquistas / gerais)
     ============================================================ */
  UI.toast = function (msg, kind, dur) {
    Fx.toast(msg, kind, dur);
  };
  function toastQueue(items, kind, title) {
    const queue = [];
    for (const it of items) {
      queue.push({
        icon: '🏆',
        title: title,
        name: it.name,
        img: it.img ? T.asset(it.img) : null,
      });
    }
    showNext(queue);
  }
  function showNext(queue) {
    if (!queue.length) return;
    const it = queue.shift();
    const card = el('div', 'toast-big toast-ach');
    card.innerHTML = (it.img ? '<img src="' + it.img + '" alt="" loading="lazy">' : '<div class="tbig-icon">' + it.icon + '</div>') +
      '<div><div class="tbig-title">' + it.title + '</div><div class="tbig-name">' + esc(it.name) + '</div></div>';
    document.body.appendChild(card);
    setTimeout(() => card.classList.add('in'), 30);
    setTimeout(() => {
      card.classList.remove('in');
      setTimeout(() => card.remove(), 500);
      showNext(queue);
    }, 3600);
  }
  UI.achievementToasts = function (fresh) {
    toastQueue(fresh || [], 'achievement', 'CONQUISTA DESBLOQUEADA!');
  };

  /* ============================================================
     ENCONTROS
     ============================================================ */
  UI.showEncounter = function (enc) {
    if (!enc) return;
    const cur = document.querySelector('.enc-overlay');
    if (cur) cur.remove();
    const ov = el('div', 'enc-overlay');
    const card = el('div', 'enc-card');
    const gainStr = enc.instantGain ? fmtMoney(enc.instantGain) : (enc.time > 0 ? 'bônus ativo por ' + fmtTime((enc.end - Date.now()) / 1000) : '');
    card.innerHTML =
      '<div class="enc-name">' + (enc.name || (enc.encounter && enc.encounter.name) || '???') + '</div>' +
      '<img src="' + enc.img + '" alt="" loading="lazy">' +
      '<div class="enc-quote">' + esc(enc.quote || '') + '</div>' +
      (gainStr ? '<div class="enc-gain">+' + gainStr + '</div>' : '') +
      '<button class="btn small">fechar</button>';
    card.querySelector('button').addEventListener('click', () => ov.remove());
    ov.appendChild(card);
    document.body.appendChild(ov);
    setTimeout(() => ov.classList.add('in'), 30);
    if (!enc.time && !enc.instant) setTimeout(() => ov.remove(), 4000);
  };

  /* ============================================================
     MODAL genérico
     ============================================================ */
  function openModal(title, bodyHtml, buttons) {
    closeModal();
    const m = el('div', 'ui-modal', '');
    m.id = 'ui-modal';
    const box = el('div', 'modal-box');
    box.appendChild(el('div', 'modal-title', title));
    const body = el('div', 'modal-body');
    if (typeof bodyHtml === 'string') body.innerHTML = bodyHtml;
    else body.appendChild(bodyHtml);
    box.appendChild(body);
    const footer = el('div', 'modal-foot');
    for (const b of (buttons || [])) {
      const btn = el('button', b.cls || 'btn', b.label);
      btn.addEventListener('click', () => {
        closeModal();
        if (b.cb) b.cb();
      });
      footer.appendChild(btn);
    }
    box.appendChild(footer);
    m.appendChild(box);
    m.addEventListener('click', (e) => { if (e.target === m) closeModal(); });
    document.body.appendChild(m);
    setTimeout(() => m.classList.add('in'), 10);
    return m;
  }
  function closeModal() {
    const m = document.getElementById('ui-modal');
    if (m) m.remove();
  }
  UI.closeModal = closeModal;

  /* ============================================================
     OFFLINE (vindo de Game.applyOffline no boot)
     ============================================================ */
  UI.showOffline = function (off) {
    if (!off) return;
    UI.toast('bem-vindo de volta após ' + fmtTime(off.elapsed) + '!', 'info', 5000);
    openModal('BEM-VINDO DE VOLTA', '<p>Você ficou offline por <b>' + fmtTime(off.elapsed) + '</b>.</p>' +
      '<p>Produziu <b class="hl">+' + fmtMoney(off.gain) + '</b> de dopamina com <b>' + Math.round(off.eff * 100) + '%</b> de eficiência offline.</p>', [
      { label: 'PROCESSAR!', cls: 'btn primary', cb: () => { UI.flush(); renderAllSoon(); } },
    ]);
  };

  /* ============================================================
     DENIED (sem dinheiro / sem condição)
     ============================================================ */
  function denied() {
    window.AudioFX.sfx.denied();
    const btn = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    Fx.shake(3);
  }

  /* ---------- utils de lista corrente ---------- */
  function tList(tab) {
    return document.querySelector('#tab-' + tab + ' > div:last-child');
  }

  /* ---------- expõe render manual ---------- */
  UI.render = function () { renderTab(selectedTab); UI.tick(0.2); };
  UI.renderTab = renderTab;
})();