const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const path = require('path');

let serverProcess = null;
let mainWindow = null;

let windowCreated = false;

function startServer() {
  const serverPath = path.join(__dirname, 'server', 'index.js');
  serverProcess = fork(serverPath, [], {
    env: { ...process.env, PORT: 5001 },
    silent: true
  });

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('[SERVER]', output.trim());
    if ((output.includes('listening at') || output.includes('Port 5001 in use')) && !windowCreated) {
      windowCreated = true;
      createWindow();
    }
  });

  serverProcess.stderr.on('data', (data) => {
    console.error('[SERVER ERROR]', data.toString().trim());
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start Express server:', err);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`Express server exited with code ${code} (signal: ${signal})`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'RFINE Media Suite',
    autoHideMenuBar: true
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER CONSOLE] ${message} (from ${sourceId}:${line})`);
  });

  // Detect if a supported file was passed as command line argument
  let openFilePath = null;
  const fs = require('fs');
  const supportedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif', '.mp4', '.mkv', '.mov', '.avi', '.webm', '.mp3', '.wav', '.aac', '.flac', '.m4a'];
  
  if (process.argv.length >= 2) {
    const found = process.argv.slice(1).find(arg => {
      try {
        const ext = path.extname(arg).toLowerCase();
        return supportedExts.includes(ext) && fs.existsSync(arg);
      } catch {
        return false;
      }
    });
    if (found) {
      openFilePath = found;
    }
  }

  const indexPath = path.join(__dirname, 'client', 'dist', 'index.html');
  const loadOptions = openFilePath ? { query: { openFile: openFilePath } } : {};
  const queryStr = openFilePath ? `?openFile=${encodeURIComponent(openFilePath)}` : '';

  mainWindow.loadURL(`http://127.0.0.1:5001${queryStr}`).catch((err) => {
    console.error('Failed to load Express server URL, falling back to local file:', err);
    mainWindow.loadFile(indexPath, loadOptions);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  // Safe fallback: if server startup messages aren't caught in 3 seconds, load window anyway
  setTimeout(() => {
    if (!windowCreated) {
      windowCreated = true;
      createWindow();
    }
  }, 3000);
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
