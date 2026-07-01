import fs from "fs";
import path from "path";
import { config } from "./config.js";
export function ensureWorkspace(){ if(!fs.existsSync(config.workspaceRoot)) fs.mkdirSync(config.workspaceRoot,{recursive:true}); }
export function resolveSafePath(inputPath='.') { ensureWorkspace(); const resolved = path.resolve(config.workspaceRoot, inputPath); if(!resolved.startsWith(config.workspaceRoot)) throw new Error('Path escapes workspace root'); return resolved; }
export function readWorkspaceFile(filePath){ const p = resolveSafePath(filePath); if(!fs.existsSync(p)) throw new Error(`No such file: ${filePath}`); return fs.readFileSync(p,'utf8'); }
export function writeWorkspaceFile(filePath, content){ const p = resolveSafePath(filePath); fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, content, 'utf8'); return { ok:true, path:p }; }
export function listWorkspace(dirPath='.') { const p=resolveSafePath(dirPath); const items=fs.existsSync(p)?fs.readdirSync(p,{withFileTypes:true}):[]; return items.map(i=>({name:i.name,type:i.isDirectory()?'dir':'file'})); }
export function appendAuditLine(text){ const f=resolveSafePath('audit.log'); fs.appendFileSync(f, text+'\n', 'utf8'); }
export function readJsonFile(filePath, fallback){ const p=resolveSafePath(filePath); if(!fs.existsSync(p)) return fallback; return JSON.parse(fs.readFileSync(p,'utf8')); }
export function writeJsonFile(filePath, value){ const p=resolveSafePath(filePath); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p, JSON.stringify(value,null,2), 'utf8'); }
export function copyFileWithinWorkspace(sourcePath,targetPath){ const s=resolveSafePath(sourcePath), t=resolveSafePath(targetPath); fs.mkdirSync(path.dirname(t),{recursive:true}); fs.copyFileSync(s,t); return {ok:true,source:s,target:t}; }
