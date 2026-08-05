const fs = require('fs');

const logPath = 'C:/Users/Jafar/.gemini/antigravity/brain/09188eb5-687a-46b1-81f8-80f4b6e7fe06/.system_generated/logs/transcript_full.jsonl';
const outPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/restored_yesterday.js';

if (!fs.existsSync(logPath)) {
  console.error('Log file not found');
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

// Find all matches for "import React"
let index = 0;
const candidates = [];
while (true) {
  const startIdx = content.indexOf('import React', index);
  if (startIdx === -1) break;
  
  // Find where it ends - let's look for a closing sequence like standard JSON block properties:
  // e.g. "Description" or "IsArtifact" or trailing transcript entries
  let endIdx = content.indexOf('","Description"', startIdx);
  if (endIdx === -1) endIdx = content.indexOf('","TargetFile"', startIdx);
  if (endIdx === -1) endIdx = content.indexOf('"}', startIdx);
  
  if (endIdx !== -1 && endIdx > startIdx) {
    const rawChunk = content.substring(startIdx, endIdx);
    candidates.push(rawChunk);
  }
  
  index = startIdx + 1;
}

console.log(`Found ${candidates.length} candidates.`);
if (candidates.length > 0) {
  // Sort by length - we want the full large file (approx 300k+ characters)
  candidates.sort((a, b) => b.length - a.length);
  
  const largest = candidates[0];
  console.log(`Largest candidate raw length: ${largest.length} characters.`);
  
  let cleanCode = largest
    .replace(/\\\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\"/g, '"')
    .replace(/\\\\r/g, '')
    .replace(/\\r/g, '')
    .replace(/\\\\t/g, '  ')
    .replace(/\\t/g, '  ');

  // Strip prefix/suffix quotes if present
  if (cleanCode.startsWith('"')) cleanCode = cleanCode.substring(1);
  if (cleanCode.endsWith('"')) cleanCode = cleanCode.substring(0, cleanCode.length - 1);
  
  fs.writeFileSync(outPath, cleanCode, 'utf8');
  console.log(`SUCCESS: Restored file written to ${outPath} (${cleanCode.length} clean characters)`);
} else {
  console.log('No complete candidates found.');
}
