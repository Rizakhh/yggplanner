/* Interface do YggIdle Build Planner */
(function () {
  'use strict';
  var Y = window.YGG, E = Y.E, D = Y.D;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var LS = 'yggplanner.v1';
  var b, R, tab = 'guide', selSlot = 'weapon', simRes = null;
  var STN = { str: 'FOR', agi: 'AGI', vit: 'VIT', int: 'INT', dex: 'DES', luk: 'SOR' };
  var TRN = { pow: 'POD', sta: 'STA', wis: 'SAB', spl: 'FEI', con: 'CON', crt: 'CRV' };
  var TRD = { pow: 'P.ATQ', sta: 'RES', wis: 'MRES', spl: 'S.ATQM', con: 'HIT/FLEE', crt: 'C.RATE / H.PLUS' };

  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (k === 'on') Object.keys(v).forEach(function (ev) { e.addEventListener(ev, v[ev]); });
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'class') e.className = v;
      else if (k === 'value') e.value = v;
      else if (v === true) e.setAttribute(k, '');
      else if (v !== false && v != null) e.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) { if (c == null) return; e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c); });
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.remove('hidden'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.add('hidden'); }, 2200); }
  function fmt(n, d) { if (n == null || isNaN(n)) return '-'; return Number(n).toLocaleString('pt-BR', { maximumFractionDigits: d == null ? 0 : d }); }

  // ---------- arte (wiki do YggIdle, com reserva na Divine Pride) ----------
  var ART = 'https://yggidle.com.br/wiki-arte/v2/', DP = 'https://static.divine-pride.net/images/';
  var SPR = { sup: 23, swo: 1, mag: 2, arc: 3, aco: 4, mer: 5, thi: 6, kni: 4008, lor: 4008, pri: 4009, hpr: 4009, wiz: 4010, hwz: 4010, bla: 4011, whi: 4011, hun: 4012, sni: 4012,
    ass: 4013, asx: 4013, cru: 4015, pal: 4015, mon: 4016, cha: 4016, sag: 4017, pro: 4017, rog: 4018, sta: 4018, alc: 4019, cre: 4019, bar: 4020, min: 4020, dan: 4021, gyp: 4021,
    gun: 24, nin: 25, tae: 4046, sg: 4047, sl: 4049 };
  function sprite(cls, sex) {
    var j = SPR[cls]; if (j == null) return null;
    var s = sex || (b && b.sex) || 'm'; if (j === 4020) s = 'm'; if (j === 4021) s = 'f';
    return ART + 'classes/' + j + '-' + s + '.png';
  }
  // sprite da classe; se faltar o gênero tenta o outro, se faltar tudo usa o retrato desenhado
  function spriteEl(cls, extra, sex) {
    var u = sprite(cls, sex);
    if (!u) return h('span', { class: 'spr svgp ' + (extra || ''), html: Y.portrait(cls) });
    var im = h('img', { src: u, class: 'spr ' + (extra || ''), alt: '', draggable: 'false' }), tried = 0;
    im.onerror = function () {
      if (!tried++) { im.src = u.replace(/-(m|f)\.png$/, function (x, g) { return '-' + (g === 'm' ? 'f' : 'm') + '.png'; }); return; }
      var sp = h('span', { class: 'spr svgp ' + (extra || ''), html: Y.portrait(cls) }); if (im.parentNode) im.parentNode.replaceChild(sp, im);
    };
    return im;
  }
  function iconImg(src, fb, cls) {
    var im = h('img', { src: src, class: cls || 'ico', loading: 'lazy', alt: '', draggable: 'false' });
    im.onerror = function () { if (fb) { im.src = fb; fb = null; } else im.classList.add('miss'); };
    return im;
  }
  function itemIcon(id, cls) { return iconImg(ART + 'itens/' + id + '.png', DP + 'items/item/' + id + '.png', cls || 'ico'); }
  function skillIcon(ae, cls) { var s = Y.sk2 && Y.sk2[ae]; return iconImg(ART + 'skills/' + ae + '.png', s ? DP + 'skill/' + s.i + '.png' : null, cls || 'sico'); }
  function mobImg(id, cls) { return iconImg(ART + 'monstros/' + id + '.webp', null, cls || 'mimg'); }
  function mapImg(code, cls) { return iconImg(ART + 'mapas/' + code + '.png', null, cls || 'mmap'); }

  // ligação entre as habilidades do simulador (ids curtos) e a árvore (AEGIS)
  var SKA = {}, AKS = {};
  (function () {
    if (!Y.sk2) return;
    var byPt = {}, byEn = {};
    Object.keys(Y.sk2).forEach(function (a) { var s = Y.sk2[a]; byPt[s.n.toLowerCase()] = byPt[s.n.toLowerCase()] || a; if (s.en) byEn[s.en.toLowerCase()] = byEn[s.en.toLowerCase()] || a; });
    Object.keys(Y.skills).forEach(function (id) {
      var n = Y.skills[id].n, m = n.match(/^(.*?)\s*\((.*)\)\s*$/), pt = (m ? m[1] : n).toLowerCase(), en = m ? m[2].toLowerCase() : '';
      var a = byEn[en] || byPt[pt] || byEn[pt]; if (a) { SKA[id] = a; if (!AKS[a]) AKS[a] = id; }
    });
  })();
  function skLabel(x) { if (Y.sk2 && Y.sk2[x]) return Y.sk2[x].n; var s = Y.skills[x]; return s ? s.n.replace(/ \(.*\)$/, '') : x; }

  // tooltip flutuante
  var tipEl = null;
  function showTip(ev, node) {
    if (!tipEl) { tipEl = h('div', { class: 'ftip' }); document.body.appendChild(tipEl); }
    tipEl.innerHTML = ''; tipEl.appendChild(node); tipEl.style.display = 'block'; moveTip(ev);
  }
  function moveTip(ev) {
    if (!tipEl || tipEl.style.display !== 'block') return;
    var w = tipEl.offsetWidth, hh = tipEl.offsetHeight, x = ev.clientX + 16, y = ev.clientY + 14;
    if (x + w > innerWidth - 8) x = ev.clientX - w - 12; if (y + hh > innerHeight - 8) y = Math.max(8, innerHeight - hh - 8);
    tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
  }
  function hideTip() { if (tipEl) tipEl.style.display = 'none'; }
  function tipOn(el, make) { el.addEventListener('mouseenter', function (e) { showTip(e, make()); }); el.addEventListener('mousemove', moveTip); el.addEventListener('mouseleave', hideTip); return el; }
  var LBL = {
    atk: 'ATQ extra', matk: 'ATQM extra', def: 'DEF', mdef: 'MDEF', hit: 'HIT', flee: 'FLEE', crit: 'CRIT', hp: 'HP', sp: 'SP', aspd: 'ASPD', atkPct: 'ATQ %', matkPct: 'ATQM %',
    defPct: 'DEF %', mdefPct: 'MDEF %', hpPct: 'HP %', spPct: 'SP %', aspdPct: 'Vel. ataque %', critPct: 'Chance crítico %', critDmg: 'Dano crítico %', dmgPhys: 'Dano físico %',
    dmgMagic: 'Dano mágico %', dmgBoth: 'Dano total %', dmgMelee: 'Corpo a corpo %', dmgRanged: 'À distância %', castVar: 'Conj. variável %', castFix: 'Conj. fixa %',
    afterCast: 'Pós-conjuração %', patk: 'P.ATQ', smatk: 'S.ATQM', res: 'RES', mres: 'MRES', hplus: 'H.PLUS', crate: 'C.RATE', perfHit: 'Precisão perfeita %', allStats: 'Todos os atributos',
    allTraits: 'Todos os traços', spCost: 'Custo de SP %', healPct: 'Cura recebida %', pflee: 'FLEE perfeito', critDef: 'Def. crítico',
    castFixPct: 'Conj. fixa %', expPct: 'EXP %', expCaos: 'EXP do Caos %', dropPct: 'Drop %', moveSpd: 'Vel. movimento %', regenHp: 'Regen. HP %', regenSp: 'Regen. SP %'
  };
  function lblKey(k) {
    if (LBL[k]) return LBL[k];
    if (STN[k]) return STN[k]; if (TRN[k]) return TRN[k];
    var p = k.split(':');
    var tp = { Phys: 'físico', Magic: 'mágico', Both: 'total' };
    if (p[0] === 'dmgRace') return 'Dano ' + (tp[p[2]] || '') + ' vs ' + (p[1] === '*' ? 'todas as raças' : p[1]) + ' %';
    if (p[0] === 'dmgEle') return 'Dano ' + (tp[p[2]] || '') + ' vs ' + p[1] + ' %';
    if (p[0] === 'dmgAtkEle') return 'Dano ' + p[1] + ' ' + (tp[p[2]] || '') + ' %';
    if (p[0] === 'dmgSize') return 'Dano ' + (tp[p[2]] || '') + ' vs ' + (p[1] === 'all' ? 'todos os tamanhos' : 'tam. ' + p[1]) + ' %';
    if (p[0] === 'dmgBoss') return 'Dano ' + (tp[p[1]] || '') + ' vs Chefe %';
    if (p[0] === 'dmgNormal') return 'Dano ' + (tp[p[1]] || '') + ' vs Normal %';
    if (p[0] === 'resEle') return 'Resist. ' + p[1] + ' %';
    if (p[0] === 'resRace') return 'Resist. ' + p[1] + ' %';
    if (p[0] === 'resSize') return 'Resist. tam. ' + p[1] + ' %';
    if (p[0] === 'ignDef') return 'Ignora DEF (' + p[1] + ') %';
    if (p[0] === 'ignMdef') return 'Ignora MDEF (' + p[1] + ') %';
    if (p[0] === 'skill') return 'Habilidade ' + p[1];
    return k;
  }

  // ---------- classes disponíveis no YggIdle ----------
  // Aprendiz e as 2ª classes comuns não existem no jogo: builds antigas migram para a transcendental
  var UPG = { nov: 'swo', kni: 'lor', cru: 'pal', wiz: 'hwz', sag: 'pro', hun: 'sni', bar: 'min', dan: 'gyp', pri: 'hpr', mon: 'cha', bla: 'whi', alc: 'cre', ass: 'asx', rog: 'sta' };
  var CGROUPS = [['Primeiras classes', ['swo', 'mag', 'aco', 'arc', 'mer', 'thi']],
    ['Transcendentais', ['lor', 'pal', 'hwz', 'pro', 'hpr', 'cha', 'sni', 'min', 'gyp', 'whi', 'cre', 'asx', 'sta']],
    ['Expandidas', ['tae', 'sg', 'sl', 'sup', 'nin', 'gun']]];

  // ---------- persistência ----------
  function ensure(x) {
    var d = E.newBuild();
    var o = Object.assign({}, d, x || {});
    o.stats = Object.assign({}, d.stats, o.stats); o.traits = Object.assign({}, d.traits, o.traits);
    o.opt = Object.assign({}, d.opt, o.opt); o.buffs = o.buffs || {}; o.skills = o.skills || {}; o.eq = o.eq || {}; o.extra = o.extra || [];
    o.sim = Object.assign({ mon: null, n: 1, farm: false, maxT: 120, mobDelay: 1.5, mobEle: 'Neutro', healPs: 0, spRegen: 1, rot: [], runs: 100 }, o.sim || {});
    o.tree = o.tree || {}; o.guides = o.guides || {}; o.sex = o.sex === 'f' ? 'f' : 'm';
    o.caos = Object.assign({ n: {}, side: 'yang', fury: 0 }, o.caos || {}); o.caos.n = o.caos.n || {}; o.caos.jw = o.caos.jw || [];
    o.cons = o.cons || []; o.xsk = o.xsk || {}; if (!o.opt.zone2) o.opt.zone2 = o.opt.traits ? 'sombrio' : 'normal';
    o.opt.traits = o.opt.zone2 === 'sombrio' || o.opt.zone2 === 'inferno'; o.opt.zone = o.opt.traits;
    if (UPG[o.cls]) o.cls = UPG[o.cls];
    if (!Y.classById[o.cls]) o.cls = 'lor';
    o.lv = Math.max(1, Math.min(175, +o.lv || 1));
    // descarta cartas/gemas fora do slot de origem (builds antigas ou importadas)
    Object.keys(o.eq).forEach(function (sl) {
      var e = o.eq[sl]; if (!e) return;
      if (e.cards) e.cards = e.cards.map(function (cid) { return cid && E.cardFits(sl, cid) ? cid : 0; });
      if (e.gem) e.gem = e.gem.map(function (cid, gi) { return cid && E.cardFits(sl, cid, gi) ? cid : 0; });
    });
    // remove da árvore o que não pertence mais à classe (ex.: Adoramus, que só vem por item) e limita ao nível máximo
    var mx = {}; (Y.trees[o.cls] || []).forEach(function (tb) { tb.sk.forEach(function (s) { mx[s[0]] = s[1]; }); });
    Object.keys(o.tree).forEach(function (k) { if (!mx[k]) delete o.tree[k]; else if (o.tree[k] > mx[k]) o.tree[k] = mx[k]; });
    // bônus aleatórios: T5 não existe no YggIdle e as faixas foram corrigidas (0.2.3): traz cada linha para dentro da faixa do jogo
    Object.keys(o.eq).forEach(function (k) { var e = o.eq[k]; if (!e || typeof e !== 'object') return; if (e.tier > 4) e.tier = 4; clampLines(e); });
    return o;
  }
  function save() { try { localStorage.setItem(LS, JSON.stringify(b)); } catch (e) { } updateState(); }

  // ---------- biblioteca de builds ----------
  var LIB = 'yggplanner.lib', CUR = 'yggplanner.cur', curId = null, savedSnap = null;
  function libGet() { try { return JSON.parse(localStorage.getItem(LIB) || '{}'); } catch (e) { return {}; } }
  function libSet(o) { try { localStorage.setItem(LIB, JSON.stringify(o)); return true; } catch (e) { toast('Não foi possível salvar (armazenamento cheio ou bloqueado)'); return false; } }
  function snap() { var c = Object.assign({}, b); return JSON.stringify(c); }
  function updateState() {
    var el = $('#saveState'); if (!el) return;
    var lib = libGet(), inLib = curId && lib[curId];
    var dirty = !inLib || savedSnap !== snap();
    el.textContent = !inLib ? '● não salva' : dirty ? '● alterações não salvas' : '✓ salva';
    el.className = 'state ' + (!inLib || dirty ? 'warn' : 'ok');
  }
  function saveToLib(asNew) {
    var lib = libGet(), id = (!asNew && curId && lib[curId]) ? curId : 'b' + Date.now().toString(36);
    if (asNew || !b.name || b.name === 'Nova build') {
      var n = prompt('Nome da build:', asNew && b.name ? b.name + ' (cópia)' : (b.name === 'Nova build' ? '' : b.name));
      if (n === null) return; b.name = n.trim() || 'Sem nome'; $('#bName').value = b.name;
    }
    lib[id] = { name: b.name, ts: Date.now(), cls: b.cls, lv: b.lv, b: JSON.parse(JSON.stringify(b)) };
    if (!libSet(lib)) return;
    curId = id; try { localStorage.setItem(CUR, id); } catch (e) { }
    savedSnap = snap(); updateState(); toast('Build salva: ' + b.name);
  }
  function loadFromLib(id) {
    var e = libGet()[id]; if (!e) return;
    b = ensure(e.b); curId = id; try { localStorage.setItem(CUR, id); } catch (x) { }
    savedSnap = snap(); simRes = null; syncHeader(); refresh(true); closeModal(); toast('Carregada: ' + b.name);
  }
  function openLib() {
    var lib = libGet(), ids = Object.keys(lib).sort(function (a, c) { return lib[c].ts - lib[a].ts; });
    var box = h('div', { class: 'list', style: 'max-height:55vh' });
    if (!ids.length) box.appendChild(h('div', { class: 'it mut' }, ['Nenhuma build salva ainda. Use “Salvar”.']));
    ids.forEach(function (id) {
      var e = lib[id], cl = Y.classById[e.cls], d = new Date(e.ts);
      box.appendChild(h('div', { class: 'it', style: 'align-items:center;flex-wrap:wrap' }, [
        h('span', null, [h('b', null, [(id === curId ? '▶ ' : '') + e.name]), h('div', { class: 'tip' }, [(cl ? cl.n : '?') + ' · Nv ' + e.lv + ' · ' + d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })])]),
        h('span', { class: 'row', style: 'margin:0' }, [
          h('button', { class: 'pri', on: { click: function () { loadFromLib(id); } } }, ['Carregar']),
          h('button', { on: { click: function () { var n = prompt('Novo nome:', e.name); if (n === null) return; var l = libGet(); l[id].name = n.trim() || e.name; l[id].b.name = l[id].name; libSet(l); if (id === curId) { b.name = l[id].name; $('#bName').value = b.name; savedSnap = snap(); updateState(); } openLib(); } } }, ['Renomear']),
          h('button', { on: { click: function () { var l = libGet(), nid = 'b' + Date.now().toString(36); var c = JSON.parse(JSON.stringify(l[id])); c.name += ' (cópia)'; c.b.name = c.name; c.ts = Date.now(); l[nid] = c; libSet(l); openLib(); } } }, ['Duplicar']),
          h('button', { on: { click: function () { navigator.clipboard.writeText(JSON.stringify(e.b)).then(function () { toast('JSON copiado'); }); } } }, ['Copiar JSON']),
          h('button', { on: { click: function () { if (!confirm('Excluir “' + e.name + '”? Não dá para desfazer.')) return; var l = libGet(); delete l[id]; libSet(l); if (id === curId) { curId = null; savedSnap = null; updateState(); } openLib(); } } }, ['Excluir'])])]));
    });
    openModal(h('div', null, [h('h3', null, ['Minhas builds (' + ids.length + ')']), box,
      h('div', { class: 'tip', style: 'margin-top:8px' }, ['Salvas apenas neste navegador. Para levar para outro computador, use Exportar ou Link.']),
      h('div', { class: 'row' }, [h('button', { class: 'pri', on: { click: function () { closeModal(); saveToLib(true); } } }, ['Salvar atual como nova']), h('button', { on: { click: closeModal } }, ['Fechar'])])]));
  }
  function load() { try { var s = localStorage.getItem(LS); if (s) return ensure(JSON.parse(s)); } catch (e) { } return ensure(); }
  function toCode(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))); }
  function fromCode(s) { s = s.trim(); var m = s.match(/#b=([^&\s]+)/); if (m) s = decodeURIComponent(m[1]); if (s[0] === '{') return JSON.parse(s); return JSON.parse(decodeURIComponent(escape(atob(s)))); }

  function recompute() { R = E.compute(b); }
  function refresh(full) { recompute(); save(); drawStats(); if (full) drawTab(); }

  // ---------- cabeçalho ----------
  var TIERN = ['Inicial', '1ª classe', '2ª classe', 'Transcendental'];
  function tierName(c) { return c.tier === 1 && E.isHigh(c.id) ? '1ª classe T' : E.EXPANDED[c.id] ? 'Expandida' : TIERN[c.tier]; }
  function setClass(id) { if (id === b.cls) return; b.cls = id; b.sim.rot = []; simRes = null; syncHeader(); refresh(true); }
  function classPath(id) { var p = [], c = Y.classById[id]; while (c) { if (!UPG[c.id]) p.unshift(c); c = c.parent ? Y.classById[c.parent] : null; } return p; }
  function openClassPicker() {
    var lines = {}, order = [];
    CGROUPS.forEach(function (g) { lines[g[0]] = g[1].map(function (id) { return Y.classById[id]; }).filter(Boolean); order.push(g[0]); });
    var q = h('input', { placeholder: 'Buscar classe…', class: 'search' });
    var lineF = null, hov = b.cls;
    var wrap = h('div', { class: 'cpick' }), prev = h('aside', { class: 'cprev' }), chips = h('div', { class: 'cfil' });
    var sexB = h('div', { class: 'sexsw' }, [['m', '♂ Masculino'], ['f', '♀ Feminino']].map(function (x) {
      return h('button', { class: b.sex === x[0] ? 'on' : '', on: { click: function () { b.sex = x[0]; save(); sexB.querySelectorAll('button').forEach(function (bt, i) { bt.classList.toggle('on', i === (x[0] === 'm' ? 0 : 1)); }); fill(); preview(hov); syncHeader(); drawStats(); } } }, [x[1]]);
    }));
    function preview(id) {
      hov = id; var c = Y.classById[id], g = Y.guideFor(id); prev.innerHTML = ''; prev.style.setProperty('--lc', Y.lineColor(id));
      var dots = h('span', { class: 'diff' }); for (var i = 1; i <= 3; i++) dots.appendChild(h('i', { class: i <= (g.diff || 1) ? 'on' : '' }));
      prev.appendChild(h('div', { class: 'stage' }, [h('span', { class: 'rune' }), h('span', { class: 'rune r2' }), h('span', { class: 'motes' }), h('span', { class: 'ped' }), spriteEl(id, 'big')]));
      prev.appendChild(h('div', { class: 'hline' }, [c.line + ' · ' + tierName(c)]));
      prev.appendChild(h('h2', null, [c.n]));
      prev.appendChild(h('div', { class: 'hchips' }, [g.role ? h('span', { class: 'chip lc' }, [g.role]) : null, h('span', { class: 'chip' }, ['Dificuldade ', dots])]));
      var path = classPath(id);
      prev.appendChild(h('div', { class: 'cpath' }, path.map(function (p, i) {
        return h('span', { class: 'cp' + (p.id === id ? ' on' : '') }, [h('span', { class: 'cpi' }, [spriteEl(p.id, 'mini')]), h('small', null, [p.n])]);
      })));
      if (g.resumo) prev.appendChild(h('p', null, [g.resumo]));
      prev.appendChild(h('div', { class: 'tip' }, ['Armas: ' + c.wp.filter(function (w) { return w !== 'Fist'; }).map(function (w) { return Y.weaponNames[w] || w; }).join(', ')]));
      prev.appendChild(h('button', { class: 'pri big', on: { click: function () { setClass(id); closeModal(); } } }, [id === b.cls ? 'Classe atual' : 'Jogar de ' + c.n + ' ▸']));
    }
    function fill() {
      wrap.innerHTML = ''; var s = q.value.trim().toLowerCase(), k = 0;
      order.forEach(function (l) {
        if (lineF && lineF !== l) return;
        var cs = lines[l].filter(function (c) { return !s || c.n.toLowerCase().indexOf(s) >= 0 || l.toLowerCase().indexOf(s) >= 0; });
        if (!cs.length) return;
        var grid = h('div', { class: 'cgrid' });
        cs.forEach(function (c) {
          var g = Y.guideFor(c.id);
          var card = h('button', { class: 'ccard t' + c.tier + (c.id === b.cls ? ' sel' : ''), style: '--lc:' + Y.lineColor(c.id) + ';animation-delay:' + (k++ * 18) + 'ms',
            on: { click: function () { setClass(c.id); closeModal(); }, mouseenter: function () { preview(c.id); } } }, [
            h('span', { class: 'aura' }), h('span', { class: 'pf' }, [spriteEl(c.id)]), h('b', null, [c.n]), h('small', null, [tierName(c) + (g.role ? ' · ' + g.role : '')]),
            c.tier === 3 ? h('span', { class: 'trans', title: 'Transcendental' }, ['✦']) : null]);
          card.addEventListener('mousemove', function (e) { var r = card.getBoundingClientRect(); card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
          grid.appendChild(card);
        });
        wrap.appendChild(h('div', { class: 'cline' }, [h('div', { class: 'clh', style: '--lc:' + Y.lineColor(cs[0].id) }, [l]), grid]));
      });
      if (!wrap.children.length) wrap.appendChild(h('div', { class: 'mut' }, ['Nenhuma classe encontrada.']));
    }
    function drawChips() {
      chips.innerHTML = '';
      [null].concat(order).forEach(function (l) {
        chips.appendChild(h('button', { class: lineF === l ? 'on' : '', style: l ? '--lc:' + Y.lineColor(lines[l][0].id) : '', on: { click: function () { lineF = l; drawChips(); fill(); } } }, [l || 'Todas']));
      });
    }
    q.addEventListener('input', fill); drawChips(); fill(); preview(b.cls);
    openModal(h('div', { class: 'cpk' }, [h('div', { class: 'mhead' }, [h('h3', null, ['Escolha sua classe']), sexB, q]), chips, h('div', { class: 'cbody' }, [wrap, prev])]), 'wide xl');
    setTimeout(function () { q.focus(); }, 30);
  }
  function initHeader() {
    $('#bCls').onclick = openClassPicker;
    $('#bName').addEventListener('change', function (e) { b.name = e.target.value; save(); drawStats(); });
    $('#bLv').addEventListener('change', function (e) { b.lv = Math.max(1, Math.min(175, +e.target.value || 1)); e.target.value = b.lv; refresh(true); });
    $('#btnNew').onclick = function () { var lib = libGet(); if (curId && lib[curId] && savedSnap === snap() || confirm('Há alterações não salvas. Começar uma build nova mesmo assim?')) { b = ensure(); curId = null; savedSnap = null; try { localStorage.removeItem(CUR); } catch (e) { } simRes = null; syncHeader(); refresh(true); } };
    $('#btnSave').onclick = function () { saveToLib(false); };
    $('#btnLib').onclick = openLib;
    $('#bName').insertAdjacentElement('afterend', h('span', { id: 'saveState', class: 'state' }));
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); saveToLib(false); } });
    $('#btnExport').onclick = openExport; $('#btnImport').onclick = openImport;
    $('#btnShare').onclick = function () {
      var u = location.href.split('#')[0] + '#b=' + encodeURIComponent(toCode(b));
      navigator.clipboard && navigator.clipboard.writeText(u).then(function () { toast('Link copiado'); }, function () { prompt('Copie o link:', u); });
      history.replaceState(null, '', '#b=' + encodeURIComponent(toCode(b)));
    };
    document.querySelectorAll('#tabs button').forEach(function (bt) {
      bt.onclick = function () { tab = bt.dataset.tab; document.querySelectorAll('#tabs button').forEach(function (x) { x.classList.toggle('on', x === bt); }); drawTab(); };
    });
    $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });
  }
  function syncHeader() {
    var c = Y.classById[b.cls];
    $('#bName').value = b.name; $('#bLv').value = b.lv;
    var bt = $('#bCls'); bt.innerHTML = ''; bt.style.setProperty('--lc', Y.lineColor(b.cls));
    bt.appendChild(h('span', { class: 'av' }, [spriteEl(b.cls, 'head')]));
    bt.appendChild(h('span', { class: 'cn' }, [h('b', null, [c.n]), h('small', null, [tierName(c) + ' · trocar ▾'])]));
  }
  function openModal(node, size) { var m = $('#modalBody'); m.innerHTML = ''; m.appendChild(node); $('#modal').className = 'modal' + (size ? ' ' + size : ''); }
  function closeModal() { $('#modal').className = 'modal hidden'; }
  function openExport() {
    var json = JSON.stringify(b, null, 1), code = toCode(b);
    var ta = h('textarea', { readonly: true }); ta.value = json;
    var codeTa = h('textarea', { readonly: true, style: 'height:70px' }); codeTa.value = code;
    openModal(h('div', null, [
      h('h3', null, ['Exportar build']),
      h('div', { class: 'tip' }, ['JSON completo (ideal para arquivo):']), ta,
      h('div', { class: 'row' }, [
        h('button', { class: 'pri', on: { click: function () { navigator.clipboard.writeText(json); toast('JSON copiado'); } } }, ['Copiar JSON']),
        h('button', { on: { click: function () { var a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: (b.name || 'build').replace(/[^\w\-]+/g, '_') + '.json' }); a.click(); } } }, ['Baixar .json']),
        h('button', { on: { click: closeModal } }, ['Fechar'])
      ]),
      h('div', { class: 'tip' }, ['Código compacto (para colar em chats):']), codeTa,
      h('button', { on: { click: function () { navigator.clipboard.writeText(code); toast('Código copiado'); } } }, ['Copiar código'])
    ]));
  }
  function openImport() {
    var ta = h('textarea', { placeholder: 'Cole aqui o JSON, o código ou o link da build' });
    var file = h('input', { type: 'file', accept: '.json,application/json' });
    file.addEventListener('change', function () { var f = file.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { ta.value = r.result; }; r.readAsText(f); });
    var err = h('div', { class: 'bad' });
    openModal(h('div', null, [
      h('h3', null, ['Importar build']), ta, file, err,
      h('div', { class: 'row' }, [
        h('button', { class: 'pri', on: { click: function () { try { b = ensure(fromCode(ta.value)); syncHeader(); refresh(true); closeModal(); toast('Build importada'); } catch (e) { err.textContent = 'Não foi possível ler a build: ' + e.message; } } } }, ['Importar']),
        h('button', { on: { click: closeModal } }, ['Cancelar'])
      ])
    ]));
  }

  // ---------- painel de estatísticas (no formato do ALT+A do jogo) ----------
  var UIK = 'yggplanner.ui', UI = (function () { try { return JSON.parse(localStorage.getItem(UIK) || '{}'); } catch (e) { return {}; } })();
  UI.col = UI.col || {};
  function uiSave() { try { localStorage.setItem(UIK, JSON.stringify(UI)); } catch (e) { } }
  var TPN = { Phys: 'físico', Magic: 'mágico', Both: 'físico e mágico' };
  function tgtName(x) {
    x = String(x || '').trim();
    if (x === 'all') return 'todos os tamanhos';
    x = x.replace(/^(oponentes|inimigos)\s+(de|da|das|do|dos)\s+/i, '').replace(/^(a|as|o|os)\s+(?=raça|raças|propriedade|propriedades|tamanho|tamanhos)/i, '')
      .replace(/^raças?\s+/i, '').replace(/^(de|da)\s+propriedade/i, 'propriedade').replace(/^do tipo\s+/i, '').replace(/\s+,/g, ',');
    return x;
  }
  var RES_ROW = { resNormal: 'Redução de dano de monstros comuns', resBoss: 'Redução de dano de chefes', resMonster: 'Redução de dano de monstros', resPhys: 'Redução de dano físico',
    resMagic: 'Redução de dano mágico', resRanged: 'Redução de dano a distância', resCaos: 'Redução de dano no Caos', resPack: 'Redução de dano em matilha', ignResCaos: 'Ignora resistência do Caos' };
  // descreve uma chave de bônus: [seção, rótulo, valor exibido, ordem]
  function statRow(k, v) {
    var p = k.split(':'), pct = function (x, neg) { x = neg ? -x : x; return (x > 0 ? '+' : '') + fmt(x, 1) + '%'; }, fl = function (x) { return (x > 0 ? '+' : '') + fmt(x, 1); };
    var F = {
      atkPct: ['dmg', 'ATQ percentual', pct(v), 1], matkPct: ['dmg', 'ATQM percentual', pct(v), 2], atk: ['dmg', 'ATQ fixo adicional', fl(v), 3], matk: ['dmg', 'ATQM fixo adicional', fl(v), 4],
      dmgPhys: ['dmg', 'Dano físico', pct(v), 5], dmgMagic: ['dmg', 'Dano mágico', pct(v), 6], dmgBoth: ['dmg', 'Dano físico e mágico', pct(v), 7], dmgMelee: ['dmg', 'Dano corpo a corpo', pct(v), 8],
      dmgRanged: ['dmg', 'Dano a distância', pct(v), 9], critDmg: ['dmg', 'Dano crítico', pct(v), 10], basicPct: ['dmg', 'Dano do ataque básico', pct(v), 11], dmgExec: ['dmg', 'Dano em alvo com 25% de HP ou menos', pct(v), 12],
      dmgCaos: ['dmg', 'Dano no Caos', pct(v), 13],
      defPct: ['def', 'DEF percentual', pct(v), 1], mdefPct: ['def', 'DEF Mágica percentual', pct(v), 2], hpPct: ['def', 'HP máximo', pct(v), 3], spPct: ['def', 'SP máximo', pct(v), 4],
      castVar: ['def', 'Redução de conjuração', pct(v, true), 40], castFix: ['def', 'Conjuração fixa', pct(v), 41], castFixPct: ['def', 'Conjuração fixa', pct(v), 41], castFixSec: ['def', 'Conjuração fixa', (v > 0 ? '+' : '') + fmt(v, 2) + ' s', 42],
      afterCast: ['def', 'Redução de pós-conjuração', pct(v, true), 43], spCost: ['def', 'Custo de SP das habilidades', pct(v), 44], aspdPct: ['def', 'Velocidade de ataque', pct(v), 45], aspd: ['def', 'Velocidade de ataque (fixa)', fl(v), 46],
      critPct: ['def', 'Chance de crítico', pct(v), 47], hitPct: ['def', 'Precisão percentual', pct(v), 48], fleePct: ['def', 'Esquiva percentual', pct(v), 49], perfHit: ['def', 'Precisão perfeita', pct(v), 50],
      healPct: ['def', 'Cura recebida', pct(v), 51], potHeal: ['def', 'Cura das poções', pct(v), 52], regenHp: ['def', 'Regeneração de HP', pct(v), 53], regenSp: ['def', 'Regeneração de SP', pct(v), 54],
      moveSpd: ['def', 'Velocidade de movimento', pct(v), 55], uninterrupt: ['def', 'Conjuração ininterrupta', '✓', 56], critDouble: ['def', 'Crítico duplo', '✓', 57],
      expPct: ['exp', 'EXP de abate', pct(v), 1], expBoss: ['exp', 'EXP de chefe', pct(v), 2], expCaos: ['exp', 'Experiência do Caos', pct(v), 3], expCaosParty: ['exp', 'Experiência do Caos em grupo', pct(v), 4],
      dropPct: ['exp', 'Chance de drop', pct(v), 5], zenyBag: ['exp', 'Sacola de Zeny', '+' + fmt(v, 1) + '‰', 8], zenyKill: ['exp', 'Zeny por monstro abatido', fl(v), 9],
      zenyBagSomb: ['exp', 'Sacola de Zeny no Sombrio (pontos)', fl(v), 10], zenyBagInf: ['exp', 'Sacola de Zeny no Inferno e Abismo (pontos)', fl(v), 11],
      allStats: ['atr', 'Todos os atributos', fl(v), 0], allTraits: ['atr', 'Todos os traços', fl(v), 7]
    };
    if (F[k]) return F[k];
    if (STN[k]) return ['atr', STN[k], fl(v), ['str', 'agi', 'vit', 'int', 'dex', 'luk'].indexOf(k) + 1];
    if (TRN[k]) return ['atr', TRN[k], fl(v), 8];
    if (RES_ROW[k]) return ['def', RES_ROW[k], pct(v), 30];
    var t = TPN[p[p.length - 1]] || '';
    if (p[0] === 'dmgBoss') return ['dmg', 'Dano ' + TPN[p[1]] + ' vs Chefes', pct(v), 20];
    if (p[0] === 'dmgNormal') return ['dmg', 'Dano ' + TPN[p[1]] + ' vs Normais', pct(v), 20];
    if (p[0] === 'dmgRace') return ['dmg', 'Dano ' + t + ' vs ' + tgtName(p[1]), pct(v), 21];
    if (p[0] === 'dmgEle') return ['dmg', 'Dano ' + t + ' vs propriedade ' + p[1], pct(v), 22];
    if (p[0] === 'dmgSize') return ['dmg', 'Dano ' + t + ' vs ' + (p[1] === 'all' ? 'todos os tamanhos' : 'alvos ' + p[1].toLowerCase().replace(/o$/, 'os').replace(/e$/, 'es')), pct(v), 23];
    if (p[0] === 'dmgAtkEle') return ['dmg', 'Dano ' + t + ' de propriedade ' + p[1], pct(v), 24];
    if (p[0] === 'skill') return ['dmg', 'Dano de ' + p[1], pct(v), 30];
    if (p[0] === 'resEle') return ['def', 'Resistência a ' + (p[1] === 'all' ? 'todos os elementos' : p[1]), pct(v), 10];
    if (p[0] === 'resRace') return ['def', 'Resistência à raça ' + p[1], pct(v), 11];
    if (p[0] === 'resSize') return ['def', 'Resistência a alvos ' + p[1].toLowerCase(), pct(v), 12];
    if (p[0] === 'resSt') return ['def', 'Resistência a ' + p[1], pct(v), 13];
    if (p[0] === 'drop') return ['exp', 'Drop de ' + (p[1] === 'Boss' ? 'chefes' : 'monstros comuns'), pct(v), 6];
    return null;
  }
  // seções que fecham e abrem, lembrando o estado entre as visitas
  function fold(id, title, kids, opt) {
    opt = opt || {};
    var d = h('details', { class: 'sfold' + (opt.cls ? ' ' + opt.cls : '') });
    if (!UI.col[id]) d.open = true;
    d.addEventListener('toggle', function () { if (d.open) delete UI.col[id]; else UI.col[id] = 1; uiSave(); });
    d.appendChild(h('summary', null, [h('span', null, [title])].concat(opt.right ? [opt.right] : [])));
    d.appendChild(h('div', { class: 'sbody' }, kids));
    return d;
  }
  function srow(k, v, cls, tip) { var r = h('div', { class: 'srow' }, [h('span', null, [k]), h('b', { class: cls || '' }, [v])]); if (tip) r.title = tip; return r; }
  function statPanel(el, wA) {
    var B = R.B, z = D.zoneOf ? D.zoneOf(b) : {};
    var atkStatus = R.batk * 2, atkEq = wA + R.refAtk + R.equipAtk;
    var main = [
      srow('ATQ', fmt(atkStatus + atkEq), '', 'Status ×2 (' + fmt(atkStatus) + ') + arma, refino e equipamentos (' + fmt(atkEq) + ')'),
      srow('ATQ Mágico', fmt(R.matk)), srow('P.ATQ', fmt(R.patk)), srow('S.ATQM', fmt(R.smatk)),
      srow('DEF', fmt(R.def + R.def2), '', 'Equipamentos ' + fmt(R.def) + ' + status ' + fmt(R.def2)),
      srow('DEF Mágica', fmt(R.mdef + R.mdef2), '', 'Equipamentos ' + fmt(R.mdef) + ' + status ' + fmt(R.mdef2)),
      srow('RES', fmt(R.res)), srow('MRES', fmt(R.mres)), srow('Precisão', fmt(R.hit)), srow('Esquiva', fmt(R.flee)), srow('Esquiva Perfeita', fmt(R.flee2 / 10, 1)),
      srow('Crítico', fmt(R.critChance, 1)), srow('Vel. de Ataque', fmt(R.aspdEff), '', fmt(R.aps, 2) + ' ataques por segundo'),
      srow('C.RATE', fmt(R.crate)), srow('H.PLUS', fmt(R.hplus)),
      srow('Conjuração variável', fmt(R.castScale * Math.max(0, 1 + (B.castVar || 0) / 100) * 100, 0) + '%', '', 'Percentual do tempo de conjuração variável que sobra (DES, INT e bônus)'),
      srow('Peso', fmt(R.weight) + ' / ' + fmt(R.maxWeight), R.weight > R.maxWeight ? 'bad' : '')];
    // Ignora defesa
    var cap = function (x) { return x > 100 ? '100% (' + fmt(x - 100, 1) + '% excedente)' : fmt(x, 1) + '%'; };
    var iD = B['ignDef:all'] || 0, iM = B['ignMdef:all'] || 0;
    var ign = [srow('Ignora DEF', cap(iD)), srow('Ignora MDEF', cap(iM)),
      srow('Ignora DEF de Normais', cap(iD + (B['ignDef:Normal'] || 0))), srow('Ignora DEF de Chefes', cap(iD + (B['ignDef:Boss'] || 0))),
      srow('Ignora DEF Mágica de Normais', cap(iM + (B['ignMdef:Normal'] || 0))), srow('Ignora DEF Mágica de Chefes', cap(iM + (B['ignMdef:Boss'] || 0))),
      srow('Penetração de Redução', fmt(D.penetration ? D.penetration(R) : 0, 1) + '%', '', 'Árvore do Caos (até 25%) + Ascensão + joias; máximo 50%')];
    // bônus agrupados por seção
    var S = { dmg: [], def: [], exp: [], atr: [], out: [] }, seen = {};
    Object.keys(B).forEach(function (k) {
      var v = B[k]; if (!v || k.charAt(0) === '_' || /^(ignDef|ignMdef|pen|res$|mres$|def$|mdef$|hit$|flee$|pflee$|crit$|hp$|sp$|patk$|smatk$|crate$|hplus$)/.test(k)) return;
      var r = statRow(k, v);
      if (!r) { S.out.push([lblKey(k), fmt(v, 1), 99, k]); return; }
      var key = r[0] + '|' + r[1].toLowerCase();
      if (seen[key] && r[2].slice(-1) === '%') { var o = seen[key]; o[4] += v; var nv = (k === 'castVar' || k === 'afterCast') ? -o[4] : o[4]; o[1] = (nv > 0 ? '+' : '') + fmt(nv, 1) + '%'; return; }
      var row = [r[1], r[2], r[3], k, v]; seen[key] = row; S[r[0]].push(row);
    });
    var flat = { hit: 'Precisão (bônus)', flee: 'Esquiva (bônus)', crit: 'Crítico (bônus)', hp: 'HP (bônus)', sp: 'SP (bônus)', def: 'DEF (bônus)', mdef: 'DEF Mágica (bônus)', pflee: 'Esquiva Perfeita (bônus)' };
    Object.keys(flat).forEach(function (k, i) { if (B[k]) S.def.push([flat[k], (B[k] > 0 ? '+' : '') + fmt(B[k], 1), 60 + i, k]); });
    function rows(list) { return list.sort(function (a, c) { return a[2] - c[2] || a[0].localeCompare(c[0]); }).map(function (r) { return srow(r[0], r[1], String(r[1]).charAt(0) === '-' ? 'neg' : 'pos'); }); }
    function sub(id, t, list, empty) { return fold('st.' + id, t, list.length ? rows(list) : [h('div', { class: 'mut sm' }, [empty || 'Nenhum bônus.'])], { cls: 'sub' }); }
    var card = h('div', { class: 'card stcard' }, [fold('st.main', 'Estatísticas', main.concat([
      fold('st.ign', 'Ignora defesa', ign, { cls: 'sub' }),
      sub('dmg', 'Dano', S.dmg), sub('def', 'Defesa e utilidade', S.def),
      sub('exp', 'Experiência e drop', S.exp, 'Sem bônus de EXP ou drop.'),
      sub('atr', 'Atributos de bônus', S.atr),
      S.out.length ? sub('out', 'Outros', S.out) : null]), { cls: 'main' })]);
    el.appendChild(card);
    // Traços de 4ª classe e Sombrio/Inferno/Abismo
    var on = !!b.opt.traits;
    var tog = h('button', { class: 'tog' + (on ? ' on' : ''), title: 'Liga se você joga no Sombrio, no Inferno ou no Abismo', on: { click: function (e) {
      e.preventDefault(); e.stopPropagation(); var nz = on ? 'normal' : (b.opt.zone2 === 'inferno' ? 'inferno' : 'sombrio');
      b.opt.zone2 = nz; b.opt.traits = nz === 'sombrio' || nz === 'inferno'; b.opt.zone = b.opt.traits; refresh(true); } } }, [on ? 'ON' : 'OFF']);
    var tr = [srow('Local', (D.ZONES[b.opt.zone2] || {}).n || 'Mapa comum')];
    ['pow', 'sta', 'wis', 'spl', 'con', 'crt'].forEach(function (k) { tr.push(srow(TRN[k] + ' → ' + TRD[k], (R[k] > 0 ? '+' : '') + fmt(R[k]), R[k] ? 'pos' : '')); });
    tr.push(srow('P.ATQ', fmt(R.patk) + '%'), srow('S.ATQM', fmt(R.smatk) + '%'), srow('RES / MRES', fmt(R.res) + ' / ' + fmt(R.mres)), srow('C.RATE (dano crít. extra)', fmt(R.crate) + '%'), srow('H.PLUS', fmt(R.hplus)));
    if (!on) tr.unshift(h('div', { class: 'tip' }, ['Desligado: os traços só valem no Sombrio, no Inferno e no Abismo.']));
    el.appendChild(h('div', { class: 'card stcard' }, [fold('st.traits', 'Traços de 4ª classe · Sombrio, Inferno e Abismo', tr, { cls: 'main', right: tog })]));
  }
  // ---------- painel de estatísticas ----------
  function kv(k, v, cls) { return h('div', { class: 'kv' }, [h('span', null, [k]), h('span', { class: cls || '' }, [v])]); }
  function drawStats() {
    var el = $('#stats'); el.innerHTML = '';
    var wA = R.wAtkBase, cl = Y.classById[b.cls], gd = Y.guideFor(b.cls);
    var left = R.ptsTotal - R.ptsUsed;
    el.appendChild(h('div', { class: 'hero', style: '--lc:' + Y.lineColor(b.cls) }, [
      h('div', { class: 'hpf' }, [h('span', { class: 'motes' }), spriteEl(b.cls, 'mid')]),
      h('div', { class: 'hinfo' }, [
        h('div', { class: 'hline' }, [cl.line + ' · ' + tierName(cl)]),
        h('div', { class: 'hname' }, [cl.n]),
        h('div', { class: 'hbuild' }, [b.name || 'Sem nome']),
        h('div', { class: 'hchips' }, [h('span', { class: 'chip' }, ['Nv ' + b.lv]), gd.role ? h('span', { class: 'chip' }, [gd.role]) : null,
          left ? h('span', { class: 'chip ' + (left < 0 ? 'bad' : 'warn') }, [left + ' pts livres']) : null]),
        h('div', { class: 'hbars' }, [bar('HP', R.hp, 'hp'), bar('SP', R.sp, 'sp')])])]));
    function bar(l, v, k) { return h('div', { class: 'hb ' + k }, [h('span', null, [l]), h('b', null, [fmt(v)])]); }
    statPanel(el, wA);
    var off = R.notes;
    if (off.length) {
      var c4 = h('details', { class: 'card' }, [h('summary', null, ['Efeitos especiais (' + off.length + ')'])]);
      c4.appendChild(h('div', { class: 'tip' }, ['Efeitos que o planner não converte em número. Verde = condição atendida.']));
      off.forEach(function (n) { c4.appendChild(h('div', { class: 'fx' + (n.on ? ' on' : '') }, [n.src + ': ' + n.t])); });
      el.appendChild(c4);
    }
  }

  // ---------- aba Status ----------
  function drawTab() {
    var t = $('#tab'); t.innerHTML = ''; hideTip();
    var F = { guide: tabGuide, tut: tabTut, status: tabStatus, equip: tabEquip, skills: tabSkills, cons: tabCons, caos: tabCaos, sim: tabSim, form: tabForm }; if (!F[tab]) tab = 'guide';
    F[tab](t);
  }
  function goTab(name) { tab = name; document.querySelectorAll('#tabs button').forEach(function (x) { x.classList.toggle('on', x.dataset.tab === name); }); drawTab(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // ---------- aba Guia ----------
  var NOTES = 'yggplanner.notes', guideBand = 'me', MI = null;
  var BANDS = [['me', 'Seu nível'], [20, 'Nv 1–40'], [60, 'Nv 40–80'], [95, 'Nv 80–110'], [125, 'Nv 110–140'], [158, 'Nv 140–175']];
  function mapIndex() {
    if (MI) return MI; MI = {};
    Y.monsters.forEach(function (m) { (m.sp || []).forEach(function (id) { (MI[id] = MI[id] || []).push(m); }); });
    return MI;
  }
  function eleMult(m, eles) {
    var best = 0, used = '';
    eles.forEach(function (e) { var k = e === 'arma' ? 'Neutro' : e; var v = (m.tbl && m.tbl[k] != null ? m.tbl[k] : 100) / 100; if (v > best) { best = v; used = k; } });
    return [best, used];
  }
  function rankMaps(L, g) {
    var mi = mapIndex(), eles = g.ele || ['arma'], out = [];
    Object.keys(Y.maps).forEach(function (id) {
      if (mapLocked(id)) return;
      var mobs = (mi[id] || []).filter(function (m) { return m.cls === 0 && m.hp > 0 && m.exp > 0 && m.lv >= L - 14 && m.lv <= L + 8; });
      if (!mobs.length) return;
      var tot = 0, best = null;
      mobs.forEach(function (m) {
        var em = eleMult(m, eles), lvf = 1 - Math.min(.5, Math.abs(m.lv - L) / 30);
        var v = m.exp / Math.pow(m.hp, .85) * Math.max(.1, em[0]) * lvf;
        m._v = v; m._em = em; tot += v; if (!best || v > best._v) best = m;
      });
      var info = Y.maps[id], dens = Math.sqrt(Math.max(30, info[3] || 100) / 150);
      out.push({ id: id, n: info[0], tier: info[1], range: info[2], cnt: info[3], mobs: mobs.sort(function (a, c) { return c._v - a._v; }), best: best, score: tot / mobs.length * (g.aoe ? dens : 1) * Math.min(1.25, .8 + mobs.length * .1) });
    });
    return out.sort(function (a, c) { return c.score - a.score; }).slice(0, 6);
  }
  function applyStats(g) {
    E.ST.forEach(function (k) { b.stats[k] = 1; }); recompute();
    var budget = R.ptsTotal;
    (g.stats || []).forEach(function (st) {
      var k = st[0], tgt = Math.min(120, st[1]);
      while (b.stats[k] < tgt) { var c = E.statCost(b.stats[k]); if (c > budget) break; budget -= c; b.stats[k]++; }
    });
    // sobra: continua subindo os atributos do guia na mesma ordem, até 120
    var seen = {}; (g.stats || []).forEach(function (st) {
      var k = st[0]; if (seen[k]) return; seen[k] = 1;
      while (b.stats[k] < 120) { var c = E.statCost(b.stats[k]); if (c > budget) break; budget -= c; b.stats[k]++; }
    });
    if (g.traits && b.opt.traits) {
      E.TR.forEach(function (k) { b.traits[k] = 0; }); recompute();
      var tb = R.traitTotal;
      g.traits.forEach(function (st) { var add = Math.max(0, Math.min(st[1] - b.traits[st[0]], tb)); b.traits[st[0]] += add; tb -= add; });
    }
    refresh(true); toast('Atributos do guia aplicados (' + budget + ' pts sobraram)');
  }
  function applyRot(g) {
    var sk = Y.skillsFor(b.cls).map(function (s) { return s.id; });
    b.sim.rot = (g.rot || []).filter(function (id) { return sk.indexOf(id) >= 0 && Y.skills[id]; }).map(function (id) { var s = Y.skills[id]; return { id: id, lv: b.skills[id] != null ? b.skills[id] : s.max }; });
    refresh(true); toast(b.sim.rot.length ? 'Rotação do guia aplicada na Simulação' : 'Nenhuma habilidade do guia disponível para esta classe');
  }
  function skName(x) { return skLabel(x); }
  // ----- guia: dados (padrão do planner ou personalizado pelo usuário, salvo na build) -----
  var gEdit = false, gLv = null, gNote = null, GC = {};
  // etapas da rota pelas missões de liberação de tier (Nv 32, 65 e 99); só agrupam, não limitam o nível do mapa
  var GBANDS = [[1, 31, 'Mapas T1'], [32, 64, 'Nv 32: missão libera o T2'], [65, 98, 'Nv 65: missão libera o T3'], [99, 175, 'Nv 99: missão libera o T4']];
  // a rota do guia começa vazia: quem monta o guia escolhe os mapas de cada faixa
  function defMaps() { return []; }
  function defGuide(cls) {
    var g = Y.guideFor(cls);
    return {
      resumo: g.resumo || '', plan: (g.stats || []).map(function (x) { return [x[0], x[1]]; }), traits: (g.traits || []).map(function (x) { return [x[0], x[1]]; }),
      ordem: (g.ordem || []).map(function (o) { return [SKA[o[0]] || o[0], o[1], o[2] || '']; }), maps: defMaps(g),
      dicas: (g.dicas || []).slice(), evitar: (g.evitar || []).slice(), equip: (g.equip || []).slice()
    };
  }
  function guide() { return b.guides[b.cls] || GC[b.cls] || (GC[b.cls] = defGuide(b.cls)); }
  function gw() { if (!b.guides[b.cls]) b.guides[b.cls] = JSON.parse(JSON.stringify(guide())); return b.guides[b.cls]; }
  function gSave(redraw) { save(); if (redraw !== false) drawTab(); }
  // distribuição exata no nível L: segue os passos em ordem; se um passo não fecha, guarda os pontos
  function distAt(plan, L) {
    var st = {}; E.ST.forEach(function (k) { st[k] = 1; });
    var tot = E.statPointsTotal(L, b.cls) + (b.bonusPts || 0), bud = tot, cur = -1;
    for (var i = 0; i < plan.length; i++) {
      var k = plan[i][0], t = Math.min(120, plan[i][1] || 1);
      while (st[k] < t) { var c = E.statCost(st[k]); if (c > bud) break; bud -= c; st[k]++; }
      if (st[k] < t) { cur = i; break; }
    }
    return { st: st, free: bud, tot: tot, cur: cur };
  }
  function stepLevels(plan) {
    var st = {}, need = 0, out = []; E.ST.forEach(function (k) { st[k] = 1; });
    plan.forEach(function (p) {
      var k = p[0], t = Math.min(120, p[1] || 1); while (st[k] < t) { need += E.statCost(st[k]); st[k]++; }
      var L = 1; while (L <= 175 && E.statPointsTotal(L, b.cls) + (b.bonusPts || 0) < need) L++;
      out.push(L > 175 ? null : L);
    });
    return out;
  }
  function moveIt(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var x = arr[i]; arr[i] = arr[j]; arr[j] = x; }
  // progressão de habilidades: expande a ordem do guia ponto a ponto (com pré-requisitos) e dá o nível de cada ponto
  var gPP = true;
  function skRanges(T, G) {
    var D0 = [[10, 55], [55, 120], [120, 175]];
    return T.map(function (tb, i) { var r = (G.skLv || [])[i]; return r && r.length === 2 ? r : (T.length === 1 ? [10, Math.min(175, 10 + tb.pts)] : D0[Math.min(i, 2)]); });
  }
  function expandOrder(ord, T) {
    var tl = {}, used = T.map(function () { return 0; }), steps = [];
    function find(ae) { for (var i = 0; i < T.length; i++) { var s = T[i].sk.filter(function (x) { return x[0] === ae; })[0]; if (s) return { s: s, ti: i }; } return null; }
    function up(ae, lv, note, seen) {
      seen = seen || {}; if (seen[ae]) return; seen[ae] = 1; var f = find(ae); if (!f) return; var s = f.s, ti = f.ti;
      s[2].forEach(function (r) { if (find(r[0]) && (tl[r[0]] || 0) < r[1]) up(r[0], r[1], 'pré-requisito de ' + skLabel(ae), seen); });
      while ((tl[ae] || 0) < Math.min(lv, s[1]) && (s[5] || used[ti] < T[ti].pts)) { tl[ae] = (tl[ae] || 0) + 1; if (!s[5]) used[ti]++; steps.push({ ae: ae, lv: tl[ae], ti: ti, k: used[ti], free: !!s[5], note: note }); note = ''; }
    }
    (ord || []).forEach(function (o) { up(o[0], o[1], o[2] || ''); });
    return { steps: steps, used: used };
  }
  function stepLv(st, T, RG) { var r = RG[st.ti], p = T[st.ti].pts; return Math.round(r[0] + (r[1] - r[0]) * Math.max(0, st.k - 1) / Math.max(1, p - 1)); }
  function treeAt(ex, T, RG, L) { var tl = {}; ex.steps.forEach(function (st) { if (stepLv(st, T, RG) <= L) tl[st.ae] = st.lv; }); return tl; }
  function applyTreeAt(tl, L) {
    b.tree = {}; Object.keys(tl).forEach(function (ae) { b.tree[ae] = tl[ae]; });
    tabsOf().forEach(function (tb) { tb.sk.forEach(function (s) { syncSim(s[0]); }); });
    refresh(true); toast(L ? 'Árvore montada como no nível ' + L : 'Árvore montada a partir do guia'); goTab('skills');
  }
  function orderFromTree() {
    var ord = []; tabsOf().forEach(function (tb) { tb.sk.slice().sort(function (a, c) { return (a[4] - c[4]) || (a[3] - c[3]); }).forEach(function (s) { if (tLv(s[0])) ord.push([s[0], tLv(s[0]), '']); }); });
    return ord;
  }
  function treeSkills(cls) { var out = []; (Y.trees[cls] || []).forEach(function (tb) { tb.sk.forEach(function (s) { out.push({ ae: s[0], max: s[1], tab: tb.n }); }); }); return out; }
  // custo para entrar no mapa (a partir do T3): valor VIP; sem VIP paga o dobro
  var MAPCOST = { 3: 125000, 4: 250000 };
  function mapCost(code) { var mp = Y.maps[code], v = mp && MAPCOST[mp[1]]; return v ? { vip: v, free: v * 2 } : null; }
  // T5 ainda não existe no YggIdle: mapas bloqueados
  // missões de liberação: no Nv 32 abre a do T2, no 65 a do T3 e no 99 a do T4
  var TIERLV = { 1: 1, 2: 32, 3: 65, 4: 99 }, MILES = [[32, 'T2'], [65, 'T3'], [99, 'T4']];
  function mapLocked(code) { var mp = Y.maps[code]; return !!(mp && mp[1] >= 5); }
  // EXP por diferença de nível (notícia oficial do YggIdle de 2026-10-07: "EXP por diferença de nível").
  // Acima: até +2 → 100%; +3 a +9 → 102% a 120% (+3 por nível); +10 a +14 → 40%; +15 → 20%; +16 ou mais → 5%.
  // Abaixo: até −5 → 100%; depois a tabela base do servidor, que a notícia diz que não mudou:
  // −6 a −10 → 95%; −11 a −15 → 90%; −16 a −20 → 85%; −21 a −25 → 60%; −26 a −30 → 35%; −31 ou menos → 10%.
  function expPct(pl, ml) {
    var d = ml - pl;
    if (d >= 16) return 5; if (d === 15) return 20; if (d >= 10) return 40; if (d >= 3) return 102 + (d - 3) * 3;
    if (d >= -5) return 100; if (d >= -10) return 95; if (d >= -15) return 90; if (d >= -20) return 85;
    if (d >= -25) return 60; if (d >= -30) return 35; return 10;
  }
  function expChip(pl, ml) {
    var p = expPct(pl, ml), d = ml - pl;
    return h('span', { class: 'xpp ' + (p > 100 ? 'up' : p === 100 ? 'eq' : p >= 85 ? 'lo' : 'bad'),
      title: 'Monstro ' + (d > 0 ? d + ' níveis acima' : d < 0 ? (-d) + ' níveis abaixo' : 'no mesmo nível') + ' do personagem Nv ' + pl + ': rende ' + p + '% da EXP' }, [p + '%']);
  }
  function expBadge(p) { return h('span', { class: 'xpp ' + (p > 100 ? 'up' : p === 100 ? 'eq' : p >= 85 ? 'lo' : 'bad') }, [p + '%']); }
  function kz(v) { return v >= 1e6 ? fmt(v / 1e6, 1) + 'kk' : fmt(v / 1e3) + 'k'; }
  function costTag(code, long) {
    var c = mapCost(code); if (!c) return null;
    return h('span', { class: 'mcost', title: 'Custo para entrar no mapa: ' + fmt(c.vip) + ' zeny com VIP, ' + fmt(c.free) + ' zeny sem VIP' },
      [long ? 'Entrada ' : '', h('b', null, [kz(c.vip)]), ' VIP · ', h('b', null, [kz(c.free)]), ' sem VIP']);
  }
  function openMapModal(code, pl) {
    var info = Y.mapInfo[code] || {}, mp = Y.maps[code] || [code];
    openModal(h('div', { class: 'mapbig' }, [h('div', { class: 'mhead' }, [h('h3', null, [mp[0] + ' · ' + code]), mapLocked(code) ? h('span', { class: 'lockt' }, ['Bloqueado']) : costTag(code, true), h('button', { on: { click: closeModal } }, ['Fechar'])]),
      h('div', { class: 'mbwrap' }, [h('div', { class: 'mbimg' }, [mapImg(code, 'mmapbig')]), mobTable(info.mob || [], true, pl)])]), 'wide');
  }
  // EXP média do mapa no nível pl (ponderada pela quantidade de cada monstro)
  function mapExpPct(mob, pl) {
    var w = 0, s = 0;
    mob.forEach(function (r) { var m = Y.monById[r[0]]; if (!m || !(m.lv > 0)) return; var q = r[1] || 1; w += q; s += q * expPct(pl, m.lv); });
    return w ? Math.round(s / w) : null;
  }
  function mobTable(mob, full, pl) {
    var hasPl = pl > 0;
    var tb = h('table', { class: 'mobt' }, [h('tr', null, [h('th', null, ['Monstro']), h('th', null, ['Qtd.']), h('th', null, ['EXP base']), h('th', null, ['EXP classe']),
      hasPl ? h('th', { title: 'Quanto da EXP do monstro o personagem recebe no Nv ' + pl + ', pela diferença de nível' }, ['EXP no Nv ' + pl]) : null])]);
    mob.slice(0, full ? 99 : 5).forEach(function (r) {
      var m = Y.monById[r[0]] || { n: '#' + r[0], lv: '?', ele: '' };
      var tr = h('tr', null, [h('td', null, [h('span', { class: 'mcell' }, [h('span', { class: 'mbox' }, [mobImg(r[0])]), h('span', null, [h('b', null, [m.n]), h('small', null, ['Nv ' + m.lv + (m.ele ? ' · ' + m.ele + ' ' + (m.el || '') : '') + (m.race ? ' · ' + m.race : '')])])])]),
        h('td', { class: 'n' }, [fmt(r[1])]), h('td', { class: 'n xb' }, [fmt(r[2])]), h('td', { class: 'n xj' }, [fmt(r[3])]),
        hasPl ? h('td', { class: 'n' }, [m.lv > 0 ? expChip(pl, m.lv) : '—']) : null]);
      tipOn(tr, function () { return h('div', null, [h('b', null, [m.n]), h('div', { class: 'tip' }, ['HP ' + fmt(m.hp) + ' · DEF ' + (m.def || 0) + ' · MDEF ' + (m.mdef || 0) + ' · ' + (m.size || '')])]); });
      tb.appendChild(tr);
    });
    if (!mob.length) tb.appendChild(h('tr', null, [h('td', { colspan: hasPl ? 5 : 4, class: 'mut' }, ['Sem dados de monstros na wiki.'])]));
    return tb;
  }
  function pickMap(onPick, band, pl) {
    var q = h('input', { placeholder: 'Buscar mapa por nome ou código…', style: 'width:100%' }), box = h('div', { class: 'list maplist' });
    var ids = Object.keys(Y.maps);
    function fill() {
      box.innerHTML = ''; var s = q.value.trim().toLowerCase(), n = 0, shown = 0, lastSec = null;
      ids.forEach(function (id) {
        var mp = Y.maps[id];
        if (s && (mp[0] + ' ' + id).toLowerCase().indexOf(s) < 0) return; n++;
        var lk = mapLocked(id), sug = band && isSug(id), sec = band ? (sug ? 'sug' : 'out') : 'all';
        if (!s && !sug && shown >= 80) return;
        if (band && sec !== lastSec) { lastSec = sec; box.appendChild(h('div', { class: 'msec' }, [sug ? 'Sugeridos para Nv ' + band[0] + '–' + band[1] : 'Outros mapas (pode adicionar qualquer um)'])); }
        shown++;
        var un = TIERLV[mp[1]], req = band && un > 1 && band[0] < un, low = isLow(id), xp = low ? lowPct(id) : null;
        box.appendChild(h('div', { class: 'it' + (lk ? ' lock' : '') + (sug ? ' near' : '') + (low && !lk ? ' low' : ''), title: lk ? 'Mapas T5 ainda não estão liberados no YggIdle' : low ? 'Os monstros deste mapa estão 9 ou mais níveis abaixo do Nv ' + pl + ' do guia: rende ' + xp + '% da EXP. Ainda pode ser adicionado.' : '', on: { click: function () { if (lk) { toast('Mapa T5 bloqueado: ainda não existe no YggIdle'); return; } onPick(id); closeModal(); } } },
          [h('span', { class: 'mapit' }, [mapImg(id, 'mthumb'), h('span', null, [h('b', null, [mp[0]]), h('small', null, [id + ' · monstros Nv ' + mp[2] + (un > 1 ? ' · libera na missão do Nv ' + un : '')])])]),
            h('span', { class: 'mapr' }, [low && !lk ? h('span', { class: 'lowt' }, ['Não recomendado · EXP ' + xp + '%']) : null, lk ? h('span', { class: 'lockt' }, ['Bloqueado']) : costTag(id), req && !lk ? h('span', { class: 'reqt' }, ['Missão Nv ' + un]) : null, h('span', { class: 'tier t' + mp[1] }, ['T' + mp[1]])])]));
      });
      if (!n) box.appendChild(h('div', { class: 'it mut' }, ['Nenhum mapa']));
      else if (shown < n) box.appendChild(h('div', { class: 'it mut' }, ['… e mais ' + (n - shown) + ' mapas. Digite para buscar.']));
    }
    function rng(id) { var r = String(Y.maps[id][2] || '').split('-'), lo = +r[0] || 0; return [lo, +r[1] || lo]; }
    // sugerido = monstros que rendem EXP cheia ou bônus em algum nível da faixa (−5 a +9) e tier já liberado nela
    // mapa 9 ou mais níveis abaixo do nível do guia: fica cinza com aviso, mas pode ser adicionado
    function isLow(id) { var r = rng(id); return pl > 0 && r[1] > 0 && r[1] <= pl - 9; }
    function lowPct(id) { var p = mapExpPct((Y.mapInfo[id] || {}).mob || [], pl); return p != null ? p : expPct(pl, rng(id)[1]); }
    function isSug(id) { var r = rng(id), mp = Y.maps[id]; return !mapLocked(id) && !isLow(id) && r[0] && r[1] >= band[0] - 5 && r[0] <= band[1] + 9 && (TIERLV[mp[1]] || 1) <= band[1]; }
    ids.sort(function (a, c) {
      function k(id) { var r = rng(id); return (mapLocked(id) ? 2e5 : 0) + (isLow(id) ? 1.5e5 : 0) + (band && !isSug(id) ? 1e5 : 0) + (Y.maps[id][1] || 0) * 1000 + r[0]; }
      return k(a) - k(c);
    });
    q.addEventListener('input', fill); fill();
    openModal(h('div', null, [h('h3', null, [band ? 'Adicionar mapa · Nv ' + band[0] + '–' + band[1] : 'Adicionar mapa ao guia']), q, box, h('div', { class: 'row' }, [h('button', { on: { click: closeModal } }, ['Cancelar'])])]));
    setTimeout(function () { q.focus(); }, 30);
  }
  function editList(arr, ph) {
    var w = h('div', { class: 'elist' });
    arr.forEach(function (x, i) {
      w.appendChild(h('div', { class: 'erow' }, [h('input', { value: x, placeholder: ph, on: { change: function (e) { arr[i] = e.target.value; gSave(false); } } }),
        h('button', { class: 'sm ghost', title: 'Subir', on: { click: function () { moveIt(arr, i, -1); gSave(); } } }, ['↑']),
        h('button', { class: 'sm ghost', title: 'Remover', on: { click: function () { arr.splice(i, 1); gSave(); } } }, ['×'])]));
    });
    w.appendChild(h('button', { class: 'sm', on: { click: function () { arr.push(''); gSave(); } } }, ['+ Adicionar']));
    return w;
  }
  function tabGuide(t) {
    var cl = Y.classById[b.cls], g0 = Y.guideFor(b.cls), G = guide(), col = Y.lineColor(b.cls), custom = !!b.guides[b.cls];
    if (gLv == null) gLv = b.lv;
    var L = gLv;
    var dots = h('span', { class: 'diff', title: 'Dificuldade' }); for (var i = 1; i <= 3; i++) dots.appendChild(h('i', { class: i <= (g0.diff || 1) ? 'on' : '' }));
    var nTut = tutCount(b.cls);
    if (nTut) t.appendChild(h('button', { class: 'tutcall', style: '--lc:' + col, on: { click: function () { tutF.cls = 'cur'; goTab('tut'); } } },
      ['★ ' + nTut + ' build' + (nTut === 1 ? '' : 's') + ' de tutor para ' + cl.n, h('span', null, ['ver ▸'])]));
    // banner
    t.appendChild(h('div', { class: 'banner', style: '--lc:' + col }, [
      h('div', { class: 'bpf' }, [h('span', { class: 'rune' }), h('span', { class: 'motes' }), h('span', { class: 'ped' }), spriteEl(b.cls, 'big')]),
      h('div', { class: 'btxt' }, [
        h('div', { class: 'hline' }, ['Guia da classe · ' + cl.line + ' · ' + tierName(cl)]),
        h('h2', null, [cl.n]),
        h('div', { class: 'hchips' }, [g0.role ? h('span', { class: 'chip lc' }, [g0.role]) : null, h('span', { class: 'chip' }, ['Dificuldade ', dots]),
          h('span', { class: 'chip ' + (custom ? 'ok' : '') }, [custom ? '✎ Guia personalizado' : 'Guia padrão do planner']),
          h('span', { class: 'chip' }, ['Armas: ' + cl.wp.filter(function (w) { return w !== 'Fist'; }).map(function (w) { return Y.weaponNames[w] || w; }).slice(0, 4).join(', ')])]),
        gEdit ? h('textarea', { class: 'gres', placeholder: 'Resumo da build…', on: { change: function (e) { gw().resumo = e.target.value; gSave(false); } } }, [G.resumo]) : h('p', null, [G.resumo || '']),
        h('div', { class: 'row' }, [
          h('button', { class: gEdit ? 'pri glow' : 'pri', on: { click: function () { gEdit = !gEdit; drawTab(); } } }, [gEdit ? '✓ Concluir edição' : '✎ Editar guia']),
          custom ? h('button', { class: 'ghost', on: { click: function () { if (confirm('Descartar suas edições do guia de ' + cl.n + '?')) { delete b.guides[b.cls]; gSave(); } } } }, ['↺ Restaurar padrão']) : null,
          h('button', { on: { click: function () { applyRot(g0); } } }, ['Usar rotação na simulação']),
          h('button', { class: 'ghost', on: { click: openClassPicker } }, ['Trocar classe'])])])]));
    if (gEdit) t.appendChild(h('div', { class: 'editbar' }, ['✎ Modo de edição: altere mapas, faixas de nível, comentários, atributos e habilidades. Tudo é salvo na build e vai junto no Exportar e no Link.']));

    // régua de nível compartilhada
    var lvBox = h('div', { class: 'card lvcard' });
    var distBox = h('div'), mapBox = h('div', { class: 'gmaps' }), rulerBox = h('div', { class: 'ruler' });
    var lvNum = h('b', { class: 'lvnum' }, [String(L)]);
    var slider = h('input', { type: 'range', min: 1, max: 175, value: L, class: 'lvslide' });
    slider.addEventListener('input', function () { gLv = L = +slider.value; lvNum.textContent = L; paintSlide(); drawDist(); drawRuler(); drawMaps(); });
    function paintSlide() { slider.style.setProperty('--p', ((L - 1) / 174 * 100) + '%'); }
    paintSlide();
    lvBox.appendChild(h('div', { class: 'lvhead' }, [h('h3', null, ['Nível do guia']), lvNum,
      h('span', { class: 'grow' }),
      h('button', { class: 'sm ghost', on: { click: function () { gLv = L = b.lv; slider.value = L; lvNum.textContent = L; paintSlide(); drawDist(); drawRuler(); drawMaps(); } } }, ['Ir para o nível da build (' + b.lv + ')'])]));
    lvBox.appendChild(slider);
    lvBox.appendChild(h('div', { class: 'lvticks' }, [1, 25, 50, 75, 100, 125, 150, 175].filter(function (x) { return !MILES.some(function (m) { return Math.abs(m[0] - x) < 10; }); }).map(function (x) { return h('span', { style: 'left:' + ((x - 1) / 174 * 100) + '%' }, [String(x)]); })
      .concat(MILES.map(function (m) { return h('span', { class: 'mtick', style: 'left:' + ((m[0] - 1) / 174 * 100) + '%', title: 'Nv ' + m[0] + ': abre a missão que libera os mapas ' + m[1] }, [m[0] + ' · ' + m[1]]); }))));
    lvBox.appendChild(rulerBox);
    t.appendChild(lvBox);
    function drawRuler() {
      rulerBox.innerHTML = '';
      var lanes = [], srt = G.maps.slice().sort(function (a, c) { return a.de - c.de; });
      srt.forEach(function (e) {
        var de = Math.max(1, e.de || 1), ate = Math.min(175, e.ate || 175), lane = 0;
        while (lanes[lane] != null && lanes[lane] >= de) lane++; lanes[lane] = ate;
        var on = L >= de && L <= ate;
        var seg = h('span', { class: 'seg' + (on ? ' on' : ''), style: 'left:' + ((de - 1) / 174 * 100) + '%;width:' + Math.max(1.2, (ate - de) / 174 * 100) + '%;top:' + (lane * 11) + 'px', title: ((Y.maps[e.m] || [e.m])[0]) + ' · Nv ' + de + '–' + ate,
          on: { click: function () { gLv = L = de; slider.value = L; lvNum.textContent = L; paintSlide(); drawDist(); drawRuler(); drawMaps(); } } });
        rulerBox.appendChild(seg);
      });
      rulerBox.style.height = Math.max(34, lanes.length * 11 + 8) + 'px';
      MILES.forEach(function (m) { rulerBox.appendChild(h('i', { class: 'mile', style: 'left:' + ((m[0] - 1) / 174 * 100) + '%', title: 'Nv ' + m[0] + ': missão libera os mapas ' + m[1] })); });
      rulerBox.appendChild(h('i', { class: 'mark', style: 'left:' + ((L - 1) / 174 * 100) + '%' }));
    }
    drawRuler();

    var cols = h('div', { class: 'gcols' }); t.appendChild(cols);
    var colL = h('div'), colR = h('div'); cols.appendChild(colL); cols.appendChild(colR);

    // mapas
    var cM = h('div', { class: 'card' }, [h('div', { class: 'ch' }, [h('h3', null, ['Rota de mapas']), h('span', { class: 'grow' }),
      h('span', { class: 'tip' }, ['Escolha os mapas de cada faixa de nível. Clique no ', h('b', { class: 'bangi' }, ['!']), ' para ler o comentário.'])])]);
    cM.appendChild(mapBox); colL.appendChild(cM);
    function bandOf(e) { for (var k = 0; k < GBANDS.length; k++) if ((e.de || 1) <= GBANDS[k][1]) return k; return GBANDS.length - 1; }
    function addTo(bd) {
      pickMap(function (id) {
        var mp = Y.maps[id], r = String(mp[2] || '').split('-'), lo = +r[0] || bd[0], hi = +r[1] || lo;
        // só uma sugestão inicial: quem monta o guia ajusta o Nv mínimo e máximo no próprio card
        var de = Math.max(bd[0], Math.min(bd[1], lo - 5)), ate = Math.min(175, Math.max(de, hi + 2));
        gw().maps.push({ m: id, de: de, ate: ate, nota: '' }); gSave();
      }, bd, L);
    }
    function drawMaps() {
      mapBox.innerHTML = '';
      var groups = GBANDS.map(function () { return []; });
      G.maps.forEach(function (e, i) { groups[bandOf(e)].push({ e: e, i: i }); });
      GBANDS.forEach(function (bd, k) {
        var on = L >= bd[0] && L <= bd[1], list = groups[k].sort(function (a, c) { return (a.e.de - c.e.de) || (a.e.ate - c.e.ate) || (a.i - c.i); });
        var sec = h('div', { class: 'gband' + (on ? ' on' : '') }, [h('div', { class: 'gbh' }, [h('b', null, ['Nv ' + bd[0] + '–' + bd[1]]),
          h('span', { class: 'mile' }, [bd[2]]),
          h('small', null, [list.length ? list.length + (list.length > 1 ? ' mapas' : ' mapa') : 'nenhum mapa escolhido']), h('span', { class: 'grow' }),
          h('button', { class: 'sm pri', title: 'Adicionar um mapa que começa nesta etapa', on: { click: function () { addTo(bd); } } }, ['+ Adicionar'])])]);
        list.forEach(function (x) { sec.appendChild(mapCard(x.e, x.i)); });
        if (!list.length) sec.appendChild(h('div', { class: 'gbempty' }, ['Vazio. Use “+ Adicionar” para escolher um mapa; o Nv mínimo e máximo de cada mapa você define no card.']));
        mapBox.appendChild(sec);
      });
    }
    function mapCard(e, i) {
      var info = Y.mapInfo[e.m] || { mob: [] }, mp = Y.maps[e.m] || [e.m, 0, '', 0], on = L >= e.de && L <= e.ate, lk = mapLocked(e.m);
      var bang = e.nota ? h('button', { class: 'bang' + (gNote === e.m ? ' open' : ''), title: 'Ver comentário', on: { click: function (ev) { ev.stopPropagation(); gNote = gNote === e.m ? null : e.m; drawMaps(); } } }, ['!']) : null;
      var thumb = h('div', { class: 'gthumb', title: 'Ampliar mapa', on: { click: function () { openMapModal(e.m, L); } } }, [mapImg(e.m), h('span', { class: 'zoom' }, ['⤢'])]);
      var tot = info.mob.reduce(function (s, r) { return s + r[1]; }, 0), xp = mapExpPct(info.mob, L);
      var un = TIERLV[mp[1]] || 1;
      function setLv(k, v) { var W = gw().maps[i]; v = Math.max(1, Math.min(175, Math.round(+v) || (k === 'de' ? 1 : 175))); W[k] = v; if (W.ate < W.de) { if (k === 'de') W.ate = W.de; else W.de = W.ate; } gSave(); }
      var lvIn = h('span', { class: 'lvr lvin' + (on ? ' on' : ''), title: 'Nível mínimo e máximo do personagem para este mapa (1 a 175)' }, ['Nv ',
        h('input', { type: 'number', min: 1, max: 175, value: e.de, on: { change: function (ev) { setLv('de', ev.target.value); } } }), ' a ',
        h('input', { type: 'number', min: 1, max: 175, value: e.ate, on: { change: function (ev) { setLv('ate', ev.target.value); } } })]);
      var head = h('div', { class: 'gmh' }, [h('div', null, [h('span', { class: 'gmn' }, [h('b', null, [mp[0]]), bang]), h('small', null, [e.m + (mp[2] ? ' · monstros Nv ' + mp[2] : '')])]),
        lvIn, mp[1] ? h('span', { class: 'tier t' + mp[1] }, ['T' + mp[1]]) : null,
        lk ? h('span', { class: 'lockt' }, ['Bloqueado']) : null,
        h('button', { class: 'sm rem', title: 'Remover este mapa da rota', on: { click: function () { gw().maps.splice(i, 1); if (gNote === e.m) gNote = null; gSave(); } } }, ['✕ Remover'])]);
      var warn = !lk && un > 1 && e.de < un ? h('div', { class: 'reqw' }, ['⚠ Mapa T' + mp[1] + ': só libera depois da missão do Nv ' + un + '. A rota começa no Nv ' + e.de + '.']) : null;
      var stats = h('div', { class: 'gms' }, [
        xp != null ? h('span', { title: 'Média ponderada pela quantidade de cada monstro: quanto da EXP o personagem Nv ' + L + ' recebe neste mapa (diferença de nível)' }, [h('small', null, ['EXP no Nv ' + L]), h('b', null, [expBadge(xp)])]) : null,
        h('span', null, [h('small', null, ['XP base/abate']), h('b', { class: 'xb' }, [fmt(info.xb)])]),
        h('span', null, [h('small', null, ['XP classe/abate']), h('b', { class: 'xj' }, [fmt(info.xj)])]),
        h('span', null, [h('small', null, ['Zeny/abate']), h('b', null, [fmt(info.z, 1)])]),
        h('span', null, [h('small', null, ['Monstros']), h('b', null, [fmt(tot)])]),
        info.el ? h('span', null, [h('small', null, ['Elemento ideal']), h('b', { class: 'el' }, [info.el])]) : null,
        mapCost(e.m) ? h('span', null, [h('small', null, ['Entrada (VIP / sem VIP)']), h('b', { class: 'zc' }, [kz(mapCost(e.m).vip) + ' / ' + kz(mapCost(e.m).free)])]) : null]);
      var body = h('div', { class: 'gmb' }, [head, warn, stats, mobTable(info.mob, false, L)]);
      if (gNote === e.m && e.nota) body.insertBefore(h('div', { class: 'gnote' }, [h('b', null, ['! Comentário']), h('div', null, [e.nota])]), stats);
      if (gEdit) {
        var W = gw().maps[i];
        body.appendChild(h('div', { class: 'gedit' }, [
          h('span', { class: 'grow' }),
          h('button', { class: 'sm ghost', on: { click: function () { moveIt(gw().maps, i, -1); gSave(); } } }, ['↑']),
          h('button', { class: 'sm ghost', on: { click: function () { moveIt(gw().maps, i, 1); gSave(); } } }, ['↓']),
          h('textarea', { class: 'gnota', placeholder: 'Comentário do mapa (aparece no “!” para quem abrir o guia)…', on: { change: function (ev) { W.nota = ev.target.value; gSave(); } } }, [e.nota || ''])]));
      }
      return h('div', { class: 'gmap' + (on ? ' on' : '') }, [thumb, body]);
    }
    drawMaps();

    // habilidades na ordem
    var TT = tabsOf(), RG = skRanges(TT, G), EX = expandOrder(G.ordem, TT);
    var c1 = h('div', { class: 'card' }, [h('div', { class: 'ch' }, [h('h3', null, ['Habilidades por nível']), h('span', { class: 'grow' }),
      h('span', { class: 'seg2' }, [h('button', { class: gPP ? 'on' : '', on: { click: function () { gPP = true; drawTab(); } } }, ['Ponto a ponto']), h('button', { class: gPP ? '' : 'on', on: { click: function () { gPP = false; drawTab(); } } }, ['Ordem resumida'])])])]);
    var skBox = h('div'); c1.appendChild(skBox);
    function drawSk() {
      skBox.innerHTML = '';
      var tl = treeAt(EX, TT, RG, L);
      skBox.appendChild(h('div', { class: 'row', style: 'margin-bottom:6px' }, [
        h('button', { class: 'sm pri', title: 'Monta a árvore com os pontos que o guia prevê até este nível', on: { click: function () { applyTreeAt(treeAt(EX, TT, RG, L), L); } } }, ['Aplicar na árvore (Nv ' + L + ')']),
        h('button', { class: 'sm', on: { click: function () { applyTreeAt(treeAt(EX, TT, RG, 999), 0); } } }, ['Aplicar tudo']),
        h('button', { class: 'sm ghost', title: 'Substitui a ordem do guia pela sua árvore atual', on: { click: function () { var o = orderFromTree(); if (!o.length) { toast('Sua árvore está vazia'); return; } gw().ordem = o; gSave(); toast('Ordem copiada da árvore'); } } }, ['Copiar da árvore'])]));
      // faixas de nível por aba
      skBox.appendChild(h('div', { class: 'sktabsum' }, TT.map(function (tb, i) {
        var got = 0; EX.steps.forEach(function (st) { if (st.ti === i && !st.free && stepLv(st, TT, RG) <= L) got++; });
        var kids = [h('b', null, [tb.n]), h('span', null, [got + ' / ' + tb.pts + ' pontos no Nv ' + L]), h('small', null, [EX.used[i] < tb.pts ? 'guia usa ' + EX.used[i] + ' de ' + tb.pts : 'completo'])];
        if (gEdit) kids.push(h('span', { class: 'gedit' }, ['Nv ', h('input', { type: 'number', class: 'num', min: 1, max: 175, value: RG[i][0], style: 'width:58px', on: { change: function (ev) { var w = gw(); w.skLv = skRanges(TT, w); w.skLv[i][0] = Math.max(1, Math.min(175, +ev.target.value || 1)); gSave(); } } }), ' a ',
          h('input', { type: 'number', class: 'num', min: 1, max: 175, value: RG[i][1], style: 'width:58px', on: { change: function (ev) { var w = gw(); w.skLv = skRanges(TT, w); w.skLv[i][1] = Math.max(1, Math.min(175, +ev.target.value || 1)); gSave(); } } })]));
        else kids.push(h('small', null, ['pontos do Nv ' + RG[i][0] + ' ao ' + RG[i][1]]));
        return h('div', { class: 'skts' }, kids);
      })));
      // árvore resumida no nível L
      var chips = h('div', { class: 'skat' });
      TT.forEach(function (tb) { tb.sk.forEach(function (s) { if (!tl[s[0]]) return; var ch = h('span', { class: 'skchip' + (tl[s[0]] >= s[1] ? ' max' : '') }, [skillIcon(s[0]), h('b', null, [String(tl[s[0]])])]); skTip(ch, s[0], tl[s[0]], s[1]); chips.appendChild(ch); }); });
      if (!chips.childNodes.length) chips.appendChild(h('span', { class: 'mut' }, ['Nenhum ponto de habilidade até o Nv ' + L + '.']));
      skBox.appendChild(h('div', { class: 'tip' }, ['Árvore no Nv ' + L + ':'])); skBox.appendChild(chips);
      if (gPP && !gEdit) {
        var ol2 = h('ol', { class: 'ppsteps' }), prevTi = -1, nowSet = false;
        EX.steps.forEach(function (st) {
          var lvS = stepLv(st, TT, RG), done = lvS <= L;
          if (st.ti !== prevTi) { ol2.appendChild(h('li', { class: 'pphead' }, [TT[st.ti].n + ' · Nv ' + RG[st.ti][0] + '–' + RG[st.ti][1]])); prevTi = st.ti; }
          var cls = done ? 'done' : !nowSet ? 'now' : ''; if (!done && !nowSet) nowSet = true;
          var li = h('li', { class: cls }, [h('span', { class: 'ppk' }, [st.free ? '·' : String(st.k)]), skillIcon(st.ae), h('span', { class: 'ppn' }, [skLabel(st.ae) + ' ', h('b', null, ['→ ' + st.lv])]),
            st.note ? h('small', null, [st.note]) : null, h('span', { class: 'grow' }), h('span', { class: 'plv' }, ['Nv ' + lvS])]);
          skTip(li, st.ae, st.lv, null); ol2.appendChild(li);
        });
        if (!EX.steps.length) ol2.appendChild(h('li', { class: 'mut' }, ['A ordem do guia está vazia. Use “Copiar da árvore” ou edite o guia.']));
        skBox.appendChild(ol2);
        requestAnimationFrame(function () { var n = ol2.querySelector('li.now'); if (n) ol2.scrollTop = Math.max(0, n.offsetTop - ol2.offsetTop - 80); });
        skBox.appendChild(h('div', { class: 'tip' }, ['Cada linha é um ponto. Os pré-requisitos entram automaticamente antes da habilidade que os pede. Edite o guia para mudar a ordem e as faixas de nível de cada aba.']));
        return;
      }
      skBox.appendChild(ol);
    }
    var ol = h('ol', { class: 'steps' }), all = treeSkills(b.cls);
    G.ordem.forEach(function (o, i) {
      var s2 = Y.sk2 && Y.sk2[o[0]], inTree = all.some(function (x) { return x.ae === o[0]; });
      var li = h('li', null, [h('div', { class: 'sh' }, [s2 ? skillIcon(o[0]) : null, h('b', null, [skLabel(o[0])]), h('span', { class: 'lvb' }, ['Nv ' + o[1]]),
        inTree ? null : h('span', { class: 'tag' }, ['fora da árvore'])]), !gEdit && o[2] ? h('div', { class: 'tip' }, [o[2]]) : null]);
      if (gEdit) {
        var W = gw().ordem[i], sel = h('select', { on: { change: function (ev) { W[0] = ev.target.value; var m = all.filter(function (x) { return x.ae === W[0]; })[0]; if (m) W[1] = Math.min(W[1], m.max) || m.max; gSave(); } } });
        var groups = {}; all.forEach(function (x) { (groups[x.tab] = groups[x.tab] || []).push(x); });
        if (!inTree) sel.appendChild(h('option', { value: o[0], selected: true }, [skLabel(o[0])]));
        Object.keys(groups).forEach(function (gname) { var og = h('optgroup', { label: gname }); groups[gname].forEach(function (x) { og.appendChild(h('option', { value: x.ae, selected: x.ae === o[0] }, [skLabel(x.ae)])); }); sel.appendChild(og); });
        li.appendChild(h('div', { class: 'gedit' }, [sel, h('input', { type: 'number', class: 'num', min: 1, max: 10, value: o[1], on: { change: function (ev) { W[1] = Math.max(1, Math.min(10, +ev.target.value || 1)); gSave(); } } }),
          h('button', { class: 'sm ghost', on: { click: function () { moveIt(gw().ordem, i, -1); gSave(); } } }, ['↑']),
          h('button', { class: 'sm ghost', on: { click: function () { moveIt(gw().ordem, i, 1); gSave(); } } }, ['↓']),
          h('button', { class: 'sm ghost', on: { click: function () { gw().ordem.splice(i, 1); gSave(); } } }, ['×']),
          h('input', { value: o[2] || '', placeholder: 'Nota (opcional)', style: 'flex:1 1 100%', on: { change: function (ev) { W[2] = ev.target.value; gSave(false); } } })]));
      }
      ol.appendChild(li);
    });
    drawSk();
    if (gEdit && all.length) c1.appendChild(h('button', { class: 'sm', on: { click: function () { gw().ordem.push([all[0].ae, 1, '']); gSave(); } } }, ['+ Adicionar habilidade']));
    if ((g0.rot || []).length) c1.appendChild(h('div', { class: 'rotline' }, [h('small', null, ['Rotação de combate: ']), h('span', null, [g0.rot.map(skName).join(' → ')])]));
    colL.appendChild(c1);

    // atributos por nível
    var c2 = h('div', { class: 'card' }, [h('div', { class: 'ch' }, [h('h3', null, ['Atributos por nível']), h('span', { class: 'grow' }),
      h('button', { class: 'sm pri', on: { click: function () { var d = distAt(G.plan, L); b.lv = L; E.ST.forEach(function (k) { b.stats[k] = d.st[k]; }); syncHeader(); refresh(true); toast('Build ajustada para o nível ' + L); } } }, ['Aplicar na build'])])]);
    c2.appendChild(distBox); colR.appendChild(c2);
    function drawDist() {
      distBox.innerHTML = '';
      var d = distAt(G.plan, L), used = d.tot - d.free, lvs = stepLevels(G.plan);
      distBox.appendChild(h('div', { class: 'dsum' }, [h('span', null, ['Nível ', h('b', null, [String(L)])]), h('span', null, ['Pontos ', h('b', null, [fmt(used) + ' / ' + fmt(d.tot)])]), h('span', { class: d.free ? 'warn' : 'ok' }, [d.cur < 0 ? (d.free ? d.free + ' livres (plano concluído, adicione passos)' : 'plano concluído') : d.free + ' guardados para o próximo passo'])]));
      E.ST.forEach(function (k) {
        var v = d.st[k], fin = 1; G.plan.forEach(function (p) { if (p[0] === k) fin = Math.max(fin, p[1]); });
        distBox.appendChild(h('div', { class: 'sbar' }, [h('b', null, [STN[k]]), h('div', { class: 'track' }, [h('em', { style: 'width:' + (fin / 120 * 100) + '%' }), h('i', { style: 'width:' + (v / 120 * 100) + '%' }), h('u', { style: 'left:' + (b.stats[k] / 120 * 100) + '%', title: 'Sua build: ' + b.stats[k] })]), h('span', null, [String(v)])]));
      });
      var ul = h('ol', { class: 'plan' });
      G.plan.forEach(function (p, i) {
        var st = i < d.cur || d.cur < 0 ? 'done' : i === d.cur ? 'now' : '';
        var li = h('li', { class: st }, [h('span', { class: 'pst' }, [STN[p[0]] + ' ' + p[1]]), h('span', { class: 'plv' }, [lvs[i] ? 'Nv ' + lvs[i] : 'após 175'])]);
        if (gEdit) {
          var W = gw().plan[i], ss = h('select', { on: { change: function (ev) { W[0] = ev.target.value; gSave(); } } });
          E.ST.forEach(function (k) { ss.appendChild(h('option', { value: k, selected: k === p[0] }, [STN[k]])); });
          li.innerHTML = ''; li.appendChild(h('span', { class: 'gedit' }, [ss, h('input', { type: 'number', class: 'num', min: 2, max: 120, value: p[1], on: { change: function (ev) { W[1] = Math.max(1, Math.min(120, +ev.target.value || 1)); gSave(); } } }),
            h('span', { class: 'plv' }, [lvs[i] ? 'Nv ' + lvs[i] : 'após 175']), h('span', { class: 'grow' }),
            h('button', { class: 'sm ghost', on: { click: function () { moveIt(gw().plan, i, -1); gSave(); } } }, ['↑']),
            h('button', { class: 'sm ghost', on: { click: function () { moveIt(gw().plan, i, 1); gSave(); } } }, ['↓']),
            h('button', { class: 'sm ghost', on: { click: function () { gw().plan.splice(i, 1); gSave(); } } }, ['×'])]));
        }
        ul.appendChild(li);
      });
      distBox.appendChild(h('div', { class: 'tip', style: 'margin-top:10px' }, ['Ordem de distribuição (cada passo sobe o atributo até o valor indicado):']));
      distBox.appendChild(ul);
      if (gEdit) distBox.appendChild(h('button', { class: 'sm', on: { click: function () { var last = G.plan[G.plan.length - 1]; gw().plan.push([last ? last[0] : 'str', Math.min(120, (last ? last[1] : 1) + 10)]); gSave(); } } }, ['+ Adicionar passo']));
      if (G.traits && G.traits.length) distBox.appendChild(h('div', { class: 'tip' }, ['Traços (Nv 100+): ' + G.traits.map(function (s) { return TRN[s[0]] + ' ' + s[1]; }).join(' · ')]));
      distBox.appendChild(h('div', { class: 'tip' }, ['Barra clara: meta final. Barra cheia: valor nesse nível. Marcador: sua build atual.']));
      drawSk();
    }
    drawDist();

    // equipamentos sugeridos
    var cE = h('div', { class: 'card' }, [h('h3', null, ['Equipamentos sugeridos'])]);
    if (gEdit) cE.appendChild(editList(gw().equip, 'Ex.: Arma: Espada de Lâmina Dupla [3]'));
    else if (G.equip.length) cE.appendChild(h('ul', { class: 'bul' }, G.equip.map(function (x) { return h('li', null, [x]); })));
    else cE.appendChild(h('div', { class: 'mut' }, ['Nenhuma sugestão.']));
    colR.appendChild(cE);

    // comentários
    var c4 = h('div', { class: 'card' }, [h('h3', null, ['Comentários e dicas'])]);
    if (gEdit) {
      c4.appendChild(h('div', { class: 'tip' }, ['Dicas'])); c4.appendChild(editList(gw().dicas, 'Uma dica…'));
      c4.appendChild(h('div', { class: 'tip', style: 'margin-top:8px' }, ['Evite'])); c4.appendChild(editList(gw().evitar, 'Algo a evitar…'));
    } else {
      G.dicas.forEach(function (x) { if (x) c4.appendChild(h('div', { class: 'note ok' }, [h('i', null, ['✦']), x])); });
      G.evitar.forEach(function (x) { if (x) c4.appendChild(h('div', { class: 'note bad' }, [h('i', null, ['✕']), x])); });
    }
    // anotações agora ficam no guia (vão junto no Link e no Exportar); as antigas, só do navegador, migram uma vez
    var notes = {}; try { notes = JSON.parse(localStorage.getItem(NOTES) || '{}'); } catch (e) { }
    if (notes[b.cls] && !G.notas) { gw().notas = notes[b.cls]; G = guide(); save(); }
    if (notes[b.cls]) { delete notes[b.cls]; try { localStorage.setItem(NOTES, JSON.stringify(notes)); } catch (e) { } }
    var ta = h('textarea', { class: 'mynotes', placeholder: 'Anotações sobre ' + cl.n + '. Quem abrir o seu Link ou importar a build também lê.' }); ta.value = G.notas || '';
    ta.addEventListener('input', function () { gw().notas = ta.value; save(); });
    c4.appendChild(h('div', { class: 'tip', style: 'margin-top:10px' }, ['Anotações pessoais · compartilhadas no Link e no Exportar'])); c4.appendChild(ta);
    colR.appendChild(c4);
    t.appendChild(h('div', { class: 'tip', style: 'text-align:center' }, ['O guia padrão é editorial, com base na wiki do YggIdle. Monstros, quantidades e EXP vêm da wiki do YggIdle.']));
  }
  function tabStatus(t) {
    var left = R.ptsTotal - R.ptsUsed;
    var c = h('div', { class: 'card' }, [h('h3', null, ['Atributos base'])]);
    c.appendChild(h('div', { class: 'row' }, [h('b', { class: left < 0 ? 'bad' : 'ok' }, ['Pontos restantes: ' + left]), h('span', { class: 'mut' }, ['(' + R.ptsUsed + ' de ' + R.ptsTotal + ')']),
      h('label', { class: 'inl' }, ['Pontos extras ', h('input', { class: 'num', type: 'number', value: b.bonusPts, on: { change: function (e) { b.bonusPts = +e.target.value || 0; refresh(true); } } })]),
      h('button', { on: { click: function () { E.ST.forEach(function (k) { b.stats[k] = 1; }); refresh(true); } } }, ['Zerar'])]));
    E.ST.forEach(function (k) {
      var inp = h('input', { type: 'number', min: 1, max: 120, value: b.stats[k], on: { change: function (e) { b.stats[k] = Math.max(1, Math.min(120, +e.target.value || 1)); refresh(true); } } });
      var bonus = (R[k] - b.stats[k]);
      c.appendChild(h('div', { class: 'stat' }, [
        h('b', null, [STN[k]]),
        h('button', { on: { click: function () { if (b.stats[k] > 1) { b.stats[k]--; refresh(true); } } } }, ['−']), inp,
        h('button', { on: { click: function () { if (b.stats[k] < 120) { b.stats[k]++; refresh(true); } } } }, ['+']),
        h('span', { class: 'mut' }, ['próximo: ' + E.statCost(b.stats[k]) + ' pts · equipamento ' + (bonus >= 0 ? '+' : '') + bonus + ' = ' + R[k]])
      ]));
    });
    t.appendChild(c);
    var tl = R.traitTotal - R.traitUsed;
    var c2 = h('div', { class: 'card' }, [h('h3', null, ['Traços (4ª classe)'])]);
    c2.appendChild(h('div', { class: 'row' }, [h('label', { class: 'inl' }, [h('input', { type: 'checkbox', checked: b.opt.traits, on: { change: function (e) { b.opt.traits = e.target.checked; refresh(true); } } }), 'Ativar traços (Sombrio / Inferno / Abismo)']),
      h('b', { class: tl < 0 ? 'bad' : 'ok' }, ['Restantes: ' + tl]),
      h('label', { class: 'inl' }, ['Pontos extras ', h('input', { class: 'num', type: 'number', value: b.bonusTraitPts, on: { change: function (e) { b.bonusTraitPts = +e.target.value || 0; refresh(true); } } })])]));
    c2.appendChild(h('div', { class: 'tip' }, ['Total padrão estimado: (nível − 100) × 3 + 3. Ajuste com “Pontos extras” se o jogo concede outro valor.']));
    E.TR.forEach(function (k) {
      c2.appendChild(h('div', { class: 'stat' }, [h('b', null, [TRN[k]]),
        h('button', { on: { click: function () { if (b.traits[k] > 0) { b.traits[k]--; refresh(true); } } } }, ['−']),
        h('input', { type: 'number', min: 0, value: b.traits[k], on: { change: function (e) { b.traits[k] = Math.max(0, +e.target.value || 0); refresh(true); } } }),
        h('button', { on: { click: function () { b.traits[k]++; refresh(true); } } }, ['+']),
        h('span', { class: 'mut' }, [TRD[k] + ' · total ' + R[k]])]));
    });
    t.appendChild(c2);
    var c3 = h('div', { class: 'card' }, [h('h3', null, ['Opções'])]);
    c3.appendChild(h('div', { class: 'row' }, [zoneSel(),
      h('label', { class: 'inl' }, ['Limite de ASPD ', h('input', { class: 'num', type: 'number', min: 150, max: 199, value: b.opt.aspdCap, on: { change: function (e) { b.opt.aspdCap = +e.target.value || 193; refresh(true); } } })])]));
    t.appendChild(c3);
  }

  // ---------- aba Equipamentos ----------
  var pickFilter = { q: '', cls: true, kind: 'item', cli: false };
  function cliTag(it) { return !it.cl ? null : h('span', { class: 'clitag' + (it.cf ? ' cf' : ''), title: it.cf ? 'Item próprio do YggIdle, lido do cliente do jogo' : 'Item que está no cliente do jogo mas não aparece na wiki: pode não existir no servidor' }, [it.cf ? 'YggIdle · cliente' : 'só no cliente']); }
  function slotAllowed(sl) { if (sl === 'shield' && b.eq.weapon && (Y.itemById[b.eq.weapon.id] || {}).th) return false; return true; }
  function usable(it) {
    var cl = Y.classById[b.cls];
    if (it.lv && it.lv > b.lv) return false;
    if (!it.j || !it.j.length) return true;
    var js = Array.isArray(it.j) ? it.j : String(it.j).split(/\s*,\s*/);
    return js.some(function (j) { return cl.items.some(function (x) { return x.toLowerCase() === String(j).toLowerCase(); }) || /todas|all/i.test(j); });
  }
  function itemTip(it, e) {
    var rar = e ? Y.bonus.rarities[e.rar || 0] : null, d = [];
    if (it.a) d.push('ATQ ' + it.a); if (it.ma) d.push('ATQM ' + it.ma); if (it.d) d.push('DEF ' + it.d); if (it.md) d.push('MDEF ' + it.md);
    if (it.wl) d.push('Arma nv ' + it.wl); if (it.lv) d.push('Nv ' + it.lv); if (it.wt) d.push('Peso ' + it.wt);
    return h('div', { class: 'itip' }, [h('div', { class: 'ith' }, [itemIcon(it.id, 'ico lg'), h('span', null, [h('b', { style: rar ? 'color:' + rar.color : '' }, [(e && e.ref ? '+' + e.ref + ' ' : '') + it.n + (it.sl ? ' [' + it.sl + ']' : '')]), h('small', null, [(it.w ? (Y.weaponNames[it.w] || it.w) + ' · ' : '') + d.join(' · ')])])]),
      it.cl ? h('div', { class: 'tip' }, [cliTag(it), it.cf ? ' Lido do cliente do jogo.' : ' Está no cliente do jogo, mas não na wiki: confira se existe no YggIdle.']) : null,
      it.f ? h('div', { class: 'tip idesc' }, [String(it.f).slice(0, 420)]) : null,
      it.j ? h('div', { class: 'tip', style: 'opacity:.75' }, ['Classes: ' + (Array.isArray(it.j) ? it.j.join(', ') : it.j)]) : null]);
  }
  // grade em pares (esquerda - direita); no Sombrio e no Visual cada slot fica na posição do equivalente comum
  var EQL = ['headT', 'headB', 'weapon', 'cloak', 'accR'], EQR = ['headM', 'body', 'shield', 'shoes', 'accL'];
  var EQMODES = [['base', 'Comum'], ['shadow', 'Sombrio'], ['visual', 'Visual']];
  var EQMAP = { shadow: { weapon: 'sW', shield: 'sS', body: 'sB', shoes: 'sF', accL: 'sAL', accR: 'sAR' }, visual: { headT: 'vT', headM: 'vM', headB: 'vB', cloak: 'vC' } };
  var eqMode = EQMAP[UI.eqMode] ? UI.eqMode : 'base';
  function eqModeOf(sl) { return E.EXTRA_SLOT[sl] || 'base'; }
  function eqPos(sl, side) {
    if (eqMode === 'base') return eqSlot(sl, side);
    var x = EQMAP[eqMode][sl];
    return x ? eqSlot(x, side) : h('div', { class: 'eqs eqnone ' + side, 'aria-hidden': 'true' });
  }
  function eqSlot(sl, side) {
    var e = b.eq[sl], it = e && Y.itemById[e.id], rar = e ? Y.bonus.rarities[e.rar || 0] : null, ok = slotAllowed(sl);
    var ico = h('span', { class: 'eqi' }, [it ? itemIcon(it.id) : h('span', { class: 'eqph eq-' + sl })]);
    var cards = e && (e.cards || []).filter(Boolean).length;
    var txt = h('span', { class: 'eqt' }, [h('small', null, [E.SLOT_NAMES[sl]]),
      h('b', { style: rar ? 'color:' + rar.color : '' }, [it ? (e.ref ? '+' + e.ref + ' ' : '') + it.n : ok ? '—' : 'bloqueado (2 mãos)']),
      it ? h('em', null, [E.EXTRA_SLOT[sl] ? (it.jl ? jlRarName(it, e.ref || 0) : E.EXTRA_SLOT[sl] === 'shadow' ? 'Sombrio' : 'Visual') : rar.n + ' · T' + e.tier + (cards ? ' · ' + cards + ' carta(s)' : '') + ((e.gem || []).filter(Boolean).length ? ' · gema' : '') + (E.canEnch(it) && (e.ench || [])[0] && Y.itemById[e.ench[0]] ? ' · ' + Y.itemById[e.ench[0]].n : '')]) : null]);
    var warn = sl === 'weapon' && it && it.w && Y.classById[b.cls].wp.indexOf(it.w) < 0;
    var bt = h('button', { class: 'eqs ' + side + (sl === selSlot ? ' sel' : '') + (it ? ' has' : '') + (ok ? '' : ' off') + (warn ? ' warnb' : ''),
      on: { click: function () { selSlot = sl; drawTab(); setTimeout(function () { var ed = $('#slotEd'); if (ed && ed.scrollIntoView) ed.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 20); },
        dblclick: function () { if (ok) pickerModal(itemsFor(sl), 'Escolher ' + E.SLOT_NAMES[sl], function (x) { if (!x) return; b.eq[sl] = E.newEq(x.id); if (sl === 'weapon' && x.th) delete b.eq.shield; refresh(true); }, { icon: true, cli: E.EXTRA_SLOT[sl] ? true : undefined }); } } },
      side === 'l' ? [txt, ico] : [ico, txt]);
    if (it) tipOn(bt, function () { return itemTip(it, e); });
    return bt;
  }
  function tabEquip(t) {
    var cl = Y.classById[b.cls];
    var win = h('div', { class: 'rowin eqwin', style: '--lc:' + Y.lineColor(b.cls) }, [
      h('div', { class: 'rotitle' }, [h('span', null, ['Equipamentos']), h('small', null, ['ALT+Q']),
        h('span', { class: 'seg2 eqmode' }, EQMODES.map(function (m) { return h('button', { class: eqMode === m[0] ? 'on' : '', title: m[0] === 'base' ? 'Equipamentos comuns' : m[0] === 'shadow' ? 'Equipamentos de Sombra' : 'Visuais (trajes)', on: { click: function () {
          if (eqMode === m[0]) return; eqMode = m[0]; UI.eqMode = eqMode; uiSave();
          if (eqModeOf(selSlot) !== eqMode) selSlot = eqMode === 'base' ? 'weapon' : eqMode === 'shadow' ? 'sW' : 'vT';
          drawTab(); } } }, [m[1]]); })),
        h('span', { class: 'grow' }), h('small', null, ['clique para editar · duplo clique para trocar'])])]);
    var grid = h('div', { class: 'eqgrid' });
    var colL = h('div', { class: 'eqcol' }), colR = h('div', { class: 'eqcol' });
    EQL.forEach(function (sl) { colL.appendChild(eqPos(sl, 'l')); });
    EQR.forEach(function (sl) { colR.appendChild(eqPos(sl, 'r')); });
    var mid = h('div', { class: 'eqmid' }, [h('div', { class: 'eqstage' }, [h('span', { class: 'rune' }), h('span', { class: 'motes' }), h('span', { class: 'ped' }), spriteEl(b.cls, 'big')]),
      h('div', { class: 'eqname' }, [h('b', null, [b.name || 'Sem nome']), h('small', null, [cl.n + ' · Nv ' + b.lv])])]);
    grid.appendChild(colL); grid.appendChild(mid); grid.appendChild(colR);
    win.appendChild(grid);
    if (eqMode === 'base') win.appendChild(h('div', { class: 'eqammo' }, [eqSlot('ammo', 'r')]));
    win.appendChild(h('div', { class: 'eqfoot' }, [
      h('span', null, [h('small', null, ['ATQ']), h('b', null, [fmt(R.batk * 2) + ' + ' + fmt(R.wAtkBase + R.refAtk + R.equipAtk)])]),
      h('span', null, [h('small', null, ['ATQM']), h('b', null, [fmt(R.matk)])]),
      h('span', null, [h('small', null, ['DEF']), h('b', null, [fmt(R.def) + ' + ' + fmt(R.def2)])]),
      h('span', null, [h('small', null, ['MDEF']), h('b', null, [fmt(R.mdef) + ' + ' + fmt(R.mdef2)])]),
      h('span', null, [h('small', null, ['ASPD']), h('b', null, [fmt(R.aspdEff)])]),
      h('span', null, [h('small', null, ['Peso']), h('b', { class: R.weight > R.maxWeight ? 'bad' : '' }, [fmt(R.weight) + ' / ' + fmt(R.maxWeight)])])]));
    t.appendChild(win);
    var ed = slotEditor(selSlot); ed.id = 'slotEd'; t.appendChild(ed);
    t.appendChild(extraEditor());
  }
  function itemsFor(sl) {
    var ty = E.SLOT_TYPE[sl];
    return Y.items.filter(function (it) {
      if (sl === 'weapon') return it.c === 'w';
      if (sl === 'ammo') return it.c === 'm';
      return it.c === 'a' && it.s === ty;
    });
  }
  function cardsFor(sl, gem, gslot) {
    return Y.items.filter(function (it) { return E.cardFits(sl, it, gem ? gslot : undefined); });
  }
  function pickerModal(list, title, onPick, opts) {
    opts = opts || {};
    var q = h('input', { placeholder: 'Buscar por nome…', style: 'width:100%' });
    var chk = h('input', { type: 'checkbox', checked: true });
    var hasCli = list.some(function (it) { return it.cl && !it.cf; });
    var cli = h('input', { type: 'checkbox', checked: opts.cli != null ? opts.cli : pickFilter.cli, on: { change: function () { if (opts.cli == null) pickFilter.cli = cli.checked; } } });
    var box = h('div', { class: 'list' });
    function fill() {
      box.innerHTML = '';
      var s = q.value.trim().toLowerCase(), n = 0;
      list.forEach(function (it) {
        if (n >= 80) return;
        if (s && it.n.toLowerCase().indexOf(s) < 0) return;
        if (chk.checked && opts.usable !== false && !usable(it)) return;
        if (it.cl && !it.cf && !cli.checked) return;
        n++;
        var d = [];
        if (it.a) d.push('ATQ ' + it.a); if (it.ma) d.push('ATQM ' + it.ma); if (it.d) d.push('DEF ' + it.d); if (it.md) d.push('MDEF ' + it.md); if (it.sl) d.push('[' + it.sl + ']'); if (it.lv) d.push('Nv ' + it.lv);
        if (it.w) d.push(Y.weaponNames[it.w] || it.w);
        var row = h('div', { class: 'it', on: { click: function () { onPick(it); closeModal(); } } }, [h('span', { class: 'mcell' }, [opts.mon ? h('span', { class: 'mbox' }, [mobImg(it.id)]) : h('span', { class: 'eqi sm' }, [itemIcon(it.id)]), h('span', null, [it.n]), cliTag(it)]), h('span', { class: 'mut' }, [d.join(' · ')])]);
        if (!opts.mon) tipOn(row, function () { return itemTip(it); });
        box.appendChild(row);
      });
      if (!n) box.appendChild(h('div', { class: 'it mut' }, ['Nenhum resultado']));
    }
    q.addEventListener('input', fill); chk.addEventListener('change', fill); cli.addEventListener('change', fill); fill();
    openModal(h('div', null, [h('h3', null, [title]), q,
      opts.usable === false ? null : h('label', { class: 'inl' }, [chk, 'Somente usáveis pela classe e nível atual']),
      hasCli ? h('label', { class: 'inl', title: 'Itens que estão no cliente do jogo (jogo.yggidle.com.br) mas não na wiki. Podem não existir no servidor: cabe a você decidir.' }, [cli, 'Incluir itens que só estão no cliente do jogo (não confirmados na wiki)']) : null,
      box, h('div', { class: 'row' }, [h('button', { on: { click: closeModal } }, ['Cancelar']), opts.clear ? h('button', { on: { click: function () { onPick(null); closeModal(); } } }, ['Remover']) : null])]));
    setTimeout(function () { q.focus(); }, 30);
  }
  var JLR = ['Comum', 'Incomum', 'Rara', 'Épica'];
  function jlRarName(it, ref) { return JLR[E.jlRarity(it, ref)] || 'Comum'; }
  // editor das linhas aleatórias próprias de um item (ex.: Joia do Destino)
  function jlEditor(c, e, it) {
    var jr = E.jlRarity(it, e.ref || 0);
    e.jlines = e.jlines || [];
    c.appendChild(h('div', { class: 'tip' }, ['Raridade pelo refino: ' + JLR[jr] + ' (' + it.jr.map(function (r, i) { return JLR[i + 1] + ' no +' + r; }).join(', ') + '). Cada raridade libera 1 linha, e todas as linhas ficam com o valor da raridade atual.']));
    for (var i = 0; i < it.jr.length; i++) (function (i) {
      var on = i < jr;
      var sel = h('select', { disabled: !on, on: { change: function (ev) { var v = ev.target.value; if (v === '') e.jlines.splice(i, 1); else e.jlines[i] = +v; refresh(true); } } });
      sel.appendChild(h('option', { value: '' }, [on ? '— linha vazia —' : 'liberada no +' + it.jr[i]]));
      var grp = {};
      it.jl.forEach(function (J, ix) {
        var used = e.jlines.indexOf(ix); if (used >= 0 && used !== i) return;
        if (!grp[J.g]) { grp[J.g] = h('optgroup', { label: J.g }); sel.appendChild(grp[J.g]); }
        grp[J.g].appendChild(h('option', { value: ix, selected: e.jlines[i] === ix }, [J.n + ' +' + J.v[Math.max(0, jr - 1)]]));
      });
      c.appendChild(h('div', { class: 'line' }, [h('span', { class: 'mut' }, ['Linha ' + (i + 1)]), sel]));
    })(i);
  }
  function itemLabel(id) { var it = Y.itemById[id]; return it ? it.n : '—'; }
  function slotEditor(sl) {
    var c = h('div', { class: 'card' }, [h('h3', null, ['Editar: ' + E.SLOT_NAMES[sl]])]);
    if (!slotAllowed(sl)) { c.appendChild(h('div', { class: 'mut' }, ['Escudo indisponível com arma de duas mãos.'])); return c; }
    var e = b.eq[sl], it = e && Y.itemById[e.id];
    c.appendChild(h('div', { class: 'row' }, [
      h('button', { class: 'pri', on: { click: function () { pickerModal(itemsFor(sl), 'Escolher ' + E.SLOT_NAMES[sl], function (x) { if (!x) return; b.eq[sl] = E.newEq(x.id); if (sl === 'weapon' && x.th) delete b.eq.shield; refresh(true); }, { icon: true, cli: E.EXTRA_SLOT[sl] ? true : undefined }); } } }, [it ? 'Trocar item' : 'Escolher item']),
      it ? h('button', { on: { click: function () { delete b.eq[sl]; refresh(true); } } }, ['Remover']) : null,
      it ? h('span', { class: 'eqi lg' }, [itemIcon(it.id)]) : null, it ? h('b', null, [it.n]) : null, it ? cliTag(it) : null]));
    if (!it) return c;
    // descrição
    var info = [];
    if (it.a) info.push('ATQ ' + it.a); if (it.ma) info.push('ATQM ' + it.ma); if (it.d) info.push('DEF ' + it.d); if (it.md) info.push('MDEF ' + it.md); if (it.wl) info.push('Arma nv ' + it.wl); if (it.sl) info.push(it.sl + ' slot(s)'); if (it.wt) info.push('Peso ' + it.wt);
    c.appendChild(h('div', { class: 'tip' }, [info.join(' · ')]));
    (it.fx || []).forEach(function (f) {
      var txt = f.t || Object.keys(f.s || {}).map(function (k) { return lblKey(k) + ' ' + (f.s[k] > 0 ? '+' : '') + f.s[k]; }).join(', ');
      c.appendChild(h('div', { class: 'fx' }, [(f.c ? '(condicional) ' : '') + txt]));
    });
    // sombrio / visual: só refino (sombrio) e linhas próprias do item
    if (E.EXTRA_SLOT[sl]) {
      if (E.EXTRA_SLOT[sl] === 'shadow') {
        var mxr = it.jl ? 15 : 20, sr2 = h('select', { on: { change: function (ev) { e.ref = +ev.target.value; refresh(true); } } });
        for (var r3 = 0; r3 <= mxr; r3++) sr2.appendChild(h('option', { value: r3, selected: r3 === e.ref }, ['+' + r3]));
        c.appendChild(h('div', { class: 'row' }, [h('label', { class: 'inl' }, ['Refino ', sr2])]));
      }
      if (it.jl) jlEditor(c, e, it);
      return c;
    }
    // refino / raridade / tier
    var rowOpt = h('div', { class: 'row' });
    if (sl !== 'ammo') {
      var sr = h('select', { on: { change: function (ev) { e.ref = +ev.target.value; refresh(true); } } });
      for (var r = 0; r <= 20; r++) sr.appendChild(h('option', { value: r, selected: r === e.ref }, ['+' + r]));
      rowOpt.appendChild(h('label', { class: 'inl' }, ['Refino ', sr]));
    }
    var rs = h('select', { on: { change: function (ev) { e.rar = +ev.target.value; trimLines(e); refresh(true); } } });
    Y.bonus.rarities.forEach(function (r2) { rs.appendChild(h('option', { value: r2.id, selected: r2.id === e.rar }, [r2.n])); });
    rowOpt.appendChild(h('label', { class: 'inl' }, ['Raridade ', rs]));
    var ts = h('select', { on: { change: function (ev) { e.tier = +ev.target.value; clampLines(e); refresh(true); } } });
    if (e.tier > 4) e.tier = 4; // T5 ainda não existe no YggIdle
    [1, 2, 3, 4].forEach(function (n) { ts.appendChild(h('option', { value: n, selected: n === e.tier }, ['Tier ' + n + ' (×' + String(Y.bonus.tierMult[n]).replace('.', ',') + ')'])); });
    ts.appendChild(h('option', { value: 5, disabled: true }, ['Tier 5 · ainda não existe no YggIdle']));
    rowOpt.appendChild(h('label', { class: 'inl' }, ['Mapa ', ts]));
    c.appendChild(rowOpt);
    // linhas
    var rar = Y.bonus.rarities[e.rar];
    if (rar.max > 0 && sl !== 'ammo') {
      c.appendChild(h('div', { class: 'tip' }, ['Bônus aleatórios: ' + rar.min + '–' + rar.max + ' linhas · até ' + rar.dim + ' dimensional(is) · valores variam conforme o tier do mapa.']));
      e.lines = e.lines || [];
      while (e.lines.length < rar.max) e.lines.push({ t: '', p: '', v: 0, d: 0 });
      e.lines.forEach(function (L, i) { c.appendChild(lineEditor(e, L, i, sl)); });
    }
    // cartas
    var nsl = it.sl || 0;
    if (nsl > 0 && sl !== 'ammo') {
      c.appendChild(h('div', { class: 'row' }, [h('b', null, ['Cartas'])]));
      e.cards = e.cards || [];
      for (var i = 0; i < nsl; i++) (function (i) {
        c.appendChild(h('div', { class: 'row' }, [h('span', { class: 'mut' }, ['Slot ' + (i + 1)]),
          h('button', { on: { click: function () { pickerModal(cardsFor(sl, false), 'Carta (slot ' + (i + 1) + ')', function (x) { e.cards[i] = x ? x.id : 0; refresh(true); }, { clear: true, usable: false }); } } }, [e.cards[i] ? h('span', { class: 'mcell' }, [itemIcon(e.cards[i]), itemLabel(e.cards[i])]) : 'Escolher carta'])]));
      })(i);
    }
    if (E.GEM_SLOTS[sl]) {
      c.appendChild(h('div', { class: 'row' }, [h('b', null, ['Gemas']), h('span', { class: 'tip' }, ['1 carta normal + 1 de miniboss/MVP. Gemas não contam para combos de cartas.'])]));
      e.gem = e.gem || [0, 0];
      [0, 1].forEach(function (gi) {
        c.appendChild(h('div', { class: 'row' }, [h('span', { class: 'mut' }, [gi ? 'Gema (miniboss/MVP)' : 'Gema (normal)']),
          h('button', { on: { click: function () { pickerModal(cardsFor(sl, true, gi), 'Gema ' + (gi ? 'de miniboss/MVP' : 'normal'), function (x) { e.gem[gi] = x ? x.id : 0; refresh(true); }, { clear: true, usable: false }); } } }, [e.gem[gi] ? h('span', { class: 'mcell' }, [itemIcon(e.gem[gi]), itemLabel(e.gem[gi])]) : 'Escolher gema'])]));
      });
    }
    if (E.canEnch(it)) {
      var EN = Y.items.filter(function (x) { return x.s === 'ench'; });
      e.ench = e.ench || [];
      c.appendChild(h('div', { class: 'row' }, [h('b', null, ['Encantamento']), h('span', { class: 'tip' }, ['Bênção que vai na própria Batina. A Bênção do mesmo atributo da Batina ativa o bônus de conjunto.'])]));
      var es = h('select', { on: { change: function (ev) { var v = +ev.target.value; e.ench = v ? [v] : []; refresh(true); } } });
      es.appendChild(h('option', { value: 0 }, ['— sem Bênção —']));
      EN.forEach(function (x) { es.appendChild(h('option', { value: x.id, selected: e.ench[0] === x.id }, [x.n])); });
      c.appendChild(h('div', { class: 'row' }, [h('span', { class: 'mut' }, ['Bênção']), es]));
      var bx = e.ench[0] && Y.itemById[e.ench[0]];
      if (bx) (bx.fx || []).forEach(function (f) {
        var ks = Object.keys(f.s || {}), ae = ks.filter(function (k) { return /^dmgAtkEle:/.test(k); });
        var txt = f.t || (ae.length >= 10 ? ['Dano ' + (/Magic$/.test(ae[0]) ? 'mágico' : 'físico') + ' de todas as propriedades +' + f.s[ae[0]] + '%'] : ks.map(function (k) { return lblKey(k) + ' ' + (f.s[k] > 0 ? '+' : '') + f.s[k]; })).join(', ');
        c.appendChild(h('div', { class: 'fx' }, [(f.c && f.c.set ? '(conjunto com ' + f.c.set.map(function (x) { return x[0]; }).join(' + ') + ') ' : f.c ? '(condicional) ' : '') + txt]));
      });
    }
    return c;
  }
  function trimLines(e) {
    var rar = Y.bonus.rarities[e.rar]; e.lines = (e.lines || []).slice(0, rar.max);
    var d = 0; e.lines.forEach(function (L) { if (L.d) { d++; if (d > rar.dim) L.d = 0; } });
    if (rar.max === 0) e.lines = [];
  }
  function clampLines(e) { (e.lines || []).forEach(function (L) { if (!L.t) return; var r = E.lineRange(L.t, e.rar, e.tier); if (r) L.v = Math.max(r[0], Math.min(r[1], L.v || r[1])); }); }
  function typesForSlot(sl) { return Y.bonus.types.filter(function (t) { return !t.slots || t.slots.indexOf(sl) >= 0; }); }
  function paramOpts(t) {
    if (t.param === 'nb') return [['Normal', 'Normal'], ['Chefe', 'Chefe']];
    if (t.param === 'race') return Y.bonus.races.map(function (x) { return [x, x]; });
    if (t.param === 'ele') return Y.bonus.eles.map(function (x) { return [x, x]; });
    if (t.param === 'attr') return E.ST.map(function (x) { return [x, STN[x]]; });
    return null;
  }
  function lineEditor(e, L, i, sl) {
    var t = L.t ? E.BT[L.t] : null;
    var ts = h('select', { on: { change: function (ev) { L.t = ev.target.value; L.p = ''; var tt = E.BT[L.t]; if (tt) { var po = paramOpts(tt); if (po) L.p = po[0][0]; var r = E.lineRange(L.t, e.rar, e.tier); L.v = r ? r[1] : 0; } else L.v = 0; refresh(true); } } });
    ts.appendChild(h('option', { value: '' }, ['— linha vazia —']));
    ['p', 'm', 'n'].forEach(function (f) {
      var og = h('optgroup', { label: Y.bonus.families[f] });
      typesForSlot(sl).filter(function (x) { return x.f === f && E.lineRange(x.id, e.rar, e.tier); }).forEach(function (x) { og.appendChild(h('option', { value: x.id, selected: x.id === L.t }, [x.n])); });
      ts.appendChild(og);
    });
    var row = h('div', { class: 'line' }, [ts]);
    var po = t ? paramOpts(t) : null;
    if (po) { var ps = h('select', { on: { change: function (ev) { L.p = ev.target.value; refresh(false); } } }); po.forEach(function (o) { ps.appendChild(h('option', { value: o[0], selected: o[0] === L.p }, [o[1]])); }); row.appendChild(ps); } else row.appendChild(h('span'));
    if (t) {
      var r = E.lineRange(L.t, e.rar, e.tier);
      var vi = h('input', { type: 'number', min: r[0], max: r[1], value: L.v, on: { change: function (ev) { L.v = Math.max(r[0], Math.min(r[1], +ev.target.value || r[0])); ev.target.value = L.v; refresh(false); } } });
      row.appendChild(vi);
      row.appendChild(h('button', { title: 'Valor máximo', on: { click: function () { L.v = r[1]; vi.value = r[1]; refresh(false); } } }, ['máx ' + r[1] + (t.pct ? '%' : '')]));
      var dimCount = (e.lines || []).filter(function (x) { return x.d; }).length, rar = Y.bonus.rarities[e.rar];
      row.appendChild(h('label', { class: 'inl', title: 'Linha dimensional (reroll dimensional)' }, [h('input', { type: 'checkbox', checked: !!L.d, disabled: !L.d && dimCount >= rar.dim, on: { change: function (ev) { L.d = ev.target.checked ? 1 : 0; refresh(true); } } }), 'dim.']));
    }
    return row;
  }
  function extraEditor() {
    var c = h('div', { class: 'card' }, [h('h3', null, ['Bônus personalizados'])]);
    c.appendChild(h('div', { class: 'tip' }, ['Para efeitos que o planner não reconheceu (ex.: ATQ +50, atkPct 10, dmgBoss:Phys 15, patk 5). Use as chaves internas.']));
    var keys = ['atk', 'matk', 'atkPct', 'matkPct', 'def', 'mdef', 'hp', 'sp', 'hit', 'flee', 'crit', 'critPct', 'critDmg', 'aspd', 'aspdPct', 'dmgPhys', 'dmgMagic', 'dmgBoth', 'dmgBoss:Phys', 'dmgBoss:Magic', 'dmgNormal:Phys', 'dmgNormal:Magic', 'patk', 'smatk', 'res', 'mres', 'crate', 'ignDef:all', 'ignMdef:all', 'castVar', 'str', 'agi', 'vit', 'int', 'dex', 'luk'];
    (b.extra || []).forEach(function (x, i) {
      var dl = h('input', { list: 'kdl', value: x.k, placeholder: 'chave', on: { change: function (ev) { x.k = ev.target.value; refresh(false); } } });
      c.appendChild(h('div', { class: 'row' }, [dl, h('input', { type: 'number', class: 'num', value: x.v, on: { change: function (ev) { x.v = +ev.target.value || 0; refresh(false); } } }),
        h('button', { on: { click: function () { b.extra.splice(i, 1); refresh(true); } } }, ['×'])]));
    });
    var dl2 = h('datalist', { id: 'kdl' }); keys.forEach(function (k) { dl2.appendChild(h('option', { value: k })); });
    c.appendChild(dl2);
    c.appendChild(h('button', { on: { click: function () { b.extra.push({ k: '', v: 0 }); refresh(true); } } }, ['+ Adicionar bônus']));
    return c;
  }

  // ---------- aba Habilidades (árvore no estilo ALT+S) ----------
  var skTab = 0, TYN = { p: 'Passiva', s: 'Ativa (em si)', u: 'Suporte', a: 'Ataque', g: 'Em área (chão)' };
  function tLv(ae) { return b.tree[ae] || 0; }
  function tabsOf() { return Y.trees[b.cls] || []; }
  function tabUsed(tb) { var u = 0; tb.sk.forEach(function (s) { if (!s[5]) u += tLv(s[0]); }); return u; }
  function inClass(ae) { return tabsOf().some(function (tb) { return tb.sk.some(function (s) { return s[0] === ae; }); }); }
  function reqOk(s) { return s[2].every(function (r) { return !inClass(r[0]) || tLv(r[0]) >= r[1]; }); }
  function gateOk(ti) { var T = tabsOf(); for (var i = 0; i < ti; i++) if (tabUsed(T[i]) < T[i].pts) return false; return true; }
  function syncSim(ae) { var id = AKS[ae]; if (!id || !Y.skills[id]) return; var lv = tLv(ae), s = Y.skills[id]; if (s.k === 'b') b.buffs[id] = Math.min(s.max, lv); else if (lv) b.skills[id] = Math.min(s.max, lv); }
  function cascade() {
    var ch = true;
    while (ch) { ch = false; tabsOf().forEach(function (tb) { tb.sk.forEach(function (s) { if (tLv(s[0]) && !reqOk(s)) { delete b.tree[s[0]]; syncSim(s[0]); ch = true; } }); }); }
  }
  function canUp(s, ti) { var tb = tabsOf()[ti]; return tLv(s[0]) < s[1] && reqOk(s) && gateOk(ti) && (s[5] || tabUsed(tb) < tb.pts); }
  // sobe a habilidade; se faltar pré-requisito, preenche a cadeia inteira antes (como no jogo ao clicar numa avançada)
  function skUp(s, ti, n) {
    var auto = null;
    if (!reqOk(s) && gateOk(ti) && tLv(s[0]) < s[1]) {
      var before = Object.assign({}, b.tree);
      s[2].forEach(function (r) { if (inClass(r[0]) && tLv(r[0]) < r[1]) learn(r[0], r[1]); });
      var changed = Object.keys(b.tree).filter(function (k) { return (b.tree[k] || 0) !== (before[k] || 0); });
      if (!reqOk(s)) { b.tree = before; changed.forEach(syncSim); toast('Pontos insuficientes para os pré-requisitos de ' + skLabel(s[0])); return -1; }
      auto = changed;
    }
    var k = 0; while (k < (n || 1) && canUp(s, ti)) { b.tree[s[0]] = tLv(s[0]) + 1; k++; }
    if (k || auto) { syncSim(s[0]); refresh(true); }
    if (auto && auto.length) toast('Pré-requisitos preenchidos: ' + auto.map(function (a) { return skLabel(a) + ' ' + tLv(a); }).join(', '));
    return k || (auto ? 1 : 0);
  }
  function skDown(s, n) { var lv = Math.max(0, tLv(s[0]) - (n || 1)); if (lv) b.tree[s[0]] = lv; else delete b.tree[s[0]]; cascade(); syncSim(s[0]); refresh(true); }
  // aprende uma habilidade levando junto os pré-requisitos (usado pelo guia)
  function learn(ae, lv, seen) {
    seen = seen || {}; if (seen[ae]) return; seen[ae] = 1;
    var T = tabsOf();
    for (var ti = 0; ti < T.length; ti++) {
      var s = T[ti].sk.filter(function (x) { return x[0] === ae; })[0]; if (!s) continue;
      s[2].forEach(function (r) { if (inClass(r[0]) && tLv(r[0]) < r[1]) learn(r[0], r[1], seen); });
      var tb = T[ti];
      while (tLv(ae) < Math.min(lv, s[1]) && (s[5] || tabUsed(tb) < tb.pts)) b.tree[ae] = tLv(ae) + 1;
      syncSim(ae); return;
    }
  }
  function applyOrderToTree(ord) {
    b.tree = {};
    (ord || []).forEach(function (o) { learn(o[0], o[1]); });
    refresh(true); toast('Árvore montada a partir da ordem do guia'); goTab('skills');
  }
  function skTipNode(s, ti) {
    var lv = tLv(s[0]);
    var reqs = s[2].filter(function (r) { return inClass(r[0]); });
    var deps = []; tabsOf().forEach(function (tb) { tb.sk.forEach(function (o) { o[2].forEach(function (r) { if (r[0] === s[0]) deps.push(skLabel(o[0]) + ' (pede ' + r[1] + ')'); }); }); });
    return skTipFull(s[0], lv, s[1], [
      reqs.length ? h('div', { class: 'treq' }, ['Requer: '].concat(reqs.map(function (r) { var ok = tLv(r[0]) >= r[1]; return h('span', { class: ok ? 'ok' : 'bad' }, [(ok ? '✓ ' : '✗ ') + skLabel(r[0]) + ' ' + r[1]]); }))) : null,
      deps.length ? h('div', { class: 'tip' }, ['Libera: ' + deps.join(', ')]) : null,
      !gateOk(ti) ? h('div', { class: 'bad tip' }, ['Gaste todos os pontos da aba anterior primeiro (troca de classe).']) : null,
      s[5] ? h('div', { class: 'tip ok' }, ['Não gasta pontos (habilidade de quest ou concedida).']) : null,
      h('div', { class: 'tip', style: 'opacity:.7' }, [(reqs.some(function (r) { return tLv(r[0]) < r[1]; }) ? 'Clique: preenche os pré-requisitos e aprende · ' : 'Clique: +1 · ') + 'Botão direito: −1 · Shift+clique: máximo'])]);
  }
  // linhas de pré-requisito desenhadas sobre a grade
  function drawLinks(wrap, grid, tb, cells) {
    var NS = 'http://www.w3.org/2000/svg', old = wrap.querySelector('svg.sklinks'); if (old) old.remove();
    if (!grid.offsetWidth) return;
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'sklinks');
    svg.setAttribute('width', grid.offsetWidth); svg.setAttribute('height', grid.offsetHeight);
    svg.style.left = grid.offsetLeft + 'px'; svg.style.top = grid.offsetTop + 'px';
    tb.sk.forEach(function (s) {
      s[2].forEach(function (r) {
        var a = cells[r[0]], z = cells[s[0]]; if (!a || !z) return;
        var ab = a.querySelector('.skib'), zb = z.querySelector('.skib');
        var x1 = a.offsetLeft + ab.offsetLeft + ab.offsetWidth / 2, y1 = a.offsetTop + ab.offsetTop + ab.offsetHeight;
        var x2 = z.offsetLeft + zb.offsetLeft + zb.offsetWidth / 2, y2 = z.offsetTop + zb.offsetTop;
        var d;
        if (Math.abs(y2 - y1) < 8) { y1 = a.offsetTop + ab.offsetTop + ab.offsetHeight / 2; y2 = y1; x1 += (x2 > x1 ? 1 : -1) * ab.offsetWidth / 2; x2 -= (x2 > x1 ? 1 : -1) * zb.offsetWidth / 2; d = 'M' + x1 + ' ' + y1 + 'H' + x2; }
        else if (y2 < y1) { y1 = a.offsetTop + ab.offsetTop; y2 = z.offsetTop + z.offsetHeight; var my = y2 + 5; d = 'M' + x1 + ' ' + y1 + 'V' + my + 'H' + x2 + 'V' + y2; }
        else { y1 = a.offsetTop + a.offsetHeight; var my2 = z.offsetTop - 5; d = 'M' + x1 + ' ' + y1 + 'V' + my2 + 'H' + x2 + 'V' + y2; }
        var ok = tLv(r[0]) >= r[1];
        var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('class', 'lk' + (ok ? ' ok' : tLv(r[0]) ? ' part' : ''));
        p.setAttribute('data-a', r[0]); p.setAttribute('data-z', s[0]); svg.appendChild(p);
        var tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', x2 + 4); tx.setAttribute('y', y2 - 3); tx.setAttribute('class', 'lkn' + (ok ? ' ok' : '')); tx.textContent = r[1]; svg.appendChild(tx);
      });
    });
    wrap.insertBefore(svg, wrap.firstChild);
  }
  function tabExtra(win) {
    var G = grantedSkills();
    var box = h('div', { class: 'skextra' });
    if (!G.length) box.appendChild(h('div', { class: 'mut', style: 'padding:14px' }, ['Nenhuma habilidade extra. Elas aparecem aqui quando um equipamento, carta, consumível (pergaminho) ou a Ascensão da Árvore do Caos concede uma habilidade. Você também pode adicionar à mão abaixo.']));
    var KN = { item: 'Equipamento/carta', caos: 'Árvore do Caos', cons: 'Consumível', manual: 'Manual' };
    G.forEach(function (g) {
      var id = AKS[g.ae], ss = id && Y.skills[id];
      var row = h('div', { class: 'skx' + (g.on ? '' : ' off') }, [skillIcon(g.ae, 'sico lg'),
        h('span', { class: 'grow' }, [h('b', null, [skLabel(g.ae) + ' · Nv ' + g.lv]), h('small', null, [KN[g.kind] + ': ' + g.src + (g.on ? '' : ' · condição não atendida')])]),
        ss ? h('span', { class: 'chip ok' }, [ss.k === 'b' ? 'buff no cálculo' : 'no simulador']) : h('span', { class: 'chip' }, ['só referência']),
        g.kind === 'manual' ? h('button', { class: 'sm ghost', on: { click: function () { delete b.xsk[g.ae]; refresh(true); } } }, ['×']) : null]);
      tipOn(row, function () { return skTipFull(g.ae, g.lv, null, [g.txt ? h('div', { class: 'tip' }, ['Fonte: “' + g.txt + '”']) : null]); });
      box.appendChild(row);
    });
    var dl = h('datalist', { id: 'skall' }); Object.keys(Y.sk2 || {}).forEach(function (a) { dl.appendChild(h('option', { value: Y.sk2[a].n })); });
    var inp = h('input', { list: 'skall', placeholder: 'Nome da habilidade…', style: 'flex:1;min-width:200px' }), lvI = h('input', { type: 'number', class: 'num', min: 1, max: 10, value: 1, style: 'width:60px' });
    box.appendChild(h('div', { class: 'row', style: 'padding:10px 4px 0' }, [h('b', null, ['Adicionar à mão: ']), inp, 'Nv', lvI, dl,
      h('button', { class: 'sm', on: { click: function () { var ae = SKN[nrm(inp.value)]; if (!ae) { toast('Habilidade não encontrada'); return; } b.xsk[ae] = Math.max(1, +lvI.value || 1); refresh(true); } } }, ['Adicionar'])]));
    win.appendChild(box);
  }
  function tabSkills(t) {
    var T = tabsOf(); if (skTab > T.length) skTab = 0;
    var win = h('div', { class: 'rowin skwin', style: '--lc:' + Y.lineColor(b.cls) });
    var totUsed = 0, totPts = 0; T.forEach(function (tb) { totUsed += tabUsed(tb); totPts += tb.pts; });
    win.appendChild(h('div', { class: 'rotitle' }, [h('span', null, ['Habilidades']), h('small', null, ['ALT+S']), h('span', { class: 'grow' }), h('small', null, ['Total ' + totUsed + ' / ' + totPts + ' pontos'])]));
    var tabsEl = h('div', { class: 'sktabs' });
    T.forEach(function (tb, i) {
      var u = tabUsed(tb);
      tabsEl.appendChild(h('button', { class: (i === skTab ? 'on' : '') + (u >= tb.pts ? ' full' : ''), on: { click: function () { skTab = i; drawTab(); } } }, [h('span', null, [tb.n]), h('small', null, [u + '/' + tb.pts])]));
    });
    var nx = grantedSkills().length;
    tabsEl.appendChild(h('button', { class: 'xtab' + (skTab === T.length ? ' on' : ''), on: { click: function () { skTab = T.length; drawTab(); } } }, [h('span', null, ['Extra']), h('small', null, [nx ? nx + ' concedida(s)' : 'itens'])]));
    win.appendChild(tabsEl);
    if (skTab === T.length) { tabExtra(win); t.appendChild(win); tabSkillsSim(t); return; }
    if (!T.length) { win.appendChild(h('div', { class: 'mut', style: 'padding:16px' }, ['Árvore indisponível para esta classe.'])); t.appendChild(win); return; }
    var tb = T[skTab], used = tabUsed(tb), left = tb.pts - used, gate = gateOk(skTab);
    var rows = 1; tb.sk.forEach(function (s) { rows = Math.max(rows, s[4] + 1); });
    var grid = h('div', { class: 'skgrid', style: 'grid-template-rows:repeat(' + rows + ',auto)' });
    var cells = {};
    tb.sk.forEach(function (s) {
      var lv = tLv(s[0]), ok = reqOk(s) && gate, d = Y.sk2[s[0]] || { n: s[0] };
      var cls = 'skc' + (lv ? ' got' : '') + (lv >= s[1] ? ' max' : '') + (!ok && !lv ? ' lock' : '') + (s[5] ? ' free' : '');
      var ib = h('button', { class: 'skib', on: { click: function (e) { if (skUp(s, skTab, e.shiftKey ? 99 : 1) === 0) toast(!gate ? 'Gaste os pontos da aba anterior primeiro' : !reqOk(s) ? 'Pré-requisitos não atendidos' : lv >= s[1] ? 'Nível máximo' : 'Sem pontos nesta aba'); },
        contextmenu: function (e) { e.preventDefault(); if (lv) skDown(s, e.shiftKey ? 99 : 1); } } }, [skillIcon(s[0])]);
      var cell = h('div', { class: cls, 'data-ae': s[0], style: 'grid-column:' + (s[3] + 1) + ';grid-row:' + (s[4] + 1) }, [ib,
        h('div', { class: 'skn' }, [d.n]),
        h('div', { class: 'skl' }, [h('button', { class: 'mi', disabled: !lv, on: { click: function () { skDown(s, 1); } } }, ['−']), h('span', null, [lv + '/' + s[1]]),
          h('button', { class: 'pl', disabled: !(canUp(s, skTab) || (gate && !reqOk(s) && lv < s[1])), on: { click: function (e) { skUp(s, skTab, e.shiftKey ? 99 : 1); } } }, ['+'])]),
        s[6] ? h('span', { class: 'ybadge', title: 'Customização do YggIdle' }, ['Y']) : null,
        (d.nt || []).length && !s[6] ? h('span', { class: 'nbadge', title: 'Alterada no YggIdle' }, ['✎']) : null]);
      cell.addEventListener('mouseenter', function (e) {
        showTip(e, skTipNode(s, skTab));
        s[2].forEach(function (r) { if (cells[r[0]]) cells[r[0]].classList.add('isreq'); });
        tb.sk.forEach(function (o) { if (o[2].some(function (r) { return r[0] === s[0]; }) && cells[o[0]]) cells[o[0]].classList.add('isdep'); });
        gw.querySelectorAll('path.lk').forEach(function (p) { if (p.getAttribute('data-z') === s[0] || p.getAttribute('data-a') === s[0]) p.classList.add('hi'); });
      });
      cell.addEventListener('mousemove', moveTip);
      cell.addEventListener('mouseleave', function () { hideTip(); Object.keys(cells).forEach(function (k) { cells[k].classList.remove('isreq', 'isdep'); }); gw.querySelectorAll('path.lk.hi').forEach(function (p) { p.classList.remove('hi'); }); });
      cells[s[0]] = cell; grid.appendChild(cell);
    });
    var gw = h('div', { class: 'skgw' }, [grid]);
    win.appendChild(gw);
    requestAnimationFrame(function () { drawLinks(gw, grid, tb, cells); });
    if (!window._skRz) { window._skRz = 1; window.addEventListener('resize', function () { if (tab === 'skills') drawTab(); }); }
    win.appendChild(h('div', { class: 'skfoot' }, [
      h('span', { class: 'skpts' + (left ? '' : ' zero') }, ['Pontos de habilidade: ', h('b', null, [String(left)])]),
      !gate ? h('span', { class: 'chip bad' }, ['Complete a aba anterior (' + T.slice(0, skTab).map(function (x) { return x.n; }).join(', ') + ')']) : null,
      h('span', { class: 'grow' }),
      h('span', { class: 'legend' }, [h('i', { class: 'lg y' }, ['Y']), 'habilidade do YggIdle ', h('i', { class: 'lg n' }, ['✎']), 'alterada ', h('i', { class: 'lg f' }), 'não gasta pontos']),
      h('button', { class: 'sm ghost', on: { click: function () { tb.sk.forEach(function (s) { delete b.tree[s[0]]; }); cascade(); refresh(true); } } }, ['Zerar aba']),
      h('button', { class: 'sm ghost', on: { click: function () { if (confirm('Zerar todas as habilidades?')) { b.tree = {}; refresh(true); } } } }, ['Zerar tudo'])]));
    t.appendChild(win);
    t.appendChild(h('div', { class: 'tip', style: 'margin:-6px 0 14px' }, ['Árvore com os pré-requisitos e as mudanças publicadas na wiki do YggIdle (1ª classe 49 pontos, 2ª classe 69). As linhas mostram o que cada habilidade pede; o número é o nível exigido.']));
    tabSkillsSim(t);
  }
  function tabSkillsSim(t) {
    var sk = simSkills();
    var bf = sk.filter(function (s) { return s.k === 'b'; }), at = sk.filter(function (s) { return s.k !== 'b'; });
    var c = h('details', { class: 'card', open: true }, [h('summary', null, ['Buffs e passivas ativas no cálculo'])]);
    c.appendChild(h('div', { class: 'tip' }, ['Nível 0 = desligado. Aprender na árvore já liga aqui. Passe o mouse para ver o efeito de cada nível.']));
    if (!bf.length) c.appendChild(h('div', { class: 'mut' }, ['Nenhum buff cadastrado para esta classe.']));
    bf.forEach(function (s) {
      var fxs = (function () { var lv = b.buffs[s.id] || 0; if (!lv) return ''; var f = s.fx(lv); return Object.keys(f).map(function (k) { return lblKey(k) + ' ' + (f[k] > 0 ? '+' : '') + fmt(f[k], 1); }).join(' · '); })();
      var row = h('div', { class: 'row skrow' }, [SKA[s.id] ? skillIcon(SKA[s.id]) : h('span', { class: 'sico' }), h('span', { style: 'min-width:240px' }, [s.n]),
        h('input', { type: 'number', class: 'num', min: 0, max: s.max, value: b.buffs[s.id] || 0, on: { change: function (e) { b.buffs[s.id] = Math.max(0, Math.min(s.max, +e.target.value || 0)); refresh(true); } } }), h('span', { class: 'mut' }, ['/ ' + s.max]),
        fxs ? h('span', { class: 'chip ok' }, [fxs]) : null]);
      if (SKA[s.id]) tipOn(row, function () {
        var tb = h('table', { class: 'tlv' }, [h('tr', null, [h('th', null, ['Nv']), h('th', null, ['Efeito no planner'])])]);
        for (var i = 1; i <= s.max; i++) { var f = s.fx(i); tb.appendChild(h('tr', { class: i === (b.buffs[s.id] || 0) ? 'cur' : '' }, [h('td', null, [String(i)]), h('td', null, [Object.keys(f).map(function (k) { return lblKey(k) + ' ' + (f[k] > 0 ? '+' : '') + fmt(f[k], 1); }).join(' · ')])])); }
        return skTipFull(SKA[s.id], b.buffs[s.id] || 0, s.max, [tb]);
      });
      c.appendChild(row);
    });
    t.appendChild(c);
    var c2 = h('details', { class: 'card', open: true }, [h('summary', null, ['Habilidades de ataque no simulador'])]);
    c2.appendChild(h('div', { class: 'tip' }, ['Multiplicadores e tempos são estimativas. O nível usado na simulação segue a árvore, mas pode ser ajustado aqui.']));
    var tb = h('table', { class: 'tbl' }, [h('tr', null, [h('th', null, ['Habilidade']), h('th', null, ['Nível']), h('th', null, ['Tipo']), h('th', null, ['Ratio']), h('th', null, ['Golpes']), h('th', null, ['SP']), h('th', null, ['Ciclo (s)'])])]);
    at.forEach(function (s) {
      var lv = b.skills[s.id] != null ? b.skills[s.id] : s.max;
      var tm = D.timing(R, s, lv);
      var nm = h('span', { class: 'mcell' }, [SKA[s.id] ? skillIcon(SKA[s.id]) : null, s.n]);
      if (SKA[s.id]) skTip(nm, SKA[s.id], lv, s.max);
      tb.appendChild(h('tr', null, [h('td', null, [nm]),
        h('td', null, [h('input', { type: 'number', class: 'num', min: 1, max: s.max, value: lv, style: 'width:56px', on: { change: function (e) { b.skills[s.id] = Math.max(1, Math.min(s.max, +e.target.value || 1)); refresh(true); } } })]),
        h('td', null, [s.k === 'm' ? 'Mágica' : 'Física']), h('td', null, [fmt(D.ratio(s, lv)) + '%']), h('td', null, [D.hitsOf(s, lv)]), h('td', null, [D.costOf(s, lv)]), h('td', null, [fmt(tm.cycle, 2)])]));
    });
    c2.appendChild(tb); t.appendChild(c2);
  }

  // ---------- aba Simulação ----------
  function monLabel(m) { return m.n + ' (Nv ' + m.lv + ', ' + (m.cls === 2 ? 'MVP' : m.cls === 1 ? 'Miniboss' : 'Comum') + ')'; }
  function autoRot() {
    var sk = simSkills().filter(function (s) { return s.k !== 'b' && (!s.w || s.w.indexOf(R.wtype) >= 0); });
    var mon = Y.monById[b.sim.mon] || Y.monsters[0]; var n = b.sim.n;
    var sc = sk.map(function (s) {
      var lv = b.skills[s.id] != null ? b.skills[s.id] : s.max;
      var st = D.skillDamage(R, b, s, lv, mon, b.sim), tm = D.timing(R, s, lv);
      var cyc = tm.cycle + tm.cd;
      return { s: s, lv: lv, dps: st.perCast * Math.min(s.a || 1, n) / Math.max(0.2, cyc), spps: D.costOf(s, lv) / Math.max(0.2, cyc) };
    }).sort(function (a, c) { return c.dps - a.dps; });
    var rot = [], spBudget = (R.sp / 60) + (b.sim.spRegen || 0);
    sc.forEach(function (x) { if (rot.length < 4) rot.push({ id: x.s.id, lv: x.lv }); });
    b.sim.rot = rot;
  }
  function simStage(t, mon) {
    var S = b.sim, maps = (mon && mon.sp || []).filter(function (m) { return Y.maps[m]; });
    if (mon && (!S.map || maps.indexOf(S.map) < 0)) S.map = maps[0] || null;
    var z = D.zoneOf(b), zm = D.zoneMult(R, b, {}, false);
    var mapUrl = S.map ? 'url(' + ART + 'mapas/' + S.map + '.png)' : 'none';
    var basic = mon ? D.skillDamage(R, b, D.BASIC, 1, mon, S) : null;
    var zk = b.opt.zone2 || 'normal';
    var stage = h('div', { class: 'simstage z-' + zk, style: '--map:' + mapUrl + ';--lc:' + Y.lineColor(b.cls) }, [
      h('div', { class: 'sky' }), h('div', { class: 'hills' }), h('div', { class: 'ground' }), h('div', { class: 'fog' }), h('span', { class: 'motes' }),
      h('div', { class: 'sstop' }, [
        S.map ? mapImg(S.map, 'ssmini') : null,
        h('div', { class: 'ssmap' }, [h('b', null, [S.map ? (Y.maps[S.map] || [S.map])[0] : 'Sem mapa']), h('small', null, [S.map || 'nenhum mapa']), S.map ? costTag(S.map, true) : null]),
        h('span', { class: 'grow' }),
        h('span', { class: 'sszone' }, [z.n])]),
      h('div', { class: 'ssfig me' }, [h('span', { class: 'ped' }), spriteEl(b.cls, 'big'), h('div', { class: 'ssbar' }, [h('b', null, [Y.classById[b.cls].n + ' · Nv ' + b.lv]), h('i', { class: 'hp' }), h('i', { class: 'sp' }), h('small', null, ['HP ' + fmt(R.hp) + ' · SP ' + fmt(R.sp)])])]),
      h('div', { class: 'ssvs' }, [h('span', null, ['VS'])]),
      mon ? h('div', { class: 'ssfig foe' + (mon.cls === 2 ? ' mvp' : mon.cls === 1 ? ' mini' : '') }, [h('span', { class: 'ped' }),
        basic ? h('div', { class: 'ssdmg' }, [h('b', null, [fmt(basic.avg)]), h('small', null, ['golpe básico · ' + fmt(basic.min) + '–' + fmt(basic.max) + (basic.critCh ? ' · crít. ' + fmt(basic.critAvg) : '')])]) : null,
        mobImg(mon.id, 'mimg big'), h('div', { class: 'ssbar' }, [h('b', null, [(mon.cls === 2 ? '★ ' : '') + mon.n + ' · Nv ' + mon.lv]), h('i', { class: 'hp m' }), h('small', null, ['HP ' + fmt(mon.hp) + ' · ' + mon.race + ' · ' + mon.size + ' · ' + mon.ele + ' ' + mon.el])])]) :
        h('div', { class: 'ssfig foe' }, [h('div', { class: 'ssempty' }, ['Escolha um monstro abaixo'])])]);
    var mapRow = maps.length > 1 ? h('div', { class: 'row' }, ['Mapa: '].concat(maps.map(function (m) { return h('button', { class: 'sm' + (S.map === m ? ' on' : ''), on: { click: function () { S.map = m; refresh(true); } } }, [(Y.maps[m] || [m])[0] + ' (' + m + ')']); }))) : null;
    var card = h('div', { class: 'card simtop' }, [h('div', { class: 'ch' }, [h('h3', null, ['Cenário']), h('span', { class: 'grow' }), zoneSel()]), stage, mapRow]);
    t.appendChild(card);
    // painel ALT+A
    var st = function (k, lab) { var bon = R[k] - (b.stats[k] || 1); return h('div', { class: 'aa' }, [h('span', null, [lab]), h('b', null, [String(b.stats[k] || 1)]), h('em', null, [bon ? '+' + bon : ''])]); };
    var sv = function (lab, v) { return h('div', { class: 'aa v' }, [h('span', null, [lab]), h('b', null, [v])]); };
    var crm = D.critMult(R, b);
    var win = h('div', { class: 'rowin altA', style: '--lc:' + Y.lineColor(b.cls) }, [h('div', { class: 'rotitle' }, [h('span', null, ['Status']), h('small', null, ['ALT+A']), h('span', { class: 'grow' }), h('small', null, [fmt(R.ptsTotal - R.ptsUsed) + ' pontos livres'])]),
      h('div', { class: 'aagrid' }, [
        h('div', { class: 'aacol' }, [st('str', 'FOR'), st('agi', 'AGI'), st('vit', 'VIT'), st('int', 'INT'), st('dex', 'DES'), st('luk', 'SOR')]),
        h('div', { class: 'aacol' }, [sv('ATQ', fmt(R.batk * 2) + ' + ' + fmt(R.wAtkBase + R.refAtk + R.equipAtk)), sv('ATQM', fmt(R.statusMatk) + ' + ' + fmt(R.matk - R.statusMatk)), sv('Precisão', fmt(R.hit)), sv('Crítico', fmt(R.critChance, 1)), sv('Dano crítico', fmt(crm, 2) + '×'), sv('Pós-conj.', fmt(-(R.afterCast || 0)) + '%')]),
        h('div', { class: 'aacol' }, [sv('DEF', fmt(R.def) + ' + ' + fmt(R.def2)), sv('DEFM', fmt(R.mdef) + ' + ' + fmt(R.mdef2)), sv('Esquiva', fmt(R.flee) + ' + ' + fmt(R.flee2 / 10, 0)), sv('ASPD', fmt(R.aspdEff) + ' (' + fmt(R.aps, 2) + '/s)'), sv('Conj. var.', fmt(R.castScale * Math.max(0, 1 + (R.B.castVar || 0) / 100) * 100) + '%'), sv('Peso', fmt(R.weight) + '/' + fmt(R.maxWeight))])]),
      b.opt.traits ? h('div', { class: 'aagrid t' }, [
        h('div', { class: 'aacol' }, [st('pow', 'POD'), st('sta', 'STA'), st('wis', 'SAB')]), h('div', { class: 'aacol' }, [st('spl', 'FEI'), st('con', 'CON'), st('crt', 'CRV')]),
        h('div', { class: 'aacol' }, [sv('P.ATQ', fmt(R.patk)), sv('S.ATQM', fmt(R.smatk)), sv('RES', fmt(R.res)), sv('MRES', fmt(R.mres)), sv('H.PLUS', fmt(R.hplus)), sv('C.RATE', fmt(R.crate))])]) :
        h('div', { class: 'tip', style: 'padding:6px 10px' }, ['Traços de 4ª classe desligados neste local (valem no Sombrio, Inferno e Abismo).']),
      h('div', { class: 'aafoot' }, [h('span', null, ['HP ', h('b', null, [fmt(R.hp)])]), h('span', null, ['SP ', h('b', null, [fmt(R.sp)])]), h('span', null, ['Dano passa ', h('b', null, [fmt(zm.mult * 100, 1) + '%'])]), h('span', null, ['Penetração ', h('b', null, [fmt(zm.pen, 1) + '%'])]), h('span', null, ['Defesa Crítica do alvo ', h('b', null, [fmt(D.critDef(R, b), 1)])])])]);
    // dano esperado
    var dm = h('div', { class: 'card' }, [h('h3', null, ['Dano esperado' + (mon ? ' contra ' + mon.n : '')])]);
    if (mon) {
      var rows = [{ n: 'Ataque básico', s: D.BASIC, lv: 1 }].concat(simSkills().filter(function (s) { return s.k !== 'b' && (!s.w || s.w.indexOf(R.wtype) >= 0); }).map(function (s) { return { n: s.n, s: s, lv: b.skills[s.id] != null ? b.skills[s.id] : s.max }; }));
      var tb = h('table', { class: 'tbl' }, [h('tr', null, ['Ataque', 'Nv', 'Por golpe', 'Crítico', 'Por uso', 'Ciclo', 'DPS', 'Usos p/ matar'].map(function (x) { return h('th', null, [x]); }))]);
      rows.forEach(function (r) {
        var x = D.skillDamage(R, b, r.s, r.lv, mon, S), tm = r.s === D.BASIC ? { cycle: R.adelay / 1000, cd: 0 } : D.timing(R, r.s, r.lv), cyc = Math.max(0.2, tm.cycle + (tm.cd || 0));
        var nm = h('span', { class: 'mcell' }, [SKA[r.s.id] ? skillIcon(SKA[r.s.id]) : null, r.n]); if (SKA[r.s.id]) skTip(nm, SKA[r.s.id], r.lv, r.s.max);
        tb.appendChild(h('tr', null, [h('td', null, [nm]), h('td', null, [String(r.lv)]), h('td', null, [fmt(x.min) + '–' + fmt(x.max)]), h('td', null, [x.critCh ? fmt(x.critAvg) + ' (' + fmt(x.critCh * 100) + '%)' : '—']),
          h('td', null, [h('b', null, [fmt(x.perCast)])]), h('td', null, [fmt(cyc, 2) + ' s']), h('td', null, [fmt(x.perCast / cyc)]), h('td', null, [x.perCast > 0 ? fmt(Math.ceil(mon.hp / x.perCast)) : '∞'])]));
      });
      dm.appendChild(tb);
      dm.appendChild(h('div', { class: 'tip' }, ['Já considera acerto, crítico, elemento, tamanho, DEF/DEFM, aura do local (' + z.n + ') e Penetração de Redução. DPS de um alvo, sem SP nem recargas compartilhadas: a simulação abaixo cuida disso.']));
    } else dm.appendChild(h('div', { class: 'mut' }, ['Escolha um monstro para ver o dano.']));
    t.appendChild(h('div', { class: 'simgrid' }, [win, dm]));
  }
  function tabSim(t) {
    var S = b.sim, mon = Y.monById[S.mon];
    simStage(t, mon);
    var c = h('div', { class: 'card' }, [h('h3', null, ['Alvo e cenário'])]);
    c.appendChild(h('div', { class: 'row' }, [
      h('button', { class: 'pri', on: { click: function () { pickerModal(Y.monsters, 'Escolher monstro', function (m) { if (m) { S.mon = m.id; refresh(true); } }, { usable: false, mon: true }); } } }, [mon ? monLabel(mon) : 'Escolher monstro']),
      h('select', { on: { change: function (e) { var m = Y.monsters.filter(function (x) { return x.cls === +e.target.value; }); if (m.length) { pickerModal(m, 'Monstros', function (x) { if (x) { S.mon = x.id; refresh(true); } }, { usable: false, mon: true }); } e.target.value = ''; } } },
        [h('option', { value: '' }, ['Atalho por tipo…']), h('option', { value: 0 }, ['Comuns']), h('option', { value: 1 }, ['Minibosses']), h('option', { value: 2 }, ['MVPs'])])]));
    c.appendChild(h('div', { class: 'row' }, ['Quantidade: '].concat([1, 3, 5, 10].map(function (n) { return h('button', { class: S.n === n ? 'on' : '', on: { click: function () { S.n = n; refresh(true); } } }, ['1v' + n]); })).concat([
      h('label', { class: 'inl' }, [h('input', { type: 'checkbox', checked: S.farm, on: { change: function (e) { S.farm = e.target.checked; save(); } } }), 'Farm contínuo (monstros renascem)'])])));
    c.appendChild(h('div', { class: 'row' }, [
      h('label', { class: 'inl' }, ['Duração máx. (s) ', h('input', { class: 'num', type: 'number', value: S.maxT, on: { change: function (e) { S.maxT = Math.max(5, +e.target.value || 120); save(); } } })]),
      h('label', { class: 'inl' }, ['Intervalo de ataque do monstro (s) ', h('input', { class: 'num', type: 'number', step: 0.1, value: S.mobDelay, on: { change: function (e) { S.mobDelay = Math.max(0.2, +e.target.value || 1.5); save(); } } })]),
      h('label', { class: 'inl' }, ['Elemento do ataque ', (function () { var s = h('select', { on: { change: function (e) { S.mobEle = e.target.value; save(); } } }); ['auto'].concat(Y.bonus.eles).forEach(function (x) { s.appendChild(h('option', { value: x, selected: x === S.mobEle }, [x === 'auto' ? 'do monstro' : x])); }); return s; })()]),
      h('label', { class: 'inl' }, ['Regen HP/s ', h('input', { class: 'num', type: 'number', value: S.healPs, on: { change: function (e) { S.healPs = +e.target.value || 0; save(); } } })]),
      h('label', { class: 'inl' }, ['Regen SP/s ', h('input', { class: 'num', type: 'number', step: 0.5, value: S.spRegen, on: { change: function (e) { S.spRegen = +e.target.value || 0; save(); } } })])]));
    if (mon) {
      var tb = Object.keys(mon.tbl || {}).map(function (k) { return k + ' ' + mon.tbl[k] + '%'; }).join(' · ');
      c.appendChild(h('div', { class: 'tip' }, ['HP ' + fmt(mon.hp) + ' · DEF ' + mon.def + ' · MDEF ' + mon.mdef + ' · ATQ ' + mon.atk + ' · ' + mon.race + ' · ' + mon.size + ' · ' + mon.ele + ' ' + mon.el + ' · Elementos: ' + tb]));
    }
    t.appendChild(c);
    // rotação
    var c2 = h('div', { class: 'card' }, [h('h3', null, ['Rotação de habilidades (prioridade de cima para baixo)'])]);
    c2.appendChild(h('div', { class: 'tip' }, ['Sem habilidade disponível (recarga ou SP), o personagem usa o ataque básico.']));
    var sk = simSkills().filter(function (s) { return s.k !== 'b'; });
    S.rot.forEach(function (r, i) {
      var s = Y.skills[r.id]; if (!s) return;
      var nm = h('span', { class: 'mcell', style: 'min-width:260px' }, [(i + 1) + '. ', SKA[s.id] ? skillIcon(SKA[s.id]) : null, s.n]);
      if (SKA[s.id]) skTip(nm, SKA[s.id], r.lv, s.max);
      c2.appendChild(h('div', { class: 'row' }, [nm,
        h('input', { class: 'num', type: 'number', min: 1, max: s.max, value: r.lv, style: 'width:56px', on: { change: function (e) { r.lv = Math.max(1, Math.min(s.max, +e.target.value || 1)); save(); } } }),
        h('button', { on: { click: function () { if (i > 0) { var x = S.rot[i - 1]; S.rot[i - 1] = r; S.rot[i] = x; refresh(true); } } } }, ['↑']),
        h('button', { on: { click: function () { S.rot.splice(i, 1); refresh(true); } } }, ['×'])]));
    });
    var add = h('select', { on: { change: function (e) { if (e.target.value) { var s = Y.skills[e.target.value]; S.rot.push({ id: s.id, lv: b.skills[s.id] != null ? b.skills[s.id] : s.max }); refresh(true); } } } }, [h('option', { value: '' }, ['+ adicionar habilidade'])]);
    sk.forEach(function (s) { add.appendChild(h('option', { value: s.id }, [s.n])); });
    c2.appendChild(h('div', { class: 'row' }, [add, h('button', { on: { click: function () { autoRot(); refresh(true); } } }, ['Rotação automática'])]));
    t.appendChild(c2);
    // execução
    var c3 = h('div', { class: 'card' }, [h('h3', null, ['Resultado'])]);
    var run = h('button', { class: 'pri', disabled: !mon, on: { click: function () { runSim(c3); } } }, ['Simular']);
    c3.appendChild(h('div', { class: 'row' }, [run, h('label', { class: 'inl' }, ['Repetições (Monte Carlo) ', h('input', { class: 'num', type: 'number', value: S.runs, on: { change: function (e) { S.runs = Math.max(1, Math.min(1000, +e.target.value || 100)); save(); } } })])]));
    t.appendChild(c3);
    if (simRes) renderSim(c3, simRes);
  }
  function runSim(host) {
    var S = b.sim, mon = Y.monById[S.mon]; if (!mon) return;
    var cfg = { mon: mon, n: S.n, rot: S.rot, farm: S.farm, maxT: S.maxT, mobDelay: S.mobDelay, mobEle: S.mobEle, healPs: S.healPs, spRegen: S.spRegen, seed: 12345, critDef: R.B.critDef || 0 };
    var one = D.simulate(R, b, cfg, true);
    var mc = D.monteCarlo(R, b, cfg, S.runs);
    simRes = { one: one, mc: mc, cfg: cfg };
    drawTab();
  }
  function renderSim(c, s) {
    var o = s.one, mc = s.mc, cfg = s.cfg;
    var mon = cfg.mon;
    c.appendChild(h('div', { class: 'kpis' }, [
      kpi('DPS médio', fmt(o.dps)), kpi('Resultado', o.win ? 'Vitória' : o.dead ? 'Derrota' : 'Tempo esgotado', o.win ? 'ok' : o.dead ? 'bad' : 'warn'),
      kpi('Tempo p/ matar (mediana)', mc.p50 == null ? 'nunca venceu' : fmt(mc.p50, 1) + ' s'), kpi('Faixa p10–p90', mc.p50 == null ? '—' : fmt(mc.p10, 1) + '–' + fmt(mc.p90, 1) + ' s'), kpi('Vitórias', mc.wins + '/' + mc.runs),
      kpi('Dano recebido/s', fmt(o.dtps)), kpi('HP mín.', fmt(o.minHp / R.hp * 100) + '%'), kpi('Abates', fmt(o.kills)), kpi('Acerto do monstro', fmt(o.mh.rate * 100) + '% · ' + fmt(o.mh.dmg) + ' dano')
    ]));
    // gráfico
    var cv = h('canvas', { width: 900, height: 280 }); c.appendChild(cv);
    drawChart(cv, o.series, cfg.maxT);
    c.appendChild(h('div', { class: 'tip' }, ['Verde: HP do jogador · Vermelho: HP total dos monstros · Dourado: SP.']));
    // tabela por habilidade
    var tb = h('table', { class: 'tbl' }, [h('tr', null, ['Habilidade', 'Mín', 'Médio', 'Máx', 'Crítico', 'Golpes', 'Acerto', 'Por uso'].map(function (x) { return h('th', null, [x]); }))]);
    var rows = [{ n: 'Ataque básico', st: o.basic }].concat(cfg.rot.map(function (r) { var sk = Y.skills[r.id]; return sk ? { n: sk.n + ' Nv' + r.lv, st: o.stat[sk.id] } : null; }).filter(Boolean));
    rows.forEach(function (r) { var st = r.st; tb.appendChild(h('tr', null, [r.n, fmt(st.min), fmt(st.avg), fmt(st.max), st.critCh ? fmt(st.critAvg) + ' (' + fmt(st.critCh * 100) + '%)' : '-', st.hits, fmt(st.hitCh * 100) + '%', fmt(st.perCast)].map(function (x, i) { return h('td', null, [String(x)]); }))); });
    c.appendChild(tb);
    var tb2 = h('table', { class: 'tbl', style: 'margin-top:10px' }, [h('tr', null, ['Contribuição (simulação única)', 'Usos', 'Dano total', '%'].map(function (x) { return h('th', null, [x]); }))]);
    Object.keys(o.perSkill).forEach(function (k) { var p = o.perSkill[k]; tb2.appendChild(h('tr', null, [p.n, fmt(p.casts), fmt(p.dmg), fmt(p.dmg / Math.max(1, o.dmgDealt) * 100) + '%'].map(function (x) { return h('td', null, [String(x)]); }))); });
    c.appendChild(tb2);
    c.appendChild(h('div', { class: 'tip', style: 'margin-top:8px' }, ['Hipóteses: ATQ do monstro = valor da wiki (golpe único), elemento do ataque configurável, variação de arma ±5% por nível, sem buffs/debuffs do monstro. Resultados são estimativas, não garantias.']));
  }
  function kpi(l, v, cls) { return h('div', { class: 'kpi' }, [h('small', null, [l]), h('span', { class: 'big ' + (cls || '') }, [String(v)])]); }
  function drawChart(cv, series, maxT) {
    var g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 30;
    g.clearRect(0, 0, W, H); g.fillStyle = '#0a160f'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(184,138,68,.2)'; g.fillStyle = '#b9b095'; g.font = '12px sans-serif';
    for (var i = 0; i <= 4; i++) { var y = pad + (H - 2 * pad) * i / 4; g.beginPath(); g.moveTo(pad, y); g.lineTo(W - pad, y); g.stroke(); g.fillText((100 - i * 25) + '%', 2, y + 4); }
    var tmax = series.length ? Math.max(series[series.length - 1][0], 1) : 1;
    for (var j = 0; j <= 5; j++) { var x = pad + (W - 2 * pad) * j / 5; g.fillText((tmax * j / 5).toFixed(1) + 's', x - 10, H - 8); }
    [[1, '#5cba76'], [2, '#e58b7a'], [3, '#e8c477']].forEach(function (cc) {
      g.strokeStyle = cc[1]; g.lineWidth = 2; g.beginPath();
      series.forEach(function (p, k) { var x = pad + (W - 2 * pad) * p[0] / tmax, y = pad + (H - 2 * pad) * (1 - Math.max(0, Math.min(1, p[cc[0]]))); if (k) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
    });
  }

  // =====================================================================
  //  v2 · dados auxiliares, habilidades concedidas, Árvore do Caos, consumíveis e fórmulas
  // =====================================================================
  var CHLOG = Y.changelog || [], VERSION = (CHLOG[0] || {}).v || '0.1.0';
  function openChangelog() {
    openModal(h('div', { class: 'chlog' }, [h('h3', null, ['Changelog · YggPlanner'])].concat(CHLOG.map(function (r, i) {
      var dt = (r.d || '').split('-').reverse().join('/');
      return h('section', { class: 'chv' + (i ? '' : ' cur') }, [
        h('div', { class: 'chh' }, [h('b', null, ['v' + r.v]), r.t ? h('span', null, [r.t]) : null, h('small', null, [dt]), i ? null : h('em', null, ['atual'])]),
        h('div', null, (r.g || []).map(function (g) { return h('div', { class: 'chg' }, [h('h4', null, [g[0]]), h('ul', null, g[1].map(function (x) { return h('li', null, [x]); }))]); }))
      ]);
    })).concat([h('p', { class: 'tip' }, ['Grande mudança avança o número do meio · hotfix estrutural soma 1 no último · correção leve recebe -hf1, -hf2…'])])));
  }
  ['ver', 'fver'].forEach(function (id) { var el = document.getElementById(id); if (el) { el.textContent = 'v' + VERSION; el.title = 'Ver changelog'; el.style.cursor = 'pointer'; el.onclick = openChangelog; } });
  var chl = document.getElementById('chlogLink'); if (chl) chl.onclick = function (e) { e.preventDefault(); openChangelog(); };
  function nrm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
  var SKD = Y.skd || {}, SKN = {}, SKI = {};
  // habilidades que só existem na descrição (4ª classe, Ascensão): entram no catálogo com nome e ícone
  Y.sk2 = Y.sk2 || {};
  Object.keys(SKD).forEach(function (a) { if (!Y.sk2[a] && SKD[a].n && SKD[a].i) Y.sk2[a] = { i: SKD[a].i, n: SKD[a].n, t: '', sp: (SKD[a].sp || '').split(/\s*\/\s*/).filter(function (x) { return /^\d+$/.test(x); }), nt: [] }; });
  // dados do cliente do jogo (jogo.yggidle.com.br): SP por nível e descrição oficial do YggIdle têm prioridade
  var GSK = Y.gsk || {};
  Object.keys(GSK).forEach(function (a) {
    var g = GSK[a]; if (!g.sp) return;
    if (Y.sk2[a]) Y.sk2[a].sp = g.sp.slice();
    var id = AKS[a]; if (id && Y.skills[id]) Y.skills[id].spl = g.sp.slice();
  });
  Object.keys(Y.sk2 || {}).forEach(function (a) {
    var s = Y.sk2[a], k = nrm(s.n); if (!SKN[k]) SKN[k] = a;
    if (s.en && !SKN[nrm(s.en)]) SKN[nrm(s.en)] = a; if (s.i) SKI[s.i] = a;
  });
  function skNum(id) { var a = SKI[id]; return a ? skLabel(a) : 'habilidade #' + id; }
  var CONS = {}; (Y.consum || []).forEach(function (c) { CONS[c.id] = c; });

  function zoneSel() {
    var s = h('select', { title: 'Onde você joga: muda aura, Defesa Crítica, corte da Árvore do Caos e traços', on: { change: function (e) {
      b.opt.zone2 = e.target.value; var z = D.ZONES[b.opt.zone2];
      b.opt.traits = b.opt.zone2 === 'sombrio' || b.opt.zone2 === 'inferno'; b.opt.zone = b.opt.traits;
      refresh(true); } } });
    Object.keys(D.ZONES).forEach(function (k) { s.appendChild(h('option', { value: k, selected: k === b.opt.zone2 }, [D.ZONES[k].n])); });
    return h('label', { class: 'inl zsel' }, ['Local ', s]);
  }

  // ----- habilidades concedidas por itens, Ascensão, consumíveis ou à mão -----
  var GRX = [/\[([^\]]+)\]\s*(?:nv\.?|n[íi]vel)\s*(\d+)/i, /habilidade\s*["“]([^"”]+)["”]\s*(?:em\s*)?n[íi]vel\s*(\d+)/i, /["“]([^"”]+?)\s+n[íi]vel\s*(\d+)["”]/i];
  function parseGrant(t) {
    if (!/(habilita|concede|permite|utiliza)/i.test(t || '')) return null;
    for (var i = 0; i < GRX.length; i++) { var m = t.match(GRX[i]); if (m) { var ae = SKN[nrm(m[1])]; if (ae) return { ae: ae, lv: +m[2] }; } }
    return null;
  }
  function grantedSkills() {
    var out = [], names = (R && R.G && R.G.names) || {};
    E.SLOTS.forEach(function (sl) {
      var e = b.eq[sl]; if (!e) return; var it = Y.itemById[e.id]; if (!it) return;
      var list = [it].concat((e.cards || []).concat(e.gem || []).map(function (c) { return c && Y.itemById[c]; }).filter(Boolean));
      list.forEach(function (x) {
        (x.fx || []).forEach(function (f) {
          if (!f.t) return; var g = parseGrant(f.t); if (!g) return;
          var on = !f.c || !!E.condMult(f.c, { b: b, ref: e.ref || 0, names: names });
          out.push({ ae: g.ae, lv: g.lv, src: x.n, srcId: x.id, kind: 'item', on: on, txt: f.t });
        });
      });
    });
    ascTiersFor(b).forEach(function (t) {
      (t.m || []).forEach(function (m) { if ((m.mecanica === 1 || m.mecanica === 5) && SKI[m.skill]) out.push({ ae: SKI[m.skill], lv: m.nivel || 1, src: 'Ascensão ' + ROMAN[t.slot] + ' (Árvore do Caos)', kind: 'caos', on: true, txt: mecText(m) }); });
    });
    (b.cons || []).forEach(function (c) {
      var it = CONS[c.id]; if (!it || !c.on) return;
      it.d.forEach(function (t) { var g = parseGrant(t); if (g) out.push({ ae: g.ae, lv: g.lv, src: it.n, srcId: it.id, kind: 'cons', on: true, txt: t }); });
    });
    Object.keys(b.xsk || {}).forEach(function (ae) { if (b.xsk[ae]) out.push({ ae: ae, lv: b.xsk[ae], src: 'Adicionada à mão', kind: 'manual', on: true }); });
    return out;
  }
  function simSkills() {
    var base = Y.skillsFor(b.cls).slice(), ids = {}; base.forEach(function (s) { ids[s.id] = 1; });
    grantedSkills().forEach(function (g) { var id = AKS[g.ae]; if (g.on && id && Y.skills[id] && !ids[id]) { ids[id] = 1; base.push(Y.skills[id]); if (b.skills[id] == null && Y.skills[id].k !== 'b') b.skills[id] = Math.min(Y.skills[id].max, g.lv); } });
    return base;
  }
  // buffs concedidos (por item, Ascensão ou à mão) entram no cálculo se a árvore não tiver o buff ligado
  E.hooks.push(function (bb, B, notes, add) {
    if (bb !== b) return;
    var seen = {};
    grantedSkills().forEach(function (g) {
      var id = AKS[g.ae], s = id && Y.skills[id]; if (!g.on || !s || s.k !== 'b' || bb.buffs[id] || seen[id]) return; seen[id] = 1;
      var fx = s.fx(Math.min(s.max, g.lv)); Object.keys(fx).forEach(function (k) { add(B, k, fx[k]); });
    });
  });

  // ----- tooltip completo de habilidade -----
  function cleanUnit(v) { return String(v).replace(/ sec\b/g, ' s').replace(/ cells?\b/g, ' células'); }
  // Valores do YggIdle que substituem a tabela original (bRO/Divine Pride), conforme yggidle.com.br/classes
  var SKO = {
    AB_JUDEX: { d: [[/3x3/g, '5x5']], c: ['ATQM', 'SP'], l: [['1.320%', '23'], ['1.740%', '29'], ['2.160%', '34'], ['2.580%', '38'], ['3.000%', '42']], rg: '11 células' },
    AB_ADORAMUS: { col: { SP: ['8', '11', '14', '17', '20', '23', '26', '29', '32', '35'] }, sp: '8 ~ 35' },
    LG_CANNONSPEAR: { c: ['ATQ', 'Área', 'SP'], l: [['140% + FOR', '3x3', '7'], ['280% + FOR', '3x3', '8'], ['420% + FOR', '5x5', '10'], ['560% + FOR', '5x5', '11'], ['700% + FOR', '5x5', '12']], sp: '7 ~ 12', cd: '-', rg: '6 células', dl: '0,6 s' },
    LK_SPIRALPIERCE: { col: { SP: ['9', '11', '12', '14', '15'] }, sp: '9 ~ 15', dl: '0,6 s' },
    MG_SOULSTRIKE: { dl: '0,8 s' }
  };
  function skData(ae) {
    var dd = SKD[ae] || {}, o = SKO[ae];
    if (!o) return dd;
    var r = Object.assign({}, dd, { yo: 1 });
    if (o.d && r.d) o.d.forEach(function (p) { r.d = r.d.replace(p[0], p[1]); });
    if (o.c) { r.c = o.c; r.l = o.l; }
    if (o.col) {
      r.c = (r.c || []).slice(); r.l = (r.l || []).map(function (x) { return x.slice(); });
      Object.keys(o.col).forEach(function (k) {
        var i = r.c.indexOf(k); if (i < 0) { i = r.c.length; r.c.push(k); }
        o.col[k].forEach(function (v, j) { if (!r.l[j]) r.l[j] = r.c.map(function () { return '—'; }); r.l[j][i] = v; });
      });
    }
    ['sp', 'ct', 'cd', 'rg', 'dl', 'fn'].forEach(function (k) { if (o[k] != null) r[k] = o[k]; });
    return r;
  }
  function skTipFull(ae, lv, max, extra) {
    var d = (Y.sk2 && Y.sk2[ae]) || { n: skLabel(ae), sp: [], nt: [] }, dd = skData(ae), sid = AKS[ae], ss = sid && Y.skills[sid];
    var L = Math.max(1, lv || 1); max = max || (ss && ss.max) || (dd.l && dd.l.length) || (d.sp && d.sp.length) || 1;
    var kids = [h('div', { class: 'ith' }, [skillIcon(ae, 'sico lg'), h('span', null, [h('b', null, [d.n]),
      h('small', null, [(d.en && d.en !== d.n ? d.en + ' · ' : '') + (dd.t || TYN[d.t] || '') + ' · Nv ' + (lv || 0) + '/' + max])])])];
    var ficha = [];
    var spv = SKO[ae] && SKO[ae].sp ? null : d.sp && d.sp.length ? d.sp[Math.min(d.sp.length, L) - 1] : null;
    if (spv != null && +spv) ficha.push(['SP (Nv ' + L + ')', String(spv)]); else if (dd.sp && dd.sp !== '0') ficha.push(['SP', dd.sp]);
    if (dd.ct) ficha.push(['Conjuração', cleanUnit(dd.ct)]);
    if (dd.cd) ficha.push(['Recarga', cleanUnit(dd.cd)]);
    if (dd.dl) ficha.push(['Pós-conjuração', cleanUnit(dd.dl)]);
    if (dd.rg) ficha.push(['Alcance', cleanUnit(dd.rg)]);
    if (ss && ss.k !== 'b') {
      var lvS = Math.min(ss.max, L);
      ficha.push(['Fórmula (Nv ' + lvS + ')', fmt(D.ratio(ss, lvS)) + '% do ' + (ss.k === 'm' ? 'ATQM' : 'ATQ') + ' · ' + D.hitsOf(ss, lvS) + ' golpe(s)' + (ss.e ? ' · ' + ss.e : '') + (ss.a > 1 ? ' · área' : '')]);
      if (R) { var tm = D.timing(R, ss, lvS); ficha.push(['Tempo de uso', fmt(tm.cast, 2) + ' s conj. · ciclo ' + fmt(tm.cycle, 2) + ' s' + (tm.cd ? ' · recarga ' + fmt(tm.cd, 1) + ' s' : '')]); }
    }
    if (ficha.length) kids.push(h('div', { class: 'tfic' }, ficha.map(function (f) { return h('span', null, [h('small', null, [f[0]]), h('b', null, [f[1]])]); })));
    var nts = d.nt || [];
    if (nts.length) kids.push(h('div', { class: 'tnote' }, [h('b', null, ['Como funciona no YggIdle'])].concat(nts.map(function (x) { return h('div', null, [x]); }))));
    var orig = nts.length && !dd.yo, gd = GSK[ae] && GSK[ae].d;
    if (gd) { kids.push(h('div', { class: 'tdesc' }, [h('small', { class: 'tsrc yo' }, ['Descrição oficial do YggIdle (cliente do jogo)'])].concat(gd.split('\n').map(function (x) { return h('div', null, [x]); })))); orig = !dd.yo; }
    else if (dd.d) kids.push(h('div', { class: 'tdesc' }, (orig ? [h('small', { class: 'tsrc' }, ['Descrição original (bRO)'])] : []).concat(dd.d.split('\n').map(function (x) { return h('div', null, [x]); }))));
    if (dd.c && dd.l && dd.l.length) {
      var rows = dd.l.slice(0, Math.max(max, 1));
      if (orig) kids.push(h('small', { class: 'tsrc' }, ['Tabela original (bRO) — as mudanças do YggIdle acima têm prioridade']));
      else if (dd.yo) kids.push(h('small', { class: 'tsrc yo' }, ['Valores do YggIdle']));
      var tb = h('table', { class: 'tlv' }, [h('tr', null, [h('th', null, ['Nv'])].concat(dd.c.map(function (c) { return h('th', null, [c]); })))]);
      rows.forEach(function (row, i) { tb.appendChild(h('tr', { class: i + 1 === lv ? 'cur' : i + 1 === (lv || 0) + 1 ? 'nxt' : '' }, [h('td', null, [String(i + 1)])].concat(row.map(function (v) { return h('td', null, [v]); })))); });
      kids.push(tb);
      if (dd.fn) kids.push(h('small', { class: 'tsrc' }, [dd.fn]));
    } else if (d.sp && d.sp.length > 1) {
      kids.push(h('div', { class: 'tip' }, ['SP por nível: ' + d.sp.join(' / ')]));
    }
    if (ss && ss.k !== 'b' && R) {
      var mon = Y.monById[b.sim.mon];
      if (mon) { var st = D.skillDamage(R, b, ss, Math.min(ss.max, L), mon, b.sim); kids.push(h('div', { class: 'tdmg' }, ['Contra ' + mon.n + ': ', h('b', null, [fmt(st.perCast)]), ' por uso (' + fmt(st.min) + '–' + fmt(st.max) + ' por golpe' + (st.critCh ? ', crítico ' + fmt(st.critAvg) : '') + ')'])); }
    }
    (extra || []).forEach(function (x) { if (x) kids.push(x); });
    return h('div', { class: 'stip wide' }, kids);
  }
  function skTip(el, ae, lvf, max) { return tipOn(el, function () { return skTipFull(ae, typeof lvf === 'function' ? lvf() : lvf, max); }); }

  // ----- Árvore do Caos -----
  var CA = Y.caos || { nodes: [], edges: [], ef: {}, asc: [], mec: {} }, CN = {}, CADJ = {};
  CA.nodes.forEach(function (n) { CN[n.i] = n; CADJ[n.i] = []; });
  CA.edges.forEach(function (e) { if (CADJ[e[0]] && CADJ[e[1]]) { CADJ[e[0]].push(e[1]); CADJ[e[1]].push(e[0]); } });
  var ROMAN = ['', 'I', 'II', 'III', 'IV', 'V'];
  var VCOL = { arcano: '#6aa7d8', lamina: '#e58b7a', bastiao: '#d1a45a', fronteira: '#a68be0', fortuna: '#5cba76', centro: '#e8c477' };
  var VNAME = { arcano: 'Arcano', lamina: 'Lâmina', bastiao: 'Bastião', fronteira: 'Fronteira', fortuna: 'Fortuna', centro: 'Centro' };
  var CTN = { entrada: 'Entrada', pequeno: 'Nó pequeno', notavel: 'Nó notável', fim: 'Nó final', juncao: 'Junção', joia: 'Encaixe de joia', furia: 'Fúria do Legado', escolha: 'Escolha de Fúria', ascensao: 'Ascensão', encaixe: 'Marca da Ascensão' };
  var CRAD = { entrada: 12, pequeno: 7, notavel: 13, fim: 15, juncao: 10, joia: 11, furia: 14, escolha: 9, ascensao: 11, encaixe: 18 };
  var CMAP = { 1: ['dmgPhys'], 2: ['dmgMagic'], 3: ['matkPct'], 4: ['dmgMagic'], 5: ['aspdPct'], 6: ['aspd'], 7: ['castVar', -1], 8: ['afterCast', -1], 9: ['crit'], 10: ['critDmg'],
    11: ['dmgMelee'], 12: ['dmgRanged'], 13: ['dmgNormal:Both'], 14: ['dmgBoss:Both'], 16: ['ignDef:Normal', 1, 'ignMdef:Normal'], 17: ['ignDef:Boss', 1, 'ignMdef:Boss'], 18: ['hpPct'],
    19: ['resMonster'], 20: ['resNormal'], 21: ['resBoss'], 22: ['def'], 23: ['resPhys'], 24: ['res', 1, null, 'caos'], 25: ['mdef'], 26: ['resMagic'], 27: ['mres', 1, null, 'caos'],
    28: ['resEle:Neutro'], 39: ['spCost', -1], 41: ['spPct'], 52: ['ignResCaos'], 53: ['resCaos'], 55: ['dmgCaos'], 56: ['penTree'], 57: ['flee'], 58: ['pflee'], 59: ['resEle:all'],
    60: ['dmgSize:all:Magic'], 61: ['castFixSec', -0.001], 62: ['dmgBoth'], 68: ['int'],
    // só exibição (o motor não usa, mas o painel de estatísticas mostra)
    15: ['dmgExec'], 31: ['regenHp'], 32: ['potHeal'], 33: ['dropPct'], 34: ['drop:Normal'], 35: ['drop:Boss'], 36: ['zenyBag'], 37: ['zenyKill'], 38: ['moveSpd'], 40: ['regenSp'],
    43: ['resSt:Atordoamento'], 44: ['resSt:Congelamento e Petrificação'], 45: ['resSt:Veneno e Sangramento'], 46: ['resSt:Maldição'], 48: ['expPct'], 49: ['expBoss'], 50: ['expCaos'], 51: ['expCaosParty'], 54: ['resPack'],
    63: ['zenyBagSomb'], 64: ['zenyBagInf'] };
  var CSHOW = { 15: 1, 31: 1, 32: 1, 33: 1, 34: 1, 35: 1, 36: 1, 37: 1, 38: 1, 40: 1, 43: 1, 44: 1, 45: 1, 46: 1, 48: 1, 49: 1, 50: 1, 51: 1, 54: 1, 63: 1, 64: 1 };
  function cCounts(n) { return n.t !== 'escolha' && n.t !== 'ascensao'; }
  function cPtsOf(bb) { var p = 0; Object.keys(bb.caos.n).forEach(function (id) { var n = CN[id]; if (n && cCounts(n)) p++; }); return p; }
  function cPts() { return cPtsOf(b); }
  function cCommon() { var p = 0; Object.keys(b.caos.n).forEach(function (id) { var n = CN[id]; if (n && cCounts(n) && n.t !== 'encaixe') p++; }); return p; }
  function caosCost(p) { return p <= 0 ? 0 : 125000 * p + 83000 * p * (p - 1) / 2; }
  function ascFor(bb) { var cl = Y.classById[bb.cls]; if (!cl) return null; var k = String(cl.rj || '').toUpperCase(); return CA.asc.filter(function (a) { return a.k === k; })[0] || null; }
  function ascTiersFor(bb) {
    var F = ascFor(bb), out = []; if (!F || !bb.caos) return out;
    Object.keys(bb.caos.n).forEach(function (id) { var n = CN[id]; if (n && n.t === 'ascensao' && n.s) { var t = (F.l[bb.caos.side] || [])[n.s - 1]; if (t) out.push({ slot: n.s, e: t.e, m: t.m, a: t.a }); } });
    return out.sort(function (a, c) { return a.slot - c.slot; });
  }
  // mecânicas que citam "a habilidade" sem dizer qual usam a habilidade principal daquele lado da Ascensão
  CA.asc.forEach(function (F) { Object.keys(F.l).forEach(function (sd) {
    var main = null; F.l[sd].forEach(function (t) { (t.m || []).forEach(function (m) { if (!main && typeof m.skill === 'number') main = m.skill; }); });
    F.l[sd].forEach(function (t) { (t.m || []).forEach(function (m) { if (main) m._def = main; }); });
  }); });
  function mecText(m) {
    var M = CA.mec[m.mecanica]; if (!M) return 'Mecânica ' + m.mecanica;
    if (m._def) ['skill', 'skillFixa', 'origem'].forEach(function (k) { if (m[k] == null && M[1].indexOf('{' + k + '}') >= 0) m[k] = m._def; });
    var t = (m.elemento || m.item) && M[2] ? M[2] : M[1];
    return t.replace(/\{(\w+)\}/g, function (x, k) {
      var v = m[k];
      if (/^(skill|origem|skillFixa)$/.test(k) && typeof v === 'number') return skNum(v);
      if (/^(origens|opcoes|skillsDasOpcoes|sombras)$/.test(k) && Array.isArray(v)) return v.map(function (z) { return typeof z === 'number' ? skNum(z) : (z.skill ? skNum(z.skill) + (z.nivel ? ' nv ' + z.nivel : '') : String(z)); }).join(', ');
      if (v != null && typeof v !== 'object') return String(v);
      if (k === 'segundos' && m.ms) return fmt(m.ms / 1000, 1);
      if ((k === 'chance' || k === 'pct') && m.porMil != null) return fmt(m.porMil / 10, 1);
      if (k === 'duracao' && m.ms) return fmt(m.ms / 60000) + ' min';
      if (k === 'status' && m.status) return m.status.replace(/^SC_/, '');
      if (k === 'runa' && m.runa) return 'runa #' + m.runa;
      if (k === 'alvo' || k === 'intervalo' || k === 'golpes' || k === 'tipo' || k === 'arma') return '';
      return '…';
    }).replace(/\s+/g, ' ').trim();
  }
  function cApply(list, asc, z, B, add) {
    (list || []).forEach(function (ev) {
      var id = ev[0], v = ev[1], m = CMAP[id];
      if (id === 29) { ['Fogo', 'Água', 'Terra', 'Vento'].forEach(function (e) { add(B, 'resEle:' + e, v); }); return; }
      if (id === 30) { ['Sagrado', 'Sombrio', 'Fantasma', 'Maldito', 'Veneno'].forEach(function (e) { add(B, 'resEle:' + e, v); }); return; }
      if (!m) return; if (m[3] === 'caos' && !z.caos) return;
      var k = asc && id === 56 ? 'penAsc' : m[0], f = m[1] || 1;
      add(B, k, v * f); if (m[2]) add(B, m[2], v * f);
    });
  }
  E.hooks.push(function (bb, B, notes, add) {
    if (!bb.caos) return;
    var z = D.zoneOf(bb), pts = 0;
    Object.keys(bb.caos.n).forEach(function (id) { var n = CN[id]; if (!n) return; if (cCounts(n)) pts++; cApply(n.e, false, z, B, add); });
    ascTiersFor(bb).forEach(function (t) { cApply(t.e, true, z, B, add); (t.m || []).forEach(function (m) { notes.push({ src: 'Ascensão ' + ROMAN[t.slot], t: mecText(m), on: true }); }); });
    B._caosPts = (B._caosPts || 0) + pts;
  });
  // ----- joias da Árvore do Caos (Joias de Yggdrasil e Joia Ying Yang) -----
  var CJW = {
    1280668: { n: 'Joia Guardião de Yggdrasil', s: { hpPct: 15, spPct: 15 }, t: 'HP e SP máximos +15%' },
    1280669: { n: 'Joia Sombra de Yggdrasil', s: { dmgMelee: 15 }, t: 'Dano físico corpo a corpo +15%' },
    1280670: { n: 'Joia Instinto de Yggdrasil', s: { dmgRanged: 15 }, t: 'Dano físico à distância +15%' },
    1280671: { n: 'Joia Mágica de Yggdrasil', s: { dmgMagic: 15 }, t: 'Dano mágico +15%' }
  };
  var CJYY = { id: 1280677, n: 'Joia Ying Yang', s: { pow: 10, sta: 10, wis: 10, spl: 10, con: 10, crt: 10 }, t: '+10 nos 6 traços' };
  var CJ_ONLY = { res: 1, mres: 1, ignResCaos: 1, patk: 1, smatk: 1, pow: 1, sta: 1, wis: 1, spl: 1, con: 1, crt: 1 };
  function cjPool() { var d = (Y.items || []).filter(function (x) { return x.id === 1280507; })[0]; return (d && d.jl) || []; }
  function cjSlots(bb) {
    var nj = 0, yy = false;
    Object.keys(bb.caos.n).forEach(function (id) { var n = CN[id]; if (!n || n.t !== 'joia') return; if (n.yy) yy = true; else nj++; });
    return { j: Math.min(2, nj), yy: yy };
  }
  function cjAdd(bb, s, z, B, add) { Object.keys(s).forEach(function (k) { if (CJ_ONLY[k] && !z.caos) return; add(B, k, s[k]); }); }
  E.hooks.push(function (bb, B, notes, add) {
    if (!bb.caos) return;
    var z = D.zoneOf(bb), sl = cjSlots(bb), pool = cjPool();
    (bb.caos.jw || []).slice(0, sl.j).forEach(function (j) {
      var J = j && CJW[j.id]; if (!J) return;
      cjAdd(bb, J.s, z, B, add);
      var r = Math.max(0, Math.min(3, j.r || 0));
      (j.l || []).slice(0, r).forEach(function (ix) { var L = pool[ix]; if (!L) return; var o = {}; L.k.forEach(function (k) { o[k] = L.v[r - 1]; }); cjAdd(bb, o, z, B, add); });
    });
    if (sl.yy && bb.caos.yy) cjAdd(bb, CJYY.s, z, B, add);
  });
  function cjCard() {
    var sl = cjSlots(b), pool = cjPool(), jw = b.caos.jw;
    var c = h('div', { class: 'card' }, [h('div', { class: 'ch' }, [h('h3', null, ['Joias do Caos']), h('span', { class: 'grow' }), h('small', { class: 'mut' }, ['itens próprios do YggIdle'])])]);
    c.appendChild(h('div', { class: 'tip' }, ['Joias de Yggdrasil: até 2 por personagem (podem ser iguais), uma em cada Encaixe de Joia comprado. A raridade e as linhas vêm do Lapidário, como na Joia do Destino: cada raridade libera 1 linha (até 3, Épica no topo). RES, MRES, Ignorar RES, P.ATQ, S.ATQM e traços só contam no Sombrio, no Inferno e no Abismo; o resto vale em todo o jogo. Nada disso vale em PvP, GvG nem Battleground.']));
    var grid = h('div', { class: 'cjgrid' });
    for (var i = 0; i < 2; i++) (function (i) {
      var on = i < sl.j, j = jw[i] || { id: 0, r: 0, l: [] };
      var box = h('div', { class: 'cjbox' + (on ? '' : ' off') }, [h('b', null, ['Encaixe ' + (i + 1)])]);
      var sel = h('select', { disabled: !on, on: { change: function (ev) { var v = +ev.target.value; if (!v) jw[i] = null; else jw[i] = { id: v, r: (jw[i] && jw[i].r) || 0, l: (jw[i] && jw[i].l) || [] }; refresh(true); } } });
      sel.appendChild(h('option', { value: 0 }, [on ? '— vazio —' : 'compre um Encaixe de Joia na árvore']));
      Object.keys(CJW).forEach(function (id) { sel.appendChild(h('option', { value: id, selected: +id === j.id }, [CJW[id].n])); });
      box.appendChild(sel);
      if (on && CJW[j.id]) {
        box.appendChild(h('div', { class: 'mut' }, ['Efeito base: ' + CJW[j.id].t]));
        var rs = h('select', { on: { change: function (ev) { j.r = +ev.target.value; j.l = (j.l || []).slice(0, j.r); refresh(true); } } });
        JLR.forEach(function (nm, r) { rs.appendChild(h('option', { value: r, selected: r === (j.r || 0) }, [nm])); });
        box.appendChild(h('label', { class: 'inl' }, ['Raridade ', rs]));
        j.l = j.l || [];
        for (var q = 0; q < 3; q++) (function (q) {
          var ok = q < (j.r || 0);
          var ls = h('select', { disabled: !ok, on: { change: function (ev) { var v = ev.target.value; if (v === '') j.l.splice(q, 1); else j.l[q] = +v; refresh(true); } } });
          ls.appendChild(h('option', { value: '' }, [ok ? '— linha vazia —' : 'liberada na raridade ' + JLR[q + 1]]));
          var grp = {};
          pool.forEach(function (L, ix) {
            var u = j.l.indexOf(ix); if (u >= 0 && u !== q) return;
            if (!grp[L.g]) { grp[L.g] = h('optgroup', { label: L.g }); ls.appendChild(grp[L.g]); }
            grp[L.g].appendChild(h('option', { value: ix, selected: j.l[q] === ix }, [L.n + ' +' + L.v[Math.max(0, (j.r || 1) - 1)]]));
          });
          box.appendChild(h('div', { class: 'line' }, [h('span', { class: 'mut' }, ['Linha ' + (q + 1)]), ls]));
        })(q);
      }
      grid.appendChild(box);
    })(i);
    var yb = h('div', { class: 'cjbox' + (sl.yy ? '' : ' off') }, [h('b', null, ['Encaixe Ying Yang'])]);
    var yc = h('input', { type: 'checkbox', checked: !!b.caos.yy, disabled: !sl.yy, on: { change: function (ev) { b.caos.yy = ev.target.checked ? 1 : 0; refresh(true); } } });
    yb.appendChild(h('label', { class: 'inl' }, [yc, CJYY.n]));
    yb.appendChild(h('div', { class: 'mut' }, [sl.yy ? 'Efeito base: ' + CJYY.t + ' (só no Sombrio, no Inferno e no Abismo). O efeito escondido, revelado no Abismo, não entra no cálculo.' : 'Compre um Encaixe Ying Yang (depois da Fúria do Legado) para usar. Só 1 por personagem, fora do limite de 2 joias.']));
    grid.appendChild(yb);
    c.appendChild(grid);
    return c;
  }
  function cAdj(id) { return (CADJ[id] || []).some(cHas); }
  function cHas(id) { return !!b.caos.n[id]; }
  function cExcl(n) { if (!n.x1) return null; var blk = null; Object.keys(b.caos.n).forEach(function (id) { var m = CN[id]; if (m && m.x1 === n.x1 && m.x2 !== n.x2) blk = m; }); return blk; }
  function cWhy(n) {
    if (cHas(n.i)) return null;
    if (n.off) return 'Em breve: ainda não aberto no jogo.';
    var ex = cExcl(n); if (ex) return 'Exclusivo: você já escolheu “' + ex.n + '”.';
    if (n.t !== 'entrada' && !cAdj(n.i)) return 'Precisa de um nó vizinho comprado.';
    if (cCounts(n) && cPts() >= 100) return 'Limite de 100 pontos atingido.';
    if (n.t === 'encaixe' && cCommon() < 30) return 'A Marca exige 30 nós comuns (você tem ' + cCommon() + ').';
    if (n.t === 'ascensao' && !cHas(7)) return 'Compre a Marca da Ascensão primeiro.';
    return '';
  }
  function cPrune() {
    var ok = {}, q = [];
    Object.keys(b.caos.n).forEach(function (id) { if (CN[id] && CN[id].t === 'entrada') { ok[id] = 1; q.push(+id); } });
    while (q.length) { var x = q.shift(); (CADJ[x] || []).forEach(function (y) { if (cHas(y) && !ok[y]) { ok[y] = 1; q.push(y); } }); }
    var rm = 0; Object.keys(b.caos.n).forEach(function (id) { if (!ok[id]) { delete b.caos.n[id]; rm++; } });
    if (cHas(7) && cCommon() < 30) { delete b.caos.n[7]; rm++; CA.nodes.forEach(function (n) { if (n.t === 'ascensao' && cHas(n.i)) { delete b.caos.n[n.i]; } }); cPrune(); }
    return rm;
  }
  var cView = null, cFind = '';
  function tabCaos(t) {
    var pts = cPts(), F = ascFor(b), asc = CA.nodes.filter(function (n) { return n.t === 'ascensao' && cHas(n.i); }).length;
    var zeny = 0; Object.keys(b.caos.n).forEach(function (id) { if (CN[id]) zeny += CN[id].z || 0; });
    var c = h('div', { class: 'card caoshead' }, [h('div', { class: 'ch' }, [h('h3', null, ['Árvore do Caos']), h('span', { class: 'grow' }), zoneSel(),
      h('button', { class: 'sm ghost', on: { click: function () { if (confirm('Zerar a Árvore do Caos?')) { b.caos.n = {}; refresh(true); } } } }, ['Zerar árvore'])])]);
    c.appendChild(h('div', { class: 'kpis' }, [kpi('Pontos', pts + ' / 100', pts >= 100 ? 'warn' : ''), kpi('Caos dos pontos', fmt(caosCost(pts))), kpi('Caos da Ascensão', fmt(asc * 10000000)),
      kpi('Zeny dos nós', fmt(zeny)), kpi('Nós comuns', cCommon() + (cHas(7) ? ' · Marca ✓' : ' / 30 p/ Marca')), kpi('Corte fora do Caos', fmt(Math.max(0, Math.min(30, pts * 0.3) - D.penetration(R)), 1) + '%')]));
    var side = h('div', { class: 'row' }, [h('b', null, ['Ascensão: ']), F ? h('span', null, [F.n]) : h('span', { class: 'mut' }, ['sem Ascensão para esta classe']),
      F ? h('span', { class: 'seg2' }, ['yang', 'ying'].map(function (sd) { return h('button', { class: b.caos.side === sd ? 'on' : '', on: { click: function () { b.caos.side = sd; refresh(true); } } }, [sd === 'yang' ? '☀ Yang' : '☾ Ying']); })) : null,
      h('span', { class: 'grow' }),
      h('input', { placeholder: 'Buscar nó (nome ou efeito)…', value: cFind, style: 'min-width:220px', on: { input: function (e) { cFind = e.target.value; paint(); } } })]);
    c.appendChild(side);
    c.appendChild(h('div', { class: 'tip' }, ['Clique para comprar · clique num nó comprado para remover (os nós que ficarem soltos saem junto) · roda do mouse: zoom · arrastar: mover. Fora do Sombrio, do Inferno e do Abismo, cada ponto corta 0,3% do seu dano (até 30%); a Penetração de Redução devolve 1% por 1%.']));
    t.appendChild(c);
    // mapa
    var NS = 'http://www.w3.org/2000/svg';
    function S(tag, at) { var e = document.createElementNS(NS, tag); Object.keys(at || {}).forEach(function (k) { e.setAttribute(k, at[k]); }); return e; }
    var X0 = -1110, Y0 = -1070, W0 = 1980, H0 = 2010;
    if (!cView) cView = { x: X0, y: Y0, w: W0, h: H0 };
    var svg = S('svg', { class: 'caosmap', viewBox: [cView.x, cView.y, cView.w, cView.h].join(' ') });
    var gE = S('g'), gN = S('g'); svg.appendChild(gE); svg.appendChild(gN);
    var ring = S('circle', { cx: 0, cy: 0, r: 120, class: 'cring' }); gE.appendChild(ring);
    var elE = [], elN = {};
    CA.edges.forEach(function (e) { var a = CN[e[0]], z = CN[e[1]]; if (!a || !z) return; var l = S('line', { x1: a.x, y1: a.y, x2: z.x, y2: z.y }); elE.push([l, e[0], e[1]]); gE.appendChild(l); });
    CA.nodes.forEach(function (n) {
      var g = S('g', { transform: 'translate(' + n.x + ',' + n.y + ')', class: 'cn t-' + n.t });
      var r = CRAD[n.t] || 8;
      if (n.t === 'notavel' || n.t === 'fim' || n.t === 'encaixe') g.appendChild(S('circle', { r: r + 5, class: 'halo' }));
      var shape = n.t === 'joia' || n.t === 'escolha' ? S('rect', { x: -r, y: -r, width: r * 2, height: r * 2, rx: 3, transform: 'rotate(45)' }) : S('circle', { r: r });
      shape.setAttribute('class', 'core'); shape.style.setProperty('--vc', VCOL[n.v] || '#ccc');
      g.appendChild(shape);
      if (n.t === 'ascensao') { var tx = S('text', { 'text-anchor': 'middle', dy: 4, class: 'ctx' }); tx.textContent = ROMAN[n.s] || ''; g.appendChild(tx); }
      if (n.t === 'encaixe') { var t2 = S('text', { 'text-anchor': 'middle', dy: 5, class: 'ctx big' }); t2.textContent = '✦'; g.appendChild(t2); }
      g.addEventListener('mouseenter', function (ev) { showTip(ev, cTip(n)); });
      g.addEventListener('mousemove', moveTip); g.addEventListener('mouseleave', hideTip);
      g.addEventListener('click', function (ev) {
        if (drag && drag.moved) return;
        if (cHas(n.i)) { delete b.caos.n[n.i]; var rm = cPrune(); hideTip(); refresh(true); if (rm) toast(rm + ' nó(s) soltos removidos junto'); return; }
        var w = cWhy(n); if (w) { toast(w); return; }
        b.caos.n[n.i] = 1; refresh(true);
      });
      elN[n.i] = g; gN.appendChild(g);
    });
    function paint() {
      var q = nrm(cFind);
      elE.forEach(function (x) { x[0].setAttribute('class', cHas(x[1]) && cHas(x[2]) ? 'got' : (cHas(x[1]) || cHas(x[2])) ? 'half' : ''); });
      CA.nodes.forEach(function (n) {
        var w = cWhy(n), st = cHas(n.i) ? 'got' : n.off ? 'off' : w === '' ? 'av' : 'lock';
        var hit = q && nrm(n.n + ' ' + n.d).indexOf(q) >= 0;
        elN[n.i].setAttribute('class', 'cn t-' + n.t + ' ' + st + (hit ? ' hit' : '') + (q && !hit ? ' dim' : ''));
      });
    }
    paint();
    // zoom e arrasto
    var drag = null;
    function setVB() { svg.setAttribute('viewBox', [cView.x, cView.y, cView.w, cView.h].join(' ')); }
    svg.addEventListener('wheel', function (e) {
      e.preventDefault(); var r = svg.getBoundingClientRect(), k = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      var px = cView.x + (e.clientX - r.left) / r.width * cView.w, py = cView.y + (e.clientY - r.top) / r.height * cView.h;
      var nw = Math.max(200, Math.min(W0 * 1.4, cView.w * k)), nh = nw * cView.h / cView.w;
      cView.x = px - (px - cView.x) * nw / cView.w; cView.y = py - (py - cView.y) * nh / cView.h; cView.w = nw; cView.h = nh; setVB();
    }, { passive: false });
    svg.addEventListener('mousedown', function (e) { drag = { x: e.clientX, y: e.clientY, vx: cView.x, vy: cView.y, moved: false }; });
    window.addEventListener('mousemove', function (e) {
      if (!drag) return; var r = svg.getBoundingClientRect(); var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      cView.x = drag.vx - dx / r.width * cView.w; cView.y = drag.vy - dy / r.height * cView.h; setVB();
    });
    window.addEventListener('mouseup', function () { setTimeout(function () { drag = null; }, 0); });
    var mapCard = h('div', { class: 'card caoswrap' }, [svg, h('div', { class: 'czoom' }, [
      h('button', { class: 'sm', title: 'Aproximar', on: { click: function () { cView.x += cView.w * .15; cView.y += cView.h * .15; cView.w *= .7; cView.h *= .7; setVB(); } } }, ['+']),
      h('button', { class: 'sm', title: 'Afastar', on: { click: function () { cView.x -= cView.w * .2; cView.y -= cView.h * .2; cView.w *= 1.4; cView.h *= 1.4; setVB(); } } }, ['−']),
      h('button', { class: 'sm', title: 'Centralizar', on: { click: function () { cView = { x: X0, y: Y0, w: W0, h: H0 }; setVB(); } } }, ['⌂'])]),
      h('div', { class: 'clegend' }, Object.keys(VNAME).map(function (k) { return h('span', null, [h('i', { style: 'background:' + VCOL[k] }), VNAME[k]]); }))]);
    t.appendChild(mapCard);
    // resumo
    var sum = {}, order = [];
    Object.keys(b.caos.n).forEach(function (id) { var n = CN[id]; (n && n.e || []).forEach(function (ev) { if (sum[ev[0]] == null) { sum[ev[0]] = 0; order.push(ev[0]); } sum[ev[0]] += ev[1]; }); });
    var tiers = ascTiersFor(b);
    tiers.forEach(function (tt) { (tt.e || []).forEach(function (ev) { if (sum[ev[0]] == null) { sum[ev[0]] = 0; order.push(ev[0]); } sum[ev[0]] += ev[1]; }); });
    var cols = h('div', { class: 'gcols' });
    var cS = h('div', { class: 'card' }, [h('h3', null, ['Bônus somados'])]);
    if (!order.length) cS.appendChild(h('div', { class: 'mut' }, ['Nenhum nó comprado.']));
    order.sort(function (a, c2) { return a - c2; }).forEach(function (id) {
      var ef = CA.ef[id] || ['?', 'pct', '#' + id], u = ef[1] === 'pct' ? '%' : ef[1] === 'ms' ? ' ms' : ef[1] === 'permil' ? '‰' : '';
      var neg = /^(REDUCAO|CUSTO_SP)/.test(ef[0]) && ef[0] !== 'REDUCAO_POS_CONJURACAO' && ef[0] !== 'REDUCAO_CONJURACAO' ? '−' : (ef[0] === 'REDUCAO_CONJURACAO' || ef[0] === 'REDUCAO_POS_CONJURACAO' ? '−' : '+');
      cS.appendChild(h('div', { class: 'kv' + ((CMAP[id] && !CSHOW[id]) || id === 29 || id === 30 ? ' calc' : '') }, [h('span', null, [ef[2]]), h('b', null, [(ef[1] === 'flag' ? '✓' : neg + fmt(sum[id], 1) + u)])]));
    });
    cS.appendChild(h('div', { class: 'tip' }, ['Em dourado: entra no cálculo do planner. Os demais aparecem só como resumo (drop, EXP, regeneração, resistências a status…).']));
    cols.appendChild(cS);
    var cA = h('div', { class: 'card' }, [h('h3', null, ['Ascensão' + (F ? ' · ' + F.n : '')])]);
    if (!F) cA.appendChild(h('div', { class: 'mut' }, ['A Ascensão existe para as classes transcendidas e expandidas com Runa da Ascensão.']));
    else ['yang', 'ying'].forEach(function (sd) {
      var box = h('div', { class: 'ascside' + (b.caos.side === sd ? ' on' : '') }, [h('b', null, [sd === 'yang' ? '☀ Yang' : '☾ Ying'])]);
      (F.l[sd] || []).forEach(function (tt, i) {
        var node = CA.nodes.filter(function (n) { return n.t === 'ascensao' && n.s === i + 1; })[0], got = node && cHas(node.i) && b.caos.side === sd;
        var txt = (tt.e || []).map(function (ev) { var ef = CA.ef[ev[0]] || ['', '', '#']; return '+' + ev[1] + (ef[1] === 'pct' ? '%' : '') + ' ' + ef[2]; }).concat((tt.m || []).map(mecText));
        box.appendChild(h('div', { class: 'asct' + (got ? ' got' : '') }, [h('i', null, [ROMAN[i + 1]]), h('span', null, [txt.join('; ') || '—'])]));
      });
      cA.appendChild(box);
    });
    cA.appendChild(h('div', { class: 'tip' }, ['Cada nó de Ascensão custa 10.000.000 de Caos e não conta como ponto. A Marca exige 30 nós comuns.']));
    cols.appendChild(cA);
    t.appendChild(cols);
    t.appendChild(cjCard());
  }
  function cTip(n) {
    var w = cWhy(n), got = cHas(n.i);
    var kids = [h('div', { class: 'ith' }, [h('span', { class: 'cdot', style: 'background:' + (VCOL[n.v] || '#ccc') }), h('span', null, [h('b', null, [n.n]), h('small', null, [(CTN[n.t] || n.t) + ' · ' + (VNAME[n.v] || n.v) + ' · profundidade ' + n.p])])])];
    if (n.d) kids.push(h('div', { class: 'tdesc' }, n.d.split(/;\s*/).map(function (x) { return h('div', null, [x]); })));
    if (n.t === 'ascensao') { var F = ascFor(b), tt = F && (F.l[b.caos.side] || [])[n.s - 1]; if (tt) kids.push(h('div', { class: 'tnote' }, [h('b', null, [F.n + ' · ' + (b.caos.side === 'yang' ? 'Yang' : 'Ying')])].concat((tt.e || []).map(function (ev) { var ef = CA.ef[ev[0]] || ['', '', '']; return h('div', null, ['+' + ev[1] + (ef[1] === 'pct' ? '%' : '') + ' ' + ef[2]]); })).concat((tt.m || []).map(function (m) { return h('div', null, [mecText(m)]); })))); }
    var cost = [];
    if (n.z) cost.push(fmt(n.z) + ' zeny');
    if (n.t === 'ascensao') cost.push('10.000.000 de Caos');
    else if (cCounts(n) && !got) cost.push(fmt(125000 + 83000 * cPts()) + ' de Caos (ponto ' + (cPts() + 1) + ')');
    if (cost.length) kids.push(h('div', { class: 'tip' }, ['Custo: ' + cost.join(' + ')]));
    if (n.x1 && /LINHA_DO_ZENY/.test(n.x1)) kids.push(h('div', { class: 'tip' }, ['Linha do Zeny: escolha só uma das três linhas.']));
    if (n.yy) kids.push(h('div', { class: 'tip' }, ['Encaixe exclusivo da Joia Ying Yang.']));
    kids.push(h('div', { class: 'tip ' + (got ? 'ok' : w ? 'bad' : 'ok') }, [got ? '✓ Comprado (clique para remover)' : w || 'Disponível: clique para comprar']));
    return h('div', { class: 'stip' }, kids);
  }

  // ----- consumíveis -----
  E.hooks.push(function (bb, B, notes, add) {
    (bb.cons || []).forEach(function (c) { var it = CONS[c.id]; if (!it || !c.on) return; Object.keys(it.s || {}).forEach(function (k) { add(B, k, it.s[k] * (c.q || 1)); }); });
  });
  var consQ = '', consKind = '';
  function consTip(it) {
    return h('div', { class: 'stip' }, [h('div', { class: 'ith' }, [itemIcon(it.id, 'ico lg'), h('span', null, [h('b', null, [it.n]), h('small', null, ['#' + it.id + (it.du ? ' · dura ' + it.du : '') + (it.w != null ? ' · peso ' + it.w : '')])])]),
      h('div', { class: 'tdesc' }, it.d.map(function (x) { return h('div', null, [x]); })),
      it.s ? h('div', { class: 'tdmg' }, ['No cálculo: ' + Object.keys(it.s).map(function (k) { return lblKey(k) + ' ' + (it.s[k] > 0 ? '+' : '') + it.s[k]; }).join(' · ')]) : h('div', { class: 'tip' }, ['Sem efeito numérico no planner.'])]);
  }
  function tabCons(t) {
    var c = h('div', { class: 'card' }, [h('div', { class: 'ch' }, [h('h3', null, ['Consumíveis em uso']), h('span', { class: 'grow' }),
      b.cons.length ? h('button', { class: 'sm ghost', on: { click: function () { b.cons = []; refresh(true); } } }, ['Remover todos']) : null])]);
    if (!b.cons.length) c.appendChild(h('div', { class: 'mut' }, ['Nenhum consumível. Adicione pela lista abaixo: comidas, poções, pergaminhos e itens de uso.']));
    b.cons.forEach(function (x, i) {
      var it = CONS[x.id]; if (!it) return;
      var row = h('div', { class: 'consrow' + (x.on ? ' on' : '') }, [
        h('input', { type: 'checkbox', checked: x.on, title: 'Ligado no cálculo', on: { change: function (e) { x.on = e.target.checked; refresh(true); } } }),
        itemIcon(it.id), h('span', { class: 'cn2' }, [h('b', null, [it.n]), h('small', null, [it.s ? Object.keys(it.s).map(function (k) { return lblKey(k) + ' ' + (it.s[k] > 0 ? '+' : '') + it.s[k]; }).join(' · ') : (it.d[1] || it.d[0] || '')])]),
        it.du ? h('span', { class: 'chip' }, [it.du]) : null,
        h('button', { class: 'sm ghost', on: { click: function () { b.cons.splice(i, 1); refresh(true); } } }, ['×'])]);
      tipOn(row, function () { return consTip(it); }); c.appendChild(row);
    });
    t.appendChild(c);
    var c2 = h('div', { class: 'card' }, [h('h3', null, ['Adicionar consumível'])]);
    var q = h('input', { placeholder: 'Buscar por nome ou efeito…', value: consQ, style: 'flex:1' }), list = h('div', { class: 'conslist' }), chips = h('div', { class: 'cfil' }), cnt = h('span', { class: 'mut' });
    var KIND = [['', 'Todos'], ['calc', 'Mudam atributos'], ['buff', 'Buffs e comidas'], ['cura', 'Cura e recuperação'], ['pergaminho', 'Pergaminhos de habilidade'], ['arma', 'Propriedade da arma'], ['mascote', 'Mascotes'], ['util', 'Utilidades'], ['caixa', 'Caixas']];
    function kOk(it, k) { return !k || (k === 'calc' ? !!it.s || it.d.some(parseGrant) : (it.k || 'util') === k); }
    function drawChips() {
      chips.innerHTML = '';
      KIND.forEach(function (k) {
        var n = (Y.consum || []).filter(function (it) { return kOk(it, k[0]); }).length;
        chips.appendChild(h('button', { class: consKind === k[0] ? 'on' : '', on: { click: function () { consKind = k[0]; drawChips(); fill(); } } }, [k[1] + ' ', h('small', null, [String(n)])]));
      });
    }
    c2.appendChild(h('div', { class: 'row' }, [q, cnt])); c2.appendChild(chips);
    function fill() {
      list.innerHTML = ''; var s = nrm(consQ), n = 0;
      (Y.consum || []).forEach(function (it) {
        if (!kOk(it, consKind)) return;
        if (s && nrm(it.n + ' ' + it.d.join(' ')).indexOf(s) < 0) return; n++;
        var has = b.cons.some(function (x) { return x.id === it.id; });
        var el = h('button', { class: 'consit' + (has ? ' on' : ''), on: { click: function () { if (has) return; b.cons.push({ id: it.id, on: true }); refresh(true); } } }, [itemIcon(it.id), h('span', null, [h('b', null, [it.n]), h('small', null, [it.s ? Object.keys(it.s).map(function (k) { return lblKey(k) + ' ' + (it.s[k] > 0 ? '+' : '') + it.s[k]; }).join(' · ') : (it.d[1] || it.d[0] || '').slice(0, 80)])])]);
        tipOn(el, function () { return consTip(it); }); list.appendChild(el);
      });
      if (!n) list.appendChild(h('div', { class: 'mut' }, ['Nada encontrado.']));
      cnt.textContent = n + ' de ' + (Y.consum || []).length + ' itens';
    }
    q.addEventListener('input', function () { consQ = q.value; fill(); }); drawChips(); fill();
    c2.appendChild(list);
    c2.appendChild(h('div', { class: 'tip' }, ['Dados, ícones e descrições da wiki do YggIdle. Comidas de atributo do mesmo tipo não acumulam no jogo: ligue só uma de cada.']));
    t.appendChild(c2);
  }

  // ----- fórmulas do jogo -----
  function tabForm(t) {
    var F = [
      ['Pontos de atributo', 0, ['Custo para subir um atributo de x para x+1: ⌊(x − 1) / 10⌋ + 2 (até 100); acima de 100: 4 × ⌊(x − 100) / 5⌋ + 16.', 'Atributos vão até 120 e o nível máximo é 175.', 'Total de pontos por nível: tabela de renewal do rAthena (servidor do YggIdle) + 52 para as transcendentais. Nível 99: 1.325; nível 175: 3.330 (expandidas: 1.273 e 3.278).', 'No YggIdle as classes básicas são as “T” (transcendentais): começam no nível 1 com 100 pontos e têm +25% de HP e SP. Classes expandidas começam com 48.'], function () { return 'Seus pontos: ' + R.ptsUsed + ' / ' + R.ptsTotal; }],
      ['Traços (4ª classe)', 1, ['Pontos de traço: (nível − 100) × 3 + 3.', 'P.ATQ = ⌊POD / 3⌋ + ⌊CON / 5⌋ · S.ATQM = ⌊FEI / 3⌋ + ⌊CON / 5⌋.', 'RES = STA + ⌊STA / 3⌋ × 5 · MRES = SAB + ⌊SAB / 3⌋ × 5.', 'H.PLUS = CRV · C.RATE = ⌊CRV / 3⌋.', 'No YggIdle os traços e os atributos de 4ª classe só valem no Mundo Sombrio, no Portal do Inferno e no Abismo de Ácido.'], function () { return 'P.ATQ ' + R.patk + ' · S.ATQM ' + R.smatk + ' · RES ' + R.res + ' · MRES ' + R.mres; }],
      ['ATQ de status', 0, ['Corpo a corpo: FOR + ⌊DES / 5⌋ + ⌊SOR / 3⌋ + ⌊nível / 4⌋ + 5 × POD.', 'À distância: troque FOR por DES (e DES por FOR).', 'No golpe, o ATQ de status conta em dobro e o ATQ da arma é multiplicado pelo ajuste de tamanho.'], function () { return 'ATQ de status: ' + R.batk; }],
      ['ATQM', 0, ['ATQM de status = INT + ⌊INT / 2⌋ + ⌊DES / 5⌋ + ⌊SOR / 3⌋ + ⌊nível / 4⌋ + 5 × FEI.', 'ATQM total = (status + arma + refino + equipamentos) × (1 + ATQM% / 100).'], function () { return 'ATQM: ' + R.matk; }],
      ['Precisão e Esquiva', 0, ['Precisão = nível + DES + ⌊SOR / 3⌋ + 175 + 2 × CON + bônus.', 'Esquiva = nível + AGI + ⌊SOR / 5⌋ + 100 + 2 × CON + bônus.', 'Esquiva perfeita = SOR + 10 + bônus × 10 (em décimos de %).', 'Chance de acertar o monstro = 80 + sua Precisão − (nível + AGI + 100 do monstro), entre 5% e 100%.'], function () { return 'Precisão ' + R.hit + ' · Esquiva ' + R.flee; }],
      ['Crítico', 1, ['Chance = 1 + SOR × 0,3 + bônus (o planner mostra em %).', 'Dano crítico no YggIdle: 1,4 × (1 + extra × eficiência × (1 − sobra / 100)), onde extra = dano crítico (%) + C.RATE.', 'Eficiência = 1 − 0,5 × min(Defesa Crítica, 30) / 30: contra 30 ou mais, o extra rende a metade.', 'Sobra = Defesa Crítica − extra / 2 (cada 2 pontos de extra tiram 1 ponto da defesa).', 'Defesa Crítica: mapa comum 0,3 por ponto da Árvore do Caos (até 30); Chefenias e LHZ 30; Sombrio 40; Inferno e Abismo 50; PvP 0.', 'Exemplo da wiki com 100% de dano crítico: 2,8× sem pontos na árvore, 2,52× com 40 pontos e 2,1× com 100.'], function () { return 'Seu multiplicador agora: ' + fmt(D.critMult(R, b), 2) + '× (Defesa Crítica ' + fmt(D.critDef(R, b), 1) + ')'; }],
      ['Velocidade de ataque', 0, ['ASPD = ⌊√(DES² / 5 (ou / 7 à distância) + AGI² / 2) / 4 + 196⌋ − penalidade da arma da classe + bônus.', 'Movimento do ataque (ms) = 2000 − ASPD × 10, reduzido pela velocidade de ataque %. Intervalo entre ataques = 2 × movimento.', 'Limite configurável na aba Status (padrão 193).'], function () { return 'ASPD efetiva ' + R.aspdEff + ' · ' + fmt(R.aps, 2) + ' ataques/s'; }],
      ['HP e SP', 0, ['HP base cresce com o nível conforme a tabela da classe; HP = base × (1 + VIT / 100) × 1,25 (transcendidas) + bônus, depois × (1 + HP% / 100).', 'SP = base × (1 + INT / 100) × 1,25 (transcendidas) + bônus, depois × (1 + SP% / 100).'], function () { return 'HP ' + fmt(R.hp) + ' · SP ' + fmt(R.sp); }],
      ['Defesas', 0, ['Redução por DEF do alvo: dano × (4000 + DEF) / (4000 + DEF × 10). DEF de status (subtrativa) = ⌊(nível + VIT) / 2 + AGI / 5⌋.', 'Redução por DEFM: dano × (1000 + DEFM) / (1000 + DEFM × 10). DEFM de status = ⌊INT + nível / 4 + (DES + VIT) / 5⌋.', 'RES e MRES reduzem o dano em RES / (RES + 400).'], function () { return 'DEF ' + R.def + ' + ' + R.def2 + ' · DEFM ' + R.mdef + ' + ' + R.mdef2; }],
      ['Conjuração', 1, ['Conjuração variável = base × (1 − √((DES × 2 + INT) / 530)) × (1 + bônus % / 100). Some 265 de DES × 2 + INT para zerar.', 'No YggIdle a conjuração fixa tem no máximo 0,5 s.', 'Pós-conjuração = base × (1 + bônus % / 100); o ciclo usa o maior entre a pós-conjuração e o movimento do ataque.'], function () { return 'Fator de conjuração variável: ' + fmt(R.castScale * 100, 1) + '%'; }],
      ['Dano físico', 0, ['Golpe = (2 × ATQ de status + ATQ da arma × tamanho + refino + ATQ de equipamentos) × (1 + ATQ% / 100) × razão da habilidade × elemento × modificadores × redução por DEF × (1 + P.ATQ / 100).', 'Modificadores: cada grupo soma dentro de si e multiplica os outros (dano físico/geral, raça, elemento do alvo, chefe/comum, tamanho, elemento do ataque).', 'Variação da arma: ±5% por nível da arma.'], null],
      ['Dano mágico', 0, ['Golpe = ATQM × razão × elemento × modificadores × redução por DEFM × (1 + S.ATQM / 100), variando ±5%.'], null],
      ['Elementos', 1, ['Tabela de elementos com as mudanças do YggIdle: um elemento contra ele mesmo resiste menos (25%, 15%, 10% e 5% nos níveis 1 a 4).', 'Resistência elemental do jogador tem teto de 90%.'], null],
      ['Árvore do Caos', 1, ['Custo em Caos do ponto n = 125.000 + 83.000 × (n − 1). Total de n pontos = 125.000 × n + 83.000 × n × (n − 1) / 2 (10 pontos = 4.985.000; 100 pontos = 423.350.000).', 'Nós de Ascensão: 10.000.000 de Caos cada, não contam como ponto. A Marca exige 30 nós comuns. Máximo de 100 pontos.', 'Fora do Sombrio, do Inferno e do Abismo, cada ponto corta 0,3% do seu dano (até 30%).'], function () { return cPts() + ' pontos · ' + fmt(caosCost(cPts())) + ' de Caos'; }],
      ['Aura e Penetração de Redução', 1, ['Aura (quanto do dano passa): Sombrio 30%, Inferno/Abismo 20%, Invasão de LHZ 70%, Chefenia de Season 30%, chefe da Chefenia de Guild 5%.', 'Penetração de Redução tira 1% do corte por 1%: árvore até 25%, Ascensão V +5%, Joias de Yggdrasil até 20%, total de 50% (Joia Ying Yang e Revanche passam do total).', 'Monstros do Sombrio têm 1.200 de RES/MRES e os do Inferno 2.000 (o planner aplica RES / (RES + 400), com o “Ignora RES no Caos”).'], function () { var z = D.zoneMult(R, b, {}, false); return z.zone + ': passa ' + fmt(z.mult * 100, 1) + '% do dano · Penetração ' + fmt(z.pen, 1) + '%'; }],
      ['Buffs e outras regras do YggIdle', 1, ['Buffs do Ferreiro duram 5 minutos.', 'Nada das regras do Legado (aura, Defesa Crítica, corte da árvore) vale em PvP, GvG ou Battleground.', 'Chefes do Legado esperam 3 s depois de cada habilidade.'], null]
    ];
    var c = h('div', { class: 'card' }, [h('h3', null, ['Fórmulas do jogo']), h('div', { class: 'tip' }, ['Fórmulas usadas pelo planner. As marcadas com ', h('span', { class: 'ybadge inl' }, ['Y']), ' são regras próprias do YggIdle, tiradas da wiki do jogo. O valor em verde é o da sua build agora.'])]);
    t.appendChild(c);
    var grid = h('div', { class: 'fgrid' });
    F.forEach(function (f) {
      grid.appendChild(h('div', { class: 'card fcard' }, [h('div', { class: 'ch' }, [h('h3', null, [f[0]]), f[1] ? h('span', { class: 'ybadge inl', title: 'Regra do YggIdle' }, ['Y']) : null]),
        h('ul', { class: 'bul' }, f[2].map(function (x) { return h('li', null, [x]); })), f[3] ? h('div', { class: 'fval' }, [f[3]()]) : null]));
    });
    t.appendChild(grid);
  }

  // ---------- aba Tutores (builds recomendadas, curadoria em data/destaques.js) ----------
  var TUT = Y.tutores || {}, DEST = (Y.destaques || []).map(function (x, i) { return Object.assign({ _i: i }, x); });
  var TAGC = { farm: '#74b85a', chefe: '#d0613f', iniciante: '#5f8de0', pvp: '#a274d8', suporte: '#e6c86b', endgame: '#e8c477' };
  var tutF = { cls: 'cur', tag: null, q: '' };
  function verCmp(a, b2) { a = String(a || '0').split('.'); b2 = String(b2 || '0').split('.'); for (var i = 0; i < 3; i++) { var d = (+a[i] || 0) - (+b2[i] || 0); if (d) return d; } return 0; }
  function destBuild(d) {
    var o = d.code ? fromCode(d.code) : Object.assign({}, d.build || {});
    o.cls = o.cls || d.cls; if (!o.name) o.name = d.t; if (d.lv && !o.lv) o.lv = d.lv; if (d.sex && !o.sex) o.sex = d.sex;
    return ensure(o);
  }
  function destLink(d) { return location.href.split('#')[0] + '#b=' + encodeURIComponent(toCode(destBuild(d))); }
  function openDest(d) {
    var lib = libGet();
    if (!(curId && lib[curId] && savedSnap === snap()) && !confirm('Abrir “' + d.t + '”? A build atual tem alterações não salvas e será substituída.')) return;
    try { b = destBuild(d); } catch (e) { toast('Não foi possível abrir a build: ' + e.message); return; }
    curId = null; savedSnap = null; try { localStorage.removeItem(CUR); } catch (e) { }
    simRes = null; closeModal(); syncHeader(); refresh(); updateState(); goTab('guide'); toast('Build de ' + ((TUT[d.tutor] || {}).n || 'tutor') + ' aberta');
  }
  function tutAvatar(k, cls) { var t = TUT[k] || {}; return h('span', { class: 'tav ' + (cls || ''), style: '--lc:' + Y.lineColor(t.cls || 'nov') }, [spriteEl(t.cls || 'nov', 'head', t.sex)]); }
  function tagChip(tg) { var c = TAGC[String(tg).toLowerCase()]; return h('span', { class: 'ttag', style: c ? '--tc:' + c : '' }, [tg]); }
  function destCard(d, k) {
    var c = Y.classById[d.cls] || {}, t = TUT[d.tutor] || { n: d.tutor || 'Tutor' }, old = verCmp(d.v, VERSION) < 0;
    var card = h('article', { class: 'dcard' + (d.principal ? ' pin' : '') + (d.exemplo ? ' demo' : ''), style: '--lc:' + Y.lineColor(d.cls) + ';animation-delay:' + (k * 40) + 'ms' }, [
      h('div', { class: 'dstage' }, [h('span', { class: 'rune' }), h('span', { class: 'motes' }), h('span', { class: 'ped' }), spriteEl(d.cls, 'big', d.sex),
        h('div', { class: 'dbadges' }, [d.principal ? h('span', { class: 'dpin', title: 'Build principal da classe, fixada pelos tutores' }, ['★ Principal']) : null,
          d.exemplo ? h('span', { class: 'ddemo' }, ['Exemplo']) : null]),
        h('div', { class: 'dcls' }, [h('b', null, [c.n || d.cls]), h('small', null, [(c.line || '') + (d.lv ? ' · Nv ' + d.lv : '')])])]),
      h('div', { class: 'dbody' }, [
        h('h4', null, [d.t]),
        (d.tags || []).length ? h('div', { class: 'dtags' }, d.tags.map(tagChip)) : null,
        d.desc ? h('p', { class: 'ddesc' }, [d.desc]) : null,
        h('button', { class: 'dtutor', title: 'Ver perfil do tutor', on: { click: function () { openTutor(d.tutor); } } }, [tutAvatar(d.tutor), h('span', null, [h('b', null, [t.n]), h('small', { class: 'tver' }, ['✔ Tutor'])])]),
        h('div', { class: 'dmeta' + (old ? ' old' : '') }, [h('span', null, ['v' + (d.v || '?')]), d.d ? h('span', null, [d.d.split('-').reverse().join('/')]) : null,
          old ? h('span', { class: 'dold', title: 'O planner e o jogo mudaram desde que esta build foi montada. Confira os valores antes de seguir.' }, ['⚠ Montada na v' + d.v + ': pode estar desatualizada']) : null]),
        h('div', { class: 'dact' }, [
          h('button', { class: 'pri', on: { click: function () { openDest(d); } } }, ['Abrir no planner ▸']),
          h('button', { class: 'ghost', title: 'Copia o link desta build', on: { click: function () { var u = destLink(d); navigator.clipboard && navigator.clipboard.writeText(u).then(function () { toast('Link copiado'); }, function () { prompt('Copie o link:', u); }); } } }, ['Link'])])])]);
    card.addEventListener('mousemove', function (e) { var r = card.getBoundingClientRect(); card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); });
    return card;
  }
  function sortDest(a, b2) { return (b2.principal ? 1 : 0) - (a.principal ? 1 : 0) || (a.exemplo ? 1 : 0) - (b2.exemplo ? 1 : 0) || String(b2.d || '').localeCompare(String(a.d || '')) || a._i - b2._i; }
  function openTutor(k) {
    var t = TUT[k] || { n: k }, list = DEST.filter(function (d) { return d.tutor === k; }).sort(sortDest);
    var grid = h('div', { class: 'dgrid' }); list.forEach(function (d, i) { grid.appendChild(destCard(d, i)); });
    openModal(h('div', { class: 'tprof', style: '--lc:' + Y.lineColor(t.cls || 'nov') }, [
      h('div', { class: 'tph' }, [tutAvatar(k, 'lg'), h('div', null, [h('h3', null, [t.n]), h('small', { class: 'tver' }, ['✔ Tutor do YggPlanner · ' + list.length + ' build' + (list.length === 1 ? '' : 's')]),
        t.desc ? h('p', null, [t.desc]) : null,
        (t.links || []).length ? h('div', { class: 'tlinks' }, t.links.map(function (l) { return h('a', { href: l[1], target: '_blank', rel: 'noopener', class: 'tlink' }, [l[0] + ' ↗']); })) : null])]),
      grid, h('div', { class: 'row' }, [h('button', { on: { click: closeModal } }, ['Fechar'])])]), 'wide xl');
  }
  function openSend() {
    var c = Y.classById[b.cls];
    var fT = h('input', { value: b.name || c.n, placeholder: 'Título da build' }), fN = h('input', { placeholder: 'Seu nome de tutor' });
    var fTags = h('input', { placeholder: 'Farm, Chefe, Iniciante…' }), fD = h('textarea', { placeholder: 'Resumo curto: para que serve, nível, equipamento-chave…', style: 'height:70px' });
    var out = h('textarea', { readonly: true, style: 'height:120px;font-family:monospace;font-size:11px' });
    function gen() {
      var o = { cls: b.cls, sex: b.sex, t: fT.value.trim() || c.n, tutor: nrm(fN.value).replace(/ /g, '') || 'tutor', tags: fTags.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean),
        lv: b.lv, v: VERSION, d: new Date().toISOString().slice(0, 10), desc: fD.value.trim(), code: toCode(b) };
      out.value = JSON.stringify(o, null, 1) + ',' + (fN.value.trim() ? '\n// tutor: ' + fN.value.trim() : '');
    }
    [fT, fN, fTags, fD].forEach(function (x) { x.addEventListener('input', gen); }); gen();
    openModal(h('div', { class: 'dsend' }, [h('h3', null, ['Enviar minha build']),
      h('div', { class: 'tip' }, ['Preencha e copie o bloco abaixo. Mande para o Rizakh (Discord ou Twitch); depois da revisão a build entra na aba Tutores. O bloco já leva a build atual inteira: atributos, equipamentos, habilidades, guia e anotações.']),
      h('div', { class: 'dform' }, [h('label', null, ['Título', fT]), h('label', null, ['Seu nome', fN]), h('label', null, ['Rótulos (separados por vírgula)', fTags]), h('label', { class: 'full' }, ['Resumo', fD])]),
      out, h('div', { class: 'row' }, [h('button', { class: 'pri', on: { click: function () { out.select(); (navigator.clipboard ? navigator.clipboard.writeText(out.value) : Promise.reject()).then(function () { toast('Bloco copiado'); }, function () { document.execCommand('copy'); toast('Bloco copiado'); }); } } }, ['Copiar bloco']),
        h('button', { on: { click: closeModal } }, ['Fechar'])])]), 'wide');
  }
  function tabTut(t) {
    var cur = Y.classById[b.cls];
    var all = DEST.slice().sort(sortDest), tags = {};
    all.forEach(function (d) { (d.tags || []).forEach(function (x) { tags[x] = 1; }); });
    var head = h('div', { class: 'card thead', style: '--lc:' + Y.lineColor(b.cls) }, [
      h('div', { class: 'thx' }, [h('h3', null, ['Builds dos tutores']),
        h('p', { class: 'mut' }, ['Builds montadas e revisadas por tutores do YggIdle. Abra uma no planner para ver atributos, equipamentos, habilidades e a rota de mapas, e ajuste à vontade.'])]),
      h('button', { class: 'ghost', on: { click: openSend } }, ['✉ Enviar minha build'])]);
    t.appendChild(head);
    var q = h('input', { class: 'search', placeholder: 'Buscar por título, classe ou tutor…', value: tutF.q });
    var bar = h('div', { class: 'tfil' });
    function chip(lbl, on, fn, col) { return h('button', { class: on ? 'on' : '', style: col ? '--tc:' + col : '', on: { click: fn } }, [lbl]); }
    function drawBar() {
      bar.innerHTML = '';
      bar.appendChild(chip(cur.n, tutF.cls === 'cur', function () { tutF.cls = 'cur'; drawBar(); fill(); }));
      bar.appendChild(chip('Todas as classes', tutF.cls === 'all', function () { tutF.cls = 'all'; drawBar(); fill(); }));
      bar.appendChild(h('span', { class: 'sep' }));
      bar.appendChild(chip('Todos os rótulos', !tutF.tag, function () { tutF.tag = null; drawBar(); fill(); }));
      Object.keys(tags).sort().forEach(function (x) { bar.appendChild(chip(x, tutF.tag === x, function () { tutF.tag = x; drawBar(); fill(); }, TAGC[x.toLowerCase()])); });
    }
    var body = h('div');
    function fill() {
      body.innerHTML = ''; var s = nrm(q.value); tutF.q = q.value;
      var list = all.filter(function (d) {
        if (tutF.cls === 'cur' && d.cls !== b.cls) return false;
        if (tutF.tag && (d.tags || []).indexOf(tutF.tag) < 0) return false;
        if (s) { var c = Y.classById[d.cls] || {}; if (nrm([d.t, c.n, c.line, (TUT[d.tutor] || {}).n, (d.tags || []).join(' ')].join(' ')).indexOf(s) < 0) return false; }
        return true;
      });
      if (!list.length) {
        body.appendChild(h('div', { class: 'card dempty' }, [h('div', { class: 'deico' }, [spriteEl(b.cls, 'mid')]),
          h('b', null, [tutF.cls === 'cur' ? 'Ainda não há build de tutor para ' + cur.n + '.' : 'Nenhuma build encontrada.']),
          h('p', { class: 'mut' }, ['É tutor? Monte a build e use “Enviar minha build” para ela aparecer aqui.']),
          tutF.cls === 'cur' && all.length ? h('button', { on: { click: function () { tutF.cls = 'all'; drawBar(); fill(); } } }, ['Ver todas as classes (' + all.length + ')']) : null]));
        return;
      }
      if (tutF.cls === 'all') {
        var by = {}, ord = []; list.forEach(function (d) { if (!by[d.cls]) { by[d.cls] = []; ord.push(d.cls); } by[d.cls].push(d); });
        var k = 0;
        ord.forEach(function (cid) {
          var g = h('div', { class: 'dgrid' }); by[cid].forEach(function (d) { g.appendChild(destCard(d, k++)); });
          body.appendChild(h('section', { class: 'dsec' }, [h('div', { class: 'clh', style: '--lc:' + Y.lineColor(cid) }, [(Y.classById[cid] || {}).n || cid]), g]));
        });
      } else { var g2 = h('div', { class: 'dgrid' }); list.forEach(function (d, i) { g2.appendChild(destCard(d, i)); }); body.appendChild(g2); }
      var tk = Object.keys(TUT); if (tk.length) body.appendChild(h('div', { class: 'card ttuts' }, [h('h3', null, ['Tutores']), h('div', { class: 'tlist' }, tk.map(function (k2) {
        var n = DEST.filter(function (d) { return d.tutor === k2; }).length;
        return h('button', { class: 'dtutor', on: { click: function () { openTutor(k2); } } }, [tutAvatar(k2), h('span', null, [h('b', null, [TUT[k2].n]), h('small', null, [n + ' build' + (n === 1 ? '' : 's')])])]);
      }))]));
    }
    q.addEventListener('input', fill);
    t.appendChild(h('div', { class: 'tbar' }, [q, bar])); t.appendChild(body); drawBar(); fill();
  }
  function tutCount(cls) { return DEST.filter(function (d) { return d.cls === cls; }).length; }

  // ---------- início ----------
  function init() {
    var m = location.hash.match(/#b=([^&]+)/);
    try { b = m ? ensure(fromCode(decodeURIComponent(m[1]))) : load(); } catch (e) { b = load(); }
    try { var cid = localStorage.getItem(CUR), e = cid && libGet()[cid]; if (e) { curId = cid; savedSnap = JSON.stringify(ensure(e.b)); } } catch (x) { }
    initHeader(); syncHeader(); recompute(); drawStats(); drawTab(); updateState();
  }
  init();
})();
