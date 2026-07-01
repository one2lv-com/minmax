import { execFile } from "child_process";
import { promisify } from "util";
import { config } from "./config.js";
const execFileAsync = promisify(execFile);
const ALLOWED = { node:['-v'], npm:['-v'], git:['status'], ls:['-la'], pwd:[], echo:[], uname:['-a'] };
export function listAllowedCommands(){ return Object.entries(ALLOWED).map(([cmd,defaults])=>({cmd,defaults})); }
export async function runAllowedCommand(command,args=[]){ if(!config.allowShell) throw new Error('Shell execution disabled'); if(!ALLOWED[command]) throw new Error(`Command not allowed: ${command}`); const mergedArgs=args.length?args:ALLOWED[command]; const {stdout,stderr}=await execFileAsync(command, mergedArgs, {cwd:process.cwd(), timeout:10000, maxBuffer:1024*1024}); return {command,args:mergedArgs,stdout,stderr}; }
