const fs = require('fs');
const path = require('path');

const brainPath = 'C:/Users/Jafar/.gemini/antigravity/brain';
const folders = fs.readdirSync(brainPath);
const candidates = [];

folders.forEach(f => {
  const logPath = path.join(brainPath, f, '.system_generated/logs/transcript.jsonl');
  if (fs.existsSync(logPath)) {
    try {
      const content = fs.readFileSync(logPath, 'utf8');
      let index = 0;
      while (true) {
        const startIdx = content.indexOf('import React', index);
        if (startIdx === -1) break;
        
        let endIdx = content.indexOf('","Description"', startIdx);
        if (endIdx === -1) endIdx = content.indexOf('","TargetFile"', startIdx);
        if (endIdx === -1) endIdx = content.indexOf('"}', startIdx);
        
        if (endIdx !== -1 && endIdx > startIdx) {
          const rawChunk = content.substring(startIdx, endIdx);
          if (!rawChunk.includes('The above content does NOT show')) {
            candidates.push({
              folder: f,
              rawLength: rawChunk.length,
              content: rawChunk
            });
          }
        }
        index = startIdx + 1;
      }
    } catch (err) {
      console.error(`Error reading ${f}: ${err.message}`);
    }
  }
});

console.log(`Found ${candidates.length} candidates in transcript.jsonl files.`);
if (candidates.length > 0) {
  candidates.sort((a, b) => b.rawLength - a.rawLength);
  const best = candidates[0];
  console.log(`Best candidate from folder: ${best.folder} (length: ${best.rawLength})`);
  
  let cleanCode = best.content
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

  fs.writeFileSync('C:/Users/Jafar/Documents/Antigravity/rfine/scratch/restored_yesterday.js', cleanCode);
  console.log('Saved to scratch/restored_yesterday.js');
} else {
  console.log('No untruncated candidates found in any transcript.jsonl file.');
}
