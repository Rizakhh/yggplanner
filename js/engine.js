/* Motor de estatísticas do planner YggIdle (fórmulas do rAthena Renewal + regras do YggIdle).
   Tudo aproximado quando a wiki não detalha; ver README. */
(function () {
  'use strict';
  var Y = window.YGG;
  var ST = ['str', 'agi', 'vit', 'int', 'dex', 'luk'];
  var TR = ['pow', 'sta', 'wis', 'spl', 'con', 'crt'];
  // sW…sAR = equipamento sombrio (Sombra), vT…vC = visual. Não recebem refino de DEF, cartas nem bônus aleatórios comuns.
  var SHADOW = ['sW', 'sS', 'sB', 'sF', 'sAL', 'sAR'], VISUAL = ['vT', 'vM', 'vB', 'vC'];
  var SLOTS = ['weapon', 'shield', 'headT', 'headM', 'headB', 'body', 'cloak', 'shoes', 'accL', 'accR', 'ammo'].concat(SHADOW, VISUAL);
  var SLOT_NAMES = { weapon: 'Arma', shield: 'Escudo', headT: 'Elmo superior', headM: 'Elmo médio', headB: 'Elmo inferior', body: 'Armadura', cloak: 'Manto', shoes: 'Calçado', accL: 'Acessório (E)', accR: 'Acessório (D)', ammo: 'Munição',
    sW: 'Sombrio: arma', sS: 'Sombrio: escudo', sB: 'Sombrio: armadura', sF: 'Sombrio: calçado', sAL: 'Sombrio: acessório (E)', sAR: 'Sombrio: acessório (D)',
    vT: 'Visual: topo', vM: 'Visual: meio', vB: 'Visual: baixo', vC: 'Visual: capa' };
  var SLOT_TYPE = { weapon: 'weapon', shield: 'shield', headT: 'headT', headM: 'headM', headB: 'headB', body: 'body', cloak: 'cloak', shoes: 'shoes', accL: 'acc', accR: 'acc', ammo: 'ammo',
    sW: 'sW', sS: 'sS', sB: 'sB', sF: 'sF', sAL: 'sA', sAR: 'sA', vT: 'vT', vM: 'vM', vB: 'vB', vC: 'vC' };
  var EXTRA_SLOT = {}; SHADOW.concat(VISUAL).forEach(function (s) { EXTRA_SLOT[s] = s[0] === 's' ? 'shadow' : 'visual'; });
  var CARD_TYPE = { weapon: 'weapon', shield: 'shield', headT: 'head', headM: 'head', headB: 'head', body: 'body', cloak: 'cloak', shoes: 'shoes', accL: 'acc', accR: 'acc' };
  var GEM_SLOTS = { body: 1, shoes: 1, accL: 1, accR: 1, headM: 1, cloak: 1 };

  // tabela de ajuste de tamanho da arma (Pequeno, Médio, Grande), rAthena size_fix
  var SIZEFIX = {
    Fist: [100, 100, 100], Dagger: [100, 75, 50], '1hSword': [75, 100, 75], '2hSword': [75, 75, 100], '1hSpear': [75, 75, 100], '2hSpear': [75, 75, 100],
    '1hAxe': [50, 75, 100], '2hAxe': [50, 75, 100], Mace: [75, 100, 100], '2hMace': [100, 100, 100], Staff: [100, 100, 100], '2hStaff': [100, 100, 100], Bow: [100, 100, 75],
    Knuckle: [100, 75, 50], Musical: [75, 100, 75], Whip: [75, 100, 50], Book: [100, 100, 50], Katar: [75, 100, 75], Revolver: [100, 100, 75], Rifle: [100, 100, 75],
    Gatling: [100, 100, 75], Shotgun: [100, 100, 75], Grenade: [100, 100, 75], Huuma: [100, 75, 50]
  };
  var RANGED = { Bow: 1, Musical: 1, Whip: 1, Revolver: 1, Rifle: 1, Gatling: 1, Shotgun: 1, Grenade: 1 };

  // índices
  Y.itemById = {};
  Y.items.forEach(function (it) { Y.itemById[it.id] = it; });
  Y.monById = {};
  Y.monsters.forEach(function (m) { Y.monById[m.id] = m; });

  function norm(s) { return String(s || '').toLowerCase().replace(/\s*\[\d+\]\s*$/, '').replace(/^carta\s+/, '').replace(/[\[\]]/g, '').trim(); }

  function newBuild() {
    var b = {
      v: 1, name: 'Nova build', cls: 'lor', lv: 175, stats: {}, traits: {}, bonusPts: 0, bonusTraitPts: 0,
      eq: {}, buffs: {}, skills: {}, extra: [], opt: { zone: true, traits: true, aspdCap: 193 }
    };
    ST.forEach(function (k) { b.stats[k] = 1; });
    TR.forEach(function (k) { b.traits[k] = 0; });
    return b;
  }
  function newEq(id) {
    var it = Y.itemById[id];
    var o = { id: id, ref: 0, rar: 0, tier: 1, lines: [], cards: [], gem: [0, 0] };
    return o;
  }

  // ---------- pontos de atributo ----------
  // no YggIdle as 1ª classes já são as "T" (Espadachim T etc.): começam com 100 pontos e têm o bônus de HP/SP das transcendentais.
  // classes expandidas (Taekwon e evoluções, Super Aprendiz, Ninja, Justiceiro) não renascem.
  var EXPANDED = { sup: 1, gun: 1, nin: 1, tae: 1, sg: 1, sl: 1 };
  function isHigh(id) { var c = Y.classById[id]; return !!c && !EXPANDED[id] && c.tier >= 1 && c.tier !== 2; }
  // total de pontos por nível = tabela de renewal do rAthena (db/re/statpoint.yml), que é o servidor do YggIdle;
  // transcendentais (as 1ª classes "T" do YggIdle) ganham +52 (começam com 100). Conferido no jogo: Nv 175 T = 3.330 pontos.
  var STATP = [48,51,54,57,60,64,68,72,76,80,85,90,95,100,105,111,117,123,129,135,142,149,156,163,170,178,186,194,202,210,219,228,237,246,255,265,275,285,295,305,316,327,338,349,360,372,384,396,408,420,433,446,459,472,485,499,513,527,541,555,570,585,600,615,630,646,662,678,694,710,727,744,761,778,795,813,831,849,867,885,904,923,942,961,980,1000,1020,1040,1060,1080,1101,1122,1143,1164,1185,1207,1229,1251,1273,1295,1318,1341,1364,1387,1410,1433,1456,1479,1502,1525,1549,1573,1597,1621,1645,1669,1693,1717,1741,1765,1790,1815,1840,1865,1890,1915,1940,1965,1990,2015,2041,2067,2093,2119,2145,2171,2197,2223,2249,2275,2302,2329,2356,2383,2410,2437,2464,2491,2518,2545,2573,2601,2629,2657,2685,2713,2741,2770,2799,2828,2857,2886,2915,2944,2974,3004,3034,3064,3094,3124,3154,3185,3216,3247,3278];
  function statPointsTotal(lv, cls) {
    lv = Math.max(1, Math.min(STATP.length, lv | 0 || 1));
    return STATP[lv - 1] + (cls && !isHigh(cls) ? 0 : 52);
  }
  // custo para ir de v para v+1 (renewal): até 99 = (v-1)/10 + 2; de 100 em diante = 16 + 4 a cada 5 pontos acima de 100
  function statCost(v) { return v < 100 ? Math.floor((v - 1) / 10) + 2 : 16 + 4 * Math.floor((v - 100) / 5); }
  function statSpent(stats) {
    var t = 0;
    ST.forEach(function (k) { for (var v = 1; v < stats[k]; v++) t += statCost(v); });
    return t;
  }
  function traitPointsTotal(lv) { return Math.max(0, (lv - 100) * 3 + 3); }

  // ---------- bônus aleatórios ----------
  var BT = {};
  Y.bonus.types.forEach(function (t) { BT[t.id] = t; });
  function resolveKey(t, p) {
    var k = t.key;
    if (t.param === 'nb') { var v = p === 'Chefe' ? 'Boss' : 'Normal'; return k.replace('dmgNB', 'dmg' + v).replace('ignDef:*', 'ignDef:' + v).replace('ignMdef:*', 'ignMdef:' + v); }
    if (t.param === 'attr') return p || 'str';
    if (t.param === 'race' || t.param === 'ele') return k.replace('*', p || '');
    return k;
  }
  function lineRange(typeId, rar, tier) {
    var t = BT[typeId]; if (!t || rar < 1) return null;
    var r = t.r[rar - 1]; if (!r) return null;
    var m = t.noScale ? 1 : (Y.bonus.tierMult[tier] || 1);
    return [Math.round(r[0] * m), Math.round(r[1] * m)];
  }

  function jlRarity(it, ref) { var n = 0; (it.jr || []).forEach(function (r) { if (ref >= r) n++; }); return n; }

  // ---------- condições ----------
  function slotRef(b, which) {
    var sl = { 'Armadura': 'body', 'Batina': 'body', 'Manto': 'cloak', 'Capa': 'cloak', 'Botas': 'shoes', 'Calçado': 'shoes', 'Arma': 'weapon', 'Escudo': 'shield', 'Elmo': 'headT', 'Joia': 'sS', 'Jóia': 'sS' };
    var parts = which.split(/ ou /), best = 0;
    var out = [];
    parts.forEach(function (p) {
      var found = null;
      Object.keys(sl).forEach(function (k) { if (p.indexOf(k) >= 0 && !found) found = sl[k]; });
      if (found && b.eq[found]) best = Math.max(best, b.eq[found].ref || 0);
    });
    return best;
  }
  function sumRef(b, txt) {
    var tot = 0;
    txt.split(/ e /).forEach(function (grp) { tot += slotRef(b, grp); });
    return tot;
  }
  function condMult(c, ctx) {
    if (!c) return 1;
    var b = ctx.b;
    if (c.proc) return 0;
    if (c.set) {
      for (var i = 0; i < c.set.length; i++) {
        var ok = c.set[i].some(function (n) { return ctx.names[norm(n)]; });
        if (!ok) return 0;
      }
      if (!c.sum) return 1;
    }
    if (c.sum) return sumRef(b, c.sum) >= c.r ? 1 : 0;
    if (c.rx) return slotRef(b, c.rx) >= c.r ? 1 : 0;
    if (c.every) {
      var n = c.every, ref = ctx.ref;
      if (c.cap) ref = Math.min(ref, c.cap);
      return Math.floor(ref / n);
    }
    if (c.r != null) return ctx.ref >= c.r ? 1 : 0;
    if (c.perStat) return Math.floor((ctx.R ? ctx.R[c.perStat] : b.stats[c.perStat]) / c.n);
    if (c.perBase) return Math.floor(b.lv / c.perBase);
    if (c.perSkill) {
      var nm = c.perSkill.toLowerCase(), lvl = 0, found = false;
      Object.keys(Y.skills).forEach(function (id) {
        var s = Y.skills[id];
        if (s.n.toLowerCase().indexOf(nm) === 0) { found = true; lvl = Math.max(lvl, b.skills[id] != null ? b.skills[id] : (b.buffs[id] != null ? b.buffs[id] : s.max)); }
      });
      return found ? Math.floor(lvl / c.n) : 0;
    }
    if (c.min) {
      if (c.min === 'base') return b.lv >= c.v ? 1 : 0;
      var key = { 'FOR base': 'str', 'AGI base': 'agi', 'VIT base': 'vit', 'INT base': 'int', 'DES base': 'dex', 'SOR base': 'luk' }[c.min];
      return key && b.stats[key] >= c.v ? 1 : 0;
    }
    if (c.zone2) return c.zone2.split('|').indexOf(b.opt.zone2) >= 0 ? 1 : 0; // zona específica (ex.: só no Inferno)
    if (c.zone) return b.opt.zone ? 1 : 0;
    if (c.job) {
      var j = c.job.toLowerCase().replace(/s$/, '');
      var cl = Y.classById[b.cls];
      return cl && cl.items.some(function (x) { return x.toLowerCase().replace(/s$/, '') === j || j.indexOf(x.toLowerCase()) === 0; }) ? 1 : 0;
    }
    return 1;
  }

  function add(B, k, v) { B[k] = (B[k] || 0) + v; }
  var HOOKS = [];

  function applyFx(B, fxs, ctx, notes, src) {
    if (!fxs) return;
    fxs.forEach(function (f) {
      var m = condMult(f.c, ctx);
      if (f.s) {
        if (!m) return;
        Object.keys(f.s).forEach(function (k) {
          var v = f.s[k];
          if (k.indexOf('ref2:') === 0) { add(B, k.slice(5), v * ctx.ref * ctx.ref); }
          else if (k.indexOf('ref1:') === 0) { add(B, k.slice(5), v * ctx.ref * m); }
          else add(B, k, v * m);
        });
      } else if (f.t) {
        var active = f.c && f.c.proc ? true : !!m;
        notes.push({ src: src, t: f.t, c: f.c, on: active });
      }
    });
  }

  // ---------- coleta de bônus ----------
  // encantamentos que vão no próprio equipamento (ex.: Bênção de FOR na Batina Angelical)
  function canEnch(it) { return !!it && /^Batina Angelical /.test(it.n); }
  // carta/gema só vale no tipo de slot de origem (carta de armadura só na armadura etc.).
  // gi: undefined = encaixe de carta; 0 = gema normal; 1 = gema de miniboss/MVP.
  function cardFits(sl, cid, gi) {
    var c = typeof cid === 'object' ? cid : Y.itemById[cid];
    if (!c || c.c !== 'k' || !CARD_TYPE[sl] || c.s !== CARD_TYPE[sl]) return false;
    if (c.only && c.only !== sl) return false; // ex.: Carta Geodoliant só no Acessório Direito
    if (gi === undefined) return true;
    if (!GEM_SLOTS[sl]) return false;
    return gi === 0 ? !c.k : !!c.k;
  }
  // item de lado único (ex.: Máscara de Oni só no Acessório Esquerdo): it.only é o slot permitido
  function itemFits(sl, it) { it = typeof it === 'object' ? it : Y.itemById[it]; return !!it && (!it.only || it.only === sl); }
  function eqCards(sl, e) { return (e.cards || []).filter(function (cid) { return cardFits(sl, cid); }); }
  function eqGems(sl, e) { return (e.gem || []).filter(function (cid, gi) { return cardFits(sl, cid, gi); }); }
  function enchOf(it, e) { return canEnch(it) ? (e.ench || []).filter(function (cid) { return cid && Y.itemById[cid] && Y.itemById[cid].s === 'ench'; }) : []; }
  function gather(b) {
    var B = {}, notes = [], names = {}, parts = [];
    var eqs = [];
    SLOTS.forEach(function (sl) {
      var e = b.eq[sl]; if (!e) return;
      var it = Y.itemById[e.id]; if (!it || !itemFits(sl, it)) return;
      eqs.push({ sl: sl, e: e, it: it });
      names[norm(it.n)] = 1;
      eqCards(sl, e).forEach(function (cid) { names[norm(Y.itemById[cid].n)] = 1; });
      // gemas não contam para combos de cartas
      enchOf(it, e).forEach(function (cid) { names[norm(Y.itemById[cid].n)] = 1; });
    });
    var base = { atk: 0, def: 0, mdef: 0, matk: 0, wAtk: 0, wMatk: 0, wlv: 1, wtype: 'Fist', refAtk: 0, refOver: 0, twoH: 0 };
    eqs.forEach(function (o) {
      var e = o.e, it = o.it, ref = e.ref || 0;
      var ctx = { b: b, ref: ref, names: names };
      if (o.sl === 'weapon') {
        base.wAtk = it.a || 0; base.wMatk = it.ma || 0; base.wlv = it.wl || 1; base.wtype = it.w || 'Fist'; base.twoH = it.th || 0;
        var tb = Y.ra.refine['Weapon' + Math.min(5, Math.max(1, base.wlv))];
        if (tb && ref > 0) { base.refAtk = tb.bonus[ref - 1] || 0; base.refOver = tb.over[ref - 1] || 0; }
      } else if (o.sl !== 'ammo') {
        base.def += (it.d || 0);
        var ta = Y.ra.refine.Armor1;
        if (ta && ref > 0 && o.sl !== 'accL' && o.sl !== 'accR' && !EXTRA_SLOT[o.sl]) base.def += ta.bonus[ref - 1] || 0;
        base.mdef += (it.md || 0);
      } else { base.ammoAtk = it.a || 0; }
      applyFx(B, it.fx, ctx, notes, it.n);
      // cartas e gemas
      eqCards(o.sl, e).concat(eqGems(o.sl, e), enchOf(it, e)).forEach(function (cid) {
        if (!cid) return; var c = Y.itemById[cid]; if (!c) return;
        applyFx(B, c.fx, ctx, notes, c.n);
      });
      // bônus aleatórios próprios do item (ex.: Joia do Destino): a raridade sobe com o refino e cada raridade libera 1 linha
      if (it.jl) {
        var jr = jlRarity(it, ref);
        (e.jlines || []).slice(0, jr).forEach(function (ix) {
          var J = it.jl[ix]; if (!J) return;
          J.k.forEach(function (k) { add(B, k, J.v[jr - 1]); });
        });
      }
      // bônus aleatórios
      if (!EXTRA_SLOT[o.sl]) (e.lines || []).forEach(function (L) {
        var t = BT[L.t]; if (!t || !L.v) return;
        var key = resolveKey(t, L.p);
        var v = L.v * (t.neg ? -1 : 1);
        add(B, key, v);
      });
    });
    // buffs
    Object.keys(b.buffs).forEach(function (id) {
      var lv = b.buffs[id], s = Y.skills[id];
      if (!s || !lv || s.k !== 'b') return;
      var fx = s.fx(lv);
      Object.keys(fx).forEach(function (k) { add(B, k, fx[k]); });
    });
    // extras
    (b.extra || []).forEach(function (x) { if (x.k && x.v) add(B, x.k, +x.v); });
    // fontes externas (Árvore do Caos, consumíveis…) registradas pela interface
    HOOKS.forEach(function (f) { f(b, B, notes, add); });
    return { B: B, notes: notes, base: base, names: names };
  }

  // ---------- HP/SP base ----------
  function baseTable(job, lv, kind) {
    var j = Y.ra.jobs[job] || Y.ra.jobs.Novice;
    var f = kind === 'hp' ? j.hpFactor : j.spFactor, inc = kind === 'hp' ? j.hpInc : j.spInc;
    var v = kind === 'hp' ? 35 : 10;
    for (var i = 1; i < lv; i++) v += Math.floor(f * (i + 1) / 100) + Math.floor(inc / 100);
    return v;
  }

  // ---------- cálculo principal ----------
  function compute(b) {
    var G = gather(b), B = G.B, base = G.base, R = { B: B, notes: G.notes, G: G };
    var cl = Y.classById[b.cls] || Y.classes[0];
    var lv = b.lv;
    R.lv = lv; R.cls = cl;
    var allS = B.allStats || 0, allT = B.allTraits || 0;
    ST.forEach(function (k) { R[k] = (b.stats[k] || 1) + (B[k] || 0) + allS; R['b_' + k] = b.stats[k]; });
    var tOn = b.opt.traits;
    TR.forEach(function (k) { R[k] = tOn ? ((b.traits[k] || 0) + (B[k] || 0) + allT) : 0; });
    // weapon type / ranged
    var wtype = base.wtype; R.wtype = wtype; R.ranged = !!RANGED[wtype];
    // ATQ de status
    var main = R.ranged ? R.dex : R.str, other = R.ranged ? R.str : R.dex;
    R.batk = Math.floor((main * 10 + Math.floor(other * 10 / 5) + Math.floor(R.luk * 10 / 3) + Math.floor(lv * 10 / 4)) / 10) + 5 * R.pow;
    // ATQ da arma
    R.wAtkBase = base.wAtk + (base.ammoAtk && wtype === 'Bow' ? base.ammoAtk : 0);
    R.refAtk = base.refAtk; R.refOver = base.refOver;
    R.equipAtk = (B.atk || 0);
    R.patk = Math.floor(R.pow / 3) + Math.floor(R.con / 5) + (B.patk || 0);
    R.smatk = Math.floor(R.spl / 3) + Math.floor(R.con / 5) + (B.smatk || 0);
    // ATQM
    R.statusMatk = R.int + Math.floor(R.int / 2) + Math.floor(R.dex / 5) + Math.floor(R.luk / 3) + Math.floor(lv / 4) + 5 * R.spl;
    R.wMatk = base.wMatk;
    R.refMatk = base.wMatk ? base.refAtk : 0; // refino da arma também soma ao ATQM quando a arma tem ATQM
    R.equipMatk = (B.matk || 0);
    R.matkPct = B.matkPct || 0; R.atkPct = B.atkPct || 0;
    R.matk = Math.floor((R.statusMatk + R.wMatk + R.refMatk + R.equipMatk) * (1 + R.matkPct / 100));
    // defesas
    R.def = Math.floor((base.def) * (1 + (B.defPct || 0) / 100)) + (B.def || 0);
    R.def2 = Math.floor((lv + R.vit) / 2 + R.agi / 5);
    R.mdef = Math.floor(base.mdef * (1 + (B.mdefPct || 0) / 100)) + (B.mdef || 0);
    R.mdef2 = Math.floor(R.int + lv / 4 + (R.dex + R.vit) / 5);
    // HIT / FLEE / CRIT
    R.hit = lv + R.dex + Math.floor(R.luk / 3) + 175 + 2 * R.con + (B.hit || 0);
    R.hit = Math.floor(R.hit * (1 + (B.hitPct || 0) / 100));
    R.flee = lv + R.agi + Math.floor(R.luk / 5) + 100 + 2 * R.con + (B.flee || 0);
    R.flee = Math.floor(R.flee * (1 + (B.fleePct || 0) / 100));
    R.flee2 = R.luk + 10 + (B.pflee || 0) * 10;
    R.cri = 10 + R.luk * 3 + Math.floor(lv / 10) + (B.crit || 0) * 10; // décimos
    R.crit = R.cri / 10;
    R.critChance = R.crit + (B.critPct || 0);
    R.critDouble = !!B.critDouble;
    if (R.critDouble) R.critChance *= 2;
    R.critDmg = 40 + (B.critDmg || 0); // % adicional (base 140%)
    R.hplus = R.crt + (B.hplus || 0); R.crate = Math.floor(R.crt / 3) + (B.crate || 0);
    R.res = R.sta + Math.floor(R.sta / 3) * 5 + (B.res || 0);
    R.mres = R.wis + Math.floor(R.wis / 3) * 5 + (B.mres || 0);
    // HP / SP
    var rj = cl.rj;
    var trans = isHigh(b.cls) ? 1.25 : 1;
    var dHp = baseTable(rj, lv, 'hp'); dHp *= (1 + R.vit * 0.01); dHp *= trans; dHp += (B.hp || 0);
    dHp += dHp * (B.hpPct || 0) / 100;
    R.hp = Math.max(1, Math.floor(dHp));
    var dSp = baseTable(rj, lv, 'sp'); dSp *= (1 + R.int * 0.01); dSp *= trans; dSp += (B.sp || 0);
    dSp += dSp * (B.spPct || 0) / 100;
    R.sp = Math.max(1, Math.floor(dSp));
    // ASPD (Renewal)
    var job = Y.ra.jobs[rj] || Y.ra.jobs.Novice, asp = job.aspd || {};
    var key = wtype === 'Fist' || !wtype ? 'Fist' : wtype;
    var aBase = asp[key] != null ? asp[key] : (asp.Fist || 50);
    if (b.eq.shield) aBase += (asp.Shield || 0);
    var temp = R.ranged ? R.dex * R.dex / 7 : R.dex * R.dex / 5;
    temp = Math.sqrt(temp + R.agi * R.agi * 0.5) * 0.25 + 196;
    var a = Math.floor(temp + (0) * R.agi / 200) - Math.min(aBase, 200);
    R.aspdBase = a;
    var aspd = a + (B.aspd || 0);
    // cada ponto de ASPD = -10 ms de amotion; velocidade % reduz o amotion
    var cap = b.opt.aspdCap || 193;
    aspd = Math.min(aspd, cap);
    var am = 2000 - aspd * 10;
    var pct = Math.min(B.aspdPct || 0, 100);
    R.aspd = Math.min(aspd, cap);
    // converter % em ASPD equivalente (rate aplicada sobre amotion), respeitando o limite
    am = Math.max(2000 - cap * 10, Math.floor(am * (100 - pct) / 100));
    R.amotion = am;
    R.aspdEff = Math.round((2000 - am) / 10);
    R.adelay = am * 2; // ms entre ataques básicos
    R.aps = 1000 / R.adelay;
    // conjuração
    R.castScale = Math.max(0, 1 - Math.sqrt((R.dex * 2 + R.int) / 530));
    R.castVar = (B.castVar || 0); // soma de % (negativo = reduz)
    R.afterCast = B.afterCast || 0;
    R.spCost = B.spCost || 0;
    // dano: modificadores
    R.mod = B;
    // peso
    var wt = 0; Object.keys(b.eq).forEach(function (sl) { var e = b.eq[sl]; if (e && Y.itemById[e.id] && itemFits(sl, e.id)) wt += (Y.itemById[e.id].wt || 0); });
    R.weight = wt; R.maxWeight = (job.maxWeight || 20000) / 10 + R.str * 30;
    // pontos
    R.ptsTotal = statPointsTotal(lv, b.cls) + (b.bonusPts || 0);
    R.ptsUsed = statSpent(b.stats);
    R.traitTotal = (cl.tier >= 3 ? traitPointsTotal(lv) : traitPointsTotal(lv)) + (b.bonusTraitPts || 0);
    R.traitUsed = TR.reduce(function (s, k) { return s + (b.traits[k] || 0); }, 0);
    return R;
  }

  Y.E = {
    ST: ST, TR: TR, SLOTS: SLOTS, SLOT_NAMES: SLOT_NAMES, SLOT_TYPE: SLOT_TYPE, CARD_TYPE: CARD_TYPE, GEM_SLOTS: GEM_SLOTS, SIZEFIX: SIZEFIX, RANGED: RANGED,
    newBuild: newBuild, newEq: newEq, compute: compute, gather: gather, statPointsTotal: statPointsTotal, isHigh: isHigh, EXPANDED: EXPANDED, statCost: statCost, statSpent: statSpent,
    SHADOW: SHADOW, VISUAL: VISUAL, EXTRA_SLOT: EXTRA_SLOT, jlRarity: jlRarity,
    lineRange: lineRange, resolveKey: resolveKey, BT: BT, norm: norm, hooks: HOOKS, condMult: condMult, canEnch: canEnch, cardFits: cardFits, itemFits: itemFits
  };
})();
