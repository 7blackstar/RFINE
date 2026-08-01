const fs = require('fs');
let content = fs.readFileSync('client/src/App.jsx', 'utf8');

const p1 = /(<div style=\{\{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba\(0,0,0,0\.1\)' \}\} \/>\s*<\/div>)(?!\s*<\/>)/g;
content = content.replace(p1, "$1\n          </>\n        )}");

const p2 = /(<div style=\{\{ width: '30px', height: '3px', background: 'var\(--color-slate\)', borderRadius: '3px' \}\} \/>\s*<\/div>)(?!\s*<\/>)/g;
content = content.replace(p2, "$1\n          </>\n        )}");

fs.writeFileSync('client/src/App.jsx', content);
