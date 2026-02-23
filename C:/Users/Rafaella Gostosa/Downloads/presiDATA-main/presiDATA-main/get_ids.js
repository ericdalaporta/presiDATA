const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'presidentes-db.json');
try {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const arr = db.presidentes || db;
  const ids = arr.map(p => p.id);
  fs.writeFileSync(path.join(__dirname, 'ids_result.txt'), ids.join('\n'), 'utf8');
} catch(e) {
  fs.writeFileSync(path.join(__dirname, 'ids_result.txt'), 'ERROR: ' + e.message, 'utf8');
}
