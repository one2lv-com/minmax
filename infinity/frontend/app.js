const canvas = document.getElementById("glass-canvas");
const ctx = canvas.getContext("2d");

const bootConsole = document.getElementById("boot-console");
const terminalOutput = document.getElementById("terminal-output");
const terminalInput = document.getElementById("terminal-input");
const runBtn = document.getElementById("run-btn");
const meshStatus = document.getElementById("mesh-status");
const bootStatusBtn = document.getElementById("boot-status-btn");

let time = 0;
let breadcrumbData = [];
let bootData = null;
let pulses = [];

const nodeMap = {
  boot: { id: "boot", label: "BOOT", x: 0.50, y: 0.14, color: "#ff9b47", glow: 24 },
  core: { id: "core", label: "CORE", x: 0.50, y: 0.33, color: "#83e8ff", glow: 16 },
  recovery: { id: "recovery", label: "RECOVERY", x: 0.27, y: 0.54, color: "#84c9ff", glow: 14 },
  mesh: { id: "mesh", label: "AI MESH", x: 0.73, y: 0.54, color: "#84c9ff", glow: 14 },
  docs: { id: "docs", label: "DOCS", x: 0.18, y: 0.75, color: "#7fb0ff", glow: 12 },
  terminal: { id: "terminal", label: "TERMINAL", x: 0.50, y: 0.78, color: "#9dd7ff", glow: 13 },
  perception: { id: "perception", label: "PERCEPTION", x: 0.82, y: 0.75, color: "#7fb0ff", glow: 12 }
};

const links = [
  ["boot", "core"],
  ["core", "recovery"],
  ["core", "mesh"],
  ["recovery", "docs"],
  ["core", "terminal"],
  ["mesh", "perception"]
];

function resize() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
window.addEventListener("resize", resize);
resize();

function getNodePosition(id) {
  const n = nodeMap[id];
  return {
    x: n.x * window.innerWidth,
    y: n.y * window.innerHeight
  };
}

function spawnPulse(fromId, toId, speed = 0.006, color = "rgba(127,231,255,0.95)") {
  pulses.push({ fromId, toId, t: 0, speed, color });
}

function bootstrapPulses() {
  pulses = [];
  spawnPulse("boot", "core", 0.0045, "rgba(255,155,71,0.95)");
  spawnPulse("core", "recovery", 0.0038);
  spawnPulse("core", "mesh", 0.0038);
  spawnPulse("core", "terminal", 0.0032);
}

function drawBackground() {
  const g = ctx.createRadialGradient(
    window.innerWidth * 0.5,
    window.innerHeight * 0.45,
    0,
    window.innerWidth * 0.5,
    window.innerHeight * 0.45,
    Math.max(window.innerWidth, window.innerHeight) * 0.7
  );
  g.addColorStop(0, "rgba(9,22,54,0.14)");
  g.addColorStop(0.5, "rgba(5,12,28,0.10)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawLinks() {
  for (const [a, b] of links) {
    const p1 = getNodePosition(a);
    const p2 = getNodePosition(b);

    ctx.strokeStyle = "rgba(127, 231, 255, 0.14)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(127, 231, 255, 0.05)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}

function drawNode(id) {
  const node = nodeMap[id];
  const p = getNodePosition(id);
  const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 + p.x * 0.01 + p.y * 0.01);
  const r = id === "boot" ? 10 : 8;

  ctx.save();
  ctx.shadowBlur = node.glow + pulse * 10;
  ctx.shadowColor = node.color;
  ctx.fillStyle = node.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r + pulse * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(220,235,255,0.92)";
  ctx.font = "12px ui-monospace, monospace";
  ctx.fillText(node.label, p.x + 14, p.y - 8);
}

function drawPulses() {
  for (const pulse of pulses) {
    const a = getNodePosition(pulse.fromId);
    const b = getNodePosition(pulse.toId);

    pulse.t += pulse.speed;
    if (pulse.t > 1) pulse.t = 0;

    const x = a.x + (b.x - a.x) * pulse.t;
    const y = a.y + (b.y - a.y) * pulse.t;

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = pulse.color;
    ctx.fillStyle = pulse.color;
    ctx.beginPath();
    ctx.arc(x, y, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawBreadcrumbVectors() {
  const mapped = [
    ["boot", "core"],
    ["core", "recovery"],
    ["core", "mesh"],
    ["core", "terminal"]
  ];

  for (let i = 0; i < breadcrumbData.length && i < mapped.length; i++) {
    const [a, b] = mapped[i];
    const p1 = getNodePosition(a);
    const p2 = getNodePosition(b);

    ctx.strokeStyle = "rgba(255,140,42,0.22)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
}

function render() {
  time += 16;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawBackground();
  drawLinks();
  drawBreadcrumbVectors();
  Object.keys(nodeMap).forEach(drawNode);
  drawPulses();

  requestAnimationFrame(render);
}

function printTerminal(text) {
  terminalOutput.textContent += `${text}\n`;
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

async function loadBootStatus() {
  bootConsole.textContent =
`Initializing One2lvOS
Establishing nodes...
Running WhoDat verification...
Loading boot vector...`;

  try {
    const res = await fetch("/api/boot-vector");
    bootData = await res.json();

    bootConsole.textContent += `

BOOT VERIFIED
Boot ID: ${bootData.boot_id}
Node: ${bootData.origin_node}
Direction: ${bootData.vector.direction}
Verified: ${bootData.who_dat.verified}
Response: ${bootData.who_dat.response}
Timestamp: ${bootData.timestamp}`;
  } catch (err) {
    bootConsole.textContent += `

Boot vector unavailable
${String(err)}`;
  }
}

async function loadBreadcrumbs() {
  try {
    const res = await fetch("/api/breadcrumbs");
    breadcrumbData = await res.json();
    meshStatus.textContent = `Breadcrumbs linked: ${breadcrumbData.length}`;
  } catch (err) {
    meshStatus.textContent = `Breadcrumb load failed: ${String(err)}`;
  }
}

async function runCommand(cmd) {
  const clean = cmd.trim();
  if (!clean) return;

  printTerminal(`> ${clean}`);

  if (clean === "boot.status") {
    const res = await fetch("/api/boot-vector");
    const data = await res.json();
    printTerminal(JSON.stringify(data, null, 2));
    return;
  }

  if (clean === "breadcrumbs") {
    const res = await fetch("/api/breadcrumbs");
    const data = await res.json();
    printTerminal(JSON.stringify(data, null, 2));
    return;
  }

  if (clean === "who.dat") {
    const res = await fetch("/api/whodat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "infinity.frontend" })
    });
    const data = await res.json();
    printTerminal(JSON.stringify(data, null, 2));
    return;
  }

  if (clean === "help") {
    printTerminal("Available: help | boot.status | who.dat | breadcrumbs");
    return;
  }

  printTerminal("Unknown command");
}

runBtn.addEventListener("click", () => {
  runCommand(terminalInput.value);
  terminalInput.value = "";
});

terminalInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runCommand(terminalInput.value);
    terminalInput.value = "";
  }
});

bootStatusBtn.addEventListener("click", loadBootStatus);

(async function init() {
  await loadBootStatus();
  await loadBreadcrumbs();
  bootstrapPulses();
  render();
})();
