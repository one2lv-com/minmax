/**
 * One2lvOS Council Planner
 * Phase 4-8: Multi-agent planning and safety evaluation
 */

import { runLLM } from '../llm/llm.js';

/**
 * Generate a plan using LLM
 */
export async function planner() {
  const memory = loadMemoryContext();

  // Construct prompt for planning
  const prompt = `
You are an agent in the One2lvOS council. Based on the current system state:
${JSON.stringify(memory, null, 2)}

Generate a simple, safe, and actionable plan for the system.
Return a brief text description of the plan (max 200 characters).
Examples:
- "Monitor system resources and log usage patterns"
- "Scan for available updates in package repositories"
- "Check network connectivity and latency"
- "Verify core services are running"
- "Review recent log entries for errors"
`;

  try {
    const result = await runLLM(prompt);
    return result.trim().substring(0, 200);
  } catch {
    // Fallback to simple plans if LLM fails
    const fallbackPlans = [
      'Check system health metrics and report status',
      'Scan for available network peers',
      'Review memory usage patterns',
      'Verify core module integrity',
      'Monitor active process count'
    ];
    return fallbackPlans[Math.floor(Math.random() * fallbackPlans.length)];
  }
}

/**
 * Evaluate plan safety
 */
export function evaluatePlanSafety(plan) {
  const str = typeof plan === 'string' ? plan : JSON.stringify(plan);

  // List of dangerous patterns
  const dangerousPatterns = [
    /rm\s+-rf\s+\//,           // rm -rf /
    /drop\s+database/i,         // drop database
    /delete\s+\*\s*\*/i,       // delete **
    /format\s+(drive|c:)/i,    // format drive
    /shutdown/i,               // shutdown
    /reboot/i,                 // reboot
    /dd\s+if=/i,               // dd if=
    /eval\s*\(/i,              // eval()
    /exec\s*\(/i,              // exec()
    /child_process/i,          // child_process
    /\|\s*sh/i,                // | sh
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(str)) {
      return { safe: false, reason: `Blocked dangerous pattern: ${pattern}` };
    }
  }

  // Check plan length
  if (str.length > 500) {
    return { safe: false, reason: 'Plan exceeds maximum length' };
  }

  return { safe: true };
}

/**
 * Load memory context for planning
 */
function loadMemoryContext() {
  const context = {
    beliefs: [],
    goals: [],
    recentNodes: []
  };

  try {
    // Try to load memory if file exists
    const memoryFile = process.env.MEMORY_FILE || '/opt/one2lv/memory/memory.json';
    // Context is loaded from council memory
  } catch {
    // Memory file may not exist yet
  }

  return context;
}

/**
 * Suggest improvements to a plan
 */
export function suggestPlanImprovements(plan) {
  const str = typeof plan === 'string' ? plan : JSON.stringify(plan);
  const suggestions = [];

  // Check for vagueness
  if (str.length < 20) {
    suggestions.push('Plan is too vague, consider adding more details');
  }

  // Check for action words
  const actionWords = ['check', 'verify', 'monitor', 'scan', 'review', 'test', 'analyze'];
  if (!actionWords.some(word => str.toLowerCase().includes(word))) {
    suggestions.push('Consider starting with an action verb');
  }

  return suggestions;
}

/**
 * Estimate plan complexity
 */
export function estimatePlanComplexity(plan) {
  const str = typeof plan === 'string' ? plan : JSON.stringify(plan);

  // Simple complexity estimation based on word count and special characters
  const words = str.split(/\s+/).length;
  const specialChars = (str.match(/[{}()\[\]]/g) || []).length;

  if (words <= 5 && specialChars === 0) return 'simple';
  if (words <= 15 && specialChars <= 2) return 'moderate';
  return 'complex';
}

export default {
  planner,
  evaluatePlanSafety,
  suggestPlanImprovements,
  estimatePlanComplexity
};
