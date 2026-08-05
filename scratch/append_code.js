const fs = require('fs');

const appPath = 'C:/Users/Jafar/Documents/Antigravity/rfine/client/src/App.jsx';
let code = fs.readFileSync(appPath, 'utf8');

// 1. Recovered SettingsTab code
const settingsCode = `

// ----------------------------------------------------------------------------
// SYSTEM SETTINGS STUDIO
// ----------------------------------------------------------------------------
function SettingsTab({ theme, setTheme, openFolderPicker }) {
  const [defSaveDir, setDefSaveDir] = useState(() => localStorage.getItem('rfine_def_save_dir') || '');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rfine_favorites')) || [];
    } catch {
      return [];
    }
  });

  const saveSettings = () => {
    localStorage.setItem('rfine_def_save_dir', defSaveDir);
    alert('Settings saved successfully!');
  };

  const removeFavorite = (pathToRemove) => {
    const updated = favorites.filter(f => f !== pathToRemove);
    setFavorites(updated);
    localStorage.setItem('rfine_favorites', JSON.stringify(updated));
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This will clear favorites and paths.')) {
      localStorage.clear();
      setDefSaveDir('');
      setFavorites([]);
      setTheme('dark');
      alert('All settings reset to defaults.');
    }
  };

  const handleOpenPicker = () => {
    openFolderPicker(defSaveDir, (selectedPath) => {
      setDefSaveDir(selectedPath);
    });
  };

  return (
    <div className="animate-fade-in animate-slide-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '15px', position: 'relative', padding: '24px 30px' }}>
      <div>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '900', color: 'var(--color-white)' }}>SYSTEM SETTINGS</h1>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: 0 }}>Configure default output targets, favorite workspaces, and theme options.</p>
      </div>

      {/* Theme Selection */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', display: 'block' }}>Interface Theme</span>
          <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Toggle between light and dark visual aesthetics.</span>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </div>

      {/* Unified Default Save Folder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>Default Save Folder</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            readOnly
            placeholder="No default folder configured"
            value={defSaveDir}
            style={{ padding: '8px', fontSize: '11px', flexGrow: 1, background: 'rgba(0,0,0,0.1)', cursor: 'default' }}
          />
          <button
            onClick={handleOpenPicker}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
          >
            Browse...
          </button>
        </div>
      </div>

      {/* Favorite Workspaces */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', flexGrow: 1, minHeight: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>Favorite Workspaces</span>
        {favorites.length === 0 ? (
          <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--color-slate)', fontSize: '11px', fontStyle: 'italic' }}>
            No favorite folders saved yet. Star folders in the file explorer to add them here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {favorites.map((fav) => (
              <div key={fav} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1, marginRight: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fav.substring(fav.lastIndexOf('\\\\') + 1) || fav}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--color-slate)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={fav}>
                    {fav}
                  </span>
                </div>
                <button
                  onClick={() => removeFavorite(fav)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save / Reset Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
        <button
          onClick={handleResetAll}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '11px', color: '#EF4444' }}
        >
          Reset All Defaults
        </button>
        <button
          onClick={saveSettings}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '11px' }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
`;

// 2. Recovered About Modal code to inject
const aboutModalCode = `
      {/* About Dialog Modal */}
      {isAboutOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(4, 5, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div className="glass-panel animate-fade-in animate-slide-in" style={{
            width: '420px',
            padding: '30px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
            position: 'relative'
          }}>
            <button onClick={() => setIsAboutOpen(false)}
              className="btn-secondary flex-center"
              style={{ position: 'absolute', top: '15px', right: '15px', padding: '6px', borderRadius: '50%', width: '28px', height: '28px', justifyContent: 'center' }}
              title="Close"
            >
              <X size={14} />
            </button>
            <div style={{ marginBottom: '10px' }}>
              <img src={theme === 'light' ? 'logo_light.png' : 'logo.png'} style={{ maxHeight: '42px', width: 'auto' }} alt="RFINE Logo" />
              <span style={{ fontSize: '10px', color: 'var(--primary-color)', display: 'block', marginTop: '6px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Refined Media Utilities
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-slate)', lineHeight: '1.6', margin: '0 0 10px 0' }}>
              Version 1.3.0 (Offline Mode)<br/>
              A high-performance offline desktop media processing workshop designed for speed, privacy, and visual elegance.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)' }}>
                <span>OS Version:</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>Windows x64</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)' }}>
                <span>Build Engine:</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>Electron + React</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)' }}>
                <span>Local Server:</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>Online (Port 5001)</span>
              </div>
            </div>
            <button onClick={() => setIsAboutOpen(false)} className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '11px' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
`;

// Find where the App component returns and finishes:
// It ends with:
//       </main>
//     </div>
//   );
// }
const mainClosingIdx = code.indexOf('</main>');
if (mainClosingIdx === -1) {
  console.error('Could not find </main> closing tag');
  process.exit(1);
}

// Let's insert the About Modal code right after the </main> closing tag (which is inside the root div container of the App render return):
const insertIdx = code.indexOf('</div>', mainClosingIdx);
if (insertIdx === -1) {
  console.error('Could not find root closing div');
  process.exit(1);
}

code = code.substring(0, insertIdx) + aboutModalCode + code.substring(insertIdx);

// Append SettingsTab code to the end of the file
code = code.trim() + settingsCode;

fs.writeFileSync(appPath, code, 'utf8');
console.log('App.jsx modified successfully!');
