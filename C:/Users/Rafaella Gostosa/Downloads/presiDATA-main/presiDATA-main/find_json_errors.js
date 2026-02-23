const fs = require('fs');
const raw = fs.readFileSync('./data/presidentes-db.json', 'utf8');

// Try to parse incrementally to find all errors
let pos = 0;
let errorPos = 0;

// First, show the error location from JSON.parse
try {
  JSON.parse(raw);
  console.log('JSON is valid!');
} catch(e) {
  console.log('Error:', e.message);
  // Extract line/col from message
  const m = e.message.match(/line (\d+) column (\d+)/);
  if (m) {
    const line = parseInt(m[1]);
    const col = parseInt(m[2]);
    const lines = raw.split('\n');
    console.log('Around error:');
    for (let i = Math.max(0, line-3); i < Math.min(lines.length, line+2); i++) {
      console.log((i+1) + ': ' + lines[i].substring(0, 150));
    }
  }
}
