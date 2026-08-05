const fs = require('fs');
const path = require('path');

const parentPath = 'C:/Users/Jafar/.gemini/antigravity/brain';
if (!fs.existsSync(parentPath)) {
  console.error('Brain parent folder not found');
  process.exit(1);
}

const folders = fs.readdirSync(parentPath).map(name => {
  const fullPath = path.join(parentPath, name);
  const stat = fs.statSync(fullPath);
  return {
    name,
    isDir: stat.isDirectory(),
    mtime: stat.mtime
  };
}).filter(f => f.isDir);

console.log('Found session folders:');
folders.forEach(f => {
  console.log(`Folder: ${f.name} | Modified: ${f.mtime}`);
});
