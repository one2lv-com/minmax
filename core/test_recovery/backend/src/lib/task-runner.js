import { readWorkspaceFile, writeWorkspaceFile, listWorkspace } from './fs-guard.js';
import { runAllowedCommand, listAllowedCommands } from './shell.js';
import { listDriveFiles } from './drive.js';
import { moltbookGet } from './moltbook.js';
import { installPackage, updatePackage, restartService, adapterPolicy } from './adapters.js';
import { searchWorkspace } from './search.js';
import { getBootState, createSnapshot, restoreSnapshot, getRecoveryChecklist } from './boot-state.js';
import { listDocs, readDoc } from './docs.js';
const TASKS = {
  'workspace.list': async (p={}) => ({ok:true, items:listWorkspace(p.path||'.')}),
  'workspace.read': async (p={}) => ({ok:true, content:readWorkspaceFile(p.path||'notes.txt')}),
  'workspace.write': async (p={}) => ({ok:true, result:writeWorkspaceFile(p.path||'notes.txt', p.content||'')}),
  'workspace.search': async (p={}) => ({ok:true, results:searchWorkspace(p.query||'')}),
  'drive.list': async () => ({ok:true, files:await listDriveFiles()}),
  'moltbook.me': async () => ({ok:true, profile:await moltbookGet('agents/me')}),
  'shell.run': async (p={}) => ({ok:true, result:await runAllowedCommand(p.command, p.args||[])}),
  'package.install': async (p={}) => installPackage(p.name||''),
  'package.update': async (p={}) => updatePackage(p.name||''),
  'service.restart': async (p={}) => restartService(p.name||''),
  'system.policy': async () => ({ok:true, policy:{adapters:adapterPolicy(),allowedCommands:listAllowedCommands(),tasks:Object.keys(TASKS)}}),
  'boot.status': async () => ({ok:true, state:getBootState(), checklist:getRecoveryChecklist()}),
  'boot.snapshot': async (p={}) => ({ok:true, snapshot:createSnapshot(p.path||'notes.txt', p.label||'manual')}),
  'boot.restore': async (p={}) => ({ok:true, result:restoreSnapshot(p.snapshotId, p.targetPath||'notes.txt')}),
  'docs.list': async () => ({ok:true, docs:listDocs()}),
  'docs.read': async (p={}) => ({ok:true, content:readDoc(p.name||'operator_quickstart.md')})
};
export function getTaskCatalog(){ return Object.keys(TASKS); }
export async function runTask(name,payload={}){ const fn=TASKS[name]; if(!fn) throw new Error(`Unknown task: ${name}`); return fn(payload); }
