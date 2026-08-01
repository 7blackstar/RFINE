const fs = require('fs');

const logPath = "C:\\Users\\Jafar\\.gemini\\antigravity\\brain\\09188eb5-687a-46b1-81f8-80f4b6e7fe06\\.system_generated\\logs\\transcript.jsonl";

const fileContent = fs.readFileSync(logPath, 'utf8');
const lines = fileContent.split('\n');

console.log("Searching for FrameExtractor full body in logs...");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('function FrameExtractor') && line.includes('secondsToTimestamp') && line.includes('filmstrip-thumb')) {
    try {
      const data = JSON.parse(line);
      const content = data.content || '';
      // check if it's a replacement or file view
      if (content.length > 5000) {
        console.log(`Found candidate at index ${i}, length: ${content.length}`);
        fs.writeFileSync(`c:\\Users\\Jafar\\Documents\\Antigravity\\rfine\\full_extractor_log_${i}.txt`, content);
      }
    } catch (e) {}
  }
}
console.log("Done.");
