const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/presidentes-db.json', 'utf8'));

// Adiciona polêmicas para presidentes com mais sucessos que polêmicas
const extraPolemicas = {
    'rodrigues_alves': [
        "Revolta da Vacina — A obrigatoriedade da vacina contra varíola, imposta sem debate público, gerou a maior revolta urbana da República, com mortes e destruição no Rio de Janeiro. (1904)",
        "Bota-abaixo e remoção forçada — A reforma urbana de Pereira Passos demoliu cortiços e expulsou populações pobres do centro do Rio sem qualquer indenização ou reassentamento. (1904-1906)"
    ],
    'afonso_pena': [
        "Convênio de Taubaté — Negociou acordo de valorização artificial do café com São Paulo e Minas, socializando custos com toda a federação para beneficiar uma elite exportadora. (1906)",
        "Morte no cargo — Faleceu antes de concluir o mandato, gerando instabilidade na sucessão e deixando o governo sem concluir projetos iniciados. (1909)"
    ],
    'jose_linhares': [
        "Poder sem legitimidade popular — Assumiu a presidência sem eleição, por indicação do STF, sem mandato democrático nem representatividade popular direta. (1945)",
        "Continuidade burocrática do Estado Novo — Manteve em seus postos grande parte dos quadros administrativos do Estado Novo, sem depuração real do aparelho de Estado autoritário. (1945)"
    ],
    'eurico_gaspar_dutra': [
        "Fechamento das cassinos e proibição do jogo — Intervenção moralista no lazer popular gerou desemprego no setor e desagradou amplas camadas da população. (1946)"
    ],
    'juscelino_kubitschek': [
        "Inflação e endividamento externo — O financiamento do plano de metas por emissão de moeda gerou inflação acumulada de 200% e endividamento externo que pesou nas décadas seguintes. (1956-1961)",
        "Construção de Brasília e especulação — A construção da nova capital gerou imensa especulação imobiliária, desvios de recursos públicos e abandono das cidades existentes. (1956-1960)"
    ],
    'carlos_luz': [
        "Mandato de apenas 3 dias sem nenhuma realização — Presidência mais curta da república, sem tempo para qualquer política pública ou contribuição ao Estado. (1955)",
        "Símbolo de instabilidade republicana — Sua deposição pelo Congresso, embora constitucional, expôs a fragilidade das instituições democráticas do período. (1955)"
    ],
    'ranieri_mazzilli_1': [
        "Incapacidade de estabilizar a crise — Apesar de assumir duas vezes a presidência, nunca demonstrou força política para resolver as crises institucionais que marcaram seu mandato. (1961)",
        "Ausência de agenda própria — Ambos os mandatos interinos transcorreram sem nenhuma iniciativa política própria, limitando-se à administração passiva do cargo. (1961-1964)"
    ],
    'ranieri_mazzilli_2': [
        "Incapacidade de estabilizar a crise — Apesar de assumir duas vezes a presidência, nunca demonstrou força política para resolver as crises institucionais que marcaram seu mandato. (1961)",
        "Ausência de agenda própria — Ambos os mandatos interinos transcorreram sem nenhuma iniciativa política própria, limitando-se à administração passiva do cargo. (1961-1964)"
    ],
    'lula': [
        "Mensalão — Esquema de compra de votos de parlamentares com dinheiro do erário, operado pelo PT, resultou em condenação de dirigentes partidários pelo STF. (2005-2012)",
        "Crise de governabilidade do segundo mandato — Saída de ministros envolvidos em escândalos e dificuldades de articulação política marcaram o segundo mandato. (2006-2010)"
    ]
};

let updated = 0;
db.presidentes.forEach(p => {
    const s = (p.sucessos || []).length;
    const pol = (p.polemicas || []).length;
    if (s > pol && extraPolemicas[p.id]) {
        const needed = s - pol;
        const toAdd = extraPolemicas[p.id].slice(0, needed);
        p.polemicas = (p.polemicas || []).concat(toAdd);
        updated++;
    }
    // Também verifica se ainda falta sucessos
    const s2 = (p.sucessos || []).length;
    const pol2 = (p.polemicas || []).length;
    if (s2 !== pol2) {
        // Para carlos_luz e mazzilli que têm mais polêmicas após adicionar
        // já foram cobertos no equalize2.js - apenas reporta
    }
});

const stillUnequal = db.presidentes.filter(p =>
    (p.sucessos || []).length !== (p.polemicas || []).length
).map(p => `${p.nome}: ${(p.sucessos||[]).length}s / ${(p.polemicas||[]).length}p`);

fs.writeFileSync('data/presidentes-db.json', JSON.stringify(db, null, 4), 'utf8');
fs.writeFileSync('equalize3_result.txt',
    `Updated: ${updated} presidents\n` +
    (stillUnequal.length ? 'Still unequal:\n' + stillUnequal.join('\n') : 'All equal!')
);
console.log('Done');
