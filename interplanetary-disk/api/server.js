import express from "express";
import fs from "fs";
import cors from "cors";
import rateLimit from "express-rate-limit";
import winston from "winston";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const PORT = 8080;

// Load JWT_SECRET from environment variable (fallback for development)
const JWT_SECRET = process.env.JWT_SECRET || "lumenis_0x73_secure_stack_dev";

const TEMP_PASSWORD = "admin";
let LIVE_HASH = "";

(async () => {
  LIVE_HASH = await bcrypt.hash(TEMP_PASSWORD, 10);
  console.log("Account ready. User: admin | Pass: " + TEMP_PASSWORD);
})();

// Logger Setup
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

// --- Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ error: "Access Denied: Token Missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Access Denied: Invalid Token" });
    req.user = user;
    next();
  });
};

// --- Public Routes ---
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

  // Mock Database Lookup
  if (username !== "admin") {
    return res.status(400).json({ error: "User not found" });
  }

  const validPass = await bcrypt.compare(password, LIVE_HASH);
  if (!validPass) {
    return res.status(403).json({ error: "Invalid credentials" });
  }

  // Issue Token
  const token = jwt.sign({ id: 1, role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
  logger.info("Admin logged in");

  res.json({ token, message: "Authentication successful" });
});

// --- Protected Routes ---
app.post("/api/deploy", authenticateToken, (req, res) => {
  const entry = `[${new Date().toISOString()}] DEPLOY BY ${req.user.role.toUpperCase()}\n`;
  fs.appendFileSync("./logs/deploy.log", entry);
  logger.info("Deployment triggered by " + req.user.role);
  res.json({ success: true, message: "Deployment Initiated & Logged." });
});

app.listen(PORT, () => {
  console.log("One2lvOs Secure API running on port 8080");
});