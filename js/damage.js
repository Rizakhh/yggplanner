/* Cálculo de dano e simulação de combate (Renewal simplificado).  m = % total por uso (dividido em h golpes);
   quando a habilidade tem hl, m é % por golpe e o número de golpes depende do nível. */
(function () {
  'use strict';
  var Y = window.YGG, E = Y.E;
  var D = {};

  function skillRatio(s, lv) { return s.m[0] + s.m[1] * lv; }
  function hitsOf(s, lv, R) {
    if (!s.hl) return s.h || 1;
    switch (s.hl) {
      case 'lv': return lv;
      // Onda Psíquica: nível + 2 ondas, o dobro com Livro ou Cajado
      case 'pwave': return (lv + 2) * (R && /Book|Staff/.test(R.wtype || '') ? 2 : 1);
      // Esfera d'Água: 1, 1, 9, 9, 25 golpes (com água em volta)
      case 'wball': return [1, 1, 9, 9, 25][Math.max(1, Math.min(5, lv)) - 1];
      case 'half': return Math.ceil(lv / 2);
      case 'lv4': return 4;
      case 'meteor': return Math.ceil(lv / 2) + 2;
      case 'blitz': return 2;
      default: return s.h || 1;
    }
  }
  function costOf(s, lv) {
    if (s.spl) return s.spl[Math.max(1, Math.min(s.spl.length, lv)) - 1];
    return Math.max(1, Math.floor(s.sp[0] + s.sp[1] * lv));
  }

  // tempos de uma habilidade (segundos)
  D.timing = function (R, s, lv) {
    var B = R.B;
    var c = s.c ? (s.c[0] + s.c[1] * lv) : 0;
    var vc = c * R.castScale * Math.max(0, 1 + (B.castVar || 0) / 100);
    if (B.uninterrupt) vc = vc; // ininterrompível não altera o tempo
    // YggIdle: conjuração fixa de no máximo 0,5 s
    var fc = Math.min(0.5, Math.max(0, (s.fc || 0) * Math.max(0, 1 + ((B.castFix || 0) + (B.castFixPct || 0)) / 100) + (B.castFixSec || 0)));
    var acd = (s.d || 0) * Math.max(0, 1 + (B.afterCast || 0) / 100);
    var am = R.amotion / 1000;
    var cast = vc + fc;
    var cycle = cast + Math.max(acd, am);
    if (s.k === 'p' && !s.c) cycle = Math.max(cycle, am * 1.0);
    return { cast: cast, acd: acd, cycle: cycle, cd: s.cd || 0 };
  };

  // dano de um golpe de ataque físico contra um monstro. Retorna função amostradora e estatísticas
  D.physPer = function (R, b, mon, opt) {
    opt = opt || {};
    var B = R.B, G = R.G.base;
    var sizeIdx = { 'Pequeno': 0, 'Médio': 1, 'Grande': 2 }[mon.size] || 1;
    var fix = (E.SIZEFIX[R.wtype] || [100, 100, 100])[sizeIdx] / 100;
    var wl = G.wlv || 1;
    var wa = R.wAtkBase;
    var varAmt = wa * 0.05 * wl;
    var wmin = Math.max(0, wa - varAmt), wmax = wa + varAmt;
    return { fix: fix, wmin: wmin, wmax: wmax };
  };

  D.cardfix = function (R, kind, mon, isRanged, isBoss, atkEle) {
    var B = R.B, K = kind; // 'Phys' | 'Magic'
    var gen = (K === 'Phys' ? (B.dmgPhys || 0) : (B.dmgMagic || 0)) + (B.dmgBoth || 0);
    if (K === 'Phys') gen += isRanged ? (B.dmgRanged || 0) : (B.dmgMelee || 0);
    var race = (B['dmgRace:' + mon.race + ':' + K] || 0) + (B['dmgRace:' + mon.race + ':Both'] || 0) + (B['dmgRace:*:' + K] || 0);
    var ele = (B['dmgEle:' + mon.ele + ':' + K] || 0) + (B['dmgEle:' + mon.ele + ':Both'] || 0);
    var cls = isBoss ? ((B['dmgBoss:' + K] || 0) + (B['dmgBoss:Both'] || 0)) : ((B['dmgNormal:' + K] || 0) + (B['dmgNormal:Both'] || 0));
    var size = (B['dmgSize:' + mon.size + ':' + K] || 0) + (B['dmgSize:all:' + K] || 0) + (B['dmgSize:' + mon.size + ':Both'] || 0) + (B['dmgSize:all:Both'] || 0);
    var atkele = (B['dmgAtkEle:' + atkEle + ':' + K] || 0) + (B['dmgAtkEle:' + atkEle + ':Both'] || 0);
    // categorias multiplicativas entre si, aditivas dentro de cada uma
    return (1 + gen / 100) * (1 + race / 100) * (1 + ele / 100) * (1 + cls / 100) * (1 + size / 100) * (1 + atkele / 100);
  };

  // bônus de equipamento "Dano de [habilidade] +X%" (chave skill:<nome>): pelo nome do simulador, da árvore ou do cliente
  function skillBonus(R, s) {
    if (!s || !s.n || !R || !R.B) return 0;
    var low = function (x) { return String(x || '').toLowerCase().trim(); };
    var nm = {}; nm[low(s.n.replace(/\s*\(.*\)\s*$/, ''))] = 1;
    if (s.ae) { if (Y.sk2 && Y.sk2[s.ae]) nm[low(Y.sk2[s.ae].n)] = 1; if (Y.skn && Y.skn[s.ae]) nm[low(Y.skn[s.ae])] = 1; }
    var v = 0; Object.keys(R.B).forEach(function (k) { if (k.indexOf('skill:') === 0 && nm[low(k.slice(6))]) v += R.B[k] || 0; });
    return v;
  }
  D.skillBonus = skillBonus;
  // % final da habilidade: base + INT, × nível de base / 100 e × bônus "Dano de [habilidade]"
  function ratioFull(R, s, lv) {
    var r = skillRatio(s, lv);
    if (!R) return r;
    if (s.si) r += s.si * (R.int || 0);
    if (s.bl) r *= (R.lv || 100) / 100;
    var bn = skillBonus(R, s); if (bn) r *= 1 + bn / 100;
    return r;
  }
  D.ratioFull = ratioFull;

  // estatística de um uso de habilidade/ataque contra um monstro
  // retorna {hits, hitCh, critCh, min, max, avg (dano médio por golpe incluindo crítico), perCast, ...}
  D.skillDamage = function (R, b, s, lv, mon, o) {
    o = o || {};
    var B = R.B, isBoss = mon.cls >= 1;
    var atkEle = s && s.e ? s.e : (o.weaponEle || 'Neutro');
    var tbl = mon.tbl || {};
    var eleMult = (tbl[atkEle] != null ? tbl[atkEle] : 100) / 100;
    var hits = s ? hitsOf(s, lv, R) : 1;
    var isMagic = s && s.k === 'm';
    var ratio = s ? ratioFull(R, s, lv) : 100;
    var perHitRatio = s && s.hl ? ratio : ratio / hits;
    var res = { hits: hits, isMagic: isMagic, atkEle: atkEle, eleMult: eleMult, ratio: ratio };
    if (isMagic) {
      var mdefEff = Math.max(0, mon.mdef * (1 - Math.min(100, (B['ignMdef:' + (isBoss ? 'Boss' : 'Normal')] || 0) + (B['ignMdef:all'] || 0) + (B['ignMdef:race:' + mon.race] || 0)) / 100));
      var matk = R.matk;
      var cf = D.cardfix(R, 'Magic', mon, true, isBoss, atkEle);
      var dmg = matk * perHitRatio / 100 * eleMult * cf;
      dmg = dmg * (1000 + mdefEff) / (1000 + mdefEff * 10) - (o.softMdef || 0);
      dmg *= (1 + R.smatk / 100);
      dmg = Math.max(1, Math.floor(dmg));
      res.min = Math.floor(dmg * 0.95); res.max = Math.ceil(dmg * 1.05); res.avg = dmg;
      res.hitCh = 1; res.critCh = 0; res.critAvg = dmg;
    } else {
      var P = D.physPer(R, b, mon);
      var ranged = s && s.id !== 'basic' ? s.r === 'r' : R.ranged;
      var def = Math.max(0, mon.def * (1 - Math.min(100, (B['ignDef:' + (isBoss ? 'Boss' : 'Normal')] || 0) + (B['ignDef:all'] || 0) + (B['ignDef:race:' + mon.race] || 0)) / 100));
      var cf2 = D.cardfix(R, 'Phys', mon, ranged, isBoss, atkEle);
      var stAtk = R.batk * 2;
      function calc(wpn, crit) {
        var base = stAtk + wpn * P.fix + (wpn > 0 ? R.refAtk * P.fix : 0) + R.equipAtk;
        if (!crit) base += 0; else base += 0;
        // refino excedente aleatório (0..over) entra como média
        if (R.refOver) base += R.refOver / 2 * P.fix;
        base *= (1 + R.atkPct / 100);
        var d = base * perHitRatio / 100 * eleMult * cf2;
        if (s && s.hl === undefined && s.di) { /* ignora defesa */ } else d = d * (4000 + def) / (4000 + def * 10) - (o.softDef || 0);
        d *= (1 + R.patk / 100);
        if (crit) d *= D.critMult(R, b, o, s);
        return Math.max(1, Math.floor(d));
      }
      res.min = calc(P.wmin, false); res.max = calc(P.wmax, false); res.avg = calc((P.wmin + P.wmax) / 2, false);
      res.critAvg = calc(P.wmax, true);
      var mobFlee = mon.lv + mon.agi + 100;
      var hitRate = Math.min(100, Math.max(5, 80 + R.hit - mobFlee)) / 100;
      var perf = (B.perfHit || 0) / 100;
      res.hitCh = 1 - (1 - hitRate) * (1 - perf);
      var critCh = Math.max(0, R.critChance - (o.critDef || 0)) / 100;
      critCh = Math.min(1, critCh);
      var canCrit = !s || s.cr || (s.id === 'basic');
      res.critCh = canCrit ? critCh : 0;
      if (!canCrit) res.critAvg = res.avg;
      res.hitRate = hitRate;
    }
    // regras do YggIdle: aura / corte da Árvore do Caos e RES/MRES dos monstros do Caos
    var zm = D.zoneMult(R, b, o, isMagic);
    res.zone = zm;
    ['min', 'max', 'avg', 'critAvg'].forEach(function (k) { if (res[k] != null) res[k] = Math.max(1, Math.floor(res[k] * zm.mult)); });
    var perHitAvg = isMagic ? res.avg : (res.critCh * res.critAvg + (1 - res.critCh) * res.avg);
    res.perHitAvg = perHitAvg;
    res.perCast = perHitAvg * hits * res.hitCh;
    return res;
  };

  // ---------- zonas do YggIdle (Legado de Ymir) ----------
  // cut = % do dano que a aura segura; cd = Defesa Crítica; res = RES/MRES dos monstros; tree = corte de 0,3%/ponto da Árvore do Caos
  D.ZONES = {
    normal: { n: 'Mapa comum', cut: 0, cd: null, res: 0, tree: true, caos: false },
    sombrio: { n: 'Mundo Sombrio', cut: 70, cd: 40, res: 1200, tree: false, caos: true },
    inferno: { n: 'Portal do Inferno / Abismo', cut: 80, cd: 50, res: 2000, tree: false, caos: true },
    lhz: { n: 'Invasão de LHZ', cut: 30, cd: 30, res: 0, tree: false, caos: true },
    season: { n: 'Chefenia de Season', cut: 70, cd: 30, res: 0, tree: false, caos: true },
    guild: { n: 'Chefenia de Guild (chefe)', cut: 95, cd: 30, res: 0, tree: false, caos: true },
    pvp: { n: 'PvP / GvG / Battleground', cut: 0, cd: 0, res: 0, tree: false, caos: false }
  };
  D.zoneOf = function (b) { return D.ZONES[(b && b.opt && b.opt.zone2) || 'normal'] || D.ZONES.normal; };
  // Penetração de Redução: árvore até 25%, Ascensão V +5%, joias até 20%, total 50% (Ying Yang/Revanche passam do total)
  D.penetration = function (R) {
    var B = R.B, tree = Math.min(25, B.penTree || 0), tot = Math.min(50, tree + (B.penAsc || 0) + Math.min(20, B.penJewel || 0) + (B.pen || 0));
    return tot + (B.penOver || 0);
  };
  D.critDef = function (R, b) {
    var z = D.zoneOf(b), pts = R.B._caosPts || 0;
    if (z.cd != null) return z.cd;
    return Math.min(30, 0.3 * pts);
  };
  // crítico do YggIdle: 1,4 × (1 + extra × eficiência × (1 − sobra da Defesa Crítica))
  // Disparo Perfurante aproveita só 50% do bônus de dano crítico (patch de 16/11/2026)
  var CRIT_HALF = { overbrand: 1 };
  D.critMult = function (R, b, o, s) {
    var B = R.B, extra = (B.critDmg || 0) * (s && CRIT_HALF[s.id] ? 0.5 : 1) + (R.crate || 0);
    var cd = o && o.critDefOverride != null ? o.critDefOverride : D.critDef(R, b);
    var eff = 1 - 0.5 * Math.min(cd, 30) / 30;
    var left = Math.max(0, cd - extra / 2);
    return 1.4 * (1 + extra / 100 * eff * (1 - left / 100));
  };
  D.zoneMult = function (R, b, o, isMagic) {
    var z = D.zoneOf(b), pen = D.penetration(R), pts = R.B._caosPts || 0, mult = 1, info = { zone: z.n, pen: pen };
    if (z.tree) { var cut = Math.max(0, Math.min(30, 0.3 * pts) - pen); info.treeCut = cut; mult *= 1 - cut / 100; }
    if (z.cut) { var c2 = Math.max(0, z.cut - pen); info.aura = c2; mult *= 1 - c2 / 100; }
    if (z.res) { var r = z.res * (1 - Math.min(100, R.B.ignResCaos || 0) / 100); var red = r / (r + 400); info.res = red * 100; mult *= 1 - red; }
    if (z.caos) mult *= 1 + (R.B.dmgCaos || 0) / 100;
    info.mult = mult; return info;
  };

  D.BASIC = { id: 'basic', n: 'Ataque básico', k: 'p', max: 1, m: [100, 0], h: 1, a: 1, r: 'm', sp: [0, 0], c: [0, 0], d: 0, cd: 0, cr: 1, e: '' };

  // dano recebido de um monstro (por golpe) e chance de acerto
  D.mobHit = function (R, b, mon, o) {
    o = o || {};
    var B = R.B;
    var ele = o.mobEle && o.mobEle !== 'auto' ? o.mobEle : (o.mobEle === 'auto' ? mon.ele : 'Neutro');
    var raw = mon.atk;
    var d = raw * (4000 + R.def) / (4000 + R.def * 10) - R.def2;
    var res = R.res / (R.res + 400);
    d *= (1 - res);
    var eleRes = (B['resEle:' + ele] || 0) + (B['resEle:all'] || 0);
    var sizeRes = (B['resSize:' + (b.opt.playerSize || 'Médio')] || 0);
    var raceRes = (B['resRace:' + mon.race] || 0);
    var normRes = mon.cls >= 1 ? (B.resBoss || 0) : (B.resNormal || 0);
    var z = D.zoneOf(b), extra = (B.resMonster || 0) + (B.resPhys || 0) + (z.caos ? (B.resCaos || 0) : 0) + ((o.n || 1) > 1 ? (B.resPack || 0) : 0);
    d *= Math.max(0, 1 - (eleRes + raceRes + normRes + extra) / 100);
    d = Math.max(1, Math.floor(d));
    var hit = mon.lv + mon.dex + 150;
    var rate = Math.min(95, Math.max(5, 80 + hit - R.flee)) / 100;
    rate *= (1 - Math.min(0.95, R.flee2 / 1000));
    return { dmg: d, rate: rate, ele: ele };
  };

  // RNG determinística
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // simulação
  // cfg: {mon, n, rot:[{id,lv}], farm:bool, maxT, mobDelay, healPs, spRegen, mobEle, weaponEle, critDef, seed, boss}
  D.simulate = function (R, b, cfg, record) {
    var rnd = rng(cfg.seed || 1);
    var mon = cfg.mon, n = cfg.n || 1;
    var maxT = cfg.maxT || 300, farm = !!cfg.farm;
    var mobs = [];
    for (var i = 0; i < n; i++) mobs.push({ hp: mon.hp, alive: true, next: rnd() * (cfg.mobDelay || 1.5) });
    var rot = (cfg.rot || []).map(function (x) { var s = Y.skills[x.id]; return s ? { s: s, lv: Math.min(x.lv || s.max, s.max), ready: 0 } : null; }).filter(Boolean);
    var stat = {};
    rot.forEach(function (r) { stat[r.s.id] = D.skillDamage(R, b, r.s, r.lv, mon, cfg); });
    var basic = D.skillDamage(R, b, D.BASIC, 1, mon, cfg);
    var mh = D.mobHit(R, b, mon, cfg);
    var t = 0, hp = R.hp, sp = R.sp, kills = 0, dmgDealt = 0, dmgTaken = 0, casts = 0, spUsed = 0;
    var perSkill = {}, series = [], healAcc = 0, spAcc = 0, minHp = hp;
    var totalHp = mon.hp * n;
    var deadAt = null;
    function alive() { return mobs.filter(function (m) { return m.alive; }); }
    function mobsTick(upto) {
      // ataques dos monstros até o tempo upto
      mobs.forEach(function (m) {
        if (!m.alive) return;
        while (m.next <= upto && hp > 0) {
          if (rnd() < mh.rate) { hp -= mh.dmg; dmgTaken += mh.dmg; }
          m.next += (cfg.mobDelay || 1.5);
        }
      });
    }
    function sample(st, s, lv, crit) {
      if (st.isMagic) { return Math.max(1, Math.round(st.min + (st.max - st.min) * rnd())); }
      var base = st.min + (st.max - st.min) * rnd();
      if (crit) base = st.critAvg;
      return Math.max(1, Math.round(base));
    }
    function doHit(st, s, lv, target) {
      var tot = 0, hits = st.hits;
      for (var h = 0; h < hits; h++) {
        if (rnd() < st.hitCh) {
          var crit = !st.isMagic && rnd() < st.critCh;
          var d = sample(st, s, lv, crit);
          tot += d;
        }
      }
      return tot;
    }
    var lastRec = -1;
    function rec() { if (!record) return; var a = alive(); var hpM = mobs.reduce(function (x, m) { return x + Math.max(0, m.hp); }, 0); series.push([t, Math.max(0, hp) / R.hp, hpM / totalHp, sp / R.sp]); }
    rec();
    var guard = 0;
    while (t < maxT && hp > 0 && guard++ < 200000) {
      var al = alive();
      if (!al.length) {
        if (farm) { mobs.forEach(function (m) { if (!m.alive) { m.alive = true; m.hp = mon.hp; m.next = t + 1.0 + rnd(); } }); continue; }
        break;
      }
      // escolher ação
      var act = null;
      for (var r = 0; r < rot.length; r++) {
        var ro = rot[r];
        if (ro.ready > t) continue;
        var cost = costOf(ro.s, ro.lv) * (1 + (R.spCost || 0) / 100);
        if (sp < cost) continue;
        if (ro.s.k === 'b') continue;
        if (ro.s.w && ro.s.w.indexOf(R.wtype) < 0) continue;
        act = { s: ro.s, lv: ro.lv, st: stat[ro.s.id], cost: cost, ro: ro, tm: D.timing(R, ro.s, ro.lv) };
        break;
      }
      if (!act) act = { s: D.BASIC, lv: 1, st: basic, cost: 0, tm: { cast: 0, cycle: R.adelay / 1000, acd: 0, cd: 0 } };
      var dur = act.tm.cycle;
      var targets = al.slice(0, Math.max(1, Math.min(act.s.a || 1, al.length)));
      var tdt = 0;
      targets.forEach(function (m) {
        var d = doHit(act.st, act.s, act.lv, m);
        m.hp -= d; tdt += d; dmgDealt += d;
        if (m.hp <= 0 && m.alive) { m.alive = false; kills++; }
      });
      if (act.cost) { sp -= act.cost; spUsed += act.cost; }
      if (act.ro) act.ro.ready = t + dur + act.tm.cd;
      casts++;
      var ps = perSkill[act.s.id] || (perSkill[act.s.id] = { n: act.s.n, casts: 0, dmg: 0 });
      ps.casts++; ps.dmg += tdt;
      t += dur;
      mobsTick(t);
      // regeneração
      hp = Math.min(R.hp, hp + (cfg.healPs || 0) * dur);
      sp = Math.min(R.sp, sp + (cfg.spRegen || 0) * dur);
      minHp = Math.min(minHp, hp);
      if (record && t - lastRec > maxT / 300) { rec(); lastRec = t; }
    }
    rec();
    return {
      t: t, win: !alive().length && hp > 0, dead: hp <= 0, kills: kills, dmgDealt: dmgDealt, dmgTaken: dmgTaken, hpLeft: Math.max(0, hp), minHp: minHp,
      dps: t > 0 ? dmgDealt / t : 0, dtps: t > 0 ? dmgTaken / t : 0, casts: casts, perSkill: perSkill, series: series, spUsed: spUsed, mh: mh, stat: stat, basic: basic
    };
  };

  D.monteCarlo = function (R, b, cfg, runs) {
    var res = [], wins = 0, kpm = 0;
    for (var i = 0; i < runs; i++) {
      var c = Object.assign({}, cfg, { seed: (cfg.seed || 1) * 7919 + i * 104729 });
      var o = D.simulate(R, b, c, false);
      if (o.win) { res.push(o.t); wins++; } kpm += o.kills;
    }
    res.sort(function (a, c) { return a - c; });
    var n = res.length, q = function (p) { return n ? res[Math.min(n - 1, Math.floor(n * p))] : null; };
    return { runs: runs, wins: wins, p10: q(0.1), p50: q(0.5), p90: q(0.9), mean: n ? res.reduce(function (a, c) { return a + c; }, 0) / n : null, kills: kpm / runs };
  };

  D.ratio = skillRatio; D.hitsOf = hitsOf; D.costOf = costOf;
  Y.D = D;
})();
