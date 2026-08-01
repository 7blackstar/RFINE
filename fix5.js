const fs = require('fs');
let app = fs.readFileSync('client/src/App.jsx', 'utf8');

const parts = app.split('        ) : (\n          <>\n');
let reconstructed = parts[0];

for (let i = 1; i < parts.length; i++) {
  let part = parts[i];
  if (!part.includes('          </>\n        )}')) {
    const divider1 = "          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.1)' }} />\n        </div>";
    const divider2 = "              <div style={{ width: '30px', height: '3px', background: 'var(--color-slate)', borderRadius: '3px' }} />\n            </div>";
    
    if (part.includes(divider1)) {
      part = part.replace(divider1, divider1 + '\n          </>\n        )}');
    } else if (part.includes(divider2)) {
      part = part.replace(divider2, divider2 + '\n          </>\n        )}');
    }
  }
  reconstructed += '        ) : (\n          <>\n' + part;
}

fs.writeFileSync('client/src/App.jsx', reconstructed);
