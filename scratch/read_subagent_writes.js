const fs = require('fs');
const path = require('path');

const logPath = 'C:/Users/Jafar/.gemini/antigravity/brain/7dad3c46-0158-4429-beca-47385f9f83e3/.system_generated/logs/transcript_full.jsonl';
const outPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/restored_yesterday.js';

if (!fs.existsSync(logPath)) {
  console.error('Log file not found at ' + logPath);
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

// Find all matches for "import React" in this subagent log
let index = 0;
const candidates = [];
while (true) {
  const startIdx = content.indexOf('import React', index);
  if (startIdx === -1) break;
  
  let endIdx = content.indexOf('","Description"', startIdx);
  if (endIdx === -1) endIdx = content.indexOf('","TargetFile"', startIdx);
  if (endIdx === -1) endIdx = content.indexOf('"}', startIdx);
  
  if (endIdx !== -1 && endIdx > startIdx) {
    const rawChunk = content.substring(startIdx, endIdx);
    if (!rawChunk.includes('The above content does NOT show') && rawChunk.length > 200000) {
      candidates.push(rawChunk);
    }
  }
  index = startIdx + 1;
}

console.log(`Found ${candidates.length} candidates in subagent logs.`);
if (candidates.length > 0) {
  candidates.sort((a, b) => b.length - a.length);
  let cleanCode = candidates[0]
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"')
    .replace(/\\\\r/g, '')
    .replace(/\\r/g, '')
    .replace(/\\\\t/g, '  ')
    .replace(/\\t/g, '  ');

  if (cleanCode.startsWith('"')) cleanCode = cleanCode.substring(1);
  if (cleanCode.endsWith('"')) cleanCode = cleanCode.substring(0, cleanCode.length - 1);
  cleanCode = cleanCode.replace(/^[\s\d]*:\s*/gm, '');

  fs.writeFileSync(outPath, cleanCode, 'utf8');
  console.log(`SUCCESS: Restored code from subagent saved to ${outPath} (${cleanCode.length} chars)`);
} else {
  console.log('No untruncated large App.jsx version found in this subagent\'s logs.');
}
