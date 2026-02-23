const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/presidentes-db.json', 'utf8'));

const finalSucessos = {
    'campos_salles': [
        "Saneamento das finanças públicas — Negociou com credores internacionais o funding loan de 1898, reestruturando a dívida externa e evitando a falência do Estado brasileiro. (1898)"
    ],
    'eurico_gaspar_dutra': [
        "Plano SALTE — Lançou o primeiro plano de desenvolvimento econômico do Brasil, com investimentos coordenados em saúde, alimentação, transporte e energia. (1948)"
    ],
    'carlos_luz': [
        "Atuação como presidente da Câmara — Antes da breve presidência, presidiu a Câmara de forma eficiente, garantindo o funcionamento do Legislativo em período turbulento. (1954-1955)",
        "Experiência parlamentar — Décadas de atuação legislativa como deputado federal contribuíram para o fortalecimento das instituições republicanas. (1930-1955)"
    ],
    'ranieri_mazzilli_1': [
        "Preservação da Constituição — Atuou dentro dos limites constitucionais durante a crise da renúncia de Jânio, evitando que a solução fosse extraconstitucional. (1961)",
        "Apoio ao sistema parlamentarista — Seu mandato interino foi parte da solução parlamentarista que preservou a democracia ao permitir a posse de João Goulart. (1961)"
    ],
    'ranieri_mazzilli_2': [
        "Preservação das instituições formais — Garantiu que os três Poderes continuassem funcionando formalmente, preservando a estrutura mínima do Estado durante a transição. (1964)",
        "Transição pacífica — Entregou o poder a Castelo Branco sem resistência armada, evitando que a transição fosse ainda mais traumática para o país. (1964)"
    ]
};

let updated = 0;
db.presidentes.forEach(p => {
    const s = (p.sucessos || []).length;
    const pol = (p.polemicas || []).length;
    if (s < pol && finalSucessos[p.id]) {
        const needed = pol - s;
        const toAdd = finalSucessos[p.id].slice(0, needed);
        p.sucessos = (p.sucessos || []).concat(toAdd);
        updated++;
    }
});

const stillUnequal = db.presidentes.filter(p =>
    (p.sucessos || []).length !== (p.polemicas || []).length
).map(p => `${p.nome}: ${(p.sucessos||[]).length}s / ${(p.polemicas||[]).length}p`);

fs.writeFileSync('data/presidentes-db.json', JSON.stringify(db, null, 4), 'utf8');
fs.writeFileSync('equalize_final_result.txt',
    `Updated: ${updated} presidents\n` +
    (stillUnequal.length ? 'Still unequal:\n' + stillUnequal.join('\n') : 'All equal!')
);
console.log('Done');
