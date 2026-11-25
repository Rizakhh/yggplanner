// Changelog do YggPlanner — a primeira entrada é sempre a versão atual.
// Regra: grande mudança → 0.(x+1).0 · hotfix estrutural → 0.x.(y+1) · hotfix leve (texto, imagem, bug leve) → mesmo número + "-hf1", "-hf2"…
// O primeiro número só muda no lançamento final (1.0.0).
window.YGG = window.YGG || {};
YGG.changelog = [
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
