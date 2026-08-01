const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'client/src/App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add state to App
const stateToAdd = `
  const [isFileBrowserCollapsed, setIsFileBrowserCollapsed] = useState(() => localStorage.getItem('rfine_file_browser_collapsed') === 'true');
  const toggleFileBrowser = () => {
    const next = !isFileBrowserCollapsed;
    setIsFileBrowserCollapsed(next);
    localStorage.setItem('rfine_file_browser_collapsed', String(next));
  };
`;
if (!content.includes('isFileBrowserCollapsed')) {
  content = content.replace('const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);', 'const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);\n' + stateToAdd);
}

// 2. Add Minimize2 to FileExplorer signature and render
const fnTarget = 'function FileExplorer({ onAddFiles, allowedExtensions = [], maxListHeight = null, onPreviewFile, theme, defaultPath, onPathChange, storageKey, showActions = true, openFolderPicker }) {';
const fnReplace = 'function FileExplorer({ onAddFiles, allowedExtensions = [], maxListHeight = null, onPreviewFile, theme, defaultPath, onPathChange, storageKey, showActions = true, openFolderPicker, onCollapse }) {';
content = content.replace(fnTarget, fnReplace);

const minimizeTarget = `<button 
          onClick={() => loadDirectory(currentPath)}
          className="btn-secondary"
          style={{ padding: '5px 8px' }}
          title="Refresh folder content"
        >
          <RefreshCw size={12} color="var(--primary-color)" />
        </button>`;
const minimizeReplace = minimizeTarget + `
        {onCollapse && (
          <button 
            onClick={onCollapse}
            className="btn-secondary"
            style={{ padding: '5px 8px' }}
            title="Collapse file browser"
          >
            <Minimize2 size={12} color="var(--color-slate)" />
          </button>
        )}`;
if (!content.includes('Collapse file browser')) {
  content = content.replace(minimizeTarget, minimizeReplace);
}

// 3. Rename File Renamer to Bulk Renamer
content = content.replace(/'File Renamer'/g, "'Bulk Renamer'");
content = content.replace(/>File Renamer</g, '>Bulk Renamer<');
content = content.replace(/"File Renamer"/g, '"Bulk Renamer"');
content = content.replace(/title="File Renamer"/g, 'title="Bulk Renamer"');
content = content.replace(/setActiveTab\('renamer'\)/g, "setActiveTab('bulk-renamer')");
content = content.replace(/activeTab === 'renamer'/g, "activeTab === 'bulk-renamer'");
content = content.replace(/FILE RENAMER MODULE/g, 'BULK RENAMER MODULE');
// Fix the tab key in recent processes
// "type === 'File Renamer'" will be updated to "type === 'Bulk Renamer'" because of the replacements above.

// 4. FileExplorer wrapping logic for middle canvas
const wrapperTemplate = `        {isFileBrowserCollapsed ? (
          <div 
            onClick={toggleFileBrowser}
            className="glass-panel hover-bright"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '12px', flexShrink: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold' }}>
              <FolderOpen size={14} color="var(--primary-color)" />
              <span>SHOW FILE EXPLORER</span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Click to expand</span>
          </div>
        ) : (
          <>
            <div style={{ height: \`\${explorerHeight}px\`, display: 'flex', flexDirection: 'column', minHeight: '150px', maxHeight: '600px', flexShrink: 0 }}>`;

const explorerRegex = /<div style={{ height: `\$\{explorerHeight\}px`, display: 'flex', flexDirection: 'column', minHeight: '150px', maxHeight: '600px', flexShrink: 0 }}>\s*<FileExplorer([\s\S]*?)openFolderPicker={openFolderPicker}\s*\/>\s*<\/div>\s*\{\/\* Draggable vertical divider \*\/\}\s*<div\s*onMouseDown=\{handleDividerMouseDown\}([\s\S]*?)<\/div>/g;

let match;
let newContent = content;
let replacedIndices = [];

// Instead of global replace which might be complex, let's just do a string replacement on all occurrences of the block.
// Wait, not all tools have exactly identical dividers, but looking at App.jsx earlier, they might.
// Let's do it with a simpler split/replace

const blocks = content.split('<div className="middle-canvas">');
let reconstructed = blocks[0];
for (let i = 1; i < blocks.length; i++) {
  let block = blocks[i];
  
  if (block.includes('<FileExplorer') && block.includes('Draggable vertical divider') && !block.includes('isFileBrowserCollapsed ?')) {
    
    // Inject onCollapse={toggleFileBrowser} into FileExplorer
    block = block.replace(/openFolderPicker={openFolderPicker}/g, 'openFolderPicker={openFolderPicker}\n            onCollapse={toggleFileBrowser}');
    
    // Replace the opening of the explorer height div
    const openDivTarget = "<div style={{ height: `${explorerHeight}px`, display: 'flex', flexDirection: 'column', minHeight: '150px', maxHeight: '600px', flexShrink: 0 }}>";
    block = block.replace(openDivTarget, wrapperTemplate);

    // Now we need to close the <> after the draggable divider.
    // The draggable divider ends with `</div>`
    // We can find `zIndex: 10` (from my previous view) and close it.
    // Wait, let's find `          </div>` that closes the divider
    const dividerCloseMatch = /zIndex: 10\s*\}\}\s*>\s*<div.*?<\/div>\s*<\/div>/;
    const match = block.match(dividerCloseMatch);
    if (match) {
      block = block.replace(match[0], match[0] + '\n          </>\n        )}');
    }
  }
  
  reconstructed += '<div className="middle-canvas">' + block;
}
content = reconstructed;

fs.writeFileSync(appPath, content);
console.log('App.jsx updated.');
