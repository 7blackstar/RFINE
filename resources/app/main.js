const { app, BrowserWindow } = require('electron');
const { fork } = require('child_process');
const path = require('path');

let serverProcess = null;
let mainWindow = null;

let windowCreated = false;

function startServer() {
  try {
    const serverPath = path.join(__dirname, 'server', 'index.js');
    console.log('[MAIN] Loading server via dynamic import:', serverPath);
    import('file:///' + serverPath.replace(/\\/g, '/')).then(() => {
      console.log('[MAIN] Server loaded and started successfully in-process!');
    }).catch(err => {
      console.error('[MAIN] Dynamic import server error:', err);
    });
  } catch (err) {
    console.error('Error launching server:', err);
  }
}

function waitForServer(attempt = 0) {
  if (windowCreated) return;
  const http = require('http');
  const req = http.get('http://127.0.0.1:5001/api/scan-dir?path=.', (res) => {
    if (!windowCreated) {
      windowCreated = true;
      createWindow();
    }
  });

  req.on('error', () => {
    if (attempt < 50) {
      setTimeout(() => waitForServer(attempt + 1), 200);
    } else if (!windowCreated) {
      windowCreated = true;
      createWindow();
    }
  });

  req.end();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    title: 'RFINE Media Suite',
    autoHideMenuBar: true
  });

  mainWindow.webContents.openDevTools();
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[MAIN] Page failed to load: ${errorDescription} (${errorCode}) at ${validatedURL}`);
  });
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('[MAIN] Render process crashed/gone:', details);
  });
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[RENDERER CONSOLE] ${message} (from ${sourceId}:${line})`);
  });

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
    if (found) openFilePath = found;
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
  waitForServer();
});

function killServerProcess() {
  if (serverProcess) {
    try {
      if (process.platform === 'win32') {
        const { execSync } = require('child_process');
        execSync(`taskkill /F /T /PID ${serverProcess.pid}`);
      } else {
        serverProcess.kill('SIGKILL');
      }
    } catch (e) {}
    serverProcess = null;
  }
}

app.on('before-quit', () => {
  killServerProcess();
});

app.on('will-quit', () => {
  killServerProcess();
});

app.on('window-all-closed', () => {
  killServerProcess();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
