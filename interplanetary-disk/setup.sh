#!/bin/bash
echo "=== Upgrading to one2lvOs Secure Stack (Lumenis_0x73) ==="

# Clean previous artifacts if they exist
rm -rf one2lvOs-node

# Re-create directory structure
mkdir -p one2lvOs-node/api
mkdir -p one2lvOs-node/sandbox
mkdir -p one2lvOs-node/logs
mkdir -p one2lvOs-node/frontend
mkdir -p one2lvOs-node/nginx

cd one2lvOs-node || exit

########################################
# 1. package.json
########################################
cat <<EOF > api/package.json
{
  "name": "one2lvOs-api",
  "version": "2.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "jsonwebtoken": "^9.0.0",
    "winston": "^3.10.0"
  }
}
EOF

########################################
# 2. server.js
########################################
cat <<'SERVEREOF' > api/server.js
import express from "express";
import fs from "fs";
import cors from "cors";
import rateLimit from "express-rate-limit";
import winston from "winston";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const PORT = 8080;
const JWT_SECRET = process.env.JWT_SECRET || "lumenis_0x73_secure_stack_dev";

const TEMP_PASSWORD = "admin";
let LIVE_HASH = "";

(async () => {
  LIVE_HASH = await bcrypt.hash(TEMP_PASSWORD, 10);
  console.log("Account ready. User: admin | Pass: " + TEMP_PASSWORD);
})();

if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs", { recursive: true });
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: "./logs/node.log" })]
});

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60000, max: 100 }));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access Denied: Token Missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Access Denied: Invalid Token" });
    req.user = user;
    next();
  });
};

