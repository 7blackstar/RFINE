const fs = require('fs');

function cleanFile(inPath, outPath) {
  let c = fs.readFileSync(inPath, 'utf8');
  c = c
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"')
    .replace(/\\\\r/g, '')
    .replace(/\\r/g, '')
    .replace(/\\\\t/g, '  ')
    .replace(/\\t/g, '  ');

  // Strip line prefix numbers
  c = c.replace(/client\\src\\App\.jsx:\d+:/g, '');
  c = c.replace(/^\s*\d+:/gm, '');
  
  // Find body matching brace
  const bodyStartIdx = c.indexOf('{', c.indexOf(')'));
  if (bodyStartIdx !== -1) {
    let braceCount = 1;
    let endIdx = 0;
    for (let i = bodyStartIdx + 1; i < c.length; i++) {
      if (c[i] === '{') {
        braceCount++;
      } else if (c[i] === '}') {
        braceCount--;
      }
      if (braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
    if (endIdx > 0) {
      c = c.substring(0, endIdx);
    }
  }
  
  fs.writeFileSync(outPath, c);
}

cleanFile('C:/Users/Jafar/Documents/Antigravity/rfine/scratch/settings_raw_13.txt', 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/clean_13.js');
cleanFile('C:/Users/Jafar/Documents/Antigravity/rfine/scratch/settings_raw_16.txt', 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/clean_16.js');
console.log('Saved clean_13.js and clean_16.js');
