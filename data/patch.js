window.YGG = window.YGG || {};
/* Correções manuais por cima dos dados gerados (wiki e cliente do jogo).
   Fica num arquivo próprio para não se perder quando items.js / citems.js / caos.js forem gerados de novo.
   Cada entrada substitui só os campos indicados do item (null apaga o campo). */
(function (Y) {
  var FIS = 'Ao realizar ataques físicos, básicos ou de habilidade';
  function proc(t) { return { c: { proc: FIS }, t: t }; }

  // ---------- itens (atualização do YggIdle de 25/11/2026) ----------
  var P = {
    // Carta Cabra Macho (normal e Selada): agora na Capa; o bônus por refino usa o refino da Capa (até +10)
    27175: { s: 'cloak', fx: [{ c: null, s: { 'resEle:Neutro': 10 } }, { c: { every: 1, cap: 10 }, s: { hpPct: 1, 'resEle:Neutro': 2 } }] },
    1280205: { s: 'cloak', fx: [{ c: null, s: { 'resEle:Neutro': 5 } }, { c: { every: 1, cap: 10 }, s: { 'resEle:Neutro': 1 } }] },
    // Anel do Vulcão reformulado
    2957: { sl: 1, j: null, fx: [{ c: null, s: { atk: 20 } }, { c: null, s: { allStats: 5 } }, { c: null, s: { 'resEle:Fogo': 10 } },
      proc('9% de chance de autoconjurar [Bolas de Fogo] nv. 10.'), proc('3% de chance de autoconjurar [Zen] nv. 1.'),
      proc('3% de chance de autoconjurar [Gloria Domini] nv. 5.'), proc('2% de chance de autoconjurar [Lâminas Destruidoras] nv. 5.'),
      proc('1% de chance de autoconjurar [Fúria Interior] nv. 1.'),
      // conjunto dos anéis (substitui os efeitos antigos)
      { c: { set: [['Anel da Vibração']] }, t: 'Conjunto com Anel da Vibração, ao realizar ataques físicos (básicos ou de habilidade): 5% de chance de autoconjurar [Brandir Machado] nv. 5.' },
      { c: { set: [['Anel da Vibração']] }, t: 'Conjunto com Anel da Vibração, ao realizar ataques físicos (básicos ou de habilidade): 2% de chance de autoconjurar [Lex Aeterna] nv. 1.' },
      { c: { set: [['Anel da Vibração']] }, t: 'Conjunto com Anel da Vibração, ao realizar ataques físicos (básicos ou de habilidade): 2% de chance de autoconjurar [Campo Gravitacional] nv. 5.' }] },
    // Anel da Vibração: DEF 2 → 0; agora ativa ao atacar (antes: ao receber ataques)
    2958: { sl: 1, j: null, d: 0, fx: [{ c: null, s: { matk: 20 } }, { c: null, s: { allStats: 5 } }, { c: null, s: { mdef: 2 } },
      proc('5% de chance de autoconjurar [Fúria da Terra] nv. 5.'), proc('3% de chance de autoconjurar [Curar] nv. 10.'),
      proc('2% de chance de autoconjurar [Explosão Tóxica] nv. 10.'), proc('2% de chance de autoconjurar [Assumptio] nv. 3.'),
      proc('1% de chance de autoconjurar [Destino nas Cartas] nv. 5. Por este anel, Sono e Incêndio também funcionam em chefes.')] },
    // Carta General Tartaruga Selada: o autoconjurar agora também vale para habilidades físicas
    4494: { fx: [{ c: null, s: { dmgPhys: 10 } }, { c: { r: 15 }, s: { dmgPhys: 5 } }, proc('1,5% de chance de autoconjurar [Impacto Explosivo] nv. 10.')] },
    // Carta Geodoliant: só no Acessório Direito; 7% de Onda Psíquica nv. 2 (conjunto com Ungoliant igual)
    300006: { only: 'accR', fx: [proc('7% de chance de autoconjurar [Onda Psíquica] nv. 2.'), { c: { set: [['Carta Ungoliant']] }, s: { 'dmgEle:Neutro:Magic': 30 } }] },
    // Carta General das Almas: descrição corrigida
    1280217: { fx: [{ c: { proc: 'Ao usar Kaupe' }, t: '10% de chance de dano mágico +20% por 5 segundos.' }] },
    // Carta Ascensão de LHZ: RES, MRES e Talentos só no Inferno
    1280202: { fx: [{ c: null, s: { hpPct: 10 } }, { c: null, s: { spPct: 10 } }, { c: null, s: { dmgBoth: 5 } },
      { c: { zone2: 'inferno', zone: 'Só no Inferno' }, s: { res: 10 } }, { c: { zone2: 'inferno', zone: 'Só no Inferno' }, s: { mres: 10 } }, { c: { zone2: 'inferno', zone: 'Só no Inferno' }, s: { allTraits: 10 } }] }
  };
  (Y.items || []).forEach(function (it) {
    var p = P[it.id]; if (!p) return;
    Object.keys(p).forEach(function (k) { if (p[k] === null) delete it[k]; else it[k] = p[k]; });
  });

  // ---------- habilidades que faltavam no catálogo (concedidas pela Ascensão da Cigana) ----------
  var SKD = Y.skd = Y.skd || {};
  SKD.WM_LESSON = SKD.WM_LESSON || { n: 'Domínio Musical', i: 2412, t: 'Passiva', d: 'Aumenta o SP máx. e a regeneração de SP a cada 10 segundos enquanto imóvel.', c: ['SP máx.', 'Regen. de SP'],
    l: [['+30', '6'], ['+60', '9'], ['+90', '12'], ['+120', '15'], ['+150', '18'], ['+180', '21'], ['+200', '24'], ['+240', '27'], ['+270', '30'], ['+300', '33']], sp: '0' };
  SKD.WA_SWING_DANCE = SKD.WA_SWING_DANCE || { n: 'Ritmo Contagiante', i: 2350, t: 'Suporte', d: 'Apenas Chicotes.\nAumenta a velocidade de ataque, movimento e reduz o tempo de conjuração fixa. Dura 180 segundos e afeta membros do grupo em 31x31 células ao redor da usuária. O bônus é afetado por [Domínio Musical].', c: ['Vel. Atq.', 'Conj. fixa'],
    l: [['+5%', '-6%'], ['+10%', '-12%'], ['+15%', '-18%'], ['+20%', '-24%'], ['+25%', '-30%']] };
  // Destino nas Cartas reformulado (Menestrel e Cigana, inclusive pelos itens)
  if (SKD.CG_TAROTCARD) SKD.CG_TAROTCARD.d = 'Sorteia 1 de 14 cartas de tarô no alvo: Os Enamorados, A Papisa, O Louco, O Mago, A Força, O Sol, A Temperança, O Carro, O Enforcado, A Morte, A Estrela, A Torre, A Roda da Fortuna e O Diabo.\n' +
    'Só uma carta fica ativa por vez: uma nova só sai quando o efeito da anterior termina.\n' +
    'Ativado pela Ascensão da Cigana ou pelo Anel da Vibração, também aplica Sono e Incêndio em chefes (manual ou por outros itens, não).';

  // ---------- Árvore do Caos: Ascensão Ying da Cigana, Nós I a IV liberados ----------
  var CA = Y.caos;
  if (CA) {
    CA.mec = CA.mec || {};
    CA.mec[900] = ['TEXTO', '{texto}', ''];
    (CA.asc || []).forEach(function (F) {
      if (F.k !== 'GYPSY' || !F.l || !F.l.ying) return;
      var Y4 = F.l.ying;
      Y4[0] = { e: [], m: [{ mecanica: 1, skill: 2412, nivel: 10 }], a: 0 };
      Y4[1] = { e: [[39, 15]], m: [{ mecanica: 1, skill: 2350, nivel: 5 }], a: 0 };
      Y4[2] = { e: [], m: [{ mecanica: 900, texto: 'Ao usar habilidades mágicas: 5% de chance de lançar Destino nas Cartas no nível 3 ou no nível aprendido (vale o maior). Por essa via, Sono e Incêndio também funcionam em chefes' }], a: 0 };
      Y4[3] = { e: [[18, 15], [41, 10]], m: [], a: 0 };
    });
  }
})(window.YGG);
