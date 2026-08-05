const fs = require('fs');

const logPath = 'C:/Users/Jafar/.gemini/antigravity/brain/09188eb5-687a-46b1-81f8-80f4b6e7fe06/.system_generated/logs/transcript_full.jsonl';
const outPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/restored_yesterday.js';

if (!fs.existsSync(logPath)) {
  console.error('Log file not found');
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

// Find all matches for "CodeContent":"\"import React... or similar raw strings
const matches = [];
let index = 0;
while (true) {
  const startIdx = content.indexOf('import React', index);
  if (startIdx === -1) break;
  
  // Extract a large chunk
  const chunk = content.substring(startIdx - 100, startIdx + 450000);
  
  // Find where it ends
  const endMarker = '\\n"';
  let endIdx = chunk.indexOf(endMarker, 100);
  if (endIdx === -1) endIdx = chunk.indexOf('","Description"', 100);
  
  if (endIdx !== -1) {
    const rawCode = chunk.substring(100, endIdx);
    matches.push(rawCode);
  }
  
  index = startIdx + 1;
}

console.log(`Found ${matches.length} candidates in logs`);
if (matches.length > 0) {
  // Sort by length to find the most complete one
  matches.sort((a, b) => b.length - a.length);
  
  let cleanCode = matches[0]
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"')
    .replace(/\\\\r/g, '')
    .replace(/\\r/g, '')
    .replace(/\\\\t/g, '  ')
    .replace(/\\t/g, '  ');

  // Strip initial prepended double quotes or slashes if any
  if (cleanCode.startsWith('"')) cleanCode = cleanCode.substring(1);
  if (cleanCode.endsWith('"')) cleanCode = cleanCode.substring(0, cleanCode.length - 1);
  
  fs.writeFileSync(outPath, cleanCode, 'utf8');
  console.log(`Saved restored yesterday's code to ${outPath} (${cleanCode.length} chars)`);
} else {
  console.log('No matches found.');
}
