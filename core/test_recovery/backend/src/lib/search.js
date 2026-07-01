import fs from "fs";
import path from "path";
import { config } from "./config.js";
import { ensureWorkspace } from "./fs-guard.js";
export function searchWorkspace(query){ ensureWorkspace(); const results=[]; const root=config.workspaceRoot; function walk(dir){ const entries=fs.readdirSync(dir,{withFileTypes:true}); for(const entry of entries){ const full=path.join(dir, entry.name); if(entry.isDirectory()){ walk(full); continue; } const text=fs.readFileSync(full,'utf8'); if(text.toLowerCase().includes(query.toLowerCase())) results.push({file:path.relative(root,full), snippet:text.slice(0,250)}); }} walk(root); return results.slice(0,20); }
