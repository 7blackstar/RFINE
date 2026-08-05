const fs = require('fs');

const logPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/fe_def_long.txt';
const content = fs.readFileSync(logPath, 'utf8');

console.log('Searching for About Modal comment...');
const aboutMatches = [];
let index = 0;
while (true) {
  const idx = content.indexOf('{/* About Dialog Modal */}', index);
  if (idx === -1) break;
  
  // Get a chunk of 4000 characters after it
  const slice = content.substring(idx, idx + 4000);
  if (slice.includes('setIsAboutOpen(false)')) {
    aboutMatches.push(slice);
  }
  index = idx + 1;
}

console.log(`Found ${aboutMatches.length} candidates for About Modal`);
if (aboutMatches.length > 0) {
  // Sort by length to find the most complete one
  aboutMatches.sort((a, b) => b.length - a.length);
  
  let cleanAbout = aboutMatches[0]
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\\\r/g, '')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"')
    .replace(/\\t/g, '  ')
    .replace(/\\\\t/g, '  ');
  
  // Clean up any line prefix numbers like "840: " if present
  cleanAbout = cleanAbout.replace(/^\s*\d+:\s*/gm, '');
  
  // Match braces/parentheses to find the end of the block `{isAboutOpen && ( ... )}`
  const bodyStartIdx = cleanAbout.indexOf('{', cleanAbout.indexOf('/*'));
  if (bodyStartIdx !== -1) {
    let braceCount = 1;
    let endIdx = 0;
    for (let i = bodyStartIdx + 1; i < cleanAbout.length; i++) {
      if (cleanAbout[i] === '{') {
        braceCount++;
      } else if (cleanAbout[i] === '}') {
        braceCount--;
      }
      if (braceCount === 0) {
        endIdx = i + 1;
        break;
      }
    }
    if (endIdx > 0) {
      cleanAbout = cleanAbout.substring(0, endIdx);
    }
  }
  
  fs.writeFileSync('C:/Users/Jafar/Documents/Antigravity/rfine/scratch/extracted_about.txt', cleanAbout);
  console.log('Saved about modal code: ' + cleanAbout.length + ' chars');
}
