import fs from 'fs';
import path from 'path';
const DOCS_ROOT = path.resolve(process.cwd(), 'docs');
export function listDocs(){ return fs.readdirSync(DOCS_ROOT).filter(n=>n.endsWith('.md')).sort(); }
export function readDoc(name){ const safe=path.resolve(DOCS_ROOT,name); if(!safe.startsWith(DOCS_ROOT)) throw new Error('Invalid doc path'); if(!fs.existsSync(safe)) throw new Error('No such doc'); return fs.readFileSync(safe,'utf8'); }
