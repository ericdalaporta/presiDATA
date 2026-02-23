const fs = require('fs');
const db = JSON.parse(fs.readFileSync('data/presidentes-db.json', 'utf8'));
const result = db.presidentes
    .filter(p => /mazzilli|lula|goulart|ranieri|medici|figueiredo|sarney|collor|itamar|dilma|temer|bolsonaro|hermes|delfim|epitacio|bernardes|washington|dutra|cafe_filho|carlos_luz|janio|costa_e_silva/i.test(p.id))
    .map(p => `${p.id} | ${p.nome} | s:${(p.sucessos||[]).length} p:${(p.polemicas||[]).length}`);
fs.writeFileSync('ids_check.txt', result.join('\n'));
console.log('Done');
