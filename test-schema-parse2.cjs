const fs = require('fs');
const schema = fs.readFileSync('server/db/schema.sql', 'utf8');

console.log('Schema length:', schema.length);
console.log('\n--- Splitting by semicolon ---');
const parts = schema.split(';');
console.log('Parts after split:', parts.length);

parts.forEach((part, i) => {
  console.log(`\nPart ${i} (length: ${part.length}):`);
  console.log('First 80 chars:', part.substring(0, 80).replace(/\n/g, '\\n'));
  console.log('Trimmed:', part.trim().substring(0, 80).replace(/\n/g, '\\n'));
  console.log('Starts with --?:', part.trim().startsWith('--'));
  console.log('Is empty after trim?:', part.trim().length === 0);
});

console.log('\n--- After filtering ---');
const statements = schema
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log('Final statements:', statements.length);
