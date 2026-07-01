import fs from "fs";
import { exec } from "child_process";
import reactor from "./reactor.js";

/* PATHS */
const QUEUE_PATH = "./reactor_core/workspace/queue.json";

/* ENSURE QUEUE */
if (!fs.existsSync(QUEUE_PATH)) {
  fs.writeFileSync(QUEUE_PATH, "[]");
}

/* READ QUEUE */
function readQueue(){
  try{
    const raw = fs.readFileSync(QUEUE_PATH, "utf-8").trim();
    if(!raw) return [];
    return JSON.parse(raw);
  }catch{
    fs.writeFileSync(QUEUE_PATH, "[]");
    return [];
  }
}

/* GENERATOR */
function generate(prompt){

  if(prompt === "status"){
    return `console.log("Reactor ACTIVE");`;
  }

  return `console.log("Lumenis:", "${prompt}");`;
}

/* EXECUTE */
function run(prompt){

  const code = generate(prompt);

  const file = `./reactor_core/workspace/mod_${Date.now()}.js`;

  fs.writeFileSync(file, code);

  exec(`node ${file}`, (err, stdout, stderr)=>{
    if(stdout) console.log(stdout);
    if(stderr) console.log(stderr);
  });

  reactor.emitEvent("lumenis_run", { prompt, file }, "lumenis_core");
}

/* LOOP */
function loop(){

  const queue = readQueue();

  if(queue.length > 0){
    const task = queue.shift();

    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));

    run(task.prompt);
  }
}

/* START */
export function startLumenisCore(){

  setInterval(()=>{
    loop();
    reactor.emitEvent("heartbeat", {}, "lumenis_core");
  }, 2000);

  console.log("🧠 Lumenis Core ONLINE");
}
