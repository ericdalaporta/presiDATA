const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/presidentes-db.json', 'utf8'));
const p = db.presidentes.find(x => x.id === 'jair_bolsonaro');
fs.writeFileSync('bolsonaro_check.txt', 
    `SUCESSOS (${p.sucessos.length}):\n` + p.sucessos.map((s,i) => `${i+1}. ${s}`).join('\n') +
    `\n\nPOLEMICAS (${p.polemicas.length}):\n` + p.polemicas.map((s,i) => `${i+1}. ${s}`).join('\n')
);
console.log('Done');
