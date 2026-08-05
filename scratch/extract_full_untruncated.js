const fs = require('fs');

const logPath = 'C:/Users/Jafar/.gemini/antigravity/brain/09188eb5-687a-46b1-81f8-80f4b6e7fe06/.system_generated/logs/transcript_full.jsonl';
const outPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/restored_yesterday.js';

if (!fs.existsSync(logPath)) {
  console.error('Log file not found');
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');

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
    
    // EXCLUDE any truncated content
    if (!rawChunk.includes('The above content does NOT show')) {
      candidates.push({
        raw: rawChunk,
        startIdx: startIdx
      });
    }
  }
  
  index = startIdx + 1;
}

console.log(`Found ${candidates.length} untruncated candidates in logs.`);
if (candidates.length > 0) {
  // Sort by length - we want the largest complete source code version
  candidates.sort((a, b) => b.raw.length - a.raw.length);
  
  const best = candidates[0];
  console.log(`Largest clean candidate: length=${best.raw.length} raw characters, log index position=${best.startIdx}`);
  
  let cleanCode = best.raw
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
  
  // Clean line number prefixes if any
  cleanCode = cleanCode.replace(/^[\s\d]*:\s*/gm, '');

  fs.writeFileSync(outPath, cleanCode, 'utf8');
  console.log(`SUCCESS: Wrote untruncated gestern version to ${outPath} (${cleanCode.length} clean characters)`);
} else {
  console.log('No untruncated versions of App.jsx found.');
}
