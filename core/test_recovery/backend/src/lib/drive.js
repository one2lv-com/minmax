import { google } from "googleapis";
import { config } from "./config.js";
export async function listDriveFiles(){ if(!config.googleDriveEnabled) throw new Error('Google Drive integration disabled'); const auth=new google.auth.GoogleAuth({keyFile:config.googleDriveCredentials, scopes:['https://www.googleapis.com/auth/drive.readonly']}); const drive=google.drive({version:'v3', auth}); const result=await drive.files.list({pageSize:25, fields:'files(id,name,mimeType,modifiedTime)'}); return result.data.files||[]; }
