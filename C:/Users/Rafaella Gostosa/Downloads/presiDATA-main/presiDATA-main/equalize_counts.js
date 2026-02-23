const fs = require('fs');
const raw = fs.readFileSync('data/presidentes-db.json', 'utf8');
const db = JSON.parse(raw);

// Itens a adicionar: { id: [...sucessos a adicionar] } ou { id: [...polemicas a adicionar] }
const addSucessos = {
    'rodrigues_alves': [
        "Reurbanização do Rio de Janeiro — Reformas de Pereira Passos modernizaram a capital federal, com abertura de avenidas, demolição de cortiços e saneamento urbano. (1904-1906)"
    ],
    'afonso_pena': [
        "Modernização das Forças Armadas — Promoveu reforma militar com missão alemã, criando a Escola de Guerra e profissionalizando o Exército brasileiro. (1906-1909)"
    ],
    'jose_linhares': [
        "Manutenção da ordem constitucional — Impediu tentativa de continuísmo varguista, garantindo a transição para eleições livres e a realização do pleito de dezembro de 1945. (1945)"
    ],
    'juscelino_kubitschek': [
        "Estabilidade democrática — Resistiu a três tentativas de golpe e completou o mandato, sendo o primeiro presidente desde 1926 a entregar o governo ao sucessor eleito democraticamente. (1955-1961)"
    ],
    'lula': [
        "Política externa de prestígio — Brasil ganhou protagonismo internacional, com candidatura ao Conselho de Segurança da ONU, mediação em crises internacionais e liderança no G20 e BRICS. (2003-2010)"
    ],
    'ranieri_mazzilli_1': [
        "Convocação de eleições — Manteve o calendário eleitoral e garantiu formalmente a realização das eleições presidenciais de outubro de 1961, preservando o rito constitucional. (1961)"
    ],
    'ranieri_mazzilli_2': [
        "Transição sem guerra civil — Apesar do contexto golpista, evitou confronto armado e garantiu uma transição relativamente ordenada do poder para o regime militar. (1964)"
    ],
    'carlos_luz': [
        "Presidente da Câmara atuante — Antes da presidência, foi presidente eficiente da Câmara dos Deputados, conduzindo trabalhos legislativos com organização. (1955)"
    ],
    'cafe_filho': [
        "Preparação das eleições de 1955 — Organizou e garantiu a realização das eleições presidenciais que elegeram Juscelino Kubitschek, respeitando o processo democrático. (1955)"
    ]
};

