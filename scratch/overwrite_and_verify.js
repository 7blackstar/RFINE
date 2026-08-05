const fs = require('fs');
const { execSync } = require('child_process');

const sourcePath = 'C:/Users/Jafar/Documents/Antigravity/rfine/scratch/restored_yesterday.js';
const targetPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/client/src/App.jsx';

if (!fs.existsSync(sourcePath)) {
  console.error('Source yesterday code file not found');
  process.exit(1);
}

// Copy the file
fs.copyFileSync(sourcePath, targetPath);
console.log('App.jsx overwritten with yesterday\'s code version.');

// Verify with build
try {
  console.log('Running npm run build inside client to verify yesterday\'s code...');
  const buildOutput = execSync('npm run build', {
    cwd: 'C:/Users/Jafar/Documents/Antigravity/rfine/client',
    encoding: 'utf8'
  });
  console.log('BUILD SUCCESSFUL!');
  console.log(buildOutput);
} catch (err) {
  console.error('BUILD FAILED WITH ERROR:');
  console.error(err.stdout || err.stderr || err.message);
  process.exit(1);
}
