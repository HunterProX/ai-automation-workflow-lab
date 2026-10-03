const fs = require('node:fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const failures = [];
if (Number(process.versions.node.split('.')[0]) < 20) failures.push('Node.js 20 or newer is required.');
for (const script of ['test', 'start']) if (!pkg.scripts[script]) failures.push(`Missing npm script: ${script}`);
if (failures.length) { console.error(failures.map((item) => `DOCTOR FAIL: ${item}`).join('\n')); process.exit(1); }
console.log('DOCTOR PASS: workflow scripts and runtime requirements are aligned.');
