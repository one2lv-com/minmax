import fs from "fs";
import path from "path";
const workspace = path.resolve(process.cwd(), "workspace");
if (!fs.existsSync(workspace)) fs.mkdirSync(workspace, { recursive: true });
for (const [name, content] of [["jobs.json", "[]\n"], ["audit.log", ""]]) {
  const p = path.join(workspace, name);
  if (!fs.existsSync(p)) fs.writeFileSync(p, content, "utf8");
}
const snaps = path.join(workspace, ".snapshots");
if (!fs.existsSync(snaps)) fs.mkdirSync(snaps, { recursive: true });
console.log("rebuild pass done");
