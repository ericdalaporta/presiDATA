const fs = require('fs');
const raw = fs.readFileSync('./data/presidentes-db.json', 'utf8');

function findErrors(raw) {
  let attempt = raw;
  let found = [];
  while (true) {
    try {
      JSON.parse(attempt);
      if (found.length === 0) {
        process.stdout.write('JSON is valid!\n');
      } else {
        process.stdout.write('Fixed all ' + found.length + ' errors.\n');
      }
      break;
    } catch(e) {
      const m = e.message.match(/line (\d+) column (\d+)/);
      if (!m) { process.stdout.write('Unknown error: ' + e.message + '\n'); break; }
      const line = parseInt(m[1]);
      const col = parseInt(m[2]);
      const lines = attempt.split('\n');
      process.stdout.write('Error at line ' + line + ' col ' + col + ':\n');
      for (let i = Math.max(0, line-3); i < Math.min(lines.length, line+2); i++) {
        process.stdout.write((i+1) + ': ' + lines[i].substring(0, 160) + '\n');
      }
      process.stdout.write('---\n');
      found.push(line);
      // Stop after first error - we need manual fix
      break;
    }
  }
}

findErrors(raw);
process.exit(0);
