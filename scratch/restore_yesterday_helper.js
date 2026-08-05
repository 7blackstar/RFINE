const fs = require('fs');
const readline = require('readline');

const logPath = 'C:/Users/Jafar/.gemini/antigravity/brain/09188eb5-687a-46b1-81f8-80f4b6e7fe06/.system_generated/logs/transcript_full.jsonl';
const outPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/restored_yesterday.js';

if (!fs.existsSync(logPath)) {
  console.error('Log not found');
  process.exit(1);
}

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let foundVersions = [];

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    
    // 1. Search in tool call replacement content (if we did a large replace)
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.args && tc.args.ReplacementContent && tc.args.ReplacementContent.length > 50000) {
          foundVersions.push({
            type: 'tool_call_replacement',
            timestamp: obj.created_at || '',
            content: tc.args.ReplacementContent
          });
        }
      }
    }
    
    // 2. Search in tool responses / system responses (if we viewed the file contents of App.jsx)
    if (obj.content && obj.content.includes('import React') && obj.content.includes('ImageResizer') && obj.content.length > 50000) {
      foundVersions.push({
        type: 'response_content',
        timestamp: obj.created_at || '',
        content: obj.content
      });
    }
  } catch (e) {
    // Ignore parse errors
  }
});

rl.on('close', () => {
  console.log(`Found ${foundVersions.length} historical versions of App.jsx in logs.`);
  if (foundVersions.length > 0) {
    // Print metadata
    foundVersions.forEach((v, i) => {
      console.log(`Candidate ${i}: type=${v.type}, timestamp=${v.timestamp}, length=${v.content.length}`);
    });
    
    // Find the one before the current session changes (yesterday's date was July 31st or early Aug 1st)
    // Let's write the most recent large version found:
    const best = foundVersions[foundVersions.length - 1];
    
    // Clean up content string (if it contains markdown block syntax)
    let finalCode = best.content;
    if (finalCode.includes('```javascript')) {
      const idx = finalCode.indexOf('```javascript');
      const endIdx = finalCode.indexOf('```', idx + 13);
      finalCode = finalCode.substring(idx + 13, endIdx);
    } else if (finalCode.includes('```jsx')) {
      const idx = finalCode.indexOf('```jsx');
      const endIdx = finalCode.indexOf('```', idx + 6);
      finalCode = finalCode.substring(idx + 6, endIdx);
    } else if (finalCode.includes('```')) {
      const idx = finalCode.indexOf('```');
      const endIdx = finalCode.indexOf('```', idx + 3);
      finalCode = finalCode.substring(idx + 3, endIdx);
    }
    
    fs.writeFileSync(outPath, finalCode, 'utf8');
    console.log(`SUCCESS: Saved version to ${outPath}`);
  } else {
    console.log('No historical versions of App.jsx found.');
  }
});
