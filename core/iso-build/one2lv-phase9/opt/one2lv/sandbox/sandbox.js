/**
 * One2lvOS Sandbox Executor
 * Phase 4-8: Per-agent capability-based sandbox
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  CAPABILITIES_FILE: process.env.CAPABILITIES_FILE || '/opt/one2lv/core/capabilities.json',
  SANDBOX_DIR: '/opt/one2lv/sandbox',
  TIMEOUT_MS: 5000,
  MAX_OUTPUT: 10000 // bytes
};

/**
 * Load capabilities
 */
function loadCapabilities() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.CAPABILITIES_FILE, 'utf8'));
  } catch {
    console.error('Failed to load capabilities');
    return {};
  }
}

/**
 * Check if command is allowed for agent
 */
function isAllowed(agent, command) {
  const capabilities = loadCapabilities();
  const agentCaps = capabilities[agent];

  if (!agentCaps) return false;

  const baseCmd = command.split(' ')[0];

  // Check if command is in whitelist
  if (agentCaps.commands.includes(baseCmd)) return true;

  // Check for wildcard permissions
  if (agentCaps.commands.includes('*')) return true;

  return false;
}

/**
 * Rate limit check
 */
const rateLimits = {};

function checkRateLimit(agent) {
  const capabilities = loadCapabilities();
  const agentCaps = capabilities[agent];

  if (!agentCaps) return false;

  const now = Date.now();
  const key = `ratelimit_${agent}`;

  if (!rateLimits[key]) {
    rateLimits[key] = { count: 0, window: now };
  }

  const limit = agentCaps.max_per_minute || 60;
  const window = 60000; // 1 minute

  // Reset window if expired
  if (now - rateLimits[key].window > window) {
    rateLimits[key] = { count: 0, window: now };
  }

  if (rateLimits[key].count >= limit) {
    return false;
  }

  rateLimits[key].count++;
  return true;
}

/**
 * Sanitize command to prevent injection
 */
function sanitize(command) {
  // Remove dangerous characters
  return command
    .replace(/[;&|`$(){}[\]<>\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);
}

/**
 * Execute command in sandbox
 */
export function sandbox(agent, command) {
  return new Promise((resolve) => {
    // Check capabilities
    if (!isAllowed(agent, command)) {
      resolve({
        success: false,
        error: 'denied',
        message: `Command not allowed for agent: ${agent}`
      });
      return;
    }

    // Check rate limit
    if (!checkRateLimit(agent)) {
      resolve({
        success: false,
        error: 'rate_limited',
        message: `Rate limit exceeded for agent: ${agent}`
      });
      return;
    }

    // Sanitize command
    const safeCommand = sanitize(command);

    // Execute with timeout
    const timeout = setTimeout(() => {
      resolve({
        success: false,
        error: 'timeout',
        message: 'Command execution timeout'
      });
    }, CONFIG.TIMEOUT_MS);

    // Use simple shell execution (in production, use Docker/proot)
    exec(safeCommand, { timeout: CONFIG.TIMEOUT_MS, maxBuffer: CONFIG.MAX_OUTPUT }, (error, stdout, stderr) => {
      clearTimeout(timeout);

      if (error) {
        resolve({
          success: false,
          error: 'execution_error',
          message: error.message,
          stderr: stderr.substring(0, CONFIG.MAX_OUTPUT)
        });
        return;
      }

      resolve({
        success: true,
        output: stdout.substring(0, CONFIG.MAX_OUTPUT),
        stderr: stderr.substring(0, CONFIG.MAX_OUTPUT)
      });
    });
  });
}

/**
 * Execute with Docker (if available)
 */
export async function sandboxDocker(agent, command, image = 'alpine:latest') {
  const allowed = isAllowed(agent, command);
  if (!allowed) {
    return { success: false, error: 'denied', message: 'Command not allowed' };
  }

  const safeCommand = sanitize(command);

  return new Promise((resolve) => {
    exec(
      `docker run --rm --network none ${image} sh -c "${safeCommand}"`,
      { timeout: CONFIG.TIMEOUT_MS, maxBuffer: CONFIG.MAX_OUTPUT },
      (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: error.message });
          return;
        }
        resolve({ success: true, output: stdout });
      }
    );
  });
}

/**
 * Execute with proot (if available)
 */
export async function sandboxProot(agent, command) {
  const allowed = isAllowed(agent, command);
  if (!allowed) {
    return { success: false, error: 'denied', message: 'Command not allowed' };
  }

  const safeCommand = sanitize(command);

  return new Promise((resolve) => {
    exec(
      `proot -b /:/mnt sh -c "${safeCommand}"`,
      { timeout: CONFIG.TIMEOUT_MS, maxBuffer: CONFIG.MAX_OUTPUT },
      (error, stdout, stderr) => {
        if (error) {
          // Fallback to simple execution
          exec(safeCommand, { timeout: CONFIG.TIMEOUT_MS }, (e, out, err) => {
            resolve({
              success: !e,
              output: out || '',
              error: e ? e.message : null
            });
          });
          return;
        }
        resolve({ success: true, output: stdout });
      }
    );
  });
}

/**
 * Get agent status
 */
export function getAgentStatus(agent) {
  const capabilities = loadCapabilities();
  const agentCaps = capabilities[agent];

  if (!agentCaps) {
    return { exists: false };
  }

  const rateKey = `ratelimit_${agent}`;
  const current = rateLimits[rateKey] || { count: 0, window: Date.now() };

  return {
    exists: true,
    description: agentCaps.description,
    commands: agentCaps.commands,
    max_per_minute: agentCaps.max_per_minute || 60,
    current_usage: current.count,
    window: current.window
  };
}

/**
 * Reset rate limits
 */
export function resetRateLimits() {
  Object.keys(rateLimits).forEach(key => {
    delete rateLimits[key];
  });
}

/**
 * Update capabilities
 */
export function updateCapabilities(newCaps) {
  fs.writeFileSync(CONFIG.CAPABILITIES_FILE, JSON.stringify(newCaps, null, 2));
  return true;
}

export default {
  sandbox,
  sandboxDocker,
  sandboxProot,
  getAgentStatus,
  resetRateLimits,
  updateCapabilities
};
