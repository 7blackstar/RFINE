const fs = require('fs');

const logPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/fe_def_long.txt';
const content = fs.readFileSync(logPath, 'utf8');

let index = 0;
let bestBlock = '';
while (true) {
  const idx = content.indexOf('function SettingsTab({ theme, setTheme', index);
  if (idx === -1) break;
  
  const endIdx = content.indexOf('// ---', idx + 100);
  const block = content.substring(idx, endIdx !== -1 ? endIdx : idx + 8000);
  
  // A clean block shouldn't contain line prefixes like "client\\src\\App.jsx:" or "8120:"
  const isClean = !block.includes('client\\src') && !/^\s*\d+:/m.test(block);
  
  if (isClean && block.length > bestBlock.length) {
    bestBlock = block;
  }
  
  index = idx + 1;
}

if (bestBlock) {
  let cleanCode = bestBlock
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"')
    .replace(/\\\\r/g, '')
    .replace(/\\r/g, '');
  
  fs.writeFileSync('C:/Users/Jafar/Documents/Antigravity/rfine/scratch/clean_settings_recovered.txt', cleanCode);
  console.log('Successfully recovered clean settings: ' + cleanCode.length + ' chars');
} else {
  console.log('No clean SettingsTab block found in logs.');
}
