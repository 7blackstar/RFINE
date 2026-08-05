const fs = require('fs');

for (let i = 0; i <= 17; i++) {
  const filename = `C:/Users/Jafar/Documents/Antigravity/rfine/scratch/settings_raw_${i}.txt`;
  if (!fs.existsSync(filename)) continue;
  
  let raw = fs.readFileSync(filename, 'utf8');
  
  // Clean escapes
  let clean = raw
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"')
    .replace(/\\\\r/g, '')
    .replace(/\\r/g, '');
  
  // Remove line number prefixes like "client\\src\\App.jsx:123: "
  clean = clean.replace(/client\\src\\App\.jsx:\d+:/g, '');
  clean = clean.replace(/^\s*\d+:/gm, '');
  
  console.log(`--- MATCH ${i} (Length: ${clean.length}) ---`);
  console.log(clean.substring(0, 300).trim());
  console.log('\n');
}
