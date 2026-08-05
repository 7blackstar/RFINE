const fs = require('fs');
const lines = fs.readFileSync('C:/Users/Jafar/.gemini/antigravity/brain/09188eb5-687a-46b1-81f8-80f4b6e7fe06/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
console.log(lines.slice(0, 10).join('\n'));
