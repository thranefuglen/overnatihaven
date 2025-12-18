const fs = require('fs');
const schema = fs.readFileSync('server/db/schema.sql', 'utf8');
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('Total statements:', statements.length);
statements.forEach((s, i) => {
  console.log(`\nStatement ${i+1} (${s.length} chars):`);
  console.log(s.substring(0, 100) + (s.length > 100 ? '...' : ''));
});
