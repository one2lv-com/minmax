/**
 * One2lvOS LLM Integration
 * Phase 4-8: LLM interface with local model support
 */

import { exec } from 'child_process';
import fs from 'fs';

const CONFIG = {
  LLAMA_PATH: process.env.LLAMA_PATH || '/opt/one2lv/llama.cpp/main',
  MODEL_PATH: process.env.MODEL_PATH || '/opt/one2lv/llama.cpp/model.gguf',
  N_PREDICTS: 80,
  TIMEOUT: 30000
};

/**
 * Run local LLM (llama.cpp)
 */
export async function runLLM(prompt) {
  // Check if llama.cpp exists
  if (!fs.existsSync(CONFIG.LLAMA_PATH)) {
    console.log('[LLM] llama.cpp not found, using simulation');
    return simulateLLM(prompt);
  }

  // Check if model exists
  if (!fs.existsSync(CONFIG.MODEL_PATH)) {
    console.log('[LLM] Model not found, using simulation');
    return simulateLLM(prompt);
  }

  return new Promise((resolve) => {
    const cmd = `"${CONFIG.LLAMA_PATH}" -m "${CONFIG.MODEL_PATH}" -p "${prompt.replace(/"/g, '\\"')}" -n ${CONFIG.N_PREDICTS} --log-disable`;

    const timeout = setTimeout(() => {
      resolve(simulateLLM(prompt));
    }, CONFIG.TIMEOUT);

    exec(cmd, { timeout: CONFIG.TIMEOUT }, (error, stdout, stderr) => {
      clearTimeout(timeout);

      if (error) {
        console.log('[LLM] LLM error:', error.message);
        resolve(simulateLLM(prompt));
        return;
      }

      resolve(stdout.trim());
    });
  });
}

/**
 * Simulate LLM response for testing
 */
function simulateLLM(prompt) {
  const responses = [
    `echo "Exploring: ${prompt.substring(0, 50)}"`,
    `echo "Analyzing memory context..."`,
    `echo "Planning next action based on: ${prompt.substring(0, 30)}"`,
    `cat /proc/uptime`,
    `date`,
    `whoami`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Generate embedding (placeholder)
 */
export function embed(text) {
  // Simple character-based embedding
  const embedding = [];
  for (let i = 0; i < 64; i++) {
    const char = text.charCodeAt(i % text.length) || 0;
    embedding.push((char % 10) / 10);
  }
  return embedding;
}

/**
 * Calculate cosine similarity
 */
export function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Query with context
 */
export async function queryWithContext(query, context, maxContext = 5) {
  const ctx = context.slice(-maxContext).join('\n');

  const prompt = `Context:
${ctx}

Question: ${query}

Answer:`;

  return await runLLM(prompt);
}

export default {
  runLLM,
  embed,
  cosineSimilarity,
  queryWithContext
};
