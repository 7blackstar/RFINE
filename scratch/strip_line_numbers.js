const fs = require('fs');

const path = 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/restored_yesterday.js';
let c = fs.readFileSync(path, 'utf8');

// Strip line prefixes like "123: " or "client\\src\\App.jsx:123: " from each line
c = c.replace(/^[\s\d]*:\s*/gm, '');

// Save clean code
fs.writeFileSync(path, c, 'utf8');
console.log('Line numbers stripped successfully.');