const addPolemicas = {
    'campos_salles': [
        "Política dos Governadores — Institutcionalizou o clientelismo entre oligarquias estaduais e o governo federal, consolidando o coronelismo e excluindo a população das decisões políticas. (1898-1902)"
    ],
    'hermes_fonseca': [
        "Salvações militares — Intervenções federais violentas no Ceará, Pernambuco e Alagoas para impor candidatos militares, derrubando governos estaduais legítimos à força. (1911-1912)",
        "Guerra do Contestado — Início do conflito no sul do Brasil com milhares de mortes entre camponeses e forças do governo federal enviadas para reprimir o movimento. (1912)"
    ],
    'delfim_moreira': [
        "Saúde debilitada e incapacidade governativa — Assumiu com saúde comprometida, delegando poder a auxiliares sem controle efetivo, gerando paralisia administrativa. (1918-1919)",
        "Repressão ao movimento operário — Greves operárias em São Paulo e Rio de Janeiro foram violentamente reprimidas por forças policiais sob seu governo. (1919)"
    ],
    'epitacio_pessoa': [
        "Crise da sucessão e instabilidade — Recusou-se a apoiar candidato militar à presidência, gerando grave crise com as Forças Armadas e contribuindo para o clima que levou à Revolução de 1922. (1922)"
    ],
    'artur_bernardes': [
        "Violência contra oposição política — Perseguição sistemática a líderes tenentistas e civis oposicionistas, com prisões arbitrárias, exílios forçados e censura à imprensa. (1922-1926)",
        "Crise econômica do café — Política de valorização artificial do café gerou endividamento externo e distorções que aprofundaram a dependência econômica do país. (1922-1926)",
        "Crise com Portugal — Incidente diplomático com Portugal após críticas de Bernardes a lideranças lusas gerou tensão bilateral e desgaste internacional. (1923)"
    ],
    'washington_luis': [
        "Repressão ao movimento operário — Ficou conhecido pela frase 'questão social é caso de polícia', sistematizando a repressão violenta a sindicatos e greves. (1926-1930)",
        "Crise do café e colapso econômico — Manutenção do padrão-ouro e recusa de renegociar dívidas durante a Grande Depressão precipitaram colapso financeiro do país. (1929-1930)"
    ],
    'eurico_gaspar_dutra': [
        "Cassação do PCB e perseguição política — Após aproximação com os EUA na Guerra Fria, cassou o registro do Partido Comunista e cassou mandatos de parlamentares eleitos. (1947)"
    ],
    'cafe_filho': [
        "Crise da sucessão e bloqueio militar — Forças militares impediram seu retorno após afastamento médico, gerando crise constitucional sem resolução pacífica garantida pelo governo. (1955)"
    ],
    'carlos_luz': [
        "Cumplicidade com tentativa de golpe — Assumiu a presidência e sinalizou apoio ao general Juarez Távora, que tentava impedir a posse de Kubitschek. Foi deposto pelo Congresso após 3 dias. (1955)",
        "Mandato de apenas 3 dias — Presidência mais curta da história brasileira, marcada por instabilidade institucional e suspeita de conivência com forças antidemocráticas. (1955)"
    ],
    'janio_quadros': [
        "Conduta excêntrica e autoritária — Proibiu biquínis em praias, rinhas de galo e lança-perfume por decreto, gerando deboche público e descrédito político. (1961)"
    ],
    'ranieri_mazzilli_1': [
        "Omissão na crise da renúncia — Assumiu interinamente e cedeu a pressões militares que tentavam impedir a posse constitucional do vice João Goulart. (1961)",
        "Fragilidade institucional — Sua incapacidade de garantir a ordem constitucional forçou o Congresso a criar o parlamentarismo como solução de compromisso. (1961)"
    ],
    'joao_goulart': [
        "Radicalização e polarização — Discurso no Comício das Reformas com tom confrontacional e anúncio de medidas por decreto acelerou o colapso político e o golpe militar de 1964. (1964)"
    ],
    'ranieri_mazzilli_2': [
        "Legitimação do golpe militar — Assinou decretos que institucionalizaram as primeiras medidas do regime militar, incluindo o AI-1, colaborando com a ruptura democrática. (1964)",
        "Passividade diante das cassações — Não tomou nenhuma medida para conter as prisões arbitrárias e cassações que ocorreram nos primeiros dias do golpe. (1964)"
    ],
    'costa_e_silva': [
        "AI-5 — Decretou o Ato Institucional Nº 5 em dezembro de 1968, o mais duro da ditadura: fechou o Congresso, suspendeu habeas corpus e inaugurou os anos de maior repressão. (1968)"
    ],
    'garrastazu_medici': [
        "Anos de chumbo — Período de maior repressão da ditadura: centenas de mortos, tortura sistematizada, desaparecimentos forçados e censura total à imprensa e à cultura. (1969-1974)"
    ],
    'joao_figueiredo': [
        "Atentado do Riocentro — Bomba explodiu no colo de militar durante show no Riocentro em 1981; governo encobriu o atentado terrorista promovido por militares de linha dura. (1981)"
    ],
    'jose_sarney': [
        "Plano Cruzado II e hiperinflação — Após congelamento artificial de preços em ano eleitoral, o Plano Cruzado II liberou reajustes que geraram hiperinflação e recessão. (1987)",
        "Clientelismo e corrupção — Uso sistemático de cargos públicos e verbas federais para manutenção de base aliada, consolidando práticas fisiológicas no período de redemocratização. (1985-1989)"
    ],
    'fernando_collor': [
        "Esquema PC Farias — Seu tesoureiro de campanha operou esquema bilionário de corrupção usando o nome do presidente para extorquir empresas em troca de contratos. (1991-1992)"
    ],
    'itamar_franco': [
        "Instabilidade ministerial — Trocou de ministros com frequência incomum, tendo quatro ministros da Fazenda em menos de dois anos, refletindo dificuldade de articulação política. (1992-1994)"
    ],
    'dilma_rousseff': [
        "Pedaladas fiscais — Manobras contábeis para maquiar o déficit público, usando bancos estatais para atrasar repasses ao governo, o que serviu de base para o processo de impeachment. (2014-2015)",
        "Crise de gestão e impopularidade — Aprovação caiu para 8% no pior momento, reflexo da recessão, desemprego crescente e incapacidade de articulação política no Congresso. (2015-2016)"
    ],
    'michel_temer': [
        "Gravação com Joesley Batista — Gravação revelou Temer discutindo propina com empresário da JBS, gerando crise gravíssima e dois pedidos de autorização para abertura de processo. (2017)",
        "Impopularidade recorde — Aprovação caiu para 3–5%, a menor de qualquer presidente brasileiro, reflexo do desgaste com reformas impopulares e investigações criminais. (2017-2018)"
    ],
    'jair_bolsonaro': [
        "Armamento da população — Editou dezenas de decretos facilitando acesso a armas e munições para civis, aumentando o arsenal nas mãos da população em contexto de violência record. (2019-2022)",
        "Destruição de políticas ambientais — Desmontou órgãos de fiscalização ambiental, exonerou técnicos e cortou orçamentos do IBAMA e ICMBio, acelerando desmatamento e queimadas. (2019-2022)"
    ]
};

let updated = 0;
db.presidentes.forEach(p => {
    let changed = false;

    if (addSucessos[p.id]) {
        p.sucessos = (p.sucessos || []).concat(addSucessos[p.id]);
        changed = true;
    }
    if (addPolemicas[p.id]) {
        p.polemicas = (p.polemicas || []).concat(addPolemicas[p.id]);
        changed = true;
    }

    if (changed) updated++;
});

// Verificação final
const stillUnequal = db.presidentes.filter(p =>
    (p.sucessos || []).length !== (p.polemicas || []).length
).map(p => `${p.nome}: ${(p.sucessos||[]).length}s / ${(p.polemicas||[]).length}p`);

fs.writeFileSync('data/presidentes-db.json', JSON.stringify(db, null, 4), 'utf8');
fs.writeFileSync('equalize_result.txt',
    `Updated: ${updated} presidents\n` +
    (stillUnequal.length ? 'Still unequal:\n' + stillUnequal.join('\n') : 'All equal!')
);
console.log('Done');
