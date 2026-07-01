const INSTALL_ALLOWLIST=['frontend','backend','nginx','workspace-tools','docs','boot-profile'];
const UPDATE_ALLOWLIST=['frontend','backend','dependencies','streams-config','docs','boot-profile'];
const SERVICE_ALLOWLIST=['api','frontend-cache','docs-index'];
export function installPackage(name){ if(!INSTALL_ALLOWLIST.includes(name)) throw new Error(`Install target not allowed: ${name}`); return {ok:true, action:'package.install', target:name, message:`Install adapter executed for ${name}`}; }
export function updatePackage(name){ if(!UPDATE_ALLOWLIST.includes(name)) throw new Error(`Update target not allowed: ${name}`); return {ok:true, action:'package.update', target:name, message:`Update adapter executed for ${name}`}; }
export function restartService(name){ if(!SERVICE_ALLOWLIST.includes(name)) throw new Error(`Service restart not allowed: ${name}`); return {ok:true, action:'service.restart', target:name, message:`Restart adapter executed for ${name}`}; }
export function adapterPolicy(){ return {installs:INSTALL_ALLOWLIST, updates:UPDATE_ALLOWLIST, services:SERVICE_ALLOWLIST}; }