app.get("/api/status", (req, res) => {
  res.json({
    node: "Lumenis_0x73",
    security: "active",
    status: "operational",
    timestamp: new Date().toISOString()
  });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (username !== "admin") {
    return res.status(400).json({ error: "User not found" });
  }

  const validPass = await bcrypt.compare(password, LIVE_HASH);
  if (!validPass) {
    return res.status(403).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: 1, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
  logger.info("Admin logged in");
  res.json({ token, message: "Authentication successful" });
});

app.post("/api/deploy", authenticateToken, (req, res) => {
  const entry = `[${new Date().toISOString()}] DEPLOY BY ${req.user.role.toUpperCase()}\n`;
  fs.appendFileSync("./logs/deploy.log", entry);
  logger.info("Deployment triggered by " + req.user.role);
  res.json({ success: true, message: "Deployment Initiated & Logged." });
});

app.listen(PORT, () => {
  console.log("One2lvOs Secure API running on port 8080");
});
SERVEREOF

########################################
# 3. API Dockerfile
########################################
cat <<EOF > api/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
EOF

########################################
# 4. Sandbox Dockerfile
########################################
cat <<EOF > sandbox/Dockerfile
FROM alpine:latest
RUN apk add --no-cache bash
WORKDIR /sandbox
CMD ["sleep", "infinity"]
EOF

########################################
# 5. docker-compose.yml
########################################
cat <<EOF > docker-compose.yml
version: '3.8'

services:
  api:
    build: ./api
    container_name: one2lvOs-api
    ports:
      - "8080:8080"
    environment:
      - JWT_SECRET=\${JWT_SECRET:-lumenis_0x73_secure_stack_dev}
    volumes:
      - ./logs:/app/logs
    restart: always
    networks:
      - one2lv-net

  sandbox:
    build: ./sandbox
    container_name: one2lvOs-sandbox
    restart: always
    networks:
      - one2lv-net

  nginx:
    image: nginx:alpine
    container_name: one2lvOs-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./frontend:/usr/share/nginx/html:ro
    depends_on:
      - api
    restart: always
    networks:
      - one2lv-net

networks:
  one2lv-net:
    driver: bridge
EOF

########################################
# 6. NGINX config
########################################
cat <<EOF > nginx/default.conf
server {
    listen 80;
    server_name www.one2lv.com one2lv.com localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://one2lvOs-api:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /health {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

########################################
# 7. Frontend HTML
########################################
cat <<'HTMLEOF' > frontend/index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>One2lvOS Secured</title>
  <style>
    :root { --neon: #00ffcc; --bg: #0f1117; --panel: #1a1d26; --err: #ff3366; }
    body { font-family: 'Courier New', monospace; background: var(--bg); color: var(--neon); display: flex; flex-direction: column; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
    .container { width: 100%; max-width: 600px; }
    .panel { background: var(--panel); padding: 20px; border: 1px solid #333; margin-bottom: 20px; border-radius: 4px; }
    h2 { border-bottom: 1px solid #333; padding-bottom: 10px; }
    input { background: #000; border: 1px solid #444; color: white; padding: 10px; width: calc(100% - 22px); margin-bottom: 10px; font-family: monospace; }
    button { background: var(--neon); color: #000; border: none; padding: 10px 20px; font-weight: bold; cursor: pointer; width: 100%; text-transform: uppercase; }
    button:hover { opacity: 0.9; }
    .status-bar { display: flex; justify-content: space-between; font-size: 0.8rem; color: #666; margin-bottom: 20px; }
    #log { color: #888; font-size: 0.9rem; white-space: pre-wrap; max-height: 200px; overflow-y: auto; padding: 10px; background: #000; }
    .hidden { display: none; }
    .success { color: #00ff00; }
    .error { color: var(--err); }
  </style>
</head>
<body>
  <div class="container">
    <div class="status-bar"><span id="clock">--:--</span><span>NODE 0x73 [SECURED]</span></div>
    <h1>One2lvOS Control Plane</h1>
    <div id="loginPanel" class="panel">
      <h2>// Authenticate</h2>
      <input type="text" id="u" placeholder="Username (admin)" value="admin">
      <input type="password" id="p" placeholder="Password (admin)" value="admin">
      <button onclick="login()">Access Node</button>
    </div>
    <div id="dashPanel" class="panel hidden">
      <h2>// Commands</h2>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <button onclick="getStatus()">Ping Status</button>
        <button onclick="deploy()" style="background: #ff9900;">Trigger Deploy</button>
      </div>
      <h3>Output Stream</h3>
      <div class="panel" style="background: #000; min-height: 100px;"><div id="log">System Ready...</div></div>
      <button onclick="logout()" style="background: #333; color: #fff; margin-top: 10px;">Terminate Session</button>
    </div>
  </div>
  <script>
    const API_URL = 'http://localhost:8080/api';
    let TOKEN = localStorage.getItem('one2lv_jwt');
    if (TOKEN) showDash();
    function showDash() { document.getElementById('loginPanel').classList.add('hidden'); document.getElementById('dashPanel').classList.remove('hidden'); log("Session Active: Admin Authenticated.", "success"); }
    function log(msg, type='info') { const d=document.getElementById('log'); d.innerText+='\n['+new Date().toLocaleTimeString()+'] '+msg; d.scrollTop=d.scrollHeight; d.style.color=type==='success'?'#00ff00':type==='error'?'#ff3366':'#00ffcc'; }
    async function login() { try { const r=await fetch(API_URL+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:document.getElementById('u').value,password:document.getElementById('p').value})}); const d=await r.json(); if(d.token){localStorage.setItem('one2lv_jwt',d.token);TOKEN=d.token;showDash();log("Authentication successful!","success");}else{log("Access Denied: "+(d.error||"Unknown"),"error");} }catch(e){log("Error: "+e.message,"error");} }
    async function getStatus() { try { const r=await fetch(API_URL+'/status'); const d=await r.json(); log("Status: "+d.node+" | Security: "+d.security,"info"); }catch(e){log("Status Error: "+e.message,"error");} }
    async function deploy() { if(!TOKEN){log("Not authenticated","error");return;} try { const r=await fetch(API_URL+'/deploy',{method:'POST',headers:{'Authorization':'Bearer '+TOKEN}}); const d=await r.json(); log(d.success?"Deployment Logged.":"Failed: "+(d.error||"Unknown"),d.success?"success":"error"); }catch(e){log("Deploy Error: "+e.message,"error");} }
    function logout() { localStorage.removeItem('one2lv_jwt'); location.reload(); }
    setInterval(()=>{document.getElementById('clock').innerText=new Date().toLocaleTimeString();},1000);
  </script>
</body>
</html>
HTMLEOF

echo ""
echo "=== Secure Stack Build Complete ==="
echo ""
echo "To launch:"
echo "  cd one2lvOs-node"
echo "  docker-compose up --build -d"
echo ""
echo "Default credentials: admin / admin"
echo ""
echo "NGINX Reverse Proxy enabled on port 80"
echo "API running on port 8080"
echo ""