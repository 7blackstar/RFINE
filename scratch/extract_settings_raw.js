const fs = require('fs');

const logPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/fe_def_long.txt';
const content = fs.readFileSync(logPath, 'utf8');

let index = 0;
let matchNum = 0;
while (true) {
  const idx = content.indexOf('function SettingsTab({ theme, setTheme', index);
  if (idx === -1) break;
  
  // Extract 15000 characters
  const rawChunk = content.substring(idx, idx + 15000);
  fs.writeFileSync(`C:/Users/Jafar/Documents/Antigravity/rfine/scratch/settings_raw_${matchNum}.txt`, rawChunk);
  console.log(`Saved match ${matchNum} at index ${idx}`);
  
  matchNum++;
  index = idx + 1;
}
