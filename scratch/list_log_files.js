const fs = require('fs');
const path = require('path');

const brainPath = 'C:/Users/Jafar/.gemini/antigravity/brain';
const folders = fs.readdirSync(brainPath);

folders.forEach(f => {
  const genPath = path.join(brainPath, f, '.system_generated/logs');
  if (fs.existsSync(genPath)) {
    const files = fs.readdirSync(genPath);
    console.log(`Folder: ${f} | Log Files: ${files.join(', ')}`);
  }
});
