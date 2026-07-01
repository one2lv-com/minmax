import { appendAuditLine, readJsonFile, writeJsonFile } from './fs-guard.js';
const JOBS_FILE='jobs.json';
export function listJobs(){ return readJsonFile(JOBS_FILE, []); }
export function createJob(job){ const jobs=listJobs(); const entry={id:`job_${Date.now()}`, createdAt:new Date().toISOString(), ...job}; jobs.unshift(entry); writeJsonFile(JOBS_FILE, jobs); appendAuditLine(`[${entry.createdAt}] JOB ${entry.id} ${entry.task} ${JSON.stringify(entry.payload||{})}`); return entry; }
export function finishJob(id,status,result){ const jobs=listJobs(); const idx=jobs.findIndex(j=>j.id===id); if(idx>=0){ jobs[idx]={...jobs[idx], status, finishedAt:new Date().toISOString(), result}; writeJsonFile(JOBS_FILE, jobs); appendAuditLine(`[${jobs[idx].finishedAt}] JOB_DONE ${id} ${status}`); return jobs[idx]; } return null; }
