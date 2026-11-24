// Guias por classe (conteúdo editorial baseado no rAthena Renewal; não é guia oficial do YggIdle).
// stats: prioridade [atributo, alvo] aplicada em ordem até acabar os pontos. ordem: [habilidade (id do planner ou nome), nível, comentário].
// rot: rotação sugerida para a simulação. ele: elementos de ataque usados no ranking de mapas ('arma' = elemento da arma). aoe: classe de dano em área.
window.YGG = window.YGG || {};
YGG.guides = {
  nov: {
    role: 'Iniciante', diff: 1, resumo: 'Fase curta: o objetivo é chegar ao nível de classe 10 e escolher a 1ª classe.',
    stats: [['agi', 20], ['str', 20], ['vit', 15]], ele: ['arma'],
    ordem: [['firstaid', 1, 'Cura barata enquanto não tem poções.'], ['Habilidades Básicas', 9, 'Obrigatório para trocar de classe.']],
    rot: [], equip: ['Qualquer adaga ou espada de aprendiz.', 'Guarde zeny para a arma da 1ª classe.'],
    dicas: ['Não gaste muitos pontos aqui: todos os atributos podem ser redistribuídos ao trocar de build no planner.', 'Porings e Lunáticos dão EXP rápida nos primeiros níveis.'],
    evitar: ['Pegar monstros acima de 10 níveis do seu.']
  },
  sup: {
    role: 'Híbrido versátil', diff: 2, resumo: 'Acesso a habilidades de todas as 1ªs classes, mas com HP e SP baixos. Funciona melhor como mago ou corpo a corpo com Rapidez com Duas Mãos.',
    stats: [['dex', 40], ['int', 60], ['vit', 40], ['dex', 80], ['int', 100], ['vit', 70], ['dex', 110]], ele: ['Fogo', 'Água', 'Vento'],
    ordem: [['bless', 10, 'Buff de FOR/INT/DES para você mesmo.'], ['agiup', 10, 'Velocidade de movimento e FLEE.'], ['firebolt', 10, 'Dano principal no início.'], ['coldbolt', 10, 'Para mortos-vivos e fogo.'], ['lightning', 10, 'Para monstros de água.'], ['thunderstorm', 10, 'Área para grupos.'], ['firewall', 5, 'Proteção contra corpo a corpo.']],
    rot: ['firebolt', 'coldbolt', 'lightning'], aoe: false,
    equip: ['Armas com ATQM e redução de conjuração.', 'Acessórios de HP compensam a fragilidade.'],
    dicas: ['Escolha o elemento de raio pela fraqueza do monstro: a tabela de elementos do alvo está na aba Simulação.', 'Overthrust e Endure ajudam muito se você jogar corpo a corpo.'],
    evitar: ['Dividir os pontos entre físico e mágico: o dano fica baixo nos dois.']
  },
  swo: {
    role: 'Corpo a corpo / tanque', diff: 1, resumo: 'Base dos Cavaleiros e Templários. Golpe Fulminante é a habilidade de dano até a troca de classe.',
    stats: [['str', 40], ['dex', 20], ['vit', 30], ['agi', 30], ['str', 60]], ele: ['arma'],
    ordem: [['bash', 10, 'Dano principal em alvo único.'], ['Aumentar Recuperação de HP', 5, 'Regeneração entre lutas.'], ['magnum', 5, 'Área de fogo e pré-requisito de várias habilidades.'], ['endure', 5, 'Evita ser interrompido.'], ['Maestria em Espada', 10, 'ATQ com espadas.']],
    rot: ['bash', 'magnum'], equip: ['Espada de 1 mão + escudo para segurança.', 'Cartas de dano por raça na arma.'],
    dicas: ['Upe com Golpe Fulminante em alvos únicos e Impacto Flamejante quando juntar 3 ou mais.'], evitar: ['Ignorar VIT no início: o Espadachim depende de poções.']
  },
  kni: {
    role: 'Dano físico corpo a corpo e em área', diff: 2, resumo: 'Lança para área (Brandir Lança) e Perfurar em Espiral para alvo único; espada de duas mãos com Rapidez com Duas Mãos para ataque automático.',
    stats: [['dex', 40], ['str', 70], ['vit', 50], ['str', 100], ['dex', 70], ['agi', 50], ['str', 120], ['vit', 80], ['dex', 90]], traits: [['pow', 40], ['con', 20], ['sta', 30]],
    ele: ['arma'], aoe: true,
    ordem: [['Montaria (Peco Peco)', 1, 'Recupera a velocidade de ataque com lança.'], ['pierce', 10, 'Dano bom em monstros grandes.'], ['brandish', 10, 'Área principal para upar em grupos.'], ['spiral', 5, 'Melhor dano em alvo único (chefes).'], ['twohand', 10, 'Para builds de espada de 2 mãos.'], ['bowling', 10, 'Área com espada.'], ['aura', 5, 'Dano extra fixo em todo golpe.'], ['berserk', 1, 'Pico de dano em MVP (gasta HP).']],
    rot: ['spiral', 'brandish', 'pierce'],
    equip: ['Lança de 2 mãos com cartas de raça/tamanho do alvo.', 'Armadura com HP% e redução de dano.', 'Linhas aleatórias: dano físico %, dano vs Chefe e P.ATQ.'],
    dicas: ['Brandir Lança acerta vários alvos à frente: use 1v5 ou 1v10 na simulação para ver o ganho real.', 'Contra MVP, troque Brandir por Perfurar em Espiral na primeira posição da rotação.'],
    evitar: ['DES abaixo de 40: a habilidade erra e a conjuração fica lenta.']
  },
  lor: { base: 'kni', resumo: 'Evolução do Cavaleiro com Ignição Rúnica (área de fogo) e Centena de Lanças (alvo único de alto dano).',
    ordem: [['hundredspear', 10, 'Principal contra chefes.'], ['dragonbreath', 5, 'Área com ótimo dano para farm.'], ['spiral', 5, 'Complemento em alvo único.'], ['brandish', 10, 'Área barata em SP.'], ['aura', 5, 'Dano fixo extra.'], ['berserk', 1, 'Explosão de dano em MVP.']],
    rot: ['hundredspear', 'dragonbreath', 'spiral', 'brandish'] },
  cru: {
    role: 'Tanque / dano sagrado', diff: 2, resumo: 'O tanque mais resistente. Pode ir de Crux Magnum (híbrido INT/VIT) ou de Bumerangue de Escudo (físico, dano por peso do escudo).',
    stats: [['vit', 50], ['dex', 40], ['str', 60], ['vit', 90], ['str', 90], ['dex', 70], ['vit', 120], ['str', 110]], traits: [['sta', 40], ['pow', 30], ['con', 20]],
    ele: ['Sagrado', 'arma'],
    ordem: [['Fé', 10, 'HP máximo e resistência sagrada.'], ['holycross', 10, 'Dano sagrado em alvo único.'], ['shieldboom', 5, 'Dano à distância com escudo.'], ['grandcross', 10, 'Área sagrada (custa HP).'], ['Devoção', 5, 'Proteger o grupo.'], ['shieldchain', 5, 'Melhor dano físico com escudo.']],
    rot: ['shieldchain', 'holycross', 'shieldboom'],
    equip: ['Escudo pesado com refino alto (o bumerangue escala com peso e refino).', 'Linhas de redução de dano por raça e elemento.'],
    dicas: ['Crux Divinum e Crux Magnum são sagrados: excelentes contra mortos-vivos e demônios (veja a coluna “fraqueza” nos mapas).', 'Para tanquear MVP, priorize VIT, RES (STA) e redução de dano antes de dano.'],
    evitar: ['Usar Crux Magnum com pouco HP: o custo pode matar você.']
  },
  pal: { base: 'cru', resumo: 'Evolução do Templário com Disparo Perfurante, um dos melhores golpes físicos de lança.',
    ordem: [['overbrand', 5, 'Dano principal com lança.'], ['shieldchain', 5, 'Alternativa com escudo.'], ['holycross', 10, 'Dano sagrado.'], ['grandcross', 10, 'Área sagrada.'], ['pressure', 5, 'Dano fixo que ignora defesa.']],
    rot: ['overbrand', 'shieldchain', 'holycross'] },
  mag: {
    role: 'Dano mágico elemental', diff: 1, resumo: 'Lanças elementais (Fogo, Gelo, Raio) escolhidas pela fraqueza do alvo. Muralha de Fogo protege contra monstros corpo a corpo.',
    stats: [['int', 50], ['dex', 40], ['vit', 20], ['int', 80], ['dex', 60]], ele: ['Fogo', 'Água', 'Vento', 'Fantasma'], aoe: true,
    ordem: [['firebolt', 10, 'Monstros de Terra e mortos-vivos.'], ['coldbolt', 10, 'Monstros de Fogo.'], ['lightning', 10, 'Monstros de Água.'], ['Aumentar Recuperação de SP', 10, 'Essencial para o ritmo de up.'], ['firewall', 10, 'Proteção e dano em fila.'], ['soulstrike', 10, 'Fantasmas e mortos-vivos.'], ['thunderstorm', 10, 'Área para grupos.'], ['frostdiver', 10, 'Congela alvos perigosos.']],
    rot: ['firebolt', 'coldbolt', 'lightning', 'thunderstorm'],
    equip: ['Cajado com ATQM e redução de conjuração.', 'Vestes com INT ou SP.', 'Linhas: ATQM %, dano mágico vs raça e conjuração variável.'],
    dicas: ['DES reduz a conjuração variável: equilíbrio INT/DES rende mais DPS do que só INT.'], evitar: ['Enfrentar grupos sem Muralha de Fogo ou Rajada de Gelo.']
  },
  wiz: {
    role: 'Dano mágico em área', diff: 2, resumo: 'O rei do up em área: Rajada de Gelo, Louvor de Odin e Tempestade de Meteoros limpam grupos inteiros.',
    stats: [['int', 60], ['dex', 50], ['vit', 30], ['int', 100], ['dex', 80], ['int', 120], ['vit', 60], ['dex', 100]], traits: [['spl', 50], ['wis', 20], ['con', 20]],
    ele: ['Água', 'Vento', 'Fogo', 'Terra'], aoe: true,
    ordem: [['stormgust', 10, 'Área de água que congela: base do up.'], ['lov', 10, 'Área de vento.'], ['firebolt2', 10, 'Área de fogo.'], ['jt', 10, 'Alvo único de vento (chefes).'], ['wom', 5, 'Terra em alvo único.'], ['Quagmire', 5, 'Reduz AGI e DES dos inimigos.'], ['Amplificação Mística', 10, 'Use antes da área principal.']],
    rot: ['stormgust', 'lov', 'firebolt2', 'jt'],
    equip: ['Cajado de 2 mãos com ATQM alto.', 'Vestes e acessórios com conjuração variável e SP.', 'Linhas: dano mágico vs elemento do mapa e S.ATQM.'],
    dicas: ['Na simulação, use 1v10 com farm contínuo para medir o ritmo real de up.', 'Escolha o mapa pela fraqueza: Rajada de Gelo em monstros de Fogo, Louvor de Odin em monstros de Água.'],
    evitar: ['Upar sozinho sem DES suficiente: a conjuração longa deixa os monstros chegarem.']
  },
  hwz: { base: 'wiz', resumo: 'Evolução do Bruxo com Amplificação Mística e mais SP: dano em área ainda maior.',
    ordem: [['amp', 10, 'Use antes de cada área principal.'], ['stormgust', 10, 'Área de água.'], ['lov', 10, 'Área de vento.'], ['firebolt2', 10, 'Área de fogo.'], ['jt', 10, 'Chefes.']] },
  sag: {
    role: 'Suporte / mago de raios', diff: 3, resumo: 'Usa raios com conjuração rápida e encantamentos de elemento na arma do grupo.',
    stats: [['int', 60], ['dex', 60], ['vit', 30], ['int', 100], ['dex', 90], ['vit', 60]], ele: ['Fogo', 'Água', 'Vento'],
    ordem: [['firebolt', 10, ''], ['coldbolt', 10, ''], ['lightning', 10, ''], ['Livre Conjuração', 10, 'Anda enquanto conjura.'], ['Ataque Automático', 10, 'Raios automáticos ao atacar.'], ['amp', 5, '']],
    rot: ['firebolt', 'coldbolt', 'lightning'], equip: ['Livro com ATQM.', 'Redução de conjuração.'],
    dicas: ['O Sábio rende mais em grupo do que sozinho.'], evitar: []
  },
  pro: { base: 'sag', resumo: 'Evolução do Sábio com Explosão Mágica e Bola de Fogo Anímica.',
    ordem: [['magicnuke', 5, 'Área principal.'], ['soulburn', 5, 'Alvo único de alto dano.'], ['firebolt', 10, ''], ['coldbolt', 10, ''], ['lightning', 10, '']], rot: ['magicnuke', 'soulburn', 'firebolt'] },
  arc: {
    role: 'Dano físico à distância', diff: 1, resumo: 'Disparo Triplo para alvo único e Chuva de Flechas para grupos. DES é o atributo principal.',
    stats: [['dex', 50], ['agi', 30], ['dex', 70], ['luk', 10], ['agi', 50], ['str', 20]], ele: ['arma'],
    ordem: [['Olhos de Coruja', 10, 'DES extra.'], ['ds', 10, 'Dano principal.'], ['Olhos de Águia', 10, 'Alcance.'], ['twilight', 10, 'AGI e DES extras.'], ['shower', 10, 'Área.']],
    rot: ['ds', 'shower'], equip: ['Arco com flechas do elemento da fraqueza do alvo.'],
    dicas: ['Troque o elemento da flecha conforme o mapa.'], evitar: ['Ignorar AGI: a velocidade de ataque cai muito.']
  },
  hun: {
    role: 'Dano à distância e falcão', diff: 2, resumo: 'Combina Disparo Triplo e ataques do falcão (Golpe do Falcão), que ignora a defesa e escala com DES e INT.',
    stats: [['dex', 60], ['agi', 40], ['dex', 90], ['int', 30], ['agi', 70], ['dex', 120], ['luk', 30]], traits: [['pow', 30], ['con', 30], ['crt', 20]], ele: ['arma'],
    ordem: [['ds', 10, 'Dano base.'], ['Domesticar Falcão', 1, 'Libera os golpes do falcão.'], ['blitz', 5, 'Dano em área que ignora defesa.'], ['sharp', 5, 'Linha de dano.'], ['aimed', 10, 'Alvos presos em armadilha.'], ['impos', 10, 'Buff de velocidade.']],
    rot: ['sharp', 'ds', 'blitz'], equip: ['Arco com cartas de raça.', 'Linhas: dano à distância %, dano vs Chefe.'],
    dicas: ['Na simulação, compare 1v1 e 1v5: o falcão rende mais em grupos.'], evitar: []
  },
  sni: { base: 'hun', resumo: 'Evolução do Caçador com Disparo Perfeito e Tempestade de Flechas.',
    ordem: [['arrowstorm', 10, 'Área principal.'], ['charge2', 5, 'Alvo único em linha.'], ['sharp', 5, ''], ['ds', 10, ''], ['blitz', 5, '']], rot: ['arrowstorm', 'charge2', 'sharp'] },
  bar: {
    role: 'Suporte com músicas', diff: 3, resumo: 'Músicas de grupo e Golpe Musical para dano. Brilha em grupo.',
    stats: [['dex', 60], ['agi', 40], ['vit', 40], ['dex', 90], ['int', 40], ['vit', 70]], ele: ['arma'],
    ordem: [['musical', 5, 'Dano principal com instrumento.'], ['ds', 10, 'Herdado do Arqueiro.'], ['slinging', 5, 'Dano em área contínuo.']],
    rot: ['musical', 'ds'], equip: ['Instrumento com DES.'], dicas: ['O valor do Bardo está nas músicas de grupo, que a simulação não mede.'], evitar: []
  },
  min: { base: 'bar', resumo: 'Evolução do Bardo com Tempestade de Flechas.', ordem: [['arrowstorm', 10, 'Área principal.'], ['musical', 5, ''], ['ds', 10, '']], rot: ['arrowstorm', 'musical'] },
  dan: { base: 'bar', resumo: 'Versão feminina do Bardo, com chicote e danças de grupo.', equip: ['Chicote com DES.'] },
  gyp: { base: 'min', resumo: 'Evolução da Odalisca com Tempestade de Flechas.' },
  aco: {
    role: 'Suporte e cura', diff: 1, resumo: 'Buffs essenciais (Bênção e Aumentar Agilidade) e dano sagrado contra mortos-vivos.',
    stats: [['int', 50], ['dex', 30], ['vit', 30], ['int', 80], ['dex', 50]], ele: ['Sagrado'],
    ordem: [['Curar', 10, 'Cura.'], ['bless', 10, 'Buff principal.'], ['agiup', 10, 'Velocidade e FLEE.'], ['holylight', 1, 'Dano sagrado.'], ['turn', 5, 'Contra mortos-vivos.']],
    rot: ['holylight'], equip: ['Maça ou cajado com INT.'], dicas: ['Upe em mapas de mortos-vivos: a fraqueza a sagrado dobra o dano.'], evitar: []
  },
  pri: {
    role: 'Suporte / exorcista', diff: 2, resumo: 'Melhor suporte do jogo; a variante de batalha usa Magnus Exorcismus em mapas de mortos-vivos e demônios.',
    stats: [['int', 70], ['dex', 50], ['vit', 40], ['int', 110], ['dex', 80], ['vit', 70]], traits: [['spl', 40], ['wis', 30], ['sta', 20]], ele: ['Sagrado'], aoe: true,
    ordem: [['magnus', 10, 'Área sagrada.'], ['judex', 5, 'Alvo único.'], ['gloria', 5, 'SOR para o grupo.'], ['impositio', 5, 'ATQ para o grupo.'], ['suffragium', 3, 'Acelera conjurações.']],
    rot: ['magnus', 'judex'], equip: ['Linhas: dano mágico vs Morto-vivo/Demônio.'],
    dicas: ['Filtre os mapas pela fraqueza “Sagrado”.'], evitar: ['Mapas de monstros sagrados: o dano cai a quase zero.']
  },
  hpr: { base: 'pri', resumo: 'Evolução do Sacerdote com Judex no nível 5 (1.320% a 3.000% de ATQM em área 5x5). Adoramus só vem por item ou Ascensão.', ordem: [['magnus', 10, 'Área sagrada.'], ['judex', 5, 'Principal dano em área 5x5.']], rot: ['judex', 'magnus'] },
  mon: {
    role: 'Explosão de dano / combos', diff: 3, resumo: 'Golpe de Esfera (Asura Strike) dá o maior dano único do jogo; o combo em cadeia mantém o dano contínuo.',
    stats: [['str', 60], ['dex', 40], ['agi', 40], ['str', 100], ['int', 40], ['vit', 50], ['str', 120]], traits: [['pow', 50], ['con', 20]], ele: ['arma'],
    ordem: [['spirit', 5, 'Esferas para os combos.'], ['tigerfist', 5, 'Início do combo.'], ['chain', 5, 'Continuação do combo.'], ['fingeroff', 5, 'Dano à distância.'], ['investigate', 5, 'Ignora defesa (melhor em alvos de DEF alta).'], ['cp', 5, 'Golpe final de MVP.']],
    rot: ['cp', 'chain', 'tigerfist', 'investigate'], equip: ['Soqueira com cartas de raça.', 'SP alto para Asura.'],
    dicas: ['Investigar escala com a DEF do alvo: teste contra MVPs blindados na simulação.'], evitar: []
  },
  cha: { base: 'mon', resumo: 'Evolução do Monge com Explosão da Esfera.', ordem: [['exp', 5, 'Golpe forte que ignora defesa.'], ['cp', 5, ''], ['chain', 5, ''], ['tigerfist', 5, '']], rot: ['cp', 'exp', 'chain'] },
  mer: {
    role: 'Comércio / dano com zeny', diff: 1, resumo: 'Mammonita converte zeny em dano. Carrinho e desconto ajudam na economia.',
    stats: [['str', 50], ['dex', 30], ['vit', 30], ['str', 80], ['agi', 30]], ele: ['arma'],
    ordem: [['Desconto', 10, 'Economia.'], ['Superfaturar', 10, 'Economia.'], ['mammonite', 10, 'Dano principal.'], ['cartrev', 1, 'Área com carrinho.']],
    rot: ['mammonite', 'cartrev'], equip: ['Machado de 1 mão.'], dicas: ['Mammonita gasta zeny por uso.'], evitar: []
  },
  bla: {
    role: 'Corpo a corpo / ferreiro', diff: 2, resumo: 'Impulso e Aprimorar Arma dão ATQ alto. Também forja armas.',
    stats: [['str', 70], ['dex', 50], ['agi', 40], ['str', 110], ['vit', 50], ['dex', 80]], traits: [['pow', 40], ['con', 20]], ele: ['arma'],
    ordem: [['overthrust', 5, 'ATQ do grupo.'], ['weaponperf', 5, 'Remove penalidade de tamanho.'], ['axeboom', 5, 'Dano à distância.'], ['hammerfall', 5, 'Atordoa grupos.'], ['maximize', 5, 'Golpe forte.']],
    rot: ['maximize', 'axeboom'], equip: ['Machado de 2 mãos.'], dicas: [], evitar: []
  },
  whi: { base: 'bla', resumo: 'Evolução do Ferreiro com Canhão de Carrinho.', ordem: [['cartcannon', 5, 'Dano à distância em área.'], ['maximize', 5, ''], ['axeboom', 5, '']], rot: ['cartcannon', 'maximize', 'axeboom'] },
  alc: {
    role: 'Dano com frascos', diff: 3, resumo: 'Terror Ácido e Demonstração causam dano que ignora parte da defesa.',
    stats: [['str', 50], ['int', 50], ['dex', 50], ['vit', 50], ['str', 90], ['int', 90]], ele: ['arma', 'Fogo'],
    ordem: [['acidterror', 5, 'Alvo único.'], ['demonstration', 10, 'Área de fogo.'], ['crazyuproar', 10, ''], ['crazywind', 5, '']],
    rot: ['acidterror', 'demonstration'], equip: [], dicas: ['Os frascos custam itens consumíveis.'], evitar: []
  },
  cre: { base: 'alc', resumo: 'Evolução do Alquimista.' },
  thi: {
    role: 'Esquiva e velocidade', diff: 1, resumo: 'FLEE alto e ataques duplos. Base dos Mercenários e Arruaceiros.',
    stats: [['agi', 50], ['str', 40], ['dex', 30], ['agi', 80], ['str', 60]], ele: ['arma', 'Veneno'],
    ordem: [['Ataque Duplo', 10, 'Mais dano com adaga.'], ['Esquiva Aprimorada', 10, 'FLEE.'], ['envenom', 10, 'Dano de veneno.'], ['Furto', 5, '']],
    rot: ['envenom'], equip: ['Adaga com cartas de raça.'], dicas: [], evitar: []
  },
  ass: {
    role: 'Dano físico explosivo', diff: 2, resumo: 'Katar com Golpe Sônico é o dano clássico; Dente do Sombrio atinge à distância.',
    stats: [['agi', 60], ['str', 60], ['dex', 40], ['str', 100], ['agi', 90], ['luk', 30], ['str', 120]], traits: [['pow', 40], ['con', 30]], ele: ['arma', 'Veneno'],
    ordem: [['Maestria em Katar', 10, ''], ['sonicblow', 10, 'Dano principal.'], ['grimtooth', 5, 'Área à distância.'], ['epiclesis', 5, 'Furtividade.'], ['raid', 5, '']],
    rot: ['sonicblow', 'grimtooth'], equip: ['Katar com cartas de raça e crítico.'], dicas: ['Builds de crítico com SOR funcionam bem com Katar.'], evitar: []
  },
  asx: { base: 'ass', resumo: 'Evolução do Mercenário com Cruz de Veneno e Tempestade de Meteoros.', ordem: [['cross', 5, 'Alvo único.'], ['meteor', 10, 'Área.'], ['sonicblow', 10, ''], ['grimtooth', 5, '']], rot: ['cross', 'meteor', 'sonicblow'] },
  rog: {
    role: 'Flexível / cópia', diff: 2, resumo: 'Pode copiar habilidades (Plágio) e usar arco ou adaga.',
    stats: [['dex', 50], ['str', 50], ['agi', 40], ['str', 90], ['dex', 80]], ele: ['arma'],
    ordem: [['backstab', 10, 'Dano com adaga.'], ['ds', 10, 'Com arco.'], ['shower', 10, 'Área.'], ['Plágio', 10, '']],
    rot: ['backstab', 'ds'], equip: [], dicas: [], evitar: []
  },
  sta: { base: 'rog', resumo: 'Evolução do Arruaceiro.', ordem: [['raid', 5, ''], ['backstab', 10, ''], ['ds', 10, '']], rot: ['backstab', 'ds', 'raid'] },
  gun: {
    role: 'Dano à distância por arma de fogo', diff: 2, resumo: 'Cada arma de fogo muda o estilo: rifle para alvo único, espingarda e metralhadora para área.',
    stats: [['dex', 60], ['agi', 40], ['dex', 100], ['str', 30], ['agi', 70], ['dex', 120]], traits: [['pow', 30], ['con', 40]], ele: ['arma'], aoe: true,
    ordem: [['madness', 10, 'Precisão.'], ['triple', 5, ''], ['tracking', 10, 'Alvo único com rifle.'], ['desperado', 10, 'Área ao redor com revólver.'], ['spread', 10, 'Área com espingarda.'], ['fullblast', 10, '']],
    rot: ['tracking', 'desperado', 'spread'], equip: ['Balas do elemento da fraqueza.'], dicas: [], evitar: []
  },
  nin: {
    role: 'Híbrido físico e mágico', diff: 3, resumo: 'Usa ninjutsu elemental ou arremessos (Huuma, Shuriken).',
    stats: [['int', 60], ['dex', 60], ['vit', 30], ['int', 100], ['dex', 90]], ele: ['Fogo', 'Água', 'Vento'], aoe: true,
    ordem: [['katon', 10, 'Fogo.'], ['hyou', 10, 'Água.'], ['windblade', 10, 'Vento.'], ['dragonfire', 10, 'Área de fogo.'], ['huuma', 5, 'Físico em área.']],
    rot: ['dragonfire', 'katon', 'hyou'], equip: [], dicas: [], evitar: []
  },
  tae: {
    role: 'Chutes e posturas', diff: 2, resumo: 'Combos de chutes ativados por posturas.',
    stats: [['agi', 50], ['str', 50], ['dex', 30], ['str', 90], ['agi', 80]], ele: ['arma'],
    ordem: [['tornado', 5, ''], ['heel', 5, ''], ['dodge', 5, ''], ['counter', 5, '']], rot: ['tornado', 'heel', 'counter'], equip: [], dicas: [], evitar: []
  },
  sg: { base: 'tae', resumo: 'Mestre Taekwon: bônus por mapa, monstro e dia (Sol, Lua, Estrela).', ordem: [['stargaze', 5, 'Área.'], ['tornado', 5, ''], ['heel', 5, '']], rot: ['stargaze', 'tornado', 'heel'] },
  sl: { base: 'tae', role: 'Suporte com espíritos', resumo: 'Concede espíritos que transformam outras classes; dano mágico com Raio da Estrela.',
    stats: [['int', 60], ['dex', 50], ['vit', 40], ['int', 100], ['dex', 80]], ele: ['Fantasma'], ordem: [['kaupe', 5, ''], ['soullinker', 5, '']], rot: ['kaupe', 'soullinker'] }
};
YGG.guideFor = function (id) {
  var G = YGG.guides, g = G[id];
  if (!g) { var c = YGG.classById[id]; while (c && !G[c.id]) c = c.parent && YGG.classById[c.parent]; g = c ? G[c.id] : G.nov; }
  var chain = [g], x = g;
  while (x.base && G[x.base]) { x = G[x.base]; chain.unshift(x); }
  return chain.reduce(function (a, o) { return Object.assign(a, o); }, {});
};
