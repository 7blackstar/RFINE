import re

with open('client/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for 40px divider
p1 = r"(<div style=\{\{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba\(0,0,0,0\.1\)' \}\} />\s*</div>)(?!\s*</>)"
content = re.sub(p1, r"\1\n          </>\n        )}", content)

# Pattern for 30px divider
p2 = r"(<div style=\{\{ width: '30px', height: '3px', background: 'var\(--color-slate\)', borderRadius: '3px' \}\} />\s*</div>)(?!\s*</>)"
content = re.sub(p2, r"\1\n          </>\n        )}", content)

with open('client/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
