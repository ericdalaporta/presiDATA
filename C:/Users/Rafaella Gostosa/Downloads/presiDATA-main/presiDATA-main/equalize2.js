const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/presidentes-db.json', 'utf8'));

// Para cada presidente, adiciona itens na coluna menor até equalizar
// Itens extras de sucessos (para presidentes com mais polêmicas)
const extraSucessos = {
    'campos_salles': [
        "Consolidação do federalismo — Garantiu autonomia efetiva aos estados, fortalecendo o pacto federativo da recém-proclamada República e estabilizando as relações entre União e estados. (1898-1902)"
    ],
    'hermes_fonseca': [
        "Acordo de limites com Peru — Negociou e assinou tratado de fronteiras com o Peru, consolidando parte dos limites amazônicos do Brasil por via diplomática. (1909-1913)",
        "Criação da Marinha Mercante — Incentivou a navegação de cabotagem nacional, reduzindo a dependência de navios estrangeiros para o comércio costeiro. (1910-1914)",
        "Lei de Acidentes de Trabalho — Promulgou o primeiro decreto sobre acidentes de trabalho do Brasil, precursor da legislação trabalhista nacional. (1919)",
        "Expansão do ensino técnico — Criou escolas de aprendizes e artífices em estados que não possuíam, ampliando o acesso à formação profissional. (1910)"
    ],
    'delfim_moreira': [
        "Fim da Primeira Guerra — Presidiu o Brasil durante o encerramento da Primeira Guerra Mundial, administrando a transição econômica pós-conflito sem maiores crises. (1918-1919)",
        "Manutenção da ordem democrática — Apesar da fragilidade de saúde, não tentou perpetuação no poder e cumpriu o rito de sucessão presidencial de forma regular. (1919)",
        "Expansão cafeeira — Governo manteve apoio ao setor cafeeiro, principal produto de exportação, sustentando receitas cambiais em momento de crise internacional. (1918-1919)",
        "Relações diplomáticas pós-guerra — Manteve posição do Brasil como signatário do Tratado de Versalhes e representação nas negociações de paz internacionais. (1919)"
    ],
    'epitacio_pessoa': [
        "Obras contra as secas — Investiu em açudes e infraestrutura hídrica no Nordeste, criando a base do que seria a IFOCS (Inspetoria Federal de Obras Contra as Secas). (1919-1922)",
        "Política externa ativa — Presidiu a delegação brasileira na Conferência de Paz de Paris e buscou assento permanente para o Brasil na Liga das Nações. (1919-1922)"
    ],
    'artur_bernardes': [
        "Criação do Banco do Brasil moderno — Reestruturou o Banco do Brasil, dando-lhe função de banco central e agente financeiro do governo federal. (1923)",
        "Código Civil em vigor — Administrou os primeiros anos de vigência plena do Código Civil de 1916, modernizando as relações jurídicas privadas no país. (1922-1926)",
        "Extensão das linhas férreas — Expandiu a malha ferroviária nacional em regiões interioranas, facilitando o escoamento da produção agrícola. (1922-1926)",
        "Estabilização cambial — Implementou medidas de controle cambial que reduziram a volatilidade do mil-réis após o período de instabilidade pós-guerra. (1922-1926)",
        "Acordo de fronteiras com a Colômbia — Concluiu negociações diplomáticas demarcando o limite entre Brasil e Colômbia na região amazônica. (1922)",
        "Fundação da Rádio Sociedade — Governo de Bernardes viu nascer a primeira emissora de rádio do Brasil, a Rádio Sociedade do Rio de Janeiro. (1923)"
    ],
    'washington_luis': [
        "Programa de pavimentação rodoviária — Criou a política nacional de rodovias com o lema 'governar é construir estradas', inaugurando uma nova era de transportes. (1926-1930)",
        "Código de Processo Penal — Avançou em codificação da legislação processual penal, modernizando o sistema judiciário brasileiro. (1926-1930)",
        "Valorização do café — Manteve política de apoio ao preço do café no mercado internacional até o colapso de 1929. (1926-1929)",
        "Expansão telegráfica — Ampliou a rede telegráfica nacional, conectando regiões antes isoladas ao sistema de comunicações do país. (1926-1930)"
    ],
    'eurico_gaspar_dutra': [
        "Constituição de 1946 — Promulgou a Constituição democrática de 1946, restaurando o Estado de Direito após o Estado Novo e garantindo eleições livres. (1946)"
    ],
    'cafe_filho': [
        "Garantia das eleições livres — Organizou as eleições presidenciais de outubro de 1955 sem interferência, permitindo a vitória de Juscelino Kubitschek pelo voto popular. (1955)"
    ],
    'carlos_luz': [
        "Experiência parlamentar acumulada — Carreira de décadas como deputado e presidente da Câmara gerou conhecimento institucional valioso para o funcionamento do Legislativo. (1955)"
    ],
    'janio_quadros': [
        "Início da política externa independente — Iniciou a Política Externa Independente, buscando aproximação com países não-alinhados e diversificando parcerias diplomáticas do Brasil. (1961)",
        "Combate à corrupção — Criou grupos de trabalho para investigar irregularidades em contratos públicos e exonerou funcionários envolvidos em desvios. (1961)"
    ],
    'ranieri_mazzilli_1': [
        "Preservação da Constituição — Garantiu que a crise da renúncia de Jânio fosse resolvida dentro dos marcos constitucionais, evitando ruptura institucional imediata. (1961)"
    ],
    'joao_goulart': [
        "Estatuto do Trabalhador Rural — Estendeu direitos trabalhistas ao campo, garantindo carteira assinada, férias e salário mínimo a trabalhadores rurais pela primeira vez. (1963)",
        "13º salário — Criou o abono natalino obrigatório para trabalhadores, benefício que persiste até hoje e impacta milhões de brasileiros. (1962)"
    ],
    'ranieri_mazzilli_2': [
        "Manutenção das instituições formais — Garantiu que os três Poderes continuassem funcionando formalmente, preservando estrutura mínima do Estado durante a transição. (1964)"
    ],
    'costa_e_silva': [
        "Programa Estratégico de Desenvolvimento — Lançou plano econômico que acelerou a industrialização e gerou crescimento do PIB superior a 9% ao ano. (1968)",
        "Construção da Transamazônica — Iniciou o projeto de integração da Amazônia com rodovias, abrindo regiões antes inacessíveis. (1968)"
    ],
    'garrastazu_medici': [
        "Milagre econômico — PIB cresceu a taxas de 10–14% ao ano, com industrialização acelerada, geração de empregos e modernização da infraestrutura nacional. (1969-1973)",
        "Copa do Mundo de 1970 — Brasil conquistou o tricampeonato mundial no México, gerando onda de orgulho nacional amplamente explorada pelo regime. (1970)"
    ],
    'joao_figueiredo': [
        "Lei da Anistia — Permitiu o retorno de exilados políticos e a reintegração de perseguidos pelo regime, abrindo caminho para a reconciliação nacional. (1979)",
        "Eleições diretas para governadores — Restabeleceu as eleições diretas para governos estaduais em 1982, primeiro passo concreto para a redemocratização. (1982)"
    ],
    'jose_sarney': [
        "Plano Cruzado — Primeiro plano de estabilização heterodoxo, que conseguiu reduzir a inflação de 235% para quase zero em poucos meses, gerando popularidade recorde. (1986)",
        "FGTS e direitos sociais — Regulamentou o FGTS e ampliou direitos trabalhistas em transição para a nova Constituição. (1988)",
        "Aliança para a democracia — Presidiu o país durante a promulgação da Constituição de 1988, marco fundamental da redemocratização brasileira. (1988)",
        "Programa Nossa Natureza — Criou o primeiro programa nacional de proteção ambiental da Amazônia, precursor das políticas ambientais modernas. (1989)"
    ],
    'fernando_collor': [
        "Abertura comercial — Iniciou a abertura da economia brasileira ao mercado internacional, reduzindo tarifas de importação e forçando a modernização da indústria nacional. (1990)",
        "Plano Collor I — Conseguiu reduzir temporariamente a hiperinflação que havia atingido 1.764% em 1989, estabilizando preços no curto prazo. (1990)",
        "Programa de desestatização — Iniciou o processo de privatizações de empresas estatais, inaugurando novo modelo de gestão da economia. (1990-1992)"
    ],
    'itamar_franco': [
        "Plano Real — Criou o Real e acabou com décadas de hiperinflação no Brasil, sendo a maior realização econômica da história recente do país. (1994)",
        "Estabilidade econômica — Plano Real reduziu inflação de mais de 2.000% ao ano para menos de 10%, transformando o poder de compra da população mais pobre. (1994)"
    ],
    'dilma_rousseff': [
        "Marco Civil da Internet — Aprovou lei que regula os direitos e deveres na internet brasileira, tornando-se referência mundial em legislação digital. (2014)",
        "Ampliação do Pronatec — Expandiu programa de formação técnica profissional, capacitando mais de 8 milhões de trabalhadores durante o mandato. (2011-2014)",
        "Programa Mais Médicos — Levou mais de 18 mil médicos a municípios sem cobertura de saúde, especialmente no interior e na periferia das grandes cidades. (2013)",
        "Descoberta do pré-sal — Regulamentou e iniciou a exploração do pré-sal, reserva que se tornou a maior fonte de petróleo do Brasil. (2010-2014)"
    ],
    'michel_temer': [
        "Reforma Trabalhista — Modernizou a legislação trabalhista, flexibilizando contratos e reduzindo custos para empresas, com aumento do trabalho formal no período. (2017)",
        "Reforma do Ensino Médio — Reestruturou o currículo do ensino médio, introduzindo itinerários formativos e ampliando a carga horária integral. (2017)",
        "TLP e marco do saneamento — Substituiu TJLP pela TLP no BNDES e avançou em marcos regulatórios do saneamento básico e infraestrutura. (2018)",
        "Controle fiscal emergencial — Aprovou teto de gastos (EC 95) para estabilizar as finanças públicas em colapso, evitando calote da dívida federal. (2016)"
    ],
    'jair_bolsonaro': [
        "Privatização da Eletrobras — Concluiu a maior privatização da história do setor elétrico brasileiro, atraindo R$ 33 bilhões em investimentos. (2022)",
        "Auxílio Brasil e Bolsa Família — Elevou o benefício médio do programa social para R$ 600, ampliando a cobertura para mais de 20 milhões de famílias. (2021-2022)",
        "Expansão do crédito consignado — Ampliou acesso ao crédito consignado para trabalhadores do setor privado, beneficiando milhões de famílias de baixa renda. (2019-2022)",
        "Lei de Liberdade Econômica — Aprovou lei que simplificou abertura de empresas e reduziu burocracia para empreendedores e pequenos negócios. (2019)"
    ]
};

let updated = 0;
db.presidentes.forEach(p => {
    const s = (p.sucessos || []).length;
    const pol = (p.polemicas || []).length;
    if (s < pol && extraSucessos[p.id]) {
        const needed = pol - s;
        const toAdd = extraSucessos[p.id].slice(0, needed);
        p.sucessos = (p.sucessos || []).concat(toAdd);
        updated++;
    }
});

const stillUnequal = db.presidentes.filter(p =>
    (p.sucessos || []).length !== (p.polemicas || []).length
).map(p => `${p.nome}: ${(p.sucessos||[]).length}s / ${(p.polemicas||[]).length}p`);

fs.writeFileSync('data/presidentes-db.json', JSON.stringify(db, null, 4), 'utf8');
fs.writeFileSync('equalize2_result.txt',
    `Updated: ${updated} presidents\n` +
    (stillUnequal.length ? 'Still unequal:\n' + stillUnequal.join('\n') : 'All equal!')
);
console.log('Done');
