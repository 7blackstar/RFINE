const fs = require('fs');
const path = require('path');

const logPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/fe_def_long.txt';
if (!fs.existsSync(logPath)) {
  console.error('Log file not found');
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

// Find all matches for SettingsTab code
let settingsCode = '';
let index = 0;
while (true) {
  const startIdx = content.indexOf('function SettingsTab({ theme, setTheme', index);
  if (startIdx === -1) break;
  // Look for a large block that looks complete
  let endIdx = content.indexOf('// ---', startIdx + 100);
  if (endIdx === -1) endIdx = startIdx + 5000;
  const chunk = content.substring(startIdx, endIdx);
  if (chunk.length > settingsCode.length) {
    settingsCode = chunk;
  }
  index = startIdx + 1;
}

if (settingsCode) {
  // Clean up JSON escapes if they are stringified in logs
  settingsCode = settingsCode
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"');
  fs.writeFileSync('C:/Users/Jafar/Documents/Antigravity/rfine/scratch/extracted_settings.txt', settingsCode);
  console.log('Saved settings code: ' + settingsCode.length + ' chars');
} else {
  console.log('SettingsTab not found');
}

// Find about modal block
let aboutCode = '';
let aboutIndex = 0;
while (true) {
  const startIdx = content.indexOf('{isAboutOpen && (', aboutIndex);
  if (startIdx === -1) break;
  let endIdx = content.indexOf(')}', startIdx);
  if (endIdx === -1) endIdx = startIdx + 1500;
  const chunk = content.substring(startIdx, endIdx + 2);
  if (chunk.length > aboutCode.length && chunk.includes('About')) {
    aboutCode = chunk;
  }
  aboutIndex = startIdx + 1;
}

if (aboutCode) {
  aboutCode = aboutCode
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"');
  fs.writeFileSync('C:/Users/Jafar/Documents/Antigravity/rfine/scratch/extracted_about.txt', aboutCode);
  console.log('Saved about code: ' + aboutCode.length + ' chars');
} else {
  console.log('About modal block not found');
}
