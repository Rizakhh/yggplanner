// Changelog do YggPlanner — a primeira entrada é sempre a versão atual.
// Regra: grande mudança → 0.(x+1).0 · hotfix estrutural → 0.x.(y+1) · hotfix leve (texto, imagem, bug leve) → mesmo número + "-hf1", "-hf2"…
// O primeiro número só muda no lançamento final (1.0.0).
window.YGG = window.YGG || {};
YGG.changelog = [
  {
    v: '0.2.11-hf2', d: '2026-11-25', t: 'Habilidades concedidas na simulação',
    g: [
      ['Simulação', [
        'Ressonância (Faísca Pigritia) agora entra na rotação, com 1.000% a 2.200% do ATQM multiplicado pelo nível de base, em área.',
        'Outras 22 habilidades concedidas por equipamentos ou pela Árvore do Caos ganharam modelo de dano e também entram na rotação: Meteoro Escarlate, Onda Psíquica, Corrente Elétrica, Luz da Criação, Eswhoo, Brisa Cortante, Congelamento, Esfera d’Água, Lâminas Retalhadoras, Ofensiva Fatal, Esporo Explosivo, Lançar Míssil, Disparo de Esferas Espirituais, Chute Aéreo, Arremessar Tomahawk, Passo Sombrio, Sombra do Templário, Tornado de Carrinho, Planta Infernal, Trindade, Rush Strike e Triple Laser.',
        'Habilidades das árvores que não tinham modelo agora estão na simulação da própria classe: Congelamento e Esfera d’Água (Bruxo), Brisa Cortante (Ninja), Chute Aéreo (Taekwon).',
        'Bônus de equipamento “Dano de [habilidade] +X%” passam a contar no dano simulado de todas as habilidades (antes só apareciam na ficha).',
        'Habilidades cujo dano depende do nível de base (Ressonância, Meteoro Escarlate, Lâminas Retalhadoras...) agora levam isso em conta.',
        'Habilidades concedidas que não causam dano (Teleporte, Furto, buffs, recalls...) seguem só na aba Extra.'
      ]],
      ['Equipamentos', [
        'Faísca Pigritia corrigida pelo cliente do jogo: ATQM 180, “Odaliscas e evoluções”, Amplificação Mística só no refino +13, “Dano mágico de todas as propriedades +5%” e “Ignora 20% da DEFM” (antes contava como DEF física).'
      ]]
    ]
  },
  {
    v: '0.2.11-hf1', d: '2026-11-25', t: 'Filtro de classe dos equipamentos',
    g: [
      ['Equipamentos', [
        'O filtro “Somente usáveis pela classe” lia mal a lista de classes de muitos itens e os escondia. Agora entende classes separadas por “/” (“Bardo / Dançarina”), “e evoluções”, nomes no plural (“Espadachins”, “Arqueiros”), “Apenas…” e “Todas as classes, exceto…”. Cerca de 640 itens voltaram a aparecer para as classes certas.',
        'Por isso a Faísca Pigritia (que concede Ressonância) não aparecia para Bardo/Dançarina e a habilidade nunca chegava à aba Extra. O mesmo acontecia com Tentáculo Afiado, Cruz Impiedosa, Lâmina dos Céus, Lâmina do Infinito, Lâmina Sagrada, Certeira Ilusional, Katar do Algoz, os Manuais (Ninja, Justiceiro, Taekwon), as Vestes de Ghostring/Angeling e as armas Ancestral/Primordial, entre outros.',
        'Itens só de “Aprendiz” não aparecem mais para todas as classes, e “Todas as classes, exceto Aprendiz” deixou de valer para o Aprendiz.',
        'Itens restritos a classes 3 e 4 (Arcebispo, Feiticeiro, Guardião Real...) seguem fora do filtro, porque o planner vai até as transcendentais.'
      ]]
    ]
  },
  {
    v: '0.2.11', d: '2026-11-25', t: 'Habilidades concedidas por equipamentos',
    g: [
      ['Habilidades', [
        'Equipamentos, cartas e consumíveis que concedem uma habilidade agora a mostram sozinhos na aba Extra. O planner passou a reconhecer cerca de 290 desses efeitos, antes eram menos de 200: textos como “Permite o uso da habilidade Teleporte em nível 1”, “Habilita [Identificar Item] e [Sentido Sobrenatural] nv. 1” e “Concede [Consagração] nv. 5”.',
        'Habilidades de fora das árvores das classes (Teleporte, Bloqueio, Poder de Odin, Consagração, Para Prontera...) usam o nome do cliente do jogo.',
        'Autoconjuração (“chance de autoconjurar…”) não conta: a habilidade não fica disponível para usar.'
      ]],
      ['Simulação', [
        'Na rotação, as habilidades concedidas aparecem num grupo próprio, com o nível e o item de origem.',
        'O nível segue o item. Ao tirar o equipamento, a habilidade sai da rotação.'
      ]]
    ]
  },
  {
    v: '0.2.10', d: '2026-11-25', t: 'Simulação: redução de dano e elemento da arma',
    g: [
      ['Simulação', [
        'A redução de dano recebido agora entra na simulação: Chefes (Miniboss e MVP), Monstros, Física, Caos e Matilha. Antes só valia a de monstros comuns, e contra chefes nenhuma.',
        'O Def. crítico do jogador não reduz mais o crítico dele mesmo; a tabela “Dano esperado” e o Resultado agora batem.',
        'O ataque básico de builds à distância passa a usar o bônus de dano à distância, não o de corpo a corpo.',
        'Novo campo “Elemento da arma” no cenário (arma elemental, Endow): vale para o ataque básico e habilidades sem elemento próprio.'
      ]]
    ]
  },
  {
    v: '0.2.9-hf1', d: '2026-11-25', t: 'Condições escritas por extenso e acessórios de um lado só',
    g: [
      ['Equipamentos', [
        'No editor do item, os efeitos marcados como “(condicional)” agora mostram a condição como no jogo, por exemplo: “Refino +7 ou mais”, “A cada 18 de FOR base”, “Conjunto com Botas de Diabolus”, “Ao realizar ataques físicos”, “A cada nível de [Rapidez com Duas Mãos]” e “Só no Inferno”.',
        'Acessórios que o jogo só deixa usar de um lado agora aparecem apenas nesse lado. Exemplos: Máscara de Oni (esquerdo), Luvas de atributo (direito), Brincos Sombrios (direito) e Colares Sombrios (esquerdo). São 294 acessórios (130 comuns e 164 sombrios), com o lado lido do cliente do jogo.',
        'O editor do item mostra em qual lado ele vai, por exemplo “só no Acessório (E)”.',
        'Builds salvas com o acessório do lado errado: o item passa para o lado certo se ele estiver livre. Se não estiver, o item sai da build. Enquanto estiver do lado errado, ele não conta no cálculo.'
      ]],
      ['Cartas', [
        'Cartas de acessório de um lado só agora encaixam apenas nesse lado, tanto como carta quanto como gema. Exemplos: Búfalo Bandido e Raydric Maldito (esquerdo), Búfalo Pistoleiro e Arqueiro Maldito (direito). São 15 cartas, e a Geodoliant continua só no Acessório Direito, como na atualização de 25/11.'
      ]]
    ]
  },
  {
    v: '0.2.9', d: '2026-11-25', t: 'Efeitos atuais ao passar o mouse no equipamento',
    g: [
      ['Equipamentos', [
        'Ao passar o mouse num item da aba Equipamentos, o quadro agora lista os efeitos que ele concede neste momento: bônus padrão, de refino e de conjunto, cada carta (com o nome), gemas, encantamentos e os bônus aleatórios com os valores sorteados.',
        'Cada bônus tem a cor da sua origem (padrão, refino, conjunto, carta, gema, encantamento, destino e aleatório), com uma legenda no fim do quadro.',
        'Só aparece o que está ativo: bônus de refino já contam o refino atual e efeitos de conjunto só entram quando o combo está completo.',
        'O espaço de carta não aparece mais duplicado no nome (antes saía “Espada [3] [3]”).'
      ]]
    ]
  },
  {
    v: '0.2.8', d: '2026-11-25', t: 'Atualização do YggIdle: Cabra Macho na Capa, anéis novos e Ascensão Ying da Cigana',
    g: [
      ['Equipamentos', [
        'Anel do Vulcão e Anel da Vibração reformulados: novos atributos e autoconjurações ao realizar ataques físicos, 1 espaço de carta e uso por todas as classes. A DEF do Anel da Vibração passou de 2 para 0.',
        'Conjunto dos dois anéis com os novos efeitos: Brandir Machado nv. 5 (5%), Lex Aeterna nv. 1 (2%) e Campo Gravitacional nv. 5 (2%).',
        'A Capa agora aceita gemas: 1 normal e 1 de miniboss/MVP (das Sementes do Herói, da Magia e dos Deuses).'
      ]],
      ['Cartas', [
        'Cabra Macho (normal e Selada) agora vai na Capa, e o bônus por refino usa o refino da Capa.',
        'General Tartaruga Selada: dano físico +10% (+15% no refino +15), e o Impacto Explosivo também sai em habilidades físicas.',
        'Geodoliant só no Acessório Direito, com 7% de Onda Psíquica nv. 2. O conjunto com Ungoliant continua igual.',
        'General das Almas: ao usar Kaupe, 10% de chance de dano mágico +20% por 5 segundos.',
        'Ascensão de LHZ: RES, MRES e Talentos +10 só contam no Inferno.'
      ]],
      ['Árvore do Caos', [
        'Ascensão Ying da Cigana com os Nós I a IV: Domínio Musical nv. 10; Ritmo Contagiante nv. 5 e −15% de custo de SP; 5% de chance de Destino nas Cartas em habilidades mágicas; HP +15% e SP +10%.',
        'Efeitos que reduzem o custo de SP agora aparecem com sinal de menos.'
      ]],
      ['Habilidades', [
        'Destino nas Cartas com as 14 cartas novas e a regra de uma carta ativa por vez. Pela Ascensão da Cigana ou pelo Anel da Vibração, Sono e Incêndio também funcionam em chefes.'
      ]]
    ]
  },
  {
    v: '0.2.7-hf1', d: '2026-11-24', t: 'Comparar etapas, link ainda menor e mapa do Caos no toque',
    g: [
      ['Etapas', [
        'Novo quadro “Comparar etapas” na barra lateral: mostra nível, HP, SP, ATQ, DEF, precisão, esquiva, crítico e velocidade de ataque da etapa atual e quanto mudou em relação a outra etapa.',
        'Botão “Copiar para…” na barra de etapas: copia só o que você marcar (nível e atributos, equipamentos, habilidades e buffs) para outra etapa.'
      ]],
      ['Simulação', [
        'A barra de etapas também aparece na Simulação, e o novo botão “Comparar etapas” roda o mesmo alvo e a mesma rotação com cada etapa preenchida, mostrando DPS e tempo para matar lado a lado.'
      ]],
      ['Link', [
        'O link ficou mais uns 12% menor (nomes de campo curtos e bônus aleatórios compactados). Links das versões anteriores continuam abrindo.'
      ]],
      ['Árvore do Caos', [
        'No celular, um dedo arrasta o mapa e dois dedos aproximam ou afastam.'
      ]],
      ['Desempenho', [
        'A primeira abertura baixa cerca de metade dos dados de itens do cliente: as descrições dos itens agora carregam logo depois que a tela aparece.'
      ]]
    ]
  },
  {
    v: '0.2.7', d: '2026-11-24', t: 'Etapas de progressão, link curto e correções nas árvores',
    g: [
      ['Etapas', [
        'Novas abas Início · Meio do Jogo · Fim do Jogo em Status, Equipamentos e Habilidades. Cada etapa guarda seu próprio nível, atributos, traços, equipamentos e habilidades; classe, Árvore do Caos e consumíveis são comuns às três.',
        'Uma etapa vazia começa como cópia da etapa em que você estava. Builds antigas abrem em Fim do Jogo.'
      ]],
      ['Link', [
        'O link de compartilhamento ficou bem mais curto (cerca de 4 a 5 vezes menor): só vai o que difere do padrão, comprimido. Links antigos continuam abrindo.',
        'Ao copiar, o aviso mostra quantos caracteres o link tem.'
      ]],
      ['Habilidades', [
        'Depois de gastar os 49 pontos da 1ª classe, os pontos da classe seguinte também podem ir para a árvore da 1ª classe, como no jogo.'
      ]],
      ['Árvore do Caos', [
        'Clicar ou arrastar sobre os nós grandes não trava mais o mapa nem o deixa preso ao mouse.'
      ]]
    ]
  },
  {
    v: '0.2.6', d: '2026-11-24', t: 'Equipamentos reorganizados e troca Comum/Sombrio/Visual',
    g: [
      ['Equipamentos', [
        'Novo seletor Comum · Sombrio · Visual no topo do quadro de Equipamentos. O Sombrio e o Visual usam o mesmo quadro dos equipamentos comuns, com cada slot na posição do equivalente comum (ex.: Sombrio: calçado no lugar do Calçado). O quadro separado “Sombrio e Visual” saiu.',
        'Slots em pares: Elmo superior e Elmo médio · Elmo inferior e Armadura · Arma e Escudo · Manto e Calçado · Acessório (D) e Acessório (E).',
        'O modo escolhido fica salvo no navegador.'
      ]]
    ]
  },
  {
    v: '0.2.5-hf1', d: '2026-11-24', t: 'Cartas e gemas só no slot de origem',
    g: [
      ['Equipamentos', [
        'Gemas de carta agora só aceitam cartas do próprio slot: carta de armadura só na Armadura, de calçado só no Calçado, de acessório só no Acessório e de cabeça só no Elmo médio. Antes a gema aceitava carta de qualquer um desses slots.',
        'A gema normal só aceita carta normal e a gema de miniboss/MVP só aceita carta de miniboss ou MVP, sempre do mesmo slot.',
        'Builds salvas ou importadas com carta ou gema no slot errado têm o encaixe esvaziado ao abrir, e esses encaixes não contam mais no cálculo.',
        'Gemas não ativam mais combos de cartas, como já dizia a dica do editor. Antes uma carta usada como gema completava o conjunto.'
      ]]
    ]
  },
  {
    v: '0.2.5', d: '2026-11-24', t: 'Bênçãos da Batina Angelical',
    g: [
      ['Equipamentos', [
        'Bênçãos de FOR, AGI, VIT, DES, INT e SOR: encantamento que vai na própria Batina Angelical, escolhido no editor da armadura (campo “Encantamento”). Cada uma dá +10 no atributo, DEF +25, DEFM +3 e um bônus próprio (ex.: Bênção de FOR: dano físico +10%).',
        'A Bênção do mesmo atributo da Batina ativa o conjunto (ex.: Bênção de FOR na Batina Angelical FOR: dano físico +5% e +12% contra todas as raças). Numa armadura que não é Batina Angelical a Bênção não conta.'
      ]],
      ['Cálculo', [
        'Itens do cliente com bônus “contra todas as raças”, “contra todos os tamanhos”, “contra oponentes de todas as propriedades”, “de todas as propriedades” e “contra monstros Normais e Chefes” passam a contar no dano. Antes ficavam só no texto.'
      ]]
    ]
  },
  {
    v: '0.2.4', d: '2026-11-24', t: 'Joias do Caos e itens próprios do YggIdle',
    g: [
      ['Árvore do Caos', [
        'Quadro novo “Joias do Caos” na aba Árvore do Caos: 2 encaixes para Joias de Yggdrasil (Guardião: HP e SP +15%; Sombra: corpo a corpo +15%; Instinto: à distância +15%; Mágica: dano mágico +15%), que podem ser iguais.',
        'Cada Joia de Yggdrasil tem raridade e até 3 linhas de bônus do Lapidário, com a mesma lista e os mesmos valores da Joia do Destino. Cada encaixe só abre depois de comprar um Encaixe de Joia na árvore.',
        'Joia Ying Yang no Encaixe Ying Yang (depois da Fúria do Legado): +10 nos 6 traços. O efeito escondido, revelado no Abismo, não entra no cálculo.',
        'RES, MRES, Ignorar RES, P.ATQ, S.ATQM e traços das joias só contam no Sombrio, no Inferno e no Abismo, como no jogo.'
      ]],
      ['Itens', [
        'Anel do Mercador (acessório alugado, Desconto e Superfaturamento nível 10) incluído; ficava de fora porque a descrição não traz o tipo do item.',
        'Os demais itens próprios do YggIdle que não estão no planner não são equipamento nem dão bônus de combate: caixas, ovos, runas, chaves, gemas de cópia de carta e itens de mochila da Rifa (Lágrima de Mímir, Brasa de Surtur e afins).'
      ]]
    ]
  },
  {
    v: '0.2.3', d: '2026-11-24', t: 'Bônus aleatórios, Sombrio/Visual e itens do cliente',
    g: [
      ['Bônus aleatórios', [
        'Faixas de todos os bônus refeitas com os valores base do servidor do YggIdle. Antes o planner usava como base o valor que a wiki mostra para o Tier 4 e ainda multiplicava pelo tier, e os números passavam do limite do jogo. Exemplo: Ataque numa armadura Épica no Tier 4 ia até 91; agora vai de 19 a 38, como no jogo.',
        'Valor final = base da raridade × multiplicador do tier do mapa (T1 ×1, T2 ×2, T3 ×2,2, T4 ×2,4), arredondado. Builds salvas têm os bônus trazidos para dentro da faixa correta sozinhos.',
        'Precisão Perfeita passa a crescer com o tier do mapa, como no servidor.',
        'Tier 5 desabilitado no seletor (ainda não existe no YggIdle); equipamentos salvos em T5 passam para T4.'
      ]],
      ['Sombrio e Visual', [
        'Janela nova “Sombrio e Visual” na aba Equipamentos: 6 slots de equipamento sombrio (arma, escudo, armadura, calçado e dois acessórios) e 4 visuais (topo, meio, baixo e capa).',
        'Joia do Destino (Sombra · escudo) com refino até +15, bônus por refino (+7, +10, +12, +15) e bônus aleatórios próprios: a raridade sobe com o refino (Incomum no +10, Rara no +12, Épica no +15), cada raridade libera 1 linha e todas as linhas ficam com o valor da raridade atual.',
        'Conjunto Batina Angelical + Joia do Destino funcionando: bônus do conjunto e o bônus extra quando a soma dos refinos da Batina e da Joia chega a 30.'
      ]],
      ['Itens', [
        'Descrição do equipamento mais clara e um pouco maior no tooltip, para ler melhor.',
        '6.920 equipamentos e cartas do cliente do jogo que faltavam na wiki, entre eles as Batinas Angelicais (FOR, AGI, VIT, DES, INT e SOR), a Joia do Destino, equipamentos sombrios e visuais.',
        'Itens próprios do YggIdle lidos do cliente aparecem sempre, com a etiqueta verde “YggIdle · cliente”. Os que só estão no cliente (podem não existir no servidor) ficam com a etiqueta “só no cliente” e só aparecem marcando “Incluir itens que só estão no cliente do jogo” no seletor; nos slots Sombrio e Visual essa opção já vem marcada.'
      ]]
    ]
  },
  {
    v: '0.2.2', d: '2026-11-24', t: 'Hotfix dos pontos de atributo',
    g: [
      ['Atributos', ['Pontos de atributo iguais aos do YggIdle: o total por nível segue a tabela do servidor do jogo (3.330 pontos no nível 175 para as classes T, conferido num personagem real), e o custo para subir um atributo acima de 100 ficou certo (ex.: de 109 para 110 custa 20 pontos, e não 12).']]
    ]
  },
  {
    v: '0.2.1', d: '2026-11-24', t: 'Revisão de habilidades e visual',
    g: [
      ['Habilidades', [
        'Clicar numa habilidade avançada preenche sozinho os pré-requisitos (se houver pontos).',
        'Árvores revisadas com as páginas oficiais de classes do YggIdle: só ficam as habilidades que a wiki diz que passam a ser da classe.',
        'Saíram da árvore (vêm só de item ou Ascensão, aba Extra): Adoramus, Oratio, Perícia em Runas, Meteoro Escarlate, Ilimitar, Combo Rápido, Garra de Tigre, Esporo Explosivo, Farmacologia Especial e Distorção Crescente.',
        'Requisitos corrigidos: Judex (Esconjurar 1), Temporal de Flechas (Menestrel: Flecha Melódica 5; Cigana: Estilingada 5), Punho Arcano (Desejo Arcano 4, até o nível 10), Dragão Ascendente (Invocar Esfera Espiritual 5) e Disparo Triplo sem requisito.',
        'Judex com os valores do YggIdle: nível máximo 5, 1.320% a 3.000% de ATQM, área 5x5, alcance 11 e SP 23 / 29 / 34 / 38 / 42.',
        'Dados do cliente oficial do jogo (jogo.yggidle.com.br): o custo de SP por nível de todas as habilidades segue o jogo, inclusive na simulação. Corrigidos Judex, Disparo Perfurante (7 a 12), Perfurar em Espiral (9 a 15), Arremesso de Machado (20 a 28), Rajada Certeira (12 a 30), Frenesi (150), Destruidor de Almas (60), Disparo de Esferas Espirituais (10), Brisa Cortante (25), Dança do Ventre (35 a 47), Crux Magnum (78 no Nv 7) e Passo Etéreo (1).',
        'Tooltip mostra a descrição oficial do YggIdle, tirada do cliente do jogo, quando ela existe (133 habilidades).',
        'Disparo Perfurante aproveita só 50% do bônus de dano crítico no acerto crítico, como no jogo.',
        'Tooltip mostra primeiro “Como funciona no YggIdle”; a descrição e a tabela do bRO ficam marcadas como originais. Valores próprios do YggIdle para Adoramus, Disparo Perfurante e Perfurar em Espiral.'
      ]],
      ['Classes', [
        'As 1ª classes são as “T” (transcendentais): começam no nível 1 com 100 pontos de atributo e +25% de HP e SP.',
        'Guia do Sumo Sacerdote refeito em torno do Judex.'
      ]],
      ['Guia', ['Anotações pessoais ficam salvas no guia e vão junto no Link e no Exportar, para quem receber a build ler. As anotações antigas, guardadas só no navegador, são migradas sozinhas.']],
      ['Visual', ['Logo nova do Planner em SVG no cabeçalho (selo com a Yggdrasil e estrela-guia), no lugar do texto “YggPlanner”, e ícone da aba com o mesmo selo.']],
      ['Celular', ['Versão para celular e tablet corrigida, em pé e deitado: a página não passa mais da largura da tela, as abas rolam para o lado, o cabeçalho fica compacto, tabelas largas rolam dentro do próprio quadro e as janelas cabem na tela mesmo com o celular deitado.']],
      ['Estatísticas', ['Painel lateral com o mesmo visual do resto do app; categorias abrem e fecham clicando no título, sem caixa escura por trás.']],
      ['Mapas', [
        'Custo de entrada a partir do T3, com e sem VIP (T3: 125k VIP / 250k sem VIP; T4: 250k VIP / 500k sem VIP), na rota de mapas do guia, no seletor, na ampliação do mapa e na simulação.',
        'Rota de mapas do guia começa vazia e é dividida pelas etapas das missões de liberação de tier: Nv 1–31 (T1), 32–64 (missão do T2), 65–98 (missão do T3) e 99–175 (missão do T4). Cada etapa tem “+ Adicionar” e cada mapa tem “✕ Remover”, em destaque.',
        'O nível mínimo e máximo de cada mapa é livre (1 a 175) e fica direto no card, sem limite pela etapa.',
        'Os níveis 32, 65 e 99 (missões que liberam o tier seguinte) aparecem marcados na régua de nível; mapa colocado antes da missão do seu tier ganha um aviso.',
        'O seletor de mapas mostra primeiro os sugeridos para a etapa e, abaixo, todos os outros, que também podem ser adicionados.',
        'O “!” do comentário fica ao lado do nome do mapa, e não mais em cima da imagem.',
        'EXP por diferença de nível: cada monstro mostra quanto % da EXP o personagem recebe no nível do guia, e o card mostra a média do mapa. Até 2 níveis acima ou 5 abaixo: 100%; 3 a 9 acima: 102% a 120%; 10 a 14 acima: 40%; 15 acima: 20%; 16 ou mais acima: 5%; abaixo: 95% (6–10), 90% (11–15), 85% (16–20), 60% (21–25), 35% (26–30) e 10% (31 ou mais).',
        'Mapas T5 aparecem como bloqueados (ainda não existem no YggIdle) e não podem ser adicionados ao guia.',
        'No seletor, mapas cujos monstros estão 9 ou mais níveis abaixo do nível do guia ficam em cinza com a tag “Não recomendado” e a % de EXP que o personagem recebe. Eles continuam podendo ser adicionados.'
      ]],
      ['Tutores', [
        'Aba nova “Tutores” com as builds recomendadas pelos tutores de cada classe, em cards com o sprite do personagem, rótulos (Farm, Chefe, Iniciante…), resumo, tutor e data.',
        'A build principal de cada classe fica fixada no topo com o selo “★ Principal”.',
        'Cada card mostra em que versão do planner a build foi montada e avisa quando ela pode estar desatualizada.',
        'Filtros por classe atual ou todas as classes, por rótulo e busca por título, classe ou tutor.',
        'Perfil do tutor com descrição, links (Twitch, Discord…) e todas as builds dele.',
        '“Abrir no planner” carrega a build inteira (com guia e anotações); “Link” copia o link dela.',
        '“Enviar minha build” gera um bloco pronto, com a build atual, para o tutor mandar para revisão. Sem login: as builds entram por curadoria.',
        'O Guia avisa quando existe build de tutor para a classe.'
      ]],
      ['Itens', ['370 itens sem descrição na wiki ganharam a descrição oficial em português do cliente do jogo.']],
      ['Rodapé', ['O nome Rizakh já leva para a Twitch; saiu o endereço entre parênteses.']],
      ['Simulação', ['Cenário novo: céu e chão no tom de cada zona, miniatura do mapa, sombras, barras de HP/SP e dano flutuante.']]
    ]
  },
  {
    v: '0.2.0', d: '2026-11-24', t: 'Painel de estatísticas completo',
    g: [
      ['Estatísticas', [
        'Painel no formato do ALT+A do jogo: ATQ, ATQ Mágico, P.ATQ, S.ATQM, DEF, DEF Mágica, RES, MRES, Precisão, Esquiva, Esquiva Perfeita, Crítico e Vel. de Ataque.',
        'Novas seções: Ignora defesa (com excedente acima de 100%), Dano, Defesa e utilidade, Experiência e drop e Atributos de bônus.',
        'Todos os bônus aparecem com nome e valor legíveis (substitui a lista “Todos os bônus somados”, que não mostrava valores úteis).',
        'Estatísticas e Traços de 4ª classe podem ser minimizados; o planner lembra o que ficou fechado.',
        'Chave ON/OFF de Sombrio, Inferno e Abismo direto no painel de traços.'
      ]],
      ['Classes', [
        'Removidos o Aprendiz e as 2ª classes comuns, que não existem no YggIdle; builds salvas com elas migram para a transcendental.',
        'Seletor em três fileiras: primeiras classes, transcendentais e expandidas por último.'
      ]],
      ['Consumíveis', [
        'Todos os 378 consumíveis da wiki listados, separados por categoria com contagem.',
        'Mais efeitos reconhecidos: EXP, drop, EXP do Caos, regeneração e velocidade de movimento.'
      ]],
      ['Árvore do Caos', ['EXP, drop, Sacola de Zeny, regeneração e resistências a status agora aparecem no painel de estatísticas.']],
      ['Geral', ['Builds novas começam no nível 175 (nível máximo).']]
    ]
  },
  {
    v: '0.1.0', d: '2026-11-24', t: 'Versão inicial',
    g: [
      ['Build', [
        'Classes do YggIdle com atributos, talentos (4ª classe) e progressão ponto a ponto por nível.',
        'Equipamentos com refino, cartas, encantamentos e bônus de conjunto.',
        'Salvar, exportar, importar e compartilhar builds por link.'
      ]],
      ['Habilidades', [
        'Árvore real de pré-requisitos com ligações e nível exigido.',
        'Tooltip completo: descrição, SP, conjuração, recarga, alcance, tabela nível a nível e dano contra o monstro simulado.',
        'Progressão de habilidades por nível no guia, com aplicar/copiar da árvore.',
        'Aba Extra com habilidades concedidas por itens, cartas, pergaminhos e Ascensão.'
      ]],
      ['Sistemas', [
        'Consumíveis com ícones, descrições e efeitos originais somados às estatísticas.',
        'Árvore do Caos completa: mapa, custos, grupos exclusivos, lado Yang/Ying e Ascensão por classe.',
        'Fórmulas do jogo com valores da build e destaque das alteradas no YggIdle.'
      ]],
      ['Simulação', [
        'Cenário com fundo do mapa, personagem e monstro.',
        'Painel de estatísticas no estilo ALT+A.',
        'Dano esperado por golpe, crítico, uso, ciclo, DPS e usos para matar.'
      ]]
    ]
  }
];
