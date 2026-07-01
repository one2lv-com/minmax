import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "./config.js";
export async function validateAdmin(username,password){ if(!config.adminPasswordHash) throw new Error('ADMIN_PASSWORD_HASH missing'); if(username!==config.adminUsername) return false; return bcrypt.compare(password, config.adminPasswordHash); }
export function issueToken(){ return jwt.sign({sub:config.adminUsername, role:'admin'}, config.jwtSecret, {expiresIn:`${config.sessionTtlHours}h`}); }
export function requireAuth(req,res,next){ const auth=req.headers.authorization||''; const token=auth.startsWith('Bearer ')?auth.slice(7):''; if(!token) return res.status(401).json({ok:false,error:'Missing bearer token'}); try{ req.user=jwt.verify(token, config.jwtSecret); next(); } catch { res.status(401).json({ok:false,error:'Invalid token'}); } }
