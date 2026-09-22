/* ============================================================
   THIEGO DOPAMINA FARM — data.js
   Registry central de conteúdo: assets, geradores, upgrades,
   evoluções, árvore de prestige, conquistas, missões,
   títulos, eventos e humor. TODOS os números de balanceamento
   vivem aqui — nada de números mágicos espalhados.
   ============================================================ */
(function () {
  'use strict';
  const T = window.TDF = {};
  const N = window.Num;

  /* ---------- assets ---------- */
  const ASSET_DIR = 'assets/';
  T.asset = function (name) { return ASSET_DIR + encodeURI(name); };

  /* ============================================================
     GERADORES
     baseProd: produção base por unidade (dopamina/s)
     growth:   multiplicador de custo por nível
     milestones [10,25,50,100,250,500,1000] → ×2 cada uma
     ============================================================ */
  T.GENERATORS = [
    { name: 'Estagiário da Dopamina', icon: '🧪', desc: 'Ele aprende rápido. Muito rápido. Rápido demais.', baseCost: 15, growth: 1.15, baseProd: 0.1 },
    { name: 'Farmador Profissional', icon: '🧑‍🌾', desc: 'Fazenda em tempo integral. Demissão não existe.', baseCost: 110, growth: 1.15, baseProd: 0.9 },
    { name: 'Técnico do Thiego', icon: '🔧', desc: 'Conserta tudo com fita isolante e dopamina.', baseCost: 1_200, growth: 1.155, baseProd: 7 },
    { name: 'Engenheiro de Dopamina', icon: '👷', desc: 'Engenharia aplicada ao que importa: o Thiego.', baseCost: 13_000, growth: 1.16, baseProd: 52 },
    { name: 'Cientista Dopamínico', icon: '🔬', desc: 'Publicou 47 artigos sobre o Thiego. Ninguém entendeu.', baseCost: 140_000, growth: 1.165, baseProd: 380 },
    { name: 'Máquina de Dopamina', icon: '⚙️', desc: 'Tecnologia duvidosa. Funciona? Funciona.', baseCost: 1.6e6, growth: 1.17, baseProd: 2_800 },
    { name: 'Reator Dopamínico', icon: '☢️', desc: 'Coração pulsante da farm. NÃO TOQUE.', baseCost: 2e7, growth: 1.175, baseProd: 21_000 },
    { name: 'Portal do Thiego', icon: '🌀', desc: 'Thiegos de outros universos trabalham aqui.', baseCost: 2.8e8, growth: 1.18, baseProd: 160_000 },
    { name: 'Singularidade Dopamínica', icon: '🌌', desc: 'A física pediu demissão nesse exato momento.', baseCost: 4.1e9, growth: 1.185, baseProd: 1.3e6 },
  ];
  T.MILESTONES = [10, 25, 50, 100, 250, 500, 1000];
  T.MILESTONE_MULT = 2;

  /* ============================================================
     UPGRADES (permanentes dentro da run; resetam no prestige)
     effect.type aplicado em economy.js:
       clickMult / clickShare | prodMult / genMult | costRed / evoCost
       critChance / critMult / critBonus | comboTime / comboCap
       prestigeGain / prestigeMult | offlineEff / offlineCap
       eventFreq / eventDur / eventReward | perEvo
     ============================================================ */
  T.UPGRADES = [
    // --- CLIQUE ---
    { id: 'click1', cat: 'clique', name: 'Dedo de Manteiga', icon: '👆', desc: 'Seus dedos agora escorregam dopamina.', cost: 25, effect: { type: 'clickMult', value: 0.25 } },
    { id: 'crit1', cat: 'clique', name: 'Sorte de Iniciante', icon: '🍀', desc: 'Às vezes o Thiego se mexe sozinho. +crit chance.', cost: 150, effect: { type: 'critChance', value: 0.03 } },
    { id: 'critd1', cat: 'clique', name: 'Faca Cega Mas Fiel', icon: '🔪', desc: 'Corta a realidade em 2 pedaços. +mult crítico.', cost: 90, effect: { type: 'critMult', value: 1 } },
    { id: 'combo1', cat: 'clique', name: 'Cafeína do Thiego', icon: '☕', desc: 'O combo aguenta mais um cadinho.', cost: 300, effect: { type: 'comboTime', value: 1200 } },
    { id: 'click2', cat: 'clique', name: 'Saco de Recompensa', icon: '💼', desc: 'Dopamina por atacado.', cost: 1_100, effect: { type: 'clickMult', value: 0.35 } },
    { id: 'crit2', cat: 'clique', name: 'Óculos do Crítico', icon: '🕶️', desc: 'Agora você VÊ os críticos chegando. +crit chance.', cost: 4_500, effect: { type: 'critChance', value: 0.05 } },
    { id: 'critd2', cat: 'clique', name: 'Machado Dopamínico', icon: '🪓', desc: 'Crítico com raiva acumulada. +mult crítico.', cost: 9_000, effect: { type: 'critMult', value: 2 } },
    { id: 'combo2', cat: 'clique', name: 'Energético do Thiego', icon: '⚡', desc: '2 horas de energia em 2.5 segundos de combo.', cost: 12_000, effect: { type: 'comboTime', value: 2500 } },
    { id: 'click3', cat: 'clique', name: 'Mão Sincronizada', icon: '🤝', desc: 'Esquerda e direita em harmonia intergaláctica.', cost: 30_000, effect: { type: 'clickMult', value: 0.5 } },
    { id: 'combo3', cat: 'clique', name: 'QUERO MAIS', icon: '🔥', desc: 'O combo máximo deixou de ser máximo.', cost: 400_000, effect: { type: 'comboCap', value: 10 } },
    { id: 'crit3', cat: 'clique', name: 'Lente Divina', icon: '🔭', desc: 'Enxerga os pontos fracos do próprio universo. +crit chance.', cost: 500_000, effect: { type: 'critChance', value: 0.07 } },
    { id: 'share1', cat: 'clique', name: 'Economia de Escala', icon: '📈', desc: 'Sua máquina de dopamina também fortalece seu dedo. +% do dps no clique.', cost: 2.5e6, effect: { type: 'clickShare', value: 0.08, maxLevel: 3 } },
    { id: 'combo4', cat: 'clique', name: 'Furor Contínuo', icon: '🚀', desc: 'Combo sem fim. Sem. Fim.', cost: 9e6, effect: { type: 'comboCap', value: 25 } },
    { id: 'critd3', cat: 'clique', name: 'Crítico do Saber', icon: '🧠', desc: 'Você sabe a hora certa. +mult crítico.', cost: 4e7, effect: { type: 'critMult', value: 4 } },
    { id: 'click4', cat: 'clique', name: 'Luvas de Thiex', icon: '🥊', desc: 'Um soco. Uma farm. +clique massivo.', cost: 2.5e8, effect: { type: 'clickMult', value: 1.5 } },

    // --- AUTOMAÇÃO ---
    { id: 'gen1', cat: 'auto', name: 'Sindicato do Thiego', icon: '🏛️', desc: 'Todos os geradores trabalham felizes. +produção de geradores.', cost: 2_500, effect: { type: 'genMult', value: 0.4 } },
    { id: 'gen2', cat: 'auto', name: 'Lei de Thiego', icon: '📜', desc: 'Artigo 1: produza. Artigo 2: produza mais.', cost: 80_000, effect: { type: 'genMult', value: 0.55 } },
    { id: 'cost1', cat: 'auto', name: 'Compra em Grupo', icon: '🛒', desc: 'Desconto por volume. O Thiego aprova.', cost: 60_000, effect: { type: 'costRed', value: 0.05 } },
    { id: 'prod1', cat: 'auto', name: 'Produção 24/7', icon: '⏱️', desc: 'A farm não dorme. Você deveria.', cost: 4e6, effect: { type: 'prodMult', value: 0.5 } },
    { id: 'gen3', cat: 'auto', name: 'Reforma Trabalhista', icon: '⚖️', desc: 'Menos pausa, mais dopamina. +produção de geradores.', cost: 8e6, effect: { type: 'genMult', value: 0.7 } },
    { id: 'cost2', cat: 'auto', name: 'Negociador Profissional', icon: '💸', desc: 'Paga menos pelo mesmo Thiego.', cost: 4e8, effect: { type: 'costRed', value: 0.06 } },
    { id: 'prod2', cat: 'auto', name: 'Hora Extra Universal', icon: '🌍', desc: 'Todos os universos deram hora extra.', cost: 3e10, effect: { type: 'prodMult', value: 0.75 } },
    { id: 'gen4', cat: 'auto', name: 'Meta de Produção', icon: '🎯', desc: 'A meta é: produzir. Sempre.', cost: 5e11, effect: { type: 'genMult', value: 1 } },
    { id: 'prod3', cat: 'auto', name: 'Overdrive Dopamínico', icon: '🌪️', desc: 'A farm entrou em overdrive. Legalmente.', cost: 2e13, effect: { type: 'prodMult', value: 1.25 } },

    // --- EVOLUÇÃO ---
    { id: 'evo1', cat: 'evo', name: 'Engenharia Reversa', icon: '🔄', desc: 'Evolui gastando menos dopamina.', cost: 300_000, effect: { type: 'evoCost', value: 0.05 } },
    { id: 'evo2', cat: 'evo', name: 'Evolução em Promoção', icon: '🏷️', desc: 'Liquidação de evoluções. Só essa semana (sempre).', cost: 3e9, effect: { type: 'evoCost', value: 0.06 } },
    { id: 'perEvo1', cat: 'evo', name: 'Essência do Thiego', icon: '👼', desc: 'Cada evolução conquistada alimenta sua produção.', cost: 1e8, effect: { type: 'perEvo', value: 0.02 } },
    { id: 'perEvo2', cat: 'evo', name: 'DNA Sobrecarregado', icon: '🧬', desc: 'O DNA do Thiego agora gera royalties.', cost: 1e13, effect: { type: 'perEvo', value: 0.025 } },

    // --- PRESTIGE ---
    { id: 'pres1', cat: 'prestige', name: 'Ambicioso', icon: '🌄', desc: '+ganho de pontos de ascensão.', cost: 1e12, effect: { type: 'prestigeGain', value: 0.25 } },
    { id: 'pres2', cat: 'prestige', name: 'Ganância Iluminada', icon: '💡', desc: 'Dopamina ascendida também quer mais.', cost: 5e16, effect: { type: 'prestigeGain', value: 0.4 } },
    { id: 'pres3', cat: 'prestige', name: 'Herança Ascendida', icon: '👑', desc: 'Seus pontos valem mais. Multiplicador de prestige ×.', cost: 1e15, effect: { type: 'prestigeMult', value: 0.15 } },

    // --- OFFLINE ---
    { id: 'off1', cat: 'offline', name: 'Soneca Estratégica', icon: '🛌', desc: 'Dormir também é farmar. +eficiência offline.', cost: 50_000, effect: { type: 'offlineEff', value: 0.15 } },
    { id: 'off2', cat: 'offline', name: 'Férias do Chefe', icon: '🏖️', desc: 'Capacidade offline estendida: o Thiego segura a farm.', cost: 6e7, effect: { type: 'offlineCap', value: 12 } },

    // --- EVENTOS ---
    { id: 'evt1', cat: 'event', name: 'Atenção do Caos', icon: '🎲', desc: 'Os eventos vêm com mais frequência e duram mais.', cost: 3e6, effect: { type: 'eventFreq', value: 0.15 } },
    { id: 'evt2', cat: 'event', name: 'Domador de Eventos', icon: '🎪', desc: 'Eventos maiores, mais compridos, mais caóticos.', cost: 2.5e10, effect: { type: 'eventFreq', value: 0.2 } },
    { id: 'evt3', cat: 'event', name: 'Recompensa Caótica', icon: '💰', desc: 'O caos paga melhor agora. +recompensas de evento.', cost: 9e12, effect: { type: 'eventReward', value: 0.5 } },

    // --- MEME ---
    { id: 'meme1', cat: 'meme', name: 'Isso é um Investimento', icon: '📊', desc: '"Isso definitivamente é um investimento inteligente." — Você, agora.', cost: 1e5, effect: { type: 'prodMult', value: 0.35 } },
    { id: 'meme2', cat: 'meme', name: 'O Universo paga royalties', icon: '🌌', desc: 'O Thiego processou a física. E venceu.', cost: 1e10, effect: { type: 'prodMult', value: 0.6 } },
    { id: 'meme3', cat: 'meme', name: 'ERROR: THIEGO TOO POWERFUL', icon: '🖥️', desc: 'O jogo avisou. Você não ouviu.', cost: 1e17, effect: { type: 'prodMult', value: 1 } },
    { id: 'meme4', cat: 'meme', name: 'O Grande Reset (menor)', icon: '♻️', desc: 'Resetar é um estilo de vida. +produção total.', cost: 1e21, effect: { type: 'prodMult', value: 1.5 } },
  ];

  /* ============================================================
     EVOLUÇÕES — TODAS as 52 fotos dos assets, uma por estágio
     custo: começa em 30 e cresce por razões (último ≈ 3.8e78 — fim de jogo)
     mult: 1.15 + 0.006×(n−1) → total do estágio 52 ≈ 6.6e5×
     ============================================================ */
  const EVOS = [
    ['THIEGO NORMAL', 'thiego normal 2.jpeg', 'Um Thiego normal. Absolutamente normal. Nada a ver.', '"Ainda dá tempo de parar."'],
    ['THIEGO DOPAMINADO', 'thiego_fase1.jpg', 'O brilho no olhar mudou. Aura leve detectada.', '"O brilho no olhar já mudou."'],
    ['THIEGO TURBINADO', 'thiego aura.jpg', 'Velocidade máxima. Cuidado com o vento.', '"Velocidade máxima. Cuidado com o vento."'],
    ['THIEGO ULTRA', 'thiego_fase2.png', 'Ele NÃO está normal. Repetimos: NÃO ESTÁ.', '"Ele NÃO está normal."'],
    ['THIEGO SUPREMO', 'thiego chad.jpg', 'O queixo curvou o espaço-tempo.', '"O queixo curvou o espaço-tempo."'],
    ['THIEGO BILIONÁRIO', 'thiego bilionário.jpeg', 'Dinheiro. Muito dinheiro. Dopamina com gravata.', '"É tudo dele. Sempre foi."'],
    ['THIEGO DIVINO', 'thiego divino.jpeg', 'Luz própria. Seguidores próprios. Farm própria.', '"Ele desceu até a farm. Por sua causa."'],
    ['THIEGO ANGELICAL', 'thiego angelical (evolução do thiego divino.jpeg', 'As asas são reais. A dopamina também.', '"Os anjos fazem hora extra por ele."'],
    ['THIEGO CELESTIAL', 'thiego celestial.jpeg', 'Ele foi longe demais. E continua indo.', '"Ele foi longe demais."'],
    ['THIEGO 4K', 'thiego 4k.jpeg', 'Resolução infinita. Clareza absoluta. Confusão total.', '"Agora dá pra ver cada defeito do universo."'],
    ['THIEGO PRICE', 'thiego price (cotaprice mas todos são thiego).png', 'Múltiplos Thiegos. Preço único. Ação astronômica.', '"ATENÇÃO: TODOS SÃO O THIEGO."'],
    ['THIEGO INFINITO ∞', 'thiego mitosis.jpeg', 'O jogo quebrou. E é lindo. Agora são vários.', '"THIEGO TORNARAM-SE MUITOS. ERROR: THIEGO TOO POWERFUL."'],
    ['THIEGO CARECA', 'thiego careca.jpeg', 'Menos cabelo, mais dopamina.', '"O cabelo foi a primeira baixa da farm."'],
    ['THIEGO ENTEADO', 'thiego entediado.jpeg', 'A farm está devagar. Ele percebeu. Você deveria clicar.', '"Sem graça. Sem clique. Sem dopamina."'],
    ['THIEGO NA MUDANÇA', 'thiego movel.jpeg', 'Farm não tem endereço. Só tem ritmo.', '"Contrata: a dopamina já chegou no galpão novo."'],
    ['THIEGO NO CELULAR', 'thiego com o celular.jpeg', 'Farmando no intervalo do auê.', '"Aguarde. Farm fora do horário de expediente."'],
    ['THIEGO TRISTE', 'thiego triste.jpeg', 'Dopamina hoje só com abraço.', '"Abraço? Não. Cliques."'],
    ['THIEGO FOFINHO', 'thiego fofinho.jpeg', 'Abrável. Abraçável. Dopamínico.', '"Cuidado ao clicar: ele morde com carinho."'],
    ['THIEGO SORRIDENTE', 'thiego sorridente.jpeg', 'O sorriso que farms sozinho.', '"Ele sorriu. Isso nunca é bom."'],
    ['THIEGO E OS COLEGAS', 'thiego e colegas.jpeg', 'Até o Thiego precisa de turma.', '"Cada colega tem sua farm. Nenhuma paga imposto."'],
    ['THIEGO CANTOR', 'thiego cantor.jpeg', 'Hit: "Dopamina, Eu Preciso". Certificação vira-lata.', '"Autotune? Não. Dopamina pura."'],
    ['THIEGO ANÃO', 'thiego anão.jpg', 'Pequeno no tamanho. Gigante na produção.', '"A estatura da farm é outra."'],
    ['THIEGO PAPEL', 'thiego papel.jpg', 'Papel também produz. Papel produz MUITO.', '"Anote: o papel pauta a lenda."'],
    ['THIEGO BISCOITANDO', 'thiego biscoitando.jpeg', 'Biscoito? O que é isso? Ele chegou no grill.', '"O grill foi a melhor decisão da farm."'],
    ['THIEGO BISCOITANDO 2', 'thiego biscoitando 2.jpeg', 'A sequência chegou. O grill segue firme.', '"O biscoito estava sozinho. Até aqui."'],
    ['THIEGO BISCOITANDO 3', 'thiego biscoitando 3.jpeg', 'O biscoito ficou famoso. Thiego também. Ninguém sabe por quê.', '"Elo perdido: biscoito, dopamina, Thiego."'],
    ['THIEGO NEGO DOCE', 'thiego nego doce.jpeg', 'Um doce. Uma lenda. Um império.', '"Doçura que não quebra recordes. Mentira."'],
    ['THIEGO GANSTER', 'thiego ganster.jpeg', 'A farm agora tem proteção. Proteção cara.', '"EXTORSÃO? Não. Consultoria de cliques."'],
    ['THIEGO MAROMBADO', 'thiego laranja marombada.jpeg', 'Proteína e dopamina. O combo perfeito.', '"O suplemento oficial da farm é clique."'],
    ['THIEGO DA CASINHA', 'thiego casa pobre.jpeg', 'Do barraco ao topo. Inspirador. E ele sabe.', '"A casinha virou sede da holding."'],
    ['THIEGO E A CASA', 'thiego casa normal.jpeg', 'Imóvel próprio. Dívida própria. Farm própria.', '"O salão da farm custa a metade da casa. Na metade."'],
    ['THIEGO MANSÃO', 'thiego mansão.jpeg', 'Cada cômodo tem um Thiego produzindo.', '"O quarto que mais produz virou depósito."'],
    ['THIEGO MALVADO', 'thiego malvado.jpeg', 'Ele riu. A farm tremeu.', '"Não é sagacidade. É maldade explícita."'],
    ['THIEGO BRAVO', 'thiego bravo.jpeg', 'Ele não perdoa clique desperdiçado.', '"CLIQUE OU SOFRA. Ele é direto."'],
    ['THIEGO AMEAÇADOR', 'thiego ameaçador.jpeg', 'O ultimato venceu. A farm dele é maior que a sua.', '"Ele deu um ultimato: produzir ou produzir."'],
    ['THIEGO PERPLEXO', 'thiego perplexo.jpeg', 'Ele não entende seus cliques. Continue.', '"Ele não entende. E isso o fortalece."'],
    ['THIEGO AMADO', 'thiego sendo lambido.jpeg', 'Ninguém sabe explicar. Ninguém precisa.', '"O amor é a forma mais pura de dopamina."'],
    ['THIEGO SAFADO', 'thiego do sorriso safado.jpeg', 'Esse sorriso já produziu milhões.', '"Ele sabe o que você fez. E aprova."'],
    ['THIEGO SAFADO PLATINUM', 'thiego do sorriso safado 2.jpeg', 'O mesmo sorriso. Trabalho completo.', '"Edição de colecionador do safado."'],
    ['THIEGO BEBÊ', 'thiego bebê.jpeg', 'Começou a farmar cedo. Cedo demais.', '"Cadê a chupeta? Cadê a farm? Tá tudo aqui."'],
    ['THIEGO NOEL', 'thiego noel.jpeg', 'Presente de natal este ano: dopamina obrigatória.', '"Ho-ho-ho. Clique. Clique. Clique."'],
    ['THIEGO VELHO', 'thiego velho.jpeg', '48 horas de farm. Ele envelheceu. A farm não.', '"Aposentadoria? Nunca ouvi falar."'],
    ['THIEGO DITADOR', 'thiego ditador.jpeg', 'Decreto número 1: produzir. Decreto 2: mais.', '"Decreto 3: quem não produz, clica."'],
    ['THIEGO DOG', 'thiego cachorro.jpg', 'Latido. Mordida. Produção.', '"Au au au au. Tradução: clique mais."'],
    ['THIEGO DORMINDO (SECRETO)', 'thiego dormindo.jpeg', 'Ele farms até dormindo. Descanse em paz.', '"ZzZz... upgrade. ZzZz... upgrade."'],
    ['THIEGO DRAG', 'thiego drag.jpg', 'Cabelão, brilho e produção em camadas.', '"Produção é arte. E ele é a obra."'],
    ['THIEGO AVATAR DA ÁGUA', 'thiego avatar da agua.jpeg', 'O espírito da dopamina escolheu alguém.', '"Fluido. Perfeito. Molhado de produtividade."'],
    ['THIEGA', 'thiega (thiego mulher).jpeg', 'A versão dele que não precisa de apresentação.', '"Sem comentários. Apenas cliques."'],
    ['THIEGO GESTANTE', 'thiego gestante.jpeg', 'Não pergunte. Apenas clicie.', '"Aqui farms um futuro farmador."'],
    ['THIEGO PIG', 'thiego pig.jpeg', 'OINK. OINK. DOPAMINA.', '"OINK. Isso é uma farm. Clique. OINK."'],
    ['THIEGO SKIBIDI', 'skibidi thiego.jpeg', 'O cérebro dele caiu. O seu quase caiu também.', '"Ele caiu. Ele levantou. Ele farms."'],
    ['THIEGO COTAPRICE', 'cotaprice thiego.jpeg', 'Cotação oficial da dopamina (Thiego padrão).', '"ATENÇÃO FINAL: TODOS SÃO THIEGO. TODAS AS FOTOS. TODAS AS FASES."'],
  ];
  const EVO_R = [2.2,2.2,2.2,2.2,2.2,2.2,2.6,2.6,2.6,2.6,2.6,2.6,8,8,8,8,8,8,8,8,30,30,30,30,30,30,30,30,30,30,100,100,100,100,100,100,100,100,100,100,600,600,600,600,600,600,600,600,600,600,600];
  T.EVOLUTIONS = EVOS.map((e, i) => ({
    name: e[0], img: e[1], desc: e[2], quote: e[3],
    cost: i === 0 ? 0 : Math.round(30 * EVO_R.slice(0, i - 1).reduce((a, b) => a * b, 1)),
    mult: i === 0 ? 1 : +(1.15 + 0.006 * (i - 1)).toFixed(3),
  }));

  /* ============================================================
     ÁRVORE DE PRESTIGE (pontos permanentes)
     ============================================================ */
  T.PRESTIGE_TREE = [
    { id: 'poder', name: 'Fonte Suprema', icon: '⚡', desc: '+30% produção total por nível.', max: 5, levels: [1, 2, 4, 8, 15], effect: { type: 'prodMult', value: 0.30 } },
    { id: 'eficiencia', name: 'Desconto Thiego', icon: '🏷️', desc: 'Custos de dopamina ×0.93 por nível.', max: 5, levels: [1, 2, 4, 8, 15], effect: { type: 'costRed', value: 0.07 } },
    { id: 'automacao', name: 'Operários Zen', icon: '🧘', desc: '+25% produção dos geradores por nível.', max: 5, levels: [1, 2, 4, 8, 15], effect: { type: 'genMult', value: 0.25 } },
    { id: 'offline', name: 'Sono Produtivo', icon: '😴', desc: '+10% eficiência offline e +4h de limite por nível.', max: 5, levels: [1, 2, 4, 8, 15], effect: { type: 'offlineEff', value: 0.10 } },
    { id: 'eventos', name: 'Caos Controlado', icon: '🎛️', desc: 'Eventos mais frequentes, longos e generosos por nível.', max: 5, levels: [1, 2, 4, 8, 15], effect: { type: 'eventFreq', value: 0.15 } },
    { id: 'transcendencia', name: 'Clique Divino', icon: '🫲', desc: '+40% clique e +2% chance de crítico por nível.', max: 5, levels: [1, 2, 4, 8, 15], effect: { type: 'clickMult', value: 0.40 } },
  ];

  /* ============================================================
     CONQUISTAS
     ctx = { evoMult, dps, rankBest, lbOnline, missionsClaimed }
     Secretas mostram "???" até desbloquear.
     ============================================================ */
  T.ACHIEVEMENTS = [
    { id: 'cl1', cat: 'clique', name: 'Primeiro Clique', desc: 'Clique 1 vez. O primeiro de muitos.', check: (s) => s.counters.clicks >= 1 },
    { id: 'cl2', cat: 'clique', name: 'Dez Dedos Quentes', desc: 'Clique 100 vezes.', check: (s) => s.counters.clicks >= 100 },
    { id: 'cl3', cat: 'clique', name: 'Dedos de Aço', desc: 'Clique 10.000 vezes.', check: (s) => s.counters.clicks >= 10_000 },
    { id: 'cl4', cat: 'clique', name: 'Um Milhão de Cliques', desc: 'Clique 1.000.000 vezes.', check: (s) => s.counters.clicks >= 1_000_000 },
    { id: 'cl5', cat: 'clique', name: 'Cem Milhões', desc: 'Clique 100.000.000 vezes.', check: (s) => s.counters.clicks >= 100_000_000 },
    { id: 'comb1', cat: 'clique', name: 'Combo Faminto', desc: 'Alcance combo ×25.', check: (s) => s.counters.maxCombo >= 25 },
    { id: 'comb2', cat: 'clique', name: 'Combo Insano', desc: 'Alcance combo ×100.', check: (s) => s.counters.maxCombo >= 100 },
    { id: 'comb3', cat: 'clique', name: 'Combo Impossível', desc: 'Alcance combo ×500.', check: (s) => s.counters.maxCombo >= 500 },
    { id: 'crit1a', cat: 'clique', name: 'Crítico Primordial', desc: 'Faça 100 críticos.', check: (s) => s.counters.crits >= 100 },
    { id: 'crit2a', cat: 'clique', name: 'Sequência Divina', desc: '5 críticos seguidos.', check: (s) => s.counters.critStreakMax >= 5 },
    { id: 'earn1', cat: 'dopami', name: 'Primeira Dopamina', desc: 'Produza sua primeira dopamina.', check: (s) => N.gte(s.totalEarned, 1) },
    { id: 'earn2', cat: 'dopami', name: 'Primeiro Milhão', desc: 'Produza 1M de dopamina.', check: (s) => N.gte(s.totalEarned, 1e6) },
    { id: 'earn3', cat: 'dopami', name: 'Dopamina Bilionária', desc: 'Produza 1B de dopamina.', check: (s) => N.gte(s.totalEarned, 1e9) },
    { id: 'earn4', cat: 'dopami', name: 'Dopamina Trilionária', desc: 'Produza 1T de dopamina.', check: (s) => N.gte(s.totalEarned, 1e12) },
    { id: 'earn5', cat: 'dopami', name: 'Dopamina Quadrilionária', desc: 'Produza 1Qa de dopamina.', check: (s) => N.gte(s.totalEarned, 1e15) },
    { id: 'earn6', cat: 'dopami', name: 'Dopamina Quintilionária', desc: 'Produza 1Qi de dopamina.', check: (s) => N.gte(s.totalEarned, 1e18) },
    { id: 'earn7', cat: 'dopami', name: 'Dopamina Avançada', desc: 'Produza 1×10²¹ de dopamina.', check: (s) => N.gte(s.totalEarned, 1e21) },
    { id: 'earn8', cat: 'dopami', name: 'Números Sem Sentido', desc: 'Produza 1×10³⁰ de dopamina.', check: (s) => N.gte(s.totalEarned, 1e30) },
    { id: 'earn9', cat: 'dopami', name: 'Além da Matemática', desc: 'Produza 1×10⁵⁰ de dopamina.', check: (s) => N.gte(s.totalEarned, 1e50) },
    { id: 'earn10', cat: 'dopami', name: 'ERROR: TOO POWERFUL', desc: 'Produza 1×10¹⁰⁰ de dopamina.', check: (s) => N.gte(s.totalEarned, 1e100) },
    { id: 'evoAll1', cat: 'evo', name: 'O Começo de Tudo', desc: 'Evolua o Thiego pela primeira vez.', check: (s) => s.tier >= 1 },
    { id: 'evoDop', cat: 'evo', name: 'Dopaminado Profundo', desc: 'Alcance THIEGO TURBINADO.', check: (s) => s.tier >= 2 },
    { id: 'evoSup', cat: 'evo', name: 'Supremo', desc: 'Alcance THIEGO SUPREMO.', check: (s) => s.tier >= 4 },
    { id: 'evoCel', cat: 'evo', name: 'Celestial', desc: 'Alcance THIEGO CELESTIAL.', check: (s) => s.tier >= 8 },
    { id: 'evoInf', cat: 'evo', name: 'INFINITO', desc: 'Alcance THIEGO INFINITO ∞.', check: (s) => s.tier >= 11 },
    { id: 'evoLend', cat: 'evo', name: 'Metade do Caminho', desc: 'Alcance a evolução 26 (de 52).', check: (s) => s.tier >= 26 },
    { id: 'evoAbs', cat: 'evo', name: 'TODOS SÃO THIEGO', desc: 'Alcance a evolução 51 (a última).', check: (s) => s.tier >= 51 },
    { id: 'gen1a', cat: 'auto', name: 'Primeiro Funcionário', desc: 'Contrate um gerador.', check: (s) => s.gens.some((g) => g >= 1) },
    { id: 'gen2a', cat: 'auto', name: 'Equipe Pequena', desc: '10 geradores no total.', check: (s) => s.gens.reduce((a, b) => a + b, 0) >= 10 },
    { id: 'gen3a', cat: 'auto', name: 'Exército do Thiego', desc: '100 geradores no total.', check: (s) => s.gens.reduce((a, b) => a + b, 0) >= 100 },
    { id: 'gen4a', cat: 'auto', name: 'Sindicato Máximo', desc: 'Qualquer gerador no nível 1000.', check: (s) => s.gens.some((g) => g >= 1000) },
    { id: 'pres1a', cat: 'prestigio', name: 'Primeira Ascensão', desc: 'Prestigie 1 vez.', check: (s) => s.prestige >= 1 },
    { id: 'pres2a', cat: 'prestigio', name: 'Ascensão Décupla', desc: 'Prestigie 10 vezes.', check: (s) => s.prestige >= 10 },
    { id: 'pres3a', cat: 'prestigio', name: 'Transcendental', desc: 'Prestigie 25 vezes.', check: (s) => s.prestige >= 25 },
    { id: 'pres4a', cat: 'prestigio', name: 'Ascendido Absoluto', desc: 'Prestigie 100 vezes.', check: (s) => s.prestige >= 100 },
    { id: 'pres5a', cat: 'prestigio', name: 'Quase Divino', desc: 'Prestigie 500 vezes.', check: (s) => s.prestige >= 500 },
    { id: 'pres6a', cat: 'prestigio', name: 'Deus da Dopamina', desc: 'Prestigie 1000 vezes.', check: (s) => s.prestige >= 1000 },
    { id: 'evt1a', cat: 'evento', name: 'Caos Inicial', desc: 'Presencie seu primeiro caos.', check: (s) => s.counters.events >= 1 },
    { id: 'evt2a', cat: 'evento', name: 'Caos Habitual', desc: 'Presencie 20 eventos.', check: (s) => s.counters.events >= 20 },
    { id: 'evt3a', cat: 'evento', name: 'Caos Profissional', desc: 'Presencie 100 eventos.', check: (s) => s.counters.events >= 100 },
    { id: 'enc1a', cat: 'evento', name: 'Visitante Estranho', desc: 'Encontre um Thiego especial.', check: (s) => s.counters.encounters >= 1 },
    { id: 'enc2a', cat: 'evento', name: 'O Dourado', desc: 'Encontre o THIEGO DOURADO.', check: (s) => s.counters.encDourado >= 1 },
    { id: 'enc3a', cat: 'evento', name: 'BRAVO!', desc: 'Encontre o THIEGO BRAVO.', check: (s) => s.counters.encBravo >= 1 },
    { id: 'time1a', cat: 'tempo', name: 'Primeira Hora', desc: 'Jogue por 1 hora.', check: (s) => s.playTime >= 3600 },
    { id: 'time2a', cat: 'tempo', name: 'Um Dia de Farm', desc: 'Jogue por 24 horas.', check: (s) => s.playTime >= 86_400 },
    { id: 'time3a', cat: 'tempo', name: 'Dorminhoco Produtivo', desc: 'Colete 48h de progresso offline no total.', check: (s) => s.offlineTime >= 172_800 },
    { id: 'miss1a', cat: 'missao', name: 'Missão Cumprida', desc: 'Conclua 5 missões.', check: (s, ctx) => ctx.missionsClaimed >= 5 },
    { id: 'rank1a', cat: 'ranking', name: 'Primeiro TOP 100', desc: 'Entre no TOP 100 global.', check: (s, ctx) => (ctx.lbOnline ? ctx.rankBest <= 100 : ctx.localTop >= 6) },
    { id: 'rank2a', cat: 'ranking', name: 'TOP 10 LENDÁRIO', desc: 'Entre no TOP 10 global.', check: (s, ctx) => (ctx.lbOnline ? ctx.rankBest <= 10 : ctx.localTop >= 6) },
    { id: 'sCode', cat: 'secreta', name: '???', desc: '???', secret: true, check: (s) => s.secrets.code },
    { id: 'sKonami', cat: 'secreta', name: '???', desc: '???', secret: true, check: (s) => s.secrets.konami },
    { id: 'sSkibidi', cat: 'secreta', name: '???', desc: '???', secret: true, check: (s) => s.counters.encSkibidi >= 1 },
    { id: 'sPig', cat: 'secreta', name: '???', desc: '???', secret: true, check: (s) => s.counters.encPig >= 1 },
    { id: 'sThiega', cat: 'secreta', name: '???', desc: '???', secret: true, check: (s) => s.secrets.thiega },
    { id: 'sGestante', cat: 'secreta', name: '???', desc: '???', secret: true, check: (s) => s.secrets.gestante },
    { id: 'sDormindo', cat: 'secreta', name: '???', desc: '???', secret: true, check: (s) => s.offlineTime >= 43_200 },
    { id: 'sOfuror', cat: 'secreta', name: '???', desc: '???', secret: true, check: (s) => s.tier >= 11 },
  ];

  /* ============================================================
     MISSÕES (diárias / semanais / especiais)
     track: contador usado · target: meta · reward: {dopa | points}
     ============================================================ */
  T.MISSION_POOL = {
    daily: [
      { id: 'dClicks', name: 'Cliques do Dia', desc: 'Faça 500 cliques hoje.', track: 'clicks', target: 500, reward: { dopa: 300 } },
      { id: 'dFarm', name: 'Farm Diária', desc: 'Produza 1M de dopamina hoje.', track: 'earned', target: 1e6, reward: { dopa: 600 } },
      { id: 'dBuy', name: 'Comprador Compulsivo', desc: 'Compre 15 geradores/upgrades hoje.', track: 'buys', target: 15, reward: { dopa: 450 } },
      { id: 'dCrit', name: 'Olho Crítico', desc: 'Acerte 25 críticos hoje.', track: 'crits', target: 25, reward: { dopa: 400 } },
      { id: 'dEvt', name: 'Turista do Caos', desc: 'Presencie 4 eventos hoje.', track: 'events', target: 4, reward: { dopa: 800 } },
    ],
    weekly: [
      { id: 'wClicks', name: 'Mão de Aço', desc: '50.000 cliques na semana.', track: 'clicks', target: 50_000, reward: { points: 5 } },
      { id: 'wFarm', name: 'Magnata da Dopamina', desc: 'Produza 1×10¹⁵ na semana.', track: 'earned', target: 1e15, reward: { points: 15 } },
      { id: 'wPres', name: 'Ascensão Semanal', desc: 'Prestigie 3 vezes na semana.', track: 'prestiges', target: 3, reward: { points: 20 } },
      { id: 'wBuy', name: 'Sindicato em Expansão', desc: 'Compre 500 unidades na semana.', track: 'buys', target: 500, reward: { points: 10 } },
    ],
    special: [
      { id: 'spDourado', name: 'Pegue o Dourado', desc: 'Encontre o THIEGO DOURADO.', track: 'encDourado', target: 1, reward: { dopa: 900 } },
      { id: 'spCombo', name: 'Combo Master', desc: 'Alcance combo ×50.', track: 'combo', target: 50, reward: { points: 8 } },
      { id: 'spCrit', name: 'Crítico Frenético', desc: 'Acerte 100 críticos.', track: 'crits', target: 100, reward: { dopa: 700 } },
      { id: 'spEvt', name: 'Chefe do Caos', desc: 'Presencie 20 eventos.', track: 'events', target: 20, reward: { dopa: 800 } },
      { id: 'spGens', name: 'Imobiliário Thiego', desc: 'Compre 50 geradores.', track: 'buys', target: 50, reward: { points: 6 } },
    ],
  };

  /* ============================================================
     TÍTULOS (perfil)
     ============================================================ */
  T.TITLES = [
    { id: 'tNovato', name: 'Novato', desc: 'Comece a jornada.', check: (s) => s.counters.clicks >= 1 },
    { id: 'tFarmador', name: 'Farmador', desc: '1.000 cliques.', check: (s) => s.counters.clicks >= 1_000 },
    { id: 'tDopaminado', name: 'Dopaminado', desc: '1B de dopamina produzida.', check: (s) => N.gte(s.totalEarned, 1e9) },
    { id: 'tVeloz', name: 'Veloz', desc: 'Combo ×50.', check: (s) => s.counters.maxCombo >= 50 },
    { id: 'tInsano', name: 'Insano', desc: '1M de cliques.', check: (s) => s.counters.clicks >= 1_000_000 },
    { id: 'tChad', name: 'Chad', desc: '10M de cliques.', check: (s) => s.counters.clicks >= 10_000_000 },
    { id: 'tTranscendental', name: 'Transcendental', desc: '25 prestígios.', check: (s) => s.prestige >= 25 },
    { id: 'tInfinito', name: 'Infinito', desc: '1×10⁵⁰ de dopamina.', check: (s) => N.gte(s.totalEarned, 1e50) },
    { id: 'tDeusClique', name: 'Deus do Clique', desc: '100M de cliques.', check: (s) => s.counters.clicks >= 100_000_000 },
    { id: 'tAscendido', name: 'Ascendido', desc: '100 prestígios.', check: (s) => s.prestige >= 100 },
    { id: 'tLenda', name: 'Lenda do Ranking', desc: 'TOP 10 global.', check: (s, ctx) => (ctx.lbOnline ? ctx.rankBest <= 10 : ctx.localTop >= 6) },
    { id: 'tEvoluido', name: 'Evoluído', desc: 'Alcance a evolução 26.', check: (s) => s.tier >= 26 },
    { id: 'tAbsoluto', name: 'Thiego Absoluto', desc: 'Todas as conquistas.', check: (s, ctx) => ctx.achAll },
  ];

  /* ============================================================
     EVENTOS E ENCONTROS
     Encontros usam imagens reais dos assets.
     ============================================================ */
  T.EVENTS = [
    { id: 'surto', text: 'SURTO DE DOPAMINA!', time: 30, prod: 3, icon: '🧠' },
    { id: 'dobro', text: 'DOPAMINA EM DOBRO!', time: 30, prod: 2, icon: '✖️' },
    { id: 'turbinado', text: 'THIEGO TURBINADO!', time: 20, click: 6, icon: '🏎️' },
    { id: 'chuva', text: 'CHUVA DE DOPAMINA!', time: 0, instant: 45, icon: '🌧️' },
    { id: 'superfarm', text: 'SUPER FARM!', time: 15, prod: 5, glitch: true, icon: '🧨' },
    { id: 'frenesi', text: 'FRENESI!', time: 12, click: 10, icon: '🔥' },
    { id: 'megaclick', text: 'MEGA CLIQUE!', time: 0, instant: 90, icon: '💥' },
  ];

  T.ENCOUNTERS = [
    { id: 'dourado', name: 'THIEGO DOURADO', img: 'thiego do sorriso safado.jpeg', chance: 10, time: 22, click: 8, cooldown: 600, quote: 'Ele brilha. Ele sabe. Ele quer teus cliques.' },
    { id: 'bravo', name: 'THIEGO BRAVO', img: 'thiego bravo.jpeg', chance: 8, time: 12, clickBoost: 15, cooldown: 600, quote: 'ELE ESTÁ BRAVO. CLIQUE OU SOFRA.' },
    { id: 'ameacador', name: 'THIEGO AMEAÇADOR', img: 'thiego ameaçador.jpeg', chance: 8, time: 30, prod: 4, cooldown: 600, quote: 'Ele deu um ultimato: produzir ou produzir.' },
    { id: 'sorridente', name: 'THIEGO SORRIDENTE', img: 'thiego sorridente.jpeg', chance: 7, time: 0, instant: 150, cooldown: 900, quote: 'Ele sorriu. Isso nunca é bom.' },
    { id: 'triste', name: 'THIEGO TRISTE', img: 'thiego triste.jpeg', chance: 7, time: 45, prod: 2, cooldown: 600, quote: 'Ele precisa de atenção. E dopamina. Muita dopamina.' },
    { id: 'perplexo', name: 'THIEGO PERPLEXO', img: 'thiego perplexo.jpeg', chance: 6, time: 60, comboKeep: true, cooldown: 600, quote: 'Ele não entende seus cliques. Continue.' },
    { id: 'dormindo', name: 'THIEGO DORMINDO (SECRETO)', img: 'thiego dormindo.jpeg', chance: 5, time: 0, instant: 120, idleOnly: 300, cooldown: 1200, secret: true, quote: 'Shh... ele farms sonhando.' },
    { id: 'skibidi', name: 'THIEGO SKIBIDI?!', img: 'skibidi thiego.jpeg', chance: 0.5, time: 45, prod: 12, cooldown: 14400, secret: true, quote: 'O cérebro dele caiu. O seu quase caiu também.' },
    { id: 'pig', name: 'THIEGO PIG?!', img: 'thiego pig.jpeg', chance: 1, time: 0, instant: 200, clickGate: 2_500_000, cooldown: 21_600, secret: true, quote: 'OINK. Isso é uma farm. Clique. OINK.' },
  ];

  /* ============================================================
     HUMOR
     ============================================================ */
  T.HUMOR = [
    'Você precisa de mais dopamina.',
    'Isso ainda não é suficiente.',
    'Thiego quer mais.',
    'Seu cérebro não está preparado.',
    'Clicar é a cura.',
    'A fazenda cresce. O cérebro nem tanto.',
    'Dopamina não compra felicidade. Compra mais dopamina.',
    'Os vizinhos começaram a notar o brilho.',
    'Relatório científico: isso é demais.',
    'Continue. A dopamina agradece.',
    'Cada clique aproxima você do Thiego final.',
    'O Thiego sabe o que você fez no último clique.',
  ];
  T.HUMOR_ABSURD = [
    'Isso não deveria ser possível.',
    'THIEGO ESTÁ ABSURDAMENTE DOPAMINADO.',
    'PARABÉNS. VOCÊ QUEBROU A REALIDADE.',
    'A física pediu demissão.',
    'Seu cérebro entrou em greve.',
    'O universo agora paga royalties ao Thiego.',
    'Os números perderam completamente o sentido.',
    'ERROR: THIEGO TOO POWERFUL.',
  ];
  T.HUMOR_CLICK = [
    'Você clicou. A dopamina agradece.',
    'Bom clique. Thiego notou.',
    'Dedo de aço. Mente de dopamina.',
    'Esse clique foi profissional.',
    'O Thiego sente cada clique. Literalmente.',
    'Clique registrado na história da farm.',
  ];
  T.HUMOR_PRESTIGE = [
    'O Thiego se foi... por enquanto.',
    'O ciclo recomeça. Mas você é mais forte.',
    'Ele voltou ao normal. Ele nunca esteve normal.',
    'Prestigiar é a única forma de avançar e recomeçar.',
  ];
})();