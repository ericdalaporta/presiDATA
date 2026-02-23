const fs = require('fs');
const raw = fs.readFileSync('data/presidentes-db.json', 'utf8');
const db = JSON.parse(raw);
const result = db.presidentes.map(p => ({
    id: p.id,
    nome: p.nome,
    sucessos: (p.sucessos || []).length,
    polemicas: (p.polemicas || []).length,
    diff: (p.polemicas || []).length - (p.sucessos || []).length
})).filter(p => p.diff !== 0);
fs.writeFileSync('counts_result.txt', result.map(p =>
    `${p.nome}: ${p.sucessos} sucessos / ${p.polemicas} polêmicas (diff: ${p.diff > 0 ? '+' + p.diff + ' polêmicas' : p.diff + ' sucessos'})`
).join('\n'));
console.log('Done');
