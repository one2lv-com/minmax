import express from "express";
import http from "http";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import reactor from "../reactor_core/reactor.js";

/* -------------------------------- */
/* CORE SETUP */
/* -------------------------------- */

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json({ strict:false }));

/* -------------------------------- */
/* PATH RESOLUTION */
/* -------------------------------- */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------------------- */
/* STATIC (UNIVERSE UI) */
/* -------------------------------- */

const UI_PATH = path.join(__dirname, "../infinity-glass");

app.use(express.static(UI_PATH));

/* direct route safety */
app.get("/universe.html", (req,res)=>{
  res.sendFile(path.join(UI_PATH, "universe.html"));
});

/* root shortcut */
app.get("/", (req,res)=>{
  res.sendFile(path.join(UI_PATH, "universe.html"));
});

/* -------------------------------- */
/* QUEUE COMMAND */
/* -------------------------------- */

const QUEUE_FILE = path.join(__dirname, "../reactor_core/workspace/queue.json");

app.post("/api/lumenis/command", (req,res)=>{

  const { prompt } = req.body;

  if(!prompt){
    return res.status(400).json({ error:"No prompt provided" });
  }

  let queue = [];

  try{
    if(fs.existsSync(QUEUE_FILE)){
      const raw = fs.readFileSync(QUEUE_FILE, "utf-8").trim();
      queue = raw ? JSON.parse(raw) : [];
    }
  }catch{
    queue = [];
  }

  queue.push({ prompt, time: Date.now() });

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));

  res.json({ success:true, queued: prompt });

});

/* -------------------------------- */
/* WEBSOCKET (REACTOR STREAM) */
/* -------------------------------- */

const wss = new WebSocketServer({ server });

/* FIXED: correct event binding */
reactor.on("event", (event, data, source)=>{

  const payload = JSON.stringify({
    type:"reactor",
    event,
    data,
    source,
    time: Date.now()
  });

  wss.clients.forEach(client=>{
    if(client.readyState === 1){
      client.send(payload);
    }
  });

});

/* -------------------------------- */
/* START SERVER */
/* -------------------------------- */

server.listen(PORT, ()=>{
  console.log(`🌌 One2lvOS running → http://127.0.0.1:${PORT}`);
});
