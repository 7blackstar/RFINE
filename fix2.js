const fs = require('fs');
let app = fs.readFileSync('client/src/App.jsx', 'utf8');

const t1 = `        >
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
        </div>

        {/* Processing Queue Title */}`;

const r1 = `        >
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
        </div>
          </>
        )}

        {/* Processing Queue Title */}`;

app = app.replace(t1, r1);
fs.writeFileSync('client/src/App.jsx', app);
