const fs = require('fs');
let app = fs.readFileSync('client/src/App.jsx', 'utf8');

// There are two types of dividers in the codebase:
const divider1 = "          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.1)' }} />\n        </div>";
const divider2 = "              <div style={{ width: '30px', height: '3px', background: 'var(--color-slate)', borderRadius: '3px' }} />\n            </div>";

function fixDividers(content, dividerStr) {
  const parts = content.split(dividerStr);
  let result = parts[0];
  for (let i = 1; i < parts.length; i++) {
    let part = parts[i];
    // check if it starts with the correct closing tags. It might have newlines before.
    if (!part.trim().startsWith('</>')) {
      // it's missing! 
      result += dividerStr + '\n          </>\n        )}' + part;
    } else {
      result += dividerStr + part;
    }
  }
  return result;
}

app = fixDividers(app, divider1);
app = fixDividers(app, divider2);

fs.writeFileSync('client/src/App.jsx', app);
