// Bônus aleatórios do YggIdle — fonte: wiki.yggidle.com.br/wiki/sistemas/bonus-aleatorios (09/11/2026)
// range = [Incomum, Raro, Épico, Lendário, Mítico], cada um [mín, máx] (valor base, tier 1)
window.YGG = window.YGG || {};
YGG.bonus = {
  tierMult: { 1: 1, 2: 2, 3: 2.2, 4: 2.4, 5: 2.4 },
  rarities: [
    { id: 0, n: 'Comum',    color: '#9aa3b2', min: 0, max: 0, dim: 1, rem: 1 },
    { id: 1, n: 'Incomum',  color: '#4ec27a', min: 1, max: 1, dim: 1, rem: 1 },
    { id: 2, n: 'Raro',     color: '#4aa3ff', min: 1, max: 2, dim: 1, rem: 1 },
    { id: 3, n: 'Épico',    color: '#b672ff', min: 2, max: 3, dim: 1, rem: 1 },
    { id: 4, n: 'Lendário', color: '#ffb23d', min: 3, max: 4, dim: 2, rem: 2 },
    { id: 5, n: 'Mítico',   color: '#ff5d6c', min: 4, max: 4, dim: 2, rem: 2 }
  ],
  // fonte de raridade -> chances por raridade (Comum..Mítico), %
  dropRates: {
    'Monstro comum': [60, 25, 15, 0, 0, 0],
    'Mini-boss': [59.9, 24.96, 14.82, 0.2, 0.1, 0.02],
    'MVP': [59.81, 24.92, 14.79, 0.3, 0.15, 0.03],
    'Exclusivo de covil': [0, 0, 70, 20, 8, 2],
    'Exclusivo da Chefenia': [60, 30, 10, 0, 0, 0]
  },
  families: { p: 'Física', m: 'Mágica', n: 'Neutra' },
  // key: chave do motor de stats; param: tipo do parâmetro extra (race|ele|attr|nb)
  types: [
    // Físicos
    { id: 'atk',        f: 'p', n: 'Ataque',                               key: 'atk',        r: [[5,19],[10,29],[19,38],[29,48],[29,55]] },
    { id: 'hit',        f: 'p', n: 'Precisão',                             key: 'hit',        r: [[2,10],[5,14],[10,19],[14,24],[14,26]] },
    { id: 'dmgMelee',   f: 'p', n: 'Dano corpo a corpo %',                 key: 'dmgMelee',   r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1 },
    { id: 'dmgRanged',  f: 'p', n: 'Dano à distância %',                   key: 'dmgRanged',  r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1 },
    { id: 'pNB',        f: 'p', n: 'Dano físico contra Normal ou Chefe %', key: 'dmgNB:Phys', r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1, param: 'nb' },
    { id: 'pRace',      f: 'p', n: 'Dano físico contra uma raça %',        key: 'dmgRace:*:Phys', r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1, param: 'race' },
    { id: 'pEle',       f: 'p', n: 'Dano físico contra um elemento %',     key: 'dmgEle:*:Phys',  r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1, param: 'ele' },
    { id: 'aspdPct',    f: 'p', n: 'Velocidade de ataque %',               key: 'aspdPct',    r: [[2,5],[5,7],[7,12],[10,14],[10,17]], pct: 1 },
    { id: 'aspd',       f: 'p', n: 'Velocidade de ataque (pontos)',        key: 'aspd',       r: [null,null,[1,1],[1,2],[2,2]], noScale: 1 },
    { id: 'critPct',    f: 'p', n: 'Chance de crítico %',                  key: 'critPct',    r: [[2,5],[5,7],[7,12],[10,14],[10,17]], pct: 1 },
    { id: 'critDmg',    f: 'p', n: 'Dano crítico %',                       key: 'critDmg',    r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1 },
    { id: 'ignDefNB',   f: 'p', n: 'Ignorar Defesa de Normal ou Chefe %',  key: 'ignDef:*',   r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1, param: 'nb' },
    { id: 'ignDefAll',  f: 'p', n: 'Ignorar Defesa de qualquer alvo %',    key: 'ignDef:all', r: [[2,5],[5,7],[7,12],[10,14],[10,17]], pct: 1 },
    { id: 'perfHit',    f: 'p', n: 'Precisão Perfeita %',                  key: 'perfHit',    r: [null,null,null,[2,2],[5,5]], pct: 1, noScale: 1 },
    // Mágicos
    { id: 'matk',       f: 'm', n: 'Ataque mágico',                        key: 'matk',       r: [[5,19],[10,29],[19,38],[29,48],[29,55]] },
    { id: 'dmgMagic',   f: 'm', n: 'Dano mágico %',                        key: 'dmgMagic',   r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1 },
    { id: 'mNB',        f: 'm', n: 'Dano mágico contra Normal ou Chefe %', key: 'dmgNB:Magic', r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1, param: 'nb' },
    { id: 'mRace',      f: 'm', n: 'Dano mágico contra uma raça %',        key: 'dmgRace:*:Magic', r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1, param: 'race' },
    { id: 'mEle',       f: 'm', n: 'Dano mágico contra um elemento %',     key: 'dmgEle:*:Magic',  r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1, param: 'ele' },
    { id: 'castVar',    f: 'm', n: 'Redução de conjuração %',              key: 'castVar',    r: [[2,5],[5,10],[7,14],[12,19],[12,22]], pct: 1, neg: 1 },
    { id: 'ignMdefNB',  f: 'm', n: 'Ignorar Defesa Mágica de Normal ou Chefe %', key: 'ignMdef:*', r: [[2,7],[5,12],[10,19],[17,29],[22,34]], pct: 1, param: 'nb' },
    { id: 'ignMdefAll', f: 'm', n: 'Ignorar Defesa Mágica de qualquer alvo %',   key: 'ignMdef:all', r: [[2,5],[5,7],[7,12],[10,14],[10,17]], pct: 1 },
    { id: 'uninterr',   f: 'm', n: 'Conjuração ininterrompível',           key: 'uninterrupt', r: [null,null,null,[1,1],[1,1]], noScale: 1 },
    // Neutros
    { id: 'attr',       f: 'n', n: 'Atributo (FOR/AGI/VIT/INT/DES/SOR)',   key: '*',          r: [[2,5],[2,7],[5,10],[7,12],[7,14]], param: 'attr' },
    { id: 'hp',         f: 'n', n: 'HP máximo',                            key: 'hp',         r: [[96,384],[192,576],[384,768],[576,960],[576,1080]] },
    { id: 'def',        f: 'n', n: 'Defesa',                               key: 'def',        r: [[5,19],[10,29],[19,38],[29,48],[29,55]] },
    { id: 'mdef',       f: 'n', n: 'Defesa mágica',                        key: 'mdef',       r: [[5,19],[10,29],[19,38],[29,48],[29,55]] },
    { id: 'resEle',     f: 'n', n: 'Resistência a um elemento %',          key: 'resEle:*',   r: [[5,12],[10,19],[17,29],[26,38],[26,43]], pct: 1, param: 'ele' },
    { id: 'afterCast',  f: 'n', n: 'Pós-conjuração % (elmo do meio, armadura, acessório)', key: 'afterCast', r: [[1,1],[1,2],[2,3],[3,4],[3,5]], pct: 1, noScale: 1, neg: 1, slots: ['headM', 'body', 'acc'] }
  ],
  races: ['Amorfo', 'Morto-vivo', 'Bruto', 'Planta', 'Inseto', 'Peixe', 'Demônio', 'Humanoide', 'Anjo', 'Dragão'],
  eles: ['Neutro', 'Água', 'Terra', 'Fogo', 'Vento', 'Veneno', 'Sagrado', 'Sombrio', 'Fantasma', 'Maldito'],
  sizes: ['Pequeno', 'Médio', 'Grande']
};
