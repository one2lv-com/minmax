import fs from "fs";
import path from "path";
import { verifyWhoDat } from "./whodat_registry.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return [];
  }
}

export function establishBootVector() {
  const bootDir = path.resolve("./data/boot");
  const breadcrumbDir = path.resolve("./data/breadcrumbs");

  ensureDir(bootDir);
  ensureDir(breadcrumbDir);

  const timestamp = new Date().toISOString();
  const whoDat = verifyWhoDat("one2lvos.core");

  const bootVector = {
    boot_id: `boot-${Date.now()}`,
    timestamp,
    origin_node: "core.boot",
    who_dat: {
      challenge: "who dat",
      response: whoDat.source_id,
      verified: whoDat.verified,
      signature: whoDat.signature
    },
    vector: {
      state: "init",
      direction: whoDat.verified ? "forward-verified" : "hold",
      checkpoint: "boot_vector"
    }
  };

  const bootVectorPath = path.join(bootDir, "boot_vector.json");
  fs.writeFileSync(bootVectorPath, JSON.stringify(bootVector, null, 2));

  const whoDatLogPath = path.join(bootDir, "whodat_log.json");
  const whoDatLog = readJsonArray(whoDatLogPath);
  whoDatLog.push({
    event: "boot",
    node: "core.boot",
    challenge: "who dat",
    response: whoDat.source_id,
    verified: whoDat.verified,
    timestamp
  });
  fs.writeFileSync(whoDatLogPath, JSON.stringify(whoDatLog, null, 2));

  const breadcrumbPath = path.join(breadcrumbDir, "boot_trace.json");
  const breadcrumbs = readJsonArray(breadcrumbPath);
  breadcrumbs.push({
    point: "core.boot",
    state_before: "offline",
    state_after: "initialized",
    verification: whoDat.verified,
    timestamp
  });
  fs.writeFileSync(breadcrumbPath, JSON.stringify(breadcrumbs, null, 2));

  return bootVector;
}
