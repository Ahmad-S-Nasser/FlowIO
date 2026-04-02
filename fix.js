const fs = require('fs');
const content = fs.readFileSync('src/pages/Builder.tsx', 'utf8');
const lines = content.split(/\r?\n/);
const result = [...lines.slice(0, 864), ...lines.slice(1263)];
fs.writeFileSync('src/pages/Builder.tsx', result.join('\n'));
console.log('Fixed Builder.tsx');
