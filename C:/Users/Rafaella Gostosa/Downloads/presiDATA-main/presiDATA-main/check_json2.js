const fs = require('fs');
const raw = fs.readFileSync('./data/presidentes-db.json', 'utf8');
let out = '';

try {
  JSON.parse(raw);
  out = 'JSON is valid!\n';
} catch(e) {
  out = 'Error: ' + e.message + '\n';
  const m = e.message.match(/line (\d+) column (\d+)/);
  if (m) {
    const line = parseInt(m[1]);
    const lines = raw.split('\n');
    out += 'Context:\n';
    for (let i = Math.max(0, line-3); i < Math.min(lines.length, line+2); i++) {
      out += (i+1) + ': ' + lines[i].substring(0, 160) + '\n';
    }
  }
}

fs.writeFileSync('./json_check_result.txt', out, 'utf8');
