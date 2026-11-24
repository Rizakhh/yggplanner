/* Builds recomendadas pelos tutores — curadoria manual, sem login.
   Como adicionar:
   1. O tutor monta a build no planner, abre a aba Tutores e clica em "Enviar minha build".
      O planner gera um bloco pronto (com o código da build) para ele mandar para você.
   2. Cole o bloco em YGG.destaques abaixo e, se for um tutor novo, cadastre-o em YGG.tutores.
   3. Publique de novo o site.

   Campos de cada build:
     cls       id da classe (ex.: 'hpr', 'lor', 'sni')            sex  'm' ou 'f' (sprite do card)
     t         título                                             tutor  chave em YGG.tutores
     tags      rótulos livres; com cor própria: Farm, Chefe, Iniciante, PvP, Suporte, Endgame
     principal true = fica fixada no topo da classe
     lv        nível da build                                     v    versão do planner em que foi montada
     d         data (AAAA-MM-DD)                                  desc resumo curto
     code      código do botão Link ou Exportar (o link inteiro também serve)
     build     alternativa ao code: objeto parcial da build ({ cls, lv, name, ... })
     exemplo   true = card de demonstração (apague quando entrarem as builds reais) */
window.YGG = window.YGG || {};
YGG.tutores = {
  rizakh: {
    n: 'Rizakh', cls: 'hpr', sex: 'm',
    desc: 'Criador do YggPlanner. Lives de YggIdle com builds, farm e testes de dano.',
    links: [['Twitch', 'https://www.twitch.tv/rizakh']]
  }
};
YGG.destaques = [
  {
    cls: 'hpr', sex: 'm', t: 'Sumo Sacerdote Judex', tutor: 'rizakh', tags: ['Farm', 'Iniciante'], principal: true,
    lv: 99, v: '0.2.1', d: '2026-11-24', exemplo: true,
    desc: 'Card de exemplo: mostra como uma build de tutor aparece. Troque pelo código real enviado pelo tutor.',
    build: { cls: 'hpr', lv: 99, name: 'Sumo Sacerdote Judex' }
  }
];
