const fs = require('fs');
const readline = require('readline');

const logPath = 'C:/Users/Jafar/.gemini/antigravity/brain/09188eb5-687a-46b1-81f8-80f4b6e7fe06/.system_generated/logs/transcript_full.jsonl';

if (!fs.existsSync(logPath)) {
  console.error('Log file not found');
  process.exit(1);
}

const rl = readline.createInterface({
  input: fs.createReadStream(logPath),
  crlfDelay: Infinity
});

let matches = [];

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const obj = JSON.parse(line);
    
    // Check tool calls
    if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.name === 'write_to_file' || tc.name === 'replace_file_content' || tc.name === 'multi_replace_file_content') {
          const target = tc.args && tc.args.TargetFile;
          if (target && target.includes('App.jsx')) {
            matches.push({
              step: obj.step_index,
              time: obj.created_at || 'unknown',
              name: tc.name,
              desc: tc.args.Description || tc.args.Instruction || '',
              length: JSON.stringify(tc.args).length
            });
          }
        }
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
});

rl.on('close', () => {
  console.log(`Found ${matches.length} tool calls modifying App.jsx in full logs:`);
  matches.forEach((m, i) => {
    console.log(`[${i}] Step: ${m.step} | Time: ${m.time} | Tool: ${m.name} | Length: ${m.length} | Desc: ${m.desc}`);
  });
});
