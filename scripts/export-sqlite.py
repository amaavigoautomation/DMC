"""Export an offline D1 SQLite backup to complete, checksummed JSONL tables.
Usage: python3 scripts/export-sqlite.py /secure/source.sqlite /secure/export
Read-only source; personal data must be transferred securely, outside the website root.
"""
import sqlite3,json,sys,hashlib,os
from pathlib import Path
if len(sys.argv)!=3:raise SystemExit(__doc__)
src=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve()
if not src.is_file():raise SystemExit('SQLite backup not found')
out.mkdir(parents=True,exist_ok=False,mode=0o700)
schema=json.loads((Path(__file__).resolve().parent.parent/'database/schema-manifest.json').read_text())
db=sqlite3.connect(src.as_uri()+'?mode=ro',uri=True);db.row_factory=sqlite3.Row
manifest={'format':'dmc24-jsonl-v1','tables':{}}
for table,spec in schema.items():
 cols=[c['name'] for c in spec['columns']]
 actual=[r['name'] for r in db.execute(f'PRAGMA table_info("{table}")')]
 if set(cols)!=set(actual):raise SystemExit('Schema mismatch: '+table+'; migrate/export from matching v171 schema')
 pk=next(c['name'] for c in spec['columns'] if c['primaryKey'])
 file=out/(table+'.jsonl');count=0;digest=hashlib.sha256()
 with file.open('wb') as f:
  os.chmod(file,0o600)
  for row in db.execute(f'SELECT * FROM "{table}" ORDER BY "{pk}"'):
   data=(json.dumps(dict(row),ensure_ascii=False,separators=(',',':'))+'\n').encode();f.write(data);digest.update(data);count+=1
 manifest['tables'][table]={'file':file.name,'rows':count,'sha256':digest.hexdigest()}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2));os.chmod(out/'manifest.json',0o600)
print('Exported',len(schema),'tables. Contains confidential records; transfer securely.')
