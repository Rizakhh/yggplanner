/* Retratos originais das classes (SVG gerado), no estilo silhueta com luz de borda da identidade Midgard.
   Para usar imagens próprias, coloque img/classes/<id>.webp (ou .png) e defina YGG.portraitImg = true. */
window.YGG = window.YGG || {};
(function () {
  var Y = window.YGG, uid = 0;
  var LINE = {
    'Aprendiz': '#b0915f', 'Super Aprendiz': '#d98ab3', 'Espadachim': '#d0613f', 'Mago': '#5f8de0', 'Arqueiro': '#74b85a',
    'Noviço': '#e6c86b', 'Mercador': '#dd8f3c', 'Gatuno': '#a274d8', 'Justiceiro': '#97adbf', 'Ninja': '#7a7fe0', 'Taekwon': '#43bfae'
  };
  // hat = adereço de cabeça, wep = arma ao fundo, fx = extras
  var P = {
    nov: { hat: 'hair', wep: 'dagger' }, sup: { hat: 'goggles', wep: 'dagger', fx: ['spark'] },
    swo: { hat: 'helm', wep: 'sword' }, kni: { hat: 'helm', wep: 'spear', fx: ['plume'] }, lor: { hat: 'helm', wep: 'spear', fx: ['plume', 'wings', 'aura'] },
    cru: { hat: 'helm', wep: 'sword', fx: ['cross', 'shield'] }, pal: { hat: 'helm', wep: 'spear', fx: ['cross', 'shield', 'wings', 'aura'] },
    mag: { hat: 'witch', wep: 'staff' }, wiz: { hat: 'witchTall', wep: 'staff', fx: ['star'] }, hwz: { hat: 'witchTall', wep: 'staff', fx: ['star', 'aura', 'orbs'] },
    sag: { hat: 'hood', wep: 'book' }, pro: { hat: 'hood', wep: 'book', fx: ['circlet', 'aura'] },
    arc: { hat: 'hood', wep: 'bow', fx: ['feather'] }, hun: { hat: 'hood', wep: 'bow', fx: ['feather', 'falcon'] }, sni: { hat: 'hood', wep: 'bow', fx: ['feather', 'falcon', 'aura'] },
    bar: { hat: 'beret', wep: 'lute', fx: ['feather'] }, min: { hat: 'beret', wep: 'lute', fx: ['feather', 'notes', 'aura'] },
    dan: { hat: 'tiara', wep: 'whip' }, gyp: { hat: 'tiara', wep: 'whip', fx: ['veil', 'aura'] },
    aco: { hat: 'mitre', wep: 'cross' }, pri: { hat: 'mitreTall', wep: 'cross' }, hpr: { hat: 'mitreTall', wep: 'cross', fx: ['halo', 'aura'] },
    mon: { hat: 'band', wep: 'fist', fx: ['spheres'] }, cha: { hat: 'band', wep: 'fist', fx: ['spheres', 'aura'] },
    mer: { hat: 'mcap', wep: 'axe' }, bla: { hat: 'mcap', wep: 'axe', fx: ['goggles'] }, whi: { hat: 'mcap', wep: 'hammer', fx: ['goggles', 'aura'] },
    alc: { hat: 'mcap', wep: 'flask' }, cre: { hat: 'mcap', wep: 'flask', fx: ['goggles', 'aura'] },
    thi: { hat: 'bandana', wep: 'dagger2', fx: ['mask'] }, ass: { hat: 'cowl', wep: 'katar', fx: ['mask', 'slits'] }, asx: { hat: 'cowl', wep: 'katar', fx: ['mask', 'slits', 'aura'] },
    rog: { hat: 'bandana', wep: 'dagger2', fx: ['mask'] }, sta: { hat: 'bandana', wep: 'bow', fx: ['mask', 'aura'] },
    gun: { hat: 'cowboy', wep: 'gun' }, nin: { hat: 'ninja', wep: 'shuriken', fx: ['mask', 'slits'] },
    tae: { hat: 'band', wep: 'kick' }, sg: { hat: 'band', wep: 'kick', fx: ['star'] }, sl: { hat: 'hood', wep: 'talisman', fx: ['orbs'] }
  };
  var G = 'url(#gg@)', F = 'url(#fg@)';
  function mix(hex, k) { // clareia (k>0) ou escurece (k<0)
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255;
    function m(c) { return Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k)); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }
  var W = { // armas desenhadas na vertical, girando em torno de (60,75)
    sword: '<g transform="rotate(32 60 75)"><path d="M56.5 14 L60 3 L63.5 14 L63.5 104 L56.5 104Z" fill="' + G + '"/><path d="M60 6 L60 104" stroke="#fff6d8" stroke-opacity=".5" stroke-width=".8"/><rect x="46" y="103" width="28" height="5" rx="2" fill="' + G + '"/><rect x="58" y="108" width="4" height="18" fill="#6f4b2a"/><circle cx="60" cy="129" r="4" fill="' + G + '"/></g>',
    spear: '<g transform="rotate(28 60 75)"><rect x="58.6" y="20" width="2.8" height="135" fill="#7a5530"/><path d="M60 -2 L67 18 L60 26 L53 18Z" fill="' + G + '"/><path d="M52 24 L68 24 L66 28 L54 28Z" fill="' + G + '"/></g>',
    staff: '<g transform="rotate(24 60 75)"><rect x="58.4" y="22" width="3.2" height="130" rx="1.5" fill="#6f4b2a"/><path d="M60 22 C50 18 50 6 60 2 C70 6 70 18 60 22Z" fill="none" stroke="' + G + '" stroke-width="2.2"/><circle cx="60" cy="12" r="5.5" fill="@L" /><circle cx="60" cy="12" r="11" fill="@L" opacity=".25"/></g>',
    bow: '<g transform="rotate(18 60 75)"><path d="M72 4 Q30 75 72 146" fill="none" stroke="' + G + '" stroke-width="4" stroke-linecap="round"/><path d="M72 4 L72 146" stroke="#f2e8cf" stroke-opacity=".55" stroke-width=".8"/><path d="M40 75 L96 75 M96 75 L90 71 M96 75 L90 79" stroke="' + G + '" stroke-width="1.6"/></g>',
    dagger: '<g transform="rotate(38 60 75)"><path d="M57 40 L60 30 L63 40 L63 82 L57 82Z" fill="' + G + '"/><rect x="51" y="81" width="18" height="4" rx="2" fill="' + G + '"/><rect x="58.3" y="85" width="3.4" height="12" fill="#6f4b2a"/></g>',
    dagger2: '<g transform="rotate(-40 60 75)"><path d="M57 34 L60 24 L63 34 L63 80 L57 80Z" fill="' + G + '"/><rect x="51" y="79" width="18" height="4" rx="2" fill="' + G + '"/></g><g transform="rotate(40 60 75)"><path d="M57 34 L60 24 L63 34 L63 80 L57 80Z" fill="' + G + '"/><rect x="51" y="79" width="18" height="4" rx="2" fill="' + G + '"/></g>',
    katar: '<g transform="rotate(-30 60 75)"><path d="M54 30 L60 8 L66 30 L66 74 L54 74Z" fill="' + G + '"/><rect x="50" y="72" width="20" height="10" rx="2" fill="none" stroke="' + G + '" stroke-width="2.4"/></g><g transform="rotate(30 60 75)"><path d="M54 30 L60 8 L66 30 L66 74 L54 74Z" fill="' + G + '"/><rect x="50" y="72" width="20" height="10" rx="2" fill="none" stroke="' + G + '" stroke-width="2.4"/></g>',
    axe: '<g transform="rotate(30 60 75)"><rect x="58.4" y="10" width="3.2" height="140" fill="#7a5530"/><path d="M61 14 C84 10 90 30 86 46 C80 38 72 36 61 40Z" fill="' + G + '"/><path d="M59 18 C44 18 40 30 42 38 C47 33 52 33 59 34Z" fill="' + G + '" opacity=".85"/></g>',
    hammer: '<g transform="rotate(30 60 75)"><rect x="58.4" y="18" width="3.2" height="132" fill="#7a5530"/><rect x="42" y="6" width="36" height="20" rx="3" fill="' + G + '"/><rect x="42" y="13" width="36" height="3" fill="#6f4b2a" opacity=".5"/></g>',
    mace: '<g transform="rotate(30 60 75)"><rect x="58.4" y="24" width="3.2" height="120" fill="#7a5530"/><circle cx="60" cy="18" r="10" fill="' + G + '"/><path d="M60 3 L60 33 M45 18 L75 18 M49 7 L71 29 M71 7 L49 29" stroke="' + G + '" stroke-width="2.4"/></g>',
    cross: '<g transform="rotate(24 60 75)"><rect x="58.4" y="30" width="3.2" height="120" fill="#7a5530"/><path d="M56 4 L64 4 L64 14 L74 14 L74 22 L64 22 L64 40 L56 40 L56 22 L46 22 L46 14 L56 14Z" fill="' + G + '"/><circle cx="60" cy="18" r="16" fill="@L" opacity=".18"/></g>',
    book: '<g transform="translate(60 26) rotate(-8)"><path d="M-26 0 Q-13 -6 0 0 Q13 -6 26 0 L26 22 Q13 16 0 22 Q-13 16 -26 22Z" fill="' + G + '"/><path d="M0 0 L0 22" stroke="#6f4b2a" stroke-width="1.2"/><path d="M-21 6 L-6 6 M-21 11 L-6 11 M6 6 L21 6 M6 11 L21 11" stroke="#6f4b2a" stroke-width=".9" opacity=".6"/><circle cx="0" cy="-8" r="16" fill="@L" opacity=".18"/></g>',
    lute: '<g transform="rotate(-28 60 75)"><ellipse cx="60" cy="104" rx="17" ry="21" fill="' + G + '"/><circle cx="60" cy="102" r="5" fill="#3a2614"/><rect x="57.5" y="20" width="5" height="66" fill="#7a5530"/><rect x="55" y="14" width="10" height="10" rx="2" fill="' + G + '"/></g>',
    whip: '<path d="M22 138 C40 100 96 110 92 72 C88 40 40 52 46 30 C50 16 72 14 82 22" fill="none" stroke="' + G + '" stroke-width="3" stroke-linecap="round"/>',
    gun: '<g transform="rotate(-24 60 75)"><rect x="14" y="40" width="80" height="7" rx="2" fill="' + G + '"/><rect x="30" y="46" width="36" height="7" fill="' + G + '"/><path d="M66 46 L90 46 L96 62 L84 64 L76 52 L66 52Z" fill="#7a5530"/><rect x="44" y="52" width="4" height="9" fill="' + G + '"/></g>',
    shuriken: '<g transform="translate(60 30)"><path d="M0 -26 L6 -6 L26 0 L6 6 L0 26 L-6 6 L-26 0 L-6 -6Z" fill="' + G + '"/><circle r="5" fill="#0b140e"/><circle r="30" fill="@L" opacity=".14"/></g>',
    fist: '<g><circle cx="60" cy="30" r="26" fill="@L" opacity=".12"/><path d="M34 30 L86 30 M60 4 L60 56 M42 12 L78 48 M78 12 L42 48" stroke="@L" stroke-opacity=".35" stroke-width="1.5"/></g>',
    kick: '<g><path d="M60 6 L66 24 L86 24 L70 36 L76 56 L60 44 L44 56 L50 36 L34 24 L54 24Z" fill="' + G + '" opacity=".9"/><circle cx="60" cy="32" r="30" fill="@L" opacity=".12"/></g>',
    flask: '<g transform="translate(60 22) rotate(14)"><rect x="-5" y="-14" width="10" height="12" fill="' + G + '"/><path d="M-6 -2 L6 -2 L18 22 Q18 30 10 30 L-10 30 Q-18 30 -18 22Z" fill="@L" opacity=".85"/><path d="M-6 -2 L6 -2 L18 22 Q18 30 10 30 L-10 30 Q-18 30 -18 22Z" fill="none" stroke="' + G + '" stroke-width="1.6"/><circle cx="-4" cy="18" r="2.5" fill="#fff" opacity=".6"/></g>',
    talisman: '<g><rect x="30" y="14" width="12" height="26" rx="1" fill="' + G + '" transform="rotate(-18 36 27)"/><rect x="54" y="4" width="12" height="26" rx="1" fill="' + G + '"/><rect x="78" y="14" width="12" height="26" rx="1" fill="' + G + '" transform="rotate(18 84 27)"/><path d="M36 20 L36 32 M60 10 L60 24 M84 20 L84 32" stroke="#6f4b2a" stroke-width="1.4" transform="translate(0 0)"/></g>'
  };
  var CENTER = { book: 1, shuriken: 1, fist: 1, kick: 1, talisman: 1, flask: 1, whip: 1, dagger2: 1, katar: 1 };
  var HEAD ='<ellipse cx="60" cy="72" rx="16.5" ry="19" fill="' + F + '"/>';
  var HAT = {
    hair: '<path d="M42 70 Q40 50 60 48 Q81 49 78 70 Q74 59 62 58 Q52 60 46 56 Q46 64 42 70Z" fill="' + F + '"/>',
    goggles: '<path d="M42 70 Q40 50 60 48 Q81 49 78 70 Q74 59 62 58 Q52 60 46 56 Q46 64 42 70Z" fill="' + F + '"/><rect x="42" y="58" width="36" height="5" rx="2" fill="#3a2614"/><circle cx="52" cy="59" r="6" fill="#0b140e" stroke="' + G + '" stroke-width="2"/><circle cx="68" cy="59" r="6" fill="#0b140e" stroke="' + G + '" stroke-width="2"/><circle cx="50" cy="57" r="1.8" fill="@L"/><circle cx="66" cy="57" r="1.8" fill="@L"/>',
    helm: '<path d="M40 78 Q38 47 60 45 Q82 47 80 78 L73 78 L73 68 Q60 64 47 68 L47 78Z" fill="' + F + '" stroke="' + G + '" stroke-width="1.2"/><rect x="58.4" y="62" width="3.2" height="16" rx="1" fill="' + G + '"/><path d="M44 60 Q60 54 76 60" stroke="' + G + '" stroke-width="1" fill="none" opacity=".7"/>',
    witch: '<ellipse cx="60" cy="58" rx="31" ry="6.5" fill="' + F + '" stroke="' + G + '" stroke-width="1"/><path d="M45 57 Q50 42 58 28 Q64 18 80 14 Q68 24 70 36 Q72 47 75 57Z" fill="' + F + '"/><path d="M47 52 Q60 48 73 52" stroke="' + G + '" stroke-width="2.2" fill="none"/>',
    witchTall: '<ellipse cx="60" cy="58" rx="33" ry="7" fill="' + F + '" stroke="' + G + '" stroke-width="1"/><path d="M44 57 Q48 38 56 22 Q62 8 84 2 Q70 16 70 32 Q71 46 76 57Z" fill="' + F + '"/><path d="M46 52 Q60 47 74 52" stroke="' + G + '" stroke-width="2.4" fill="none"/>',
    hood: '<path d="M37 92 Q34 50 60 42 Q86 50 83 92 Q78 70 60 66 Q42 70 37 92Z" fill="' + F + '" stroke="@L" stroke-opacity=".45" stroke-width="1"/>',
    beret: '<path d="M38 60 Q42 44 64 45 Q86 47 84 58 Q62 53 38 60Z" fill="' + F + '" stroke="' + G + '" stroke-width="1"/><circle cx="64" cy="45" r="2" fill="' + G + '"/>',
    tiara: '<path d="M40 84 Q36 50 60 48 Q84 50 80 84 Q84 100 88 112 Q78 100 76 80 Q72 60 60 60 Q48 60 44 80 Q42 100 32 112 Q36 100 40 84Z" fill="' + F + '"/><path d="M44 60 Q60 52 76 60 L72 56 L66 58 L60 50 L54 58 L48 56Z" fill="' + G + '"/><circle cx="60" cy="54" r="2" fill="@L"/>',
    mitre: '<path d="M46 62 L48 40 Q60 28 72 40 L74 62 Q60 57 46 62Z" fill="' + F + '" stroke="' + G + '" stroke-width="1.2"/><path d="M58.5 40 L61.5 40 L61.5 45 L66 45 L66 48 L61.5 48 L61.5 55 L58.5 55 L58.5 48 L54 48 L54 45 L58.5 45Z" fill="' + G + '"/>',
    mitreTall: '<path d="M45 62 L47 34 Q60 18 73 34 L75 62 Q60 57 45 62Z" fill="' + F + '" stroke="' + G + '" stroke-width="1.2"/><path d="M58.3 32 L61.7 32 L61.7 39 L67 39 L67 42.5 L61.7 42.5 L61.7 52 L58.3 52 L58.3 42.5 L53 42.5 L53 39 L58.3 39Z" fill="' + G + '"/>',
    band: '<path d="M43 64 Q60 56 77 64 L77 68 Q60 61 43 68Z" fill="@L"/><path d="M77 65 Q90 66 96 76 M77 67 Q88 72 90 84" stroke="@L" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    mcap: '<path d="M42 63 Q43 47 60 46 Q78 47 80 61 L92 63 Q80 67 42 65Z" fill="' + F + '" stroke="' + G + '" stroke-width="1"/>',
    bandana: '<path d="M42 66 Q42 48 60 47 Q78 48 78 66 Q60 58 42 66Z" fill="@D"/><path d="M78 62 L92 58 L88 66 L94 72 L80 66Z" fill="@D"/>',
    cowl: '<path d="M36 96 Q32 48 60 40 Q88 48 84 96 Q80 72 60 68 Q40 72 36 96Z" fill="' + F + '" stroke="@L" stroke-opacity=".5" stroke-width="1"/><path d="M60 40 L56 30 L64 30Z" fill="' + F + '"/>',
    cowboy: '<ellipse cx="60" cy="58" rx="35" ry="6" fill="' + F + '" stroke="' + G + '" stroke-width="1"/><path d="M45 57 Q44 38 52 38 Q60 44 68 38 Q76 38 75 57Z" fill="' + F + '"/><rect x="45" y="51" width="30" height="3.4" fill="' + G + '"/>',
    ninja: '<path d="M41 70 Q40 48 60 47 Q80 48 79 70 Q60 62 41 70Z" fill="' + F + '"/><rect x="41" y="60" width="38" height="5" rx="2" fill="@L"/><path d="M79 62 Q92 62 98 72 M79 64 Q90 70 92 80" stroke="@L" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
  };
  var FX = {
    plume: '<path d="M62 46 Q70 26 92 22 Q82 30 84 40 Q76 36 68 48Z" fill="@L"/>',
    wings: '<path d="M40 62 Q26 54 22 40 Q32 46 40 50 Q30 40 30 30 Q40 42 44 54Z M80 62 Q94 54 98 40 Q88 46 80 50 Q90 40 90 30 Q80 42 76 54Z" fill="' + G + '"/>',
    cross: '<path d="M58.6 49 L61.4 49 L61.4 53 L65 53 L65 55.6 L61.4 55.6 L61.4 60 L58.6 60 L58.6 55.6 L55 55.6 L55 53 L58.6 53Z" fill="@L"/>',
    shield: '<path d="M14 104 Q14 92 26 90 Q38 92 38 104 Q38 122 26 130 Q14 122 14 104Z" fill="' + F + '" stroke="' + G + '" stroke-width="2"/><path d="M24.8 98 L27.2 98 L27.2 104 L32 104 L32 106.4 L27.2 106.4 L27.2 118 L24.8 118 L24.8 106.4 L20 106.4 L20 104 L24.8 104Z" fill="@L"/>',
    star: '<path d="M88 20 L90.4 26 L97 26.4 L92 30.6 L93.6 37 L88 33.4 L82.4 37 L84 30.6 L79 26.4 L85.6 26Z" fill="@L"/>',
    orbs: '<circle cx="24" cy="56" r="4" fill="@L" opacity=".9"/><circle cx="24" cy="56" r="8" fill="@L" opacity=".2"/><circle cx="98" cy="70" r="3" fill="@L" opacity=".9"/><circle cx="98" cy="70" r="7" fill="@L" opacity=".2"/><circle cx="30" cy="88" r="2.4" fill="@L" opacity=".8"/>',
    circlet: '<path d="M44 62 Q60 56 76 62" stroke="' + G + '" stroke-width="2" fill="none"/><path d="M60 55 L63 59 L60 63 L57 59Z" fill="@L"/>',
    feather: '<path d="M78 56 Q92 40 104 34 Q96 46 90 50 Q86 54 80 60Z" fill="@L"/>',
    falcon: '<path d="M88 100 Q96 92 106 94 Q100 96 98 100 Q104 102 108 108 Q98 106 92 108Z" fill="' + G + '"/>',
    notes: '<path d="M22 50 L22 38 L30 36 L30 48" stroke="@L" stroke-width="1.6" fill="none"/><circle cx="20" cy="50" r="2.6" fill="@L"/><circle cx="28" cy="48" r="2.6" fill="@L"/><path d="M96 84 L96 74" stroke="@L" stroke-width="1.6"/><circle cx="94" cy="84" r="2.6" fill="@L"/>',
    veil: '<path d="M44 80 Q60 86 76 80 L74 90 Q60 96 46 90Z" fill="@L" opacity=".55"/>',
    halo: '<ellipse cx="60" cy="24" rx="17" ry="4.5" fill="none" stroke="@L" stroke-width="2.4"/><ellipse cx="60" cy="24" rx="17" ry="4.5" fill="none" stroke="@L" stroke-width="7" opacity=".2"/>',
    spheres: '<circle cx="30" cy="48" r="4.6" fill="@L"/><circle cx="90" cy="48" r="4.6" fill="@L"/><circle cx="22" cy="72" r="4" fill="@L" opacity=".85"/><circle cx="98" cy="72" r="4" fill="@L" opacity=".85"/><circle cx="30" cy="48" r="9" fill="@L" opacity=".18"/><circle cx="90" cy="48" r="9" fill="@L" opacity=".18"/>',
    goggles: '<rect x="44" y="60" width="32" height="4" rx="2" fill="#3a2614"/><circle cx="52" cy="61" r="5" fill="#0b140e" stroke="' + G + '" stroke-width="1.8"/><circle cx="68" cy="61" r="5" fill="#0b140e" stroke="' + G + '" stroke-width="1.8"/>',
    mask: '<path d="M44 76 Q60 82 76 76 L75 88 Q60 96 45 88Z" fill="@D" stroke="@L" stroke-opacity=".4" stroke-width=".8"/>',
    slits: '',
    spark: '<path d="M92 30 L94 36 L100 38 L94 40 L92 46 L90 40 L84 38 L90 36Z" fill="@L"/>',
    aura: ''
  };
  function portrait(id, opt) {
    opt = opt || {};
    var cl = Y.classById && Y.classById[id]; if (!cl) return '';
    var p = P[id] || { hat: 'hair', wep: 'dagger' }, fx = p.fx || [], col = LINE[cl.line] || '#e8c477';
    var n = ++uid, L = mix(col, .25), D = mix(col, -.55);
    function s(t) { return t.replace(/@L/g, L).replace(/@D/g, D).replace(/gg@/g, 'gg' + n).replace(/fg@/g, 'fg' + n); }
    var masked = fx.indexOf('slits') >= 0;
    var eyes = masked
      ? '<path d="M49 72 L56 73.5 M64 73.5 L71 72" stroke="@L" stroke-width="2.2" stroke-linecap="round"/>'
      : '<ellipse cx="53.5" cy="73" rx="2" ry="1.4" fill="@L"/><ellipse cx="66.5" cy="73" rx="2" ry="1.4" fill="@L"/>';
    var tier = cl.tier || 0, stars = '';
    for (var i = 0; i < tier; i++) { var x = 60 + (i - (tier - 1) / 2) * 10; stars += '<path d="M' + x + ' 139 l3 4 -3 4 -3 -4Z" fill="url(#gg' + n + ')"/>'; }
    var aura = fx.indexOf('aura') >= 0 ? '<circle cx="60" cy="78" r="46" fill="url(#ag' + n + ')"/>' : '';
    var vb = opt.mini ? '30 36 60 60' : '0 0 120 150';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" class="portrait" role="img" aria-label="' + cl.n + '">' +
      '<defs><radialGradient id="bg' + n + '" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="' + mix(col, -.35) + '"/><stop offset=".55" stop-color="' + mix(col, -.72) + '"/><stop offset="1" stop-color="#07100a"/></radialGradient>' +
      '<radialGradient id="ag' + n + '"><stop offset="0" stop-color="' + L + '" stop-opacity=".35"/><stop offset="1" stop-color="' + L + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="gg' + n + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7ad"/><stop offset=".5" stop-color="#d9ad5c"/><stop offset="1" stop-color="#8f6a2c"/></linearGradient>' +
      '<linearGradient id="fg' + n + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3527"/><stop offset="1" stop-color="#08120c"/></linearGradient>' +
      '<filter id="rl' + n + '" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius=".9" result="d"/><feFlood flood-color="' + L + '" flood-opacity=".85"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>' +
      '<rect width="120" height="150" rx="' + (opt.mini ? 0 : 12) + '" fill="url(#bg' + n + ')"/>' +
      '<g opacity=".22" stroke="#e8c477" fill="none"><circle cx="60" cy="74" r="50" stroke-width=".6"/><circle cx="60" cy="74" r="44" stroke-width=".4" stroke-dasharray="2 4"/></g>' + aura +
      (CENTER[p.wep] ? s(W[p.wep] || '') : '<g transform="translate(24 4)">' + s(W[p.wep] || '') + '</g>') +
      '<g filter="url(#rl' + n + ')">' + s('<path d="M12 150 C14 118 34 103 60 101 C86 103 106 118 108 150Z" fill="' + F + '"/><rect x="53" y="86" width="14" height="18" fill="' + F + '"/>' + HEAD + (HAT[p.hat] || '')) + '</g>' +
      s('<path d="M40 110 Q60 126 80 110" stroke="@L" stroke-opacity=".55" stroke-width="1.2" fill="none"/><path d="M60 117 L64 122 L60 127 L56 122Z" fill="@L"/><path d="M24 128 Q30 116 40 112 M96 128 Q90 116 80 112" stroke="' + G + '" stroke-opacity=".6" stroke-width="1.2" fill="none"/>') +
      s(eyes) + fx.map(function (f) { return s(FX[f] || ''); }).join('') +
      (opt.mini ? '' : '<path d="M30 150 Q60 128 90 150" fill="#07100a" opacity=".55"/>' + stars + '<rect x=".75" y=".75" width="118.5" height="148.5" rx="11.5" fill="none" stroke="#b88a44" stroke-opacity=".7" stroke-width="1.5"/>') +
      '</svg>';
    return svg;
  }
  Y.portrait = portrait;
  Y.lineColor = function (id) { var c = Y.classById[id]; return LINE[c && c.line] || '#e8c477'; };
})();
