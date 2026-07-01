/* =========================================
   Lumenis Reactor Terminal v4
   Identity + Real System Bridge
========================================= */

const termBody = document.getElementById("terminal-body");
const input = document.getElementById("terminal-input");

const API = "http://127.0.0.1:8080";

let dualAgent = false;

/* PRINT */

function addLine(text, cls=""){
  const line = document.createElement("div");
  line.textContent = text;
  if(cls) line.className = cls;
  termBody.appendChild(line);
  termBody.scrollTop = termBody.scrollHeight;
}

/* INPUT */

input.addEventListener("keypress", async function(e){

  if(e.key !== "Enter") return;

  const command = input.value.trim();
  input.value = "";

  addLine(`one2lv@lumenis:~$ ${command}`);

  /* ----------------------------- */
  /* I AM → ACTIVATE SYSTEM */
  /* ----------------------------- */

  if(command.toLowerCase() === "i am"){

    dualAgent = true;

    addLine("I AM IMPLICIT. ONE2LV OS DEPLOYED.", "neon-cyan");

    // 🔥 REAL REACTOR EVENT
    await fetch(`${API}/api/reactor`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ event:"dual_agent_activate" })
    });

    addLine("Reactor linked → Dual-Agent active", "neon-pink");

  }

  /* ----------------------------- */
  /* WHO.DAT (REAL) */
  /* ----------------------------- */

  else if(command.toLowerCase() === "who.dat"){

    if(!dualAgent){
      addLine("401 → Declare I AM first", "neon-pink");
      return;
    }

    try{

      const r = await fetch(`${API}/api/who.dat`);
      const j = await r.json();

      addLine("WHO.DAT VERIFIED", "neon-cyan");
      addLine(`System: ${j.system}`);
      addLine(`Node: ${j.node}`);
      addLine(`Resonance: ${j.resonance}`);
      addLine(`Temp: ${j.temperature}`);
      addLine(`Anchor: ${j.anchor}`);

    }catch{
      addLine("who.dat unavailable");
    }

  }

  /* ----------------------------- */
  /* STATUS (REAL) */
  /* ----------------------------- */

  else if(command.toLowerCase() === "status"){

    try{

      const r = await fetch(`${API}/api/status`);
      const j = await r.json();

      addLine(`System: ${j.system}`);
      addLine(`Node: ${j.node}`);
      addLine(`Status: ${j.status}`);
      addLine(`Time: ${j.time}`);

    }catch{
      addLine("status unavailable");
    }

  }

  /* ----------------------------- */
  /* FALLBACK → REAL SHELL */
  /* ----------------------------- */

  else{

    try{

      const r = await fetch(`${API}/api/shell`,{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ cmd:command })
      });

      const j = await r.json();

      if(j.stdout) addLine(j.stdout);
      if(j.stderr) addLine(j.stderr);

    }catch{
      addLine("command failed");
    }

  }

});

/* -------------------------------- */
/* 73Hz VISUAL PULSE */
/* -------------------------------- */

setInterval(()=>{
  if(dualAgent){
    document.body.style.boxShadow="0 0 40px rgba(0,255,204,0.8)";
    setTimeout(()=>document.body.style.boxShadow="none",150);
  }
},1370);

/* BOOT */

addLine("⚛ Lumenis Terminal v4");
addLine("Type 'I AM' to deploy system");
