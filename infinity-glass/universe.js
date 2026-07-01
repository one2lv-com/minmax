const WS = "ws://127.0.0.1:3000";

/* -------------------------------- */
/* SCENE */
/* -------------------------------- */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 30;

/* -------------------------------- */
/* CORE */
/* -------------------------------- */

const core = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x00ffcc })
);

scene.add(core);

/* -------------------------------- */
/* NODE STORAGE */
/* -------------------------------- */

const nodes = [];

/* -------------------------------- */
/* COLORS BY SOURCE */
/* -------------------------------- */

const COLORS = {
  human: 0xffffff,
  lumenis_echo: 0x00ffcc,
  gemini: 0xff00ff,
  gemini_code: 0xff8800,
  gemini_vision: 0xffff00,
  one2lv_agent: 0x8888ff
};

/* -------------------------------- */
/* SPAWN NODE */
/* -------------------------------- */

function spawnNode(text, source="unknown"){

  const color = COLORS[source] || 0x00ffcc;

  const node = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color })
  );

  node.position.set(
    (Math.random()-0.5)*20,
    (Math.random()-0.5)*20,
    (Math.random()-0.5)*20
  );

  node.userData = { text, life: 1 };

  scene.add(node);
  nodes.push(node);

  console.log(`[${source}]`, text);
}

/* -------------------------------- */
/* NODE FADE */
/* -------------------------------- */

function updateNodes(){

  nodes.forEach((n, i)=>{

    n.userData.life -= 0.002;

    if(n.userData.life <= 0){
      scene.remove(n);
      nodes.splice(i,1);
    }

  });

}

/* -------------------------------- */
/* WEBSOCKET */
/* -------------------------------- */

const socket = new WebSocket(WS);

socket.onopen = ()=>{
  document.getElementById("status").innerText = "Connected";
};

socket.onmessage = (msg)=>{

  try{

    const data = JSON.parse(msg.data);

    if(data.type === "reactor"){

      handleEvent(data.event, data.data, data.source);

    }

  }catch(e){
    console.log("WS parse error");
  }

};

/* -------------------------------- */
/* EVENT HANDLER */
/* -------------------------------- */

function handleEvent(event, data, source){

  if(event === "heartbeat"){
    pulse();
  }

  if(event === "lumenis_direct"){
    spawnNode(data.prompt, source);
  }

  if(event === "gemini_response"){
    spawnNode(data.response, source);
  }

  if(event === "gemini_code"){
    spawnNode(data.result, "gemini_code");
  }

  if(event === "gemini_vision"){
    spawnNode(data.result, "gemini_vision");
  }

}

/* -------------------------------- */
/* CORE PULSE */
/* -------------------------------- */

function pulse(){
  const scale = 1 + Math.sin(Date.now()*0.004)*0.2;
  core.scale.set(scale,scale,scale);
}

/* -------------------------------- */
/* TERMINAL → API */
/* -------------------------------- */

document.getElementById("cmd").addEventListener("keydown", async (e)=>{

  if(e.key === "Enter"){

    const cmd = e.target.value;
    e.target.value = "";

    await fetch("http://127.0.0.1:3000/api/lumenis/command", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ prompt: cmd })
    });

  }

});

/* -------------------------------- */
/* STARFIELD */
/* -------------------------------- */

const starsGeometry = new THREE.BufferGeometry();
const starVertices = [];

for (let i = 0; i < 2000; i++) {
  starVertices.push(
    (Math.random()-0.5)*1000,
    (Math.random()-0.5)*1000,
    (Math.random()-0.5)*1000
  );
}

starsGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices,3)
);

const stars = new THREE.Points(
  starsGeometry,
  new THREE.PointsMaterial({ color:0x888888 })
);

scene.add(stars);

/* -------------------------------- */
/* ANIMATE */
/* -------------------------------- */

function animate(){

  requestAnimationFrame(animate);

  stars.rotation.y += 0.0005;
  core.rotation.y += 0.01;

  updateNodes();

  renderer.render(scene, camera);

}

animate();

/* -------------------------------- */
/* RESIZE */
/* -------------------------------- */

window.addEventListener("resize", ()=>{

  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

});

