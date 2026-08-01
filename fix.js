const fs = require('fs');
let app = fs.readFileSync('client/src/App.jsx', 'utf8');
app = app.replace(/\\`/g, '`');
app = app.replace(/\\\$/g, '$');
fs.writeFileSync('client/src/App.jsx', app);
