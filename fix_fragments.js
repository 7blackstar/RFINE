const fs = require('fs');
let app = fs.readFileSync('client/src/App.jsx', 'utf8');

// The block starts with `        ) : (\n          <>\n            <div style={{ height: \`\${explorerHeight}px\``
// We need to find the `Draggable vertical divider` div and insert `</>\n)}` right after it if it's missing.

const parts = app.split('        ) : (\n          <>\n');
let reconstructed = parts[0];

for (let i = 1; i < parts.length; i++) {
  let part = parts[i];
  
  // check if it already has `          </>\n        )}` before the next thing
  if (!part.includes('          </>\n        )}')) {
    // We need to inject it after the divider.
    // Let's find `          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.1)' }} />\n        </div>` or similar
    const dividerCloseStr1 = "          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.1)' }} />\n        </div>";
    const dividerCloseStr2 = "              <div style={{ width: '30px', height: '3px', background: 'var(--color-slate)', borderRadius: '3px' }} />\n            </div>";
    
    if (part.includes(dividerCloseStr1)) {
      part = part.replace(dividerCloseStr1, dividerCloseStr1 + '\n          </>\n        )}');
    } else if (part.includes(dividerCloseStr2)) {
      part = part.replace(dividerCloseStr2, dividerCloseStr2 + '\n          </>\n        )}');
    } else {
      // Just find `zIndex: 10` and close after 2 `</div>`
      // Wait, there's `title="Drag to resize panels"\n        >\n          <div ... />\n        </div>`
      const titleMatch = part.match(/title="Drag to resize panels"\s*>\s*<div.*?<\/div>\s*<\/div>/);
      if (titleMatch) {
         part = part.replace(titleMatch[0], titleMatch[0] + '\n          </>\n        )}');
      }
    }
  }
  
  reconstructed += '        ) : (\n          <>\n' + part;
}

fs.writeFileSync('client/src/App.jsx', reconstructed);
console.log('Fixed fragments');
