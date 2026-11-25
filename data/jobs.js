// Classes e habilidades (curadoria aproximada baseada no rAthena Renewal; edite os multiplicadores na aba Habilidades).
// Habilidade: k 'p' físico | 'm' mágico | 'b' buff. m = % por nível (array) ou [base, porNível]. h = golpes; a = alvos máx. atingidos (área);
// r 'm' corpo a corpo | 'r' distância; sp, c (conj. variável s), fc (conj. fixa s), d (atraso pós-conj. s), cd (recarga s); w = armas exigidas; cr = pode crítico; e = elemento (''=arma).
window.YGG = window.YGG || {};
(function () {
  var lin = function (b, p) { return [b, p]; };
  var S = {};
  function P(id, n, max, m, o) { S[id] = Object.assign({ id: id, n: n, max: max, k: 'p', m: m, h: 1, a: 1, r: 'm', sp: [10, 0], c: [0, 0], fc: 0, d: 0.5, cd: 0, e: '', cr: 0 }, o || {}); }
  function M(id, n, max, m, o) { S[id] = Object.assign({ id: id, n: n, max: max, k: 'm', m: m, h: 1, a: 1, r: 'r', sp: [20, 0], c: [1, 0], fc: 0, d: 1, cd: 0, e: 'Neutro' }, o || {}); }
  function B(id, n, max, fx, o) { S[id] = Object.assign({ id: id, n: n, max: max, k: 'b', fx: fx }, o || {}); }

  // ---- Espadachim
  P('bash', 'Golpe Fulminante (Bash)', 10, lin(100, 30), { sp: [8, 0], cr: 1, d: 0.7 });
  P('magnum', 'Impacto Flamejante (Magnum Break)', 10, lin(100, 20), { a: 9, e: 'Fogo', sp: [30, 0], d: 1 });
  B('endure', 'Resistência (Endure)', 10, function (l) { return { mdef: l }; });
  P('bowling', 'Impacto de Tyr (Bowling Bash)', 10, lin(100, 40), { h: 2, a: 5, sp: [13, 0], w: ['1hSword', '2hSword'], cr: 1, d: 0.8 });
  P('pierce', 'Perfurar (Pierce)', 10, lin(100, 10), { h: 2, w: ['1hSpear', '2hSpear'], sp: [7, 0] });
  P('spiral', 'Perfurar em Espiral (Spiral Pierce)', 5, lin(150, 150), { h: 5, w: ['1hSpear', '2hSpear'], sp: [9, 0], d: 0.6, cr: 0 });
  P('brandish', 'Brandir Lança (Brandish Spear)', 10, lin(100, 40), { a: 9, w: ['1hSpear', '2hSpear'], sp: [12, 0] });
  P('boomerang', 'Bumerangue de Lança (Spear Boomerang)', 5, lin(100, 50), { r: 'r', w: ['1hSpear', '2hSpear'], sp: [10, 0] });
  P('charge', 'Avanço Ofensivo (Charge Attack)', 5, lin(300, 0), { r: 'r', cd: 1.5, sp: [15, 0] });
  P('sonicwave', 'Onda de Choque (Shockwave)', 5, lin(100, 50), { r: 'r', a: 3, sp: [10, 0] });
  B('twohand', 'Rapidez com Duas Mãos (Two-Hand Quicken)', 10, function (l) { return { aspdPct: 30 }; });
  B('aura', 'Lâmina de Aura (Aura Blade)', 5, function (l) { return { atk: l * 20 + 20 }; });
  B('berserk', 'Frenesi (Berserk)', 1, function () { return { atkPct: 200, hpPct: 50, aspdPct: 30, fleePct: -20, defPct: -20, mdefPct: -20 }; });
  B('parry', 'Aparar Golpe (Parry)', 10, function (l) { return {}; });
  P('pressure', 'Gloria Domini (Pressure)', 5, lin(500, 0), { r: 'r', a: 5, sp: [20, 0], cd: 1, w: ['1hSpear', '2hSpear', '1hSword', '2hSword'] });
  P('holycross', 'Crux Divinum (Holy Cross)', 10, lin(135, 0), { h: 2, e: 'Sagrado', sp: [11, 0], w: ['1hSpear', '2hSpear', '1hSword', '2hSword'], cr: 0 });
  P('grandcross', 'Crux Magnum (Grand Cross)', 10, lin(300, 0), { a: 9, e: 'Sagrado', sp: [37, 0], d: 1.5, c: [1.5, 0] });
  P('shieldboom', 'Bumerangue de Escudo (Shield Boomerang)', 5, lin(100, 40), { r: 'r', sp: [12, 0] });
  P('shieldchain', 'Corrente de Escudo (Shield Chain)', 5, lin(300, 100), { h: 5, r: 'r', sp: [18, 0] });
  P('overbrand', 'Disparo Perfurante (Overbrand)', 5, lin(140, 140), { r: 'r', a: 5, w: ['1hSpear', '2hSpear'], sp: [9, 0] });
  P('dragonbreath', 'Ignição Rúnica (Ignition Break)', 5, lin(300, 250), { a: 9, e: 'Fogo', sp: [30, 0], d: 1.5 });
  P('hundredspear', 'Centena de Lanças (Hundred Spear)', 10, lin(500, 100), { a: 5, r: 'r', w: ['2hSpear'], sp: [30, 0], d: 1.2, cd: 2 });
  // ---- Mago
  M('firebolt', 'Lança de Fogo (Fire Bolt)', 10, lin(100, 0), { h: 1, e: 'Fogo', sp: [12, 0], hl: 'lv' });
  M('coldbolt', 'Lança de Gelo (Cold Bolt)', 10, lin(100, 0), { e: 'Água', sp: [12, 0], hl: 'lv' });
  M('lightning', 'Relâmpago (Lightning Bolt)', 10, lin(100, 0), { e: 'Vento', sp: [12, 0], hl: 'lv' });
  M('soulstrike', 'Ataque Espiritual (Soul Strike)', 10, lin(100, 0), { e: 'Fantasma', sp: [18, 0], hl: 'half', a: 1 });
  M('napalm', 'Napalm Beat', 10, lin(80, 10), { e: 'Fantasma', a: 5, sp: [9, 0], c: [1, 0] });
  M('thunderstorm', 'Tempestade de Raios (Thunder Storm)', 10, lin(80, 0), { a: 9, e: 'Vento', sp: [29, 0], hl: 'lv', c: [1, 0] });
  M('firewall', 'Muralha de Fogo (Fire Wall)', 10, lin(50, 0), { a: 3, e: 'Fogo', sp: [40, 0] });
  M('frostdiver', 'Mergulho Gélido (Frost Diver)', 10, lin(110, 10), { e: 'Água', sp: [25, 0], c: [0.8, 0] });
  M('firebolt2', 'Tempestade de Meteoros (Meteor Storm)', 10, lin(125, 0), { a: 7, e: 'Fogo', hl: 'meteor', sp: [20, 0], c: [3, 0], d: 2 });
  M('lov', 'Louvor de Odin (Lord of Vermilion)', 10, lin(100, 20), { a: 9, e: 'Vento', sp: [64, 0], hl: 'lv4', c: [4, 0], d: 3 });
  M('stormgust', 'Rajada de Gelo (Storm Gust)', 10, lin(140, 40), { a: 9, e: 'Água', sp: [78, 0], hl: 'lv', c: [4, 0], d: 4 });
  M('jt', 'Tempestade de Jupiter (Jupitel Thunder)', 10, lin(100, 0), { a: 3, e: 'Vento', hl: 'lv', sp: [20, 0], c: [3, 0] });
  M('fireball', 'Bola de Fogo (Fire Ball)', 10, lin(100, 20), { a: 5, e: 'Fogo', sp: [20, 0], c: [1.5, 0] });
  M('wom', 'Bola de Fogo Gigante (Earth Spike)', 10, lin(100, 0), { e: 'Terra', hl: 'lv', sp: [12, 0] });
  M('hwind', 'Vento Sagrado (Heaven\'s Drive)', 10, lin(100, 0), { a: 5, e: 'Terra', hl: 'lv', sp: [28, 0], c: [1, 0] });
  M('magicnuke', 'Explosão Mágica (Psychic Wave)', 5, lin(300, 100), { a: 5, e: 'Neutro', sp: [32, 0], c: [1.5, 0] });
  M('soulburn', 'Bola de Fogo Anímica (Soul Expansion)', 5, lin(200, 100), { e: 'Fantasma', sp: [30, 0], c: [1, 0] });
  B('amp', 'Amplificação Mística (Mystical Amplification)', 10, function (l) { return { matkPct: 5 * l }; });
  B('sight', 'Concentração (Energy Coat)', 5, function (l) { return {}; });
  // ---- Arqueiro
  P('ds', 'Disparo Triplo (Double Strafe)', 10, lin(100, 10), { h: 2, r: 'r', sp: [12, 0], w: ['Bow'], cr: 1, d: 0.3 });
  P('shower', 'Chuva de Flechas (Arrow Shower)', 10, lin(100, 5), { r: 'r', a: 9, sp: [15, 0], w: ['Bow'], d: 0.5 });
  P('charge2', 'Disparo Perfeito (Focused Arrow Strike)', 5, lin(450, 100), { r: 'r', sp: [25, 0], w: ['Bow'], c: [1.5, 0], cr: 1 });
  P('sharp', 'Rajada Certeira (Sharpshooting)', 5, lin(300, 50), { r: 'r', sp: [18, 0], w: ['Bow'], cr: 1, a: 3 });
  P('blitz', 'Golpe do Falcão (Blitz Beat)', 5, lin(150, 100), { r: 'r', e: 'Neutro', sp: [10, 0], a: 3, hl: 'blitz' });
  P('phantasmic', 'Flecha Fantasma (Phantasmic Arrow)', 1, lin(150, 0), { r: 'r', sp: [10, 0], w: ['Bow'], a: 3 });
  P('aimed', 'Tiro Preciso (Aimed Bolt)', 10, lin(100, 30), { r: 'r', h: 2, sp: [15, 0], w: ['Bow'] });
  P('arrowstorm', 'Tempestade de Flechas (Arrow Storm)', 10, lin(500, 100), { r: 'r', a: 9, sp: [40, 0], w: ['Bow'], c: [1, 0], d: 1.5 });
  P('musical', 'Golpe Musical (Musical Strike)', 5, lin(150, 50), { r: 'r', h: 2, sp: [12, 0], w: ['Musical', 'Whip'] });
  P('slinging', 'Ataque Dissonante (Dissonance)', 5, lin(60, 20), { a: 9, r: 'r', e: 'Neutro', sp: [18, 0], hl: 'lv' });
  B('twilight', 'Concentração (Attention Concentrate)', 10, function (l) { return { hit: 2 * l, aspdPct: 0, defPct: -(5 + l) }; });
  B('impos', 'Poção do Falcão (Wind Walk)', 10, function (l) { return { flee: l * 3 }; });
  // ---- Noviço
  M('holylight', 'Luz Divina (Holy Light)', 1, lin(125, 0), { e: 'Sagrado', sp: [15, 0], c: [2, 0] });
  M('turn', 'Expulsar Mortos-vivos (Turn Undead)', 10, lin(100, 0), { e: 'Sagrado', sp: [40, 0], c: [1, 0], tu: 1 });
  M('magnus', 'Magnus Exorcismus', 10, lin(100, 0), { h: 2, a: 9, e: 'Sagrado', sp: [40, 0], c: [4, 0], d: 4, hl: 'lv' });
  // YggIdle: Judex vai até o Nv 5 (1.320% a 3.000% de ATQM, área 5x5, 42 SP no Nv 5)
  M('judex', 'Judex', 5, lin(900, 420), { a: 25, e: 'Sagrado', sp: [30, 0], spl: [20, 23, 26, 29, 42], c: [2, 0] });
  // Adoramus: só por item/Ascensão; SP do YggIdle 8 a 35
  M('adoramus', 'Adoramus', 10, lin(300, 250), { h: 1, a: 49, e: 'Sagrado', sp: [5, 3], c: [1.5, 0], d: 2 });
  P('fingeroff', 'Ataque Rápido do Dedo (Finger Offensive)', 5, lin(150, 50), { ae: 'MO_FINGEROFFENSIVE', h: 5, r: 'r', sp: [10, 0], w: ['Fist', 'Knuckle'] });
  P('investigate', 'Investigar (Investigate)', 5, lin(100, 100), { e: '', sp: [10, 0], w: ['Fist', 'Knuckle'], di: 1 });
  P('tigerfist', 'Punho de Tigre (Tiger Knuckle)', 5, lin(100, 100), { h: 2, w: ['Fist', 'Knuckle'], sp: [15, 0] });
  P('cp', 'Golpe de Esfera (Asura Strike)', 5, lin(800, 0), { e: '', sp: [200, 0], c: [3, 0], d: 3.5, asura: 1, cd: 0 });
  P('chain', 'Combo em Cadeia (Chain Crush Combo)', 5, lin(400, 100), { h: 2, w: ['Fist', 'Knuckle'], sp: [14, 0], cr: 1 });
  P('exp', 'Explosão da Esfera (Occult Impaction)', 5, lin(250, 50), { r: 'r', sp: [10, 0], di: 1 });
  B('bless', 'Bênção (Blessing)', 10, function (l) { return { str: l, int: l, dex: l }; });
  B('agiup', 'Aumentar Agilidade (Increase AGI)', 10, function (l) { return { agi: 2 + l }; });
  B('gloria', 'Gloria (Gloria)', 5, function (l) { return { luk: 30 }; });
  B('impositio', 'Impositio Manus', 5, function (l) { return { atk: l * 5 }; });
  B('suffragium', 'Suffragium', 3, function (l) { return { castVar: -15 * l }; });
  B('spirit', 'Esfera Espiritual (Spirit Sphere)', 5, function (l) { return { atk: 3 * l }; });
  // ---- Mercador
  P('mammonite', 'Mammonita (Mammonite)', 10, lin(100, 50), { sp: [5, 0], cr: 1, d: 0.5 });
  P('cartrev', 'Revolução do Carrinho (Cart Revolution)', 1, lin(150, 0), { a: 5, sp: [12, 0], e: 'Neutro' });
  P('axeboom', 'Arremesso de Machado (Axe Boomerang)', 5, lin(250, 50), { r: 'r', w: ['1hAxe', '2hAxe'], sp: [10, 0] });
  P('hammerfall', 'Queda de Martelo (Hammer Fall)', 5, lin(300, 100), { a: 5, w: ['1hAxe', '2hAxe', 'Mace', '2hMace'], sp: [15, 0] });
  P('cartcannon', 'Canhão de Carrinho (Cart Cannon)', 5, lin(250, 50), { r: 'r', a: 5, sp: [18, 0], e: 'Neutro' });
  P('maximize', 'Golpe Devastador (Skull Crush)', 5, lin(300, 100), { sp: [20, 0], w: ['1hAxe', '2hAxe', 'Mace', '2hMace'], cr: 1 });
  P('acidterror', 'Terror Ácido (Acid Terror)', 5, lin(200, 40), { r: 'r', sp: [15, 0], di: 1, e: 'Neutro' });
  P('demonstration', 'Demonstração (Acid Demonstration)', 10, lin(200, 100), { r: 'r', sp: [20, 0], di: 1, e: 'Neutro', cd: 0 });
  P('crazyuproar', 'Dano de Fogo Alquímico (Fire Bottle)', 10, lin(150, 50), { r: 'r', sp: [20, 0], e: 'Fogo', a: 3 });
  B('overthrust', 'Impulso (Overthrust)', 5, function (l) { return { atkPct: 5 * l }; });
  B('weaponperf', 'Aprimorar Arma (Weapon Perfection)', 5, function (l) { return {}; });
  B('crazywind', 'Frenesi Alquímico (Pitching)', 5, function (l) { return { atk: 10 * l }; });
  // ---- Gatuno
  P('sonicblow', 'Golpe Sônico (Sonic Blow)', 10, lin(300, 50), { h: 8, w: ['Katar', 'Dagger'], sp: [16, 0], cr: 1, d: 2, cd: 1 });
  P('grimtooth', 'Dente do Sombrio (Grimtooth)', 5, lin(100, 20), { a: 3, r: 'r', sp: [3, 0], w: ['Katar', 'Dagger'], d: 0.5 });
  P('cross', 'Cruz de Veneno (Cross Impact)', 5, lin(450, 50), { h: 3, sp: [20, 0], w: ['Katar', 'Dagger'], cr: 1 });
  P('meteor', 'Tempestade de Meteoros (Meteor Assault)', 10, lin(200, 40), { a: 9, e: 'Neutro', sp: [20, 0], d: 1 });
  P('backstab', 'Golpe nas Costas (Back Stab)', 10, lin(200, 40), { h: 2, w: ['Dagger'], sp: [16, 0], cr: 1 });
  P('raid', 'Ataque Surpresa (Sightless Mind)', 5, lin(250, 50), { a: 9, sp: [10, 0], e: 'Neutro' });
  P('envenom', 'Envenenar (Envenom)', 10, lin(100, 15), { sp: [12, 0], e: 'Veneno' });
  P('tripleattack', 'Ataque Triplo (Triple Attack)', 5, lin(300, 50), { h: 3, w: ['Dagger', 'Katar', '1hSword'], sp: [10, 0], r: 'r', cr: 1 });
  B('epiclesis', 'Concentração (Cloaking)', 5, function (l) { return {}; });
  // ---- Justiceiro
  P('triple', 'Disparo Triplo (Triple Action)', 5, lin(500, 0), { h: 3, r: 'r', sp: [10, 0], w: ['Revolver', 'Rifle', 'Gatling', 'Shotgun', 'Grenade'] });
  P('fullblast', 'Rajada de Tiros (Full Blast)', 10, lin(400, 100), { h: 4, a: 3, r: 'r', sp: [28, 0], w: ['Gatling'] });
  P('desperado', 'Desperado', 10, lin(100, 50), { h: 10, a: 9, r: 'r', sp: [30, 0], w: ['Revolver'], d: 2 });
  P('crowdfire', 'Fogo de Barragem (Crowd Fire)', 10, lin(300, 50), { h: 2, a: 5, r: 'r', sp: [20, 0], w: ['Shotgun'] });
  P('spread', 'Tiro Espalhado (Spread Attack)', 10, lin(200, 50), { a: 5, r: 'r', sp: [20, 0], w: ['Shotgun'] });
  P('tracking', 'Rastreamento (Tracking)', 10, lin(300, 100), { r: 'r', sp: [20, 0], c: [2, 0], w: ['Rifle'], cr: 1 });
  P('grenade', 'Granada Explosiva (Hell\'s Plant)', 5, lin(300, 100), { a: 9, r: 'r', sp: [30, 0], w: ['Grenade'], e: 'Neutro' });
  B('madness', 'Concentração (Increase Accuracy)', 10, function (l) { return { hit: 20 + l * 3, agi: l }; });
  // ---- Ninja
  M('kunai', 'Kunai Explosiva (Explosive Kunai)', 10, lin(150, 50), { a: 5, e: 'Neutro', sp: [20, 0], c: [0.5, 0] });
  M('katon', 'Pétalas Flamejantes (Flaming Petals)', 10, lin(100, 0), { e: 'Fogo', hl: 'lv', sp: [10, 0], c: [0.5, 0] });
  M('hyou', 'Lança Congelante (Frozen Spear)', 10, lin(100, 0), { e: 'Água', hl: 'lv', sp: [10, 0], c: [0.5, 0] });
  M('windblade', 'Lâmina de Vento (Wind Blade)', 10, lin(100, 0), { e: 'Vento', hl: 'lv', sp: [10, 0], c: [0.5, 0] });
  M('dragonfire', 'Dragão de Fogo (Dragon Flame)', 10, lin(200, 100), { a: 9, e: 'Fogo', sp: [40, 0], c: [2, 0], d: 1.5 });
  P('throwshuriken', 'Arremesso de Shuriken (Throw Shuriken)', 10, lin(100, 20), { r: 'r', sp: [3, 0], w: ['Fist', 'Huuma', 'Dagger'] });
  P('huuma', 'Huuma Shuriken Gigante (Huuma Giant Shuriken)', 5, lin(150, 150), { a: 9, r: 'r', sp: [20, 0], w: ['Huuma'], d: 1 });
  P('ninjaclose', 'Golpe da Sombra (Shadow Slash)', 5, lin(300, 100), { h: 2, sp: [15, 0], w: ['Dagger', 'Huuma'], cr: 1 });
  // ---- Taekwon
  P('tornado', 'Chute Giratório (Tornado Kick)', 5, lin(300, 100), { a: 5, sp: [10, 0], w: ['Fist'], d: 0.5 });
  P('dodge', 'Chute Esquivo (Rising Dragon)', 5, lin(250, 100), { sp: [10, 0], w: ['Fist'], cr: 1 });
  P('heel', 'Chute de Calcanhar (Heel Drop)', 5, lin(300, 100), { sp: [15, 0], w: ['Fist'], cr: 1 });
  P('counter', 'Contra-Ataque (Counter Kick)', 5, lin(300, 90), { sp: [10, 0], w: ['Fist'], cr: 1, a: 3 });
  P('stargaze', 'Chute Estelar (Comet Kick)', 5, lin(350, 150), { a: 5, sp: [18, 0], w: ['Fist'] });
  M('soullinker', 'Espírito da Alma (Spirit of the Soul)', 5, lin(250, 150), { a: 3, e: 'Neutro', sp: [20, 0], c: [1, 0] });
  M('kaupe', 'Raio da Estrela (Star Ray)', 5, lin(300, 100), { a: 5, e: 'Neutro', sp: [30, 0], c: [2, 0] });
  // ---- Aprendiz
  B('firstaid', 'Primeiros Socorros (First Aid)', 1, function () { return {}; });

  // ---- Concedidas por equipamentos ou pela Árvore do Caos (não são da árvore de nenhuma classe do planner)
  // ae = nome AEGIS (liga ao item que concede); bl = dano × nível de base / 100; si = +% de ATQM/ATQ por ponto de INT.
  // Fórmulas da descrição do YggIdle/cliente; onde ela não dá o número, rAthena Renewal.
  M('reverb', 'Ressonância (Reverberation)', 5, lin(700, 300), { ae: 'WM_REVERBERATION', a: 9, bl: 1, e: '', w: ['Whip', 'Musical'], sp: [24, 4], c: [1, 0], d: 1 });
  M('crimson', 'Meteoro Escarlate (Crimson Rock)', 5, lin(700, 600), { ae: 'WL_CRIMSONROCK', a: 9, bl: 1, e: 'Fogo', sp: [50, 10], c: [3, 0], fc: 0.5, d: 0.5, cd: 5 });
  M('pwave', 'Onda Psíquica (Psychic Wave)', 5, lin(0, 70), { ae: 'SO_PSYCHIC_WAVE', a: 9, bl: 1, si: 3, hl: 'pwave', e: 'Neutro', sp: [44, 4], c: [6.5, -0.5], fc: 1, d: 1, cd: 5 });
  M('chainlight', 'Corrente Elétrica (Chain Lightning)', 5, lin(500, 100), { ae: 'WL_CHAINLIGHTNING', a: 9, bl: 1, e: 'Vento', sp: [70, 10], c: [3.5, 0.5], fc: 1, d: 1, cd: 3 });
  M('genesis', 'Luz da Criação (Ray of Genesis)', 10, lin(0, 350), { ae: 'LG_RAYOFGENESIS', a: 25, e: 'Sagrado', sp: [55, 5], c: [2, 0], fc: 0.5, d: 2, cd: 2 });
  M('swhoo', 'Eswhoo', 10, lin(1500, 200), { ae: 'SP_SWHOO', a: 9, bl: 1, e: 'Neutro', sp: [120, 0], c: [2, 0], d: 0.5, cd: 0.5 });
  M('kamaitachi', 'Brisa Cortante (Kamaitachi)', 7, lin(2000, 0), { ae: 'NJ_KAMAITACHI', a: 3, e: 'Neutro', sp: [25, 0], c: [1.2, 0], fc: 0.3, d: 1 });
  M('frostnova', 'Congelamento (Frost Nova)', 10, lin(66.7, 6.7), { ae: 'WZ_FROSTNOVA', a: 9, e: 'Água', sp: [47, -2], c: [6, -0.4], d: 1 });
  M('waterball', "Esfera d'Água (Water Ball)", 5, lin(100, 30), { ae: 'WZ_WATERBALL', hl: 'wball', e: 'Água', sp: [15, 5], c: [1, 1], d: 0.5 });
  P('crossimp', 'Lâminas Retalhadoras (Cross Impact)', 5, lin(1400, 150), { ae: 'GC_CROSSIMPACT', h: 7, bl: 1, w: ['Katar'], sp: [25, 0], d: 1, cd: 1, cr: 1 });
  P('fatalmenace', 'Ofensiva Fatal (Fatal Menace)', 10, lin(0, 120), { ae: 'SC_FATALMENACE', a: 9, bl: 1, sp: [19, 1], d: 0.5 });
  P('sporeexp', 'Esporo Explosivo (Spore Explosion)', 10, lin(400, 200), { ae: 'GN_SPORE_EXPLOSION', a: 9, bl: 1, r: 'r', e: 'Neutro', sp: [55, 5], c: [1.5, 0], fc: 0.5, d: 1, cd: 0.5 });
  P('dtail', 'Lançar Míssil (Dragon Tail)', 10, lin(500, 200), { ae: 'RL_D_TAIL', a: 9, r: 'r', w: ['Grenade'], sp: [50, 5], c: [1, 0], fc: 0.5, d: 1, cd: 2 });
  P('jumpkick', 'Chute Aéreo (Flying Side Kick)', 7, lin(30, 10), { ae: 'TK_JUMPKICK', r: 'm', sp: [80, -10], d: 0.5 });
  P('tomahawk', 'Arremessar Tomahawk (Throw Tomahawk)', 1, lin(100, 0), { ae: 'ITM_TOMAHAWK', r: 'r', e: 'Vento', sp: [0, 0] });
  P('darkillu', 'Passo Sombrio (Dark Illusion)', 5, lin(100, 0), { ae: 'GC_DARKILLUSION', r: 'r', sp: [10, 0], d: 1, cd: 1 });
  P('sombrapa', 'Sombra do Templário', 5, lin(1300, 0), { ae: 'MIDGARD_SOMBRA_PA', h: 3, r: 'r', sp: [40, 0], c: [0.6, 0], d: 0.8, cd: 1 });
  P('carttornado', 'Tornado de Carrinho (Cart Tornado)', 10, lin(0, 200), { ae: 'GN_CART_TORNADO', a: 9, bl: 1, sp: [30, 0], d: 0.5, cd: 0.5 });
  P('hellsplant', 'Planta Infernal (Hell\'s Plant)', 5, lin(0, 100), { ae: 'GN_HELLS_PLANT', a: 9, bl: 1, e: 'Neutro', sp: [40, 0], d: 1 });
  P('hesperus', 'Trindade (Hesperus Lit)', 5, lin(0, 300), { ae: 'LG_HESPERUSLIT', bl: 1, w: ['1hSpear', '2hSpear'], sp: [80, 0], d: 0.5, cd: 3 });
  P('rushstrike', 'Rush Strike', 5, lin(0, 12250), { ae: 'MT_RUSH_STRIKE', h: 7, a: 9, bl: 1, w: ['2hAxe'], sp: [60, 0], d: 1, cd: 1 });
  P('triplelaser', 'Triple Laser', 5, lin(1950, 3450), { ae: 'MT_TRIPLE_LASER', h: 3, r: 'r', bl: 1, cr: 1, sp: [60, 0], c: [1, 0], fc: 0.5, d: 0.25, cd: 0.35 });

  YGG.skills = S;
  var all = function (a) { return a; };
  var Wall = ['Fist', 'Dagger', '1hSword', '2hSword', '1hSpear', '2hSpear', '1hAxe', '2hAxe', 'Mace', '2hMace', 'Staff', '2hStaff', 'Bow', 'Knuckle', 'Musical', 'Whip', 'Book', 'Katar', 'Revolver', 'Rifle', 'Gatling', 'Shotgun', 'Grenade', 'Huuma'];
  // item = nomes de classes usados nas páginas de item; line = linha; tier 0..3; rj = trabalho rAthena; wp = armas; sk = habilidades adicionais (herdam do pai)
  // stat = atributos principais sugeridos
  var C = [
    { id: 'nov', n: 'Aprendiz', line: 'Aprendiz', tier: 0, rj: 'Novice', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', 'Mace', 'Staff'], items: ['Aprendiz'], sk: ['firstaid'] },
    { id: 'sup', n: 'Super Aprendiz', line: 'Super Aprendiz', tier: 1, rj: 'Super_Novice', parent: 'nov', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', 'Mace', '2hMace', 'Staff', '2hStaff'], items: ['Aprendiz', 'Super Aprendiz'], sk: ['magnum', 'firebolt', 'coldbolt', 'lightning', 'soulstrike', 'napalm', 'thunderstorm', 'firewall', 'twohand', 'endure', 'bless', 'agiup', 'overthrust'] },
    // Espadachim
    { id: 'swo', n: 'Espadachim', line: 'Espadachim', tier: 1, rj: 'Swordman', parent: 'nov', wp: ['Fist', 'Dagger', '1hSword', '2hSword', '1hSpear', '2hSpear', '1hAxe', '2hAxe', 'Mace'], items: ['Aprendiz', 'Espadachim'], sk: ['bash', 'magnum', 'endure'] },
    { id: 'kni', n: 'Cavaleiro', line: 'Espadachim', tier: 2, rj: 'Knight', parent: 'swo', wp: ['Fist', 'Dagger', '1hSword', '2hSword', '1hSpear', '2hSpear', '1hAxe', '2hAxe', 'Mace', '2hMace'], items: ['Aprendiz', 'Espadachim', 'Cavaleiro'], sk: ['bowling', 'pierce', 'spiral', 'brandish', 'boomerang', 'charge', 'sonicwave', 'twohand', 'aura', 'berserk', 'parry'] },
    { id: 'lor', n: 'Lorde', line: 'Espadachim', tier: 3, rj: 'Lord_Knight', parent: 'kni', wp: ['Fist', 'Dagger', '1hSword', '2hSword', '1hSpear', '2hSpear', '1hAxe', '2hAxe', 'Mace', '2hMace'], items: ['Aprendiz', 'Espadachim', 'Cavaleiro', 'Lorde'], sk: ['dragonbreath', 'hundredspear'] },
    { id: 'cru', n: 'Templário', line: 'Espadachim', tier: 2, rj: 'Crusader', parent: 'swo', wp: ['Fist', 'Dagger', '1hSword', '1hSpear', '2hSpear', '1hAxe', 'Mace'], items: ['Aprendiz', 'Espadachim', 'Cruzado'], sk: ['holycross', 'grandcross', 'shieldboom', 'shieldchain', 'pierce', 'spiral', 'brandish', 'pressure'] },
    { id: 'pal', n: 'Paladino', line: 'Espadachim', tier: 3, rj: 'Paladin', parent: 'cru', wp: ['Fist', 'Dagger', '1hSword', '1hSpear', '2hSpear', '1hAxe', 'Mace'], items: ['Aprendiz', 'Espadachim', 'Cruzado', 'Paladino'], sk: ['overbrand'] },
    // Mago
    { id: 'mag', n: 'Mago', line: 'Mago', tier: 1, rj: 'Mage', parent: 'nov', wp: ['Fist', 'Dagger', 'Staff', '2hStaff'], items: ['Aprendiz', 'Mago'], sk: ['firebolt', 'coldbolt', 'lightning', 'soulstrike', 'napalm', 'firewall', 'thunderstorm', 'frostdiver', 'fireball'] },
    { id: 'wiz', n: 'Bruxo', line: 'Mago', tier: 2, rj: 'Wizard', parent: 'mag', wp: ['Fist', 'Dagger', 'Staff', '2hStaff'], items: ['Aprendiz', 'Mago', 'Feiticeiro'], sk: ['lov', 'stormgust', 'jt', 'firebolt2', 'wom', 'frostnova', 'waterball'] },
    { id: 'hwz', n: 'Arquimago', line: 'Mago', tier: 3, rj: 'High_Wizard', parent: 'wiz', wp: ['Fist', 'Dagger', 'Staff', '2hStaff'], items: ['Aprendiz', 'Mago', 'Feiticeiro', 'Arquimago'], sk: ['amp'] },
    { id: 'sag', n: 'Sábio', line: 'Mago', tier: 2, rj: 'Sage', parent: 'mag', wp: ['Fist', 'Dagger', 'Staff', '2hStaff', '1hSword', 'Book'], items: ['Aprendiz', 'Mago', 'Sábio'], sk: ['hwind', 'amp'] },
    { id: 'pro', n: 'Professor', line: 'Mago', tier: 3, rj: 'Professor', parent: 'sag', wp: ['Fist', 'Dagger', 'Staff', '2hStaff', '1hSword', 'Book'], items: ['Aprendiz', 'Mago', 'Sábio', 'Professor'], sk: ['magicnuke', 'soulburn'] },
    // Arqueiro
    { id: 'arc', n: 'Arqueiro', line: 'Arqueiro', tier: 1, rj: 'Archer', parent: 'nov', wp: ['Fist', 'Dagger', 'Bow'], items: ['Aprendiz', 'Arqueiro'], sk: ['ds', 'shower', 'twilight'] },
    { id: 'hun', n: 'Caçador', line: 'Arqueiro', tier: 2, rj: 'Hunter', parent: 'arc', wp: ['Fist', 'Dagger', 'Bow'], items: ['Aprendiz', 'Arqueiro', 'Caçador'], sk: ['blitz', 'sharp', 'phantasmic', 'aimed', 'impos'] },
    { id: 'sni', n: 'Atirador de Elite', line: 'Arqueiro', tier: 3, rj: 'Sniper', parent: 'hun', wp: ['Fist', 'Dagger', 'Bow'], items: ['Aprendiz', 'Arqueiro', 'Caçador', 'Atirador de Elite'], sk: ['charge2', 'arrowstorm'] },
    { id: 'bar', n: 'Bardo', line: 'Arqueiro', tier: 2, rj: 'Bard', parent: 'arc', wp: ['Fist', 'Dagger', 'Bow', 'Musical'], items: ['Aprendiz', 'Arqueiro', 'Bardo'], sk: ['musical', 'slinging'] },
    { id: 'min', n: 'Menestrel', line: 'Arqueiro', tier: 3, rj: 'Minstrel', parent: 'bar', wp: ['Fist', 'Dagger', 'Bow', 'Musical'], items: ['Aprendiz', 'Arqueiro', 'Bardo', 'Menestrel'], sk: ['arrowstorm'] },
    { id: 'dan', n: 'Odalisca', line: 'Arqueiro', tier: 2, rj: 'Dancer', parent: 'arc', wp: ['Fist', 'Dagger', 'Bow', 'Whip'], items: ['Aprendiz', 'Arqueiro', 'Odalisca', 'Dançarina'], sk: ['musical', 'slinging'] },
    { id: 'gyp', n: 'Cigana', line: 'Arqueiro', tier: 3, rj: 'Gypsy', parent: 'dan', wp: ['Fist', 'Dagger', 'Bow', 'Whip'], items: ['Aprendiz', 'Arqueiro', 'Odalisca', 'Dançarina', 'Cigana'], sk: ['arrowstorm'] },
    // Noviço
    { id: 'aco', n: 'Noviço', line: 'Noviço', tier: 1, rj: 'Acolyte', parent: 'nov', wp: ['Fist', 'Mace', 'Knuckle', 'Staff'], items: ['Aprendiz', 'Noviço', 'Acólito'], sk: ['holylight', 'bless', 'agiup', 'turn'] },
    { id: 'pri', n: 'Sacerdote', line: 'Noviço', tier: 2, rj: 'Priest', parent: 'aco', wp: ['Fist', 'Mace', '2hMace', 'Staff', 'Knuckle', 'Book'], items: ['Aprendiz', 'Acólito', 'Sacerdote'], sk: ['magnus', 'judex', 'gloria', 'impositio', 'suffragium'] },
    { id: 'hpr', n: 'Sumo Sacerdote', line: 'Noviço', tier: 3, rj: 'High_Priest', parent: 'pri', wp: ['Fist', 'Mace', '2hMace', 'Staff', 'Knuckle', 'Book'], items: ['Aprendiz', 'Acólito', 'Sacerdote', 'Sumo Sacerdote'], sk: ['judex'] },
    { id: 'mon', n: 'Monge', line: 'Noviço', tier: 2, rj: 'Monk', parent: 'aco', wp: ['Fist', 'Mace', '2hMace', 'Staff', 'Knuckle'], items: ['Aprendiz', 'Acólito', 'Monge'], sk: ['fingeroff', 'investigate', 'tigerfist', 'cp', 'spirit', 'chain'] },
    { id: 'cha', n: 'Mestre', line: 'Noviço', tier: 3, rj: 'Champion', parent: 'mon', wp: ['Fist', 'Mace', '2hMace', 'Staff', 'Knuckle'], items: ['Aprendiz', 'Acólito', 'Monge', 'Mestre'], sk: ['exp'] },
    // Mercador
    { id: 'mer', n: 'Mercador', line: 'Mercador', tier: 1, rj: 'Merchant', parent: 'nov', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', '2hAxe', 'Mace'], items: ['Aprendiz', 'Mercador'], sk: ['mammonite', 'cartrev'] },
    { id: 'bla', n: 'Ferreiro', line: 'Mercador', tier: 2, rj: 'Blacksmith', parent: 'mer', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', '2hAxe', 'Mace', '2hMace'], items: ['Aprendiz', 'Mercador', 'Ferreiro'], sk: ['hammerfall', 'maximize', 'overthrust', 'axeboom', 'weaponperf'] },
    { id: 'whi', n: 'Mestre-Ferreiro', line: 'Mercador', tier: 3, rj: 'Whitesmith', parent: 'bla', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', '2hAxe', 'Mace', '2hMace'], items: ['Aprendiz', 'Mercador', 'Ferreiro', 'Mestre-Ferreiro'], sk: ['cartcannon'] },
    { id: 'alc', n: 'Alquimista', line: 'Mercador', tier: 2, rj: 'Alchemist', parent: 'mer', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', 'Mace'], items: ['Aprendiz', 'Mercador', 'Alquimista'], sk: ['acidterror', 'demonstration', 'crazyuproar', 'crazywind'] },
    { id: 'cre', n: 'Criador', line: 'Mercador', tier: 3, rj: 'Creator', parent: 'alc', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', 'Mace'], items: ['Aprendiz', 'Mercador', 'Alquimista', 'Criador'], sk: [] },
    // Gatuno
    { id: 'thi', n: 'Gatuno', line: 'Gatuno', tier: 1, rj: 'Thief', parent: 'nov', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', 'Bow'], items: ['Aprendiz', 'Ladrão', 'Gatuno'], sk: ['envenom', 'tripleattack'] },
    { id: 'ass', n: 'Mercenário', line: 'Gatuno', tier: 2, rj: 'Assassin', parent: 'thi', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', 'Katar'], items: ['Aprendiz', 'Ladrão', 'Assassino'], sk: ['sonicblow', 'grimtooth', 'raid', 'epiclesis'] },
    { id: 'asx', n: 'Algoz', line: 'Gatuno', tier: 3, rj: 'Assassin_Cross', parent: 'ass', wp: ['Fist', 'Dagger', '1hSword', '1hAxe', 'Katar'], items: ['Aprendiz', 'Ladrão', 'Assassino', 'Algoz'], sk: ['cross', 'meteor'] },
    { id: 'rog', n: 'Arruaceiro', line: 'Gatuno', tier: 2, rj: 'Rogue', parent: 'thi', wp: ['Fist', 'Dagger', '1hSword', 'Bow'], items: ['Aprendiz', 'Ladrão', 'Vigarista'], sk: ['backstab', 'ds', 'shower'] },
    { id: 'sta', n: 'Desordeiro', line: 'Gatuno', tier: 3, rj: 'Stalker', parent: 'rog', wp: ['Fist', 'Dagger', '1hSword', 'Bow'], items: ['Aprendiz', 'Ladrão', 'Vigarista', 'Desordeiro'], sk: ['raid'] },
    // Outros
    { id: 'gun', n: 'Justiceiro', line: 'Justiceiro', tier: 1, rj: 'Gunslinger', parent: 'nov', wp: ['Fist', 'Revolver', 'Rifle', 'Gatling', 'Shotgun', 'Grenade'], items: ['Aprendiz', 'Pistoleiro', 'Rebelião', 'Justiceiro'], sk: ['triple', 'fullblast', 'desperado', 'crowdfire', 'spread', 'tracking', 'grenade', 'madness'] },
    { id: 'nin', n: 'Ninja', line: 'Ninja', tier: 1, rj: 'Ninja', parent: 'nov', wp: ['Fist', 'Dagger', 'Huuma'], items: ['Aprendiz', 'Ninja'], sk: ['kunai', 'katon', 'hyou', 'windblade', 'dragonfire', 'throwshuriken', 'huuma', 'ninjaclose', 'kamaitachi'] },
    { id: 'tae', n: 'Taekwon', line: 'Taekwon', tier: 1, rj: 'Taekwon', parent: 'nov', wp: ['Fist'], items: ['Aprendiz', 'Taekwon'], sk: ['tornado', 'dodge', 'heel', 'counter', 'jumpkick'] },
    { id: 'sg', n: 'Mestre Taekwon', line: 'Taekwon', tier: 2, rj: 'Star_Gladiator', parent: 'tae', wp: ['Fist'], items: ['Aprendiz', 'Taekwon', 'Mestre Taekwon'], sk: ['stargaze'] },
    { id: 'sl', n: 'Espiritualista', line: 'Taekwon', tier: 2, rj: 'Soul_Linker', parent: 'tae', wp: ['Fist', 'Dagger', '1hSword', '1hSpear', 'Staff', '2hStaff'], items: ['Aprendiz', 'Taekwon', 'Espiritualista'], sk: ['soullinker', 'kaupe'] }
  ];
  YGG.classes = C;
  YGG.classById = {};
  C.forEach(function (c) { YGG.classById[c.id] = c; });
  YGG.skillsFor = function (cid) {
    var out = [], seen = {}, c = YGG.classById[cid];
    var chain = [];
    while (c) { chain.unshift(c); c = c.parent ? YGG.classById[c.parent] : null; }
    chain.forEach(function (cl) { cl.sk.forEach(function (s) { if (!seen[s] && S[s]) { seen[s] = 1; out.push(S[s]); } }); });
    return out;
  };
  YGG.weaponNames = {
    Fist: 'Mãos nuas', Dagger: 'Adaga', '1hSword': 'Espada 1 mão', '2hSword': 'Espada 2 mãos', '1hSpear': 'Lança 1 mão', '2hSpear': 'Lança 2 mãos',
    '1hAxe': 'Machado 1 mão', '2hAxe': 'Machado 2 mãos', Mace: 'Maça', '2hMace': 'Maça 2 mãos', Staff: 'Cajado', '2hStaff': 'Cajado 2 mãos', Bow: 'Arco',
    Knuckle: 'Soqueira', Musical: 'Instrumento', Whip: 'Chicote', Book: 'Livro', Katar: 'Katar', Revolver: 'Revólver', Rifle: 'Rifle',
    Gatling: 'Metralhadora', Shotgun: 'Espingarda', Grenade: 'Lançador de granadas', Huuma: 'Huuma'
  };
})();
