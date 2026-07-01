/**
 * One2lvOS Council Core
 * Phase 4-8: Multi-agent council with autonomous execution
 */

import fs from 'fs';
import { planner, evaluatePlanSafety } from './planner.js';
import { negotiate, score, evaluatePlan } from './engine.js';
import { sandbox } from '../../sandbox/sandbox.js';
import { broadcast, getPeerInfo } from '../../mesh/discovery.js';
import { PeerDiscovery } from '../../mesh/discovery.js';
import { runLLM } from '../llm/llm.js';

const CONFIG = {
  MEMORY_FILE: process.env.MEMORY_FILE || '/opt/one2lv/memory/memory.json',
  CYCLE_INTERVAL: 6000, // 6 seconds
  COUNCIL_SIZE: 3, // Number of agents
  EXECUTION_ENABLED: true
};

const memory = {
  nodes: [],
  beliefs: [],
  goals: [],
  cycles: 0
};

/**
 * Load memory from file
 */
function loadMemory() {
  try {
    const data = fs.readFileSync(CONFIG.MEMORY_FILE, 'utf8');
    const parsed = JSON.parse(data);
    memory.nodes = parsed.nodes || [];
    memory.beliefs = parsed.beliefs || [];
    memory.goals = parsed.goals || [];
  } catch {
    memory.nodes = [];
    memory.beliefs = [];
    memory.goals = [];
  }
}

/**
 * Save memory to file
 */
function saveMemory() {
  fs.writeFileSync(CONFIG.MEMORY_FILE, JSON.stringify(memory, null, 2));
}

/**
 * Add node to memory
 */
function addNode(data) {
  memory.nodes.push({
    id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    time: Date.now()
  });

  // Prune old nodes
  if (memory.nodes.length > 500) {
    memory.nodes = memory.nodes.slice(-300);
  }
}

/**
 * Generate plans from multiple agents
 */
async function generateCouncilPlans() {
  const plans = [];

  for (let i = 0; i < CONFIG.COUNCIL_SIZE; i++) {
    try {
      const plan = await planner();
      plans.push(plan);
      console.log(`[Council] Agent ${i + 1} proposed: ${plan.substring(0, 50)}...`);
    } catch (error) {
      console.error(`[Council] Agent ${i + 1} failed:`, error.message);
    }
  }

  return plans;
}

/**
 * Execute plan with sandbox
 */
async function executePlan(plan) {
  if (!CONFIG.EXECUTION_ENABLED) {
    return { success: true, output: 'Execution disabled', plan };
  }

  // Evaluate plan safety
  const safety = evaluatePlanSafety(plan);
  if (!safety.safe) {
    console.log(`[Council] Plan rejected: ${safety.reason}`);
    return { success: false, error: safety.reason, plan };
  }

  // Evaluate feasibility
  const feasibility = evaluatePlan(plan);
  if (!feasibility.feasible) {
    return { success: false, error: feasibility.reason, plan };
  }

  // Execute in sandbox
  console.log(`[Council] Executing: ${plan}`);
  const result = await sandbox('executor', plan);

  return { ...result, plan };
}

/**
 * Form beliefs from patterns
 */
function formBeliefs() {
  const patterns = {};

  memory.nodes.forEach(node => {
    if (node.type === 'execution' && node.result) {
      const key = node.result.substring(0, 30);
      patterns[key] = (patterns[key] || 0) + 1;
    }
  });

  memory.beliefs = Object.entries(patterns)
    .filter(([_, count]) => count >= 2)
    .map(([belief, count]) => ({
      belief,
      confidence: count,
      formed: Date.now()
    }))
    .slice(-10);
}

/**
 * Generate goals from beliefs
 */
function generateGoals() {
  memory.goals = memory.beliefs
    .filter(b => b.confidence >= 3)
    .map(b => ({
      goal: `expand:${b.belief}`,
      priority: b.confidence,
      belief: b.belief
    }));
}

/**
 * Main council cycle
 */
async function councilCycle() {
  memory.cycles++;

  console.log(`\n🧠 Council Cycle #${memory.cycles}`);

  // 1. Generate plans from council
  console.log('[Council] Generating plans...');
  const plans = await generateCouncilPlans();

  if (plans.length === 0) {
    console.log('[Council] No plans generated');
    return;
  }

  // 2. Negotiate consensus
  console.log('[Council] Negotiating...');
  const consensus = negotiate(plans);
  console.log(`[Council] Consensus: ${consensus}`);

  // 3. Execute plan
  const result = await executePlan(consensus);

  // 4. Score result
  const planScore = score(result.output || result.error);

  // 5. Add to memory
  addNode({
    type: 'council',
    plans,
    consensus,
    chosen: consensus,
    result: result.output || result.error,
    score: planScore
  });

  // 6. Form beliefs and goals
  formBeliefs();
  generateGoals();

  // 7. Save memory
  saveMemory();

  // 8. Broadcast (if discovery enabled)
  try {
    broadcast();
  } catch {
    // Discovery may not be available
  }

  // Log status
  console.log(`[Council] Cycle complete | Score: ${planScore} | Nodes: ${memory.nodes.length} | Beliefs: ${memory.beliefs.length}`);
}

/**
 * Start council
 */
async function start() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏛️ One2lvOS Council v4.0.0                           ║
║   Phase 4-8 - Multi-Agent Autonomous System              ║
║                                                           ║
║   Configuration:                                          ║
║   • Council Size: ${CONFIG.COUNCIL_SIZE}                                        ║
║   • Cycle Interval: ${CONFIG.CYCLE_INTERVAL / 1000}s                                   ║
║   • Execution: ${CONFIG.EXECUTION_ENABLED ? 'Enabled' : 'Disabled'}                                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

  // Load existing memory
  loadMemory();
  console.log(`📂 Loaded ${memory.nodes.length} memory nodes`);

  // Try to start peer discovery
  try {
    const discovery = new PeerDiscovery({
      onPeerFound: (address) => console.log(`[Discovery] Peer found: ${address}`),
      onPeerLost: (address) => console.log(`[Discovery] Peer lost: ${address}`)
    });

    await discovery.start();
    console.log('[Discovery] Peer discovery started');
  } catch {
    console.log('[Discovery] Peer discovery not available (requires UDP)');
  }

  // Run initial cycle
  await councilCycle();

  // Start cycle interval
  setInterval(councilCycle, CONFIG.CYCLE_INTERVAL);

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n💾 Saving memory...');
    saveMemory();
    process.exit(0);
  });
}

// Export for module use
export {
  councilCycle,
  loadMemory,
  saveMemory,
  addNode,
  generateCouncilPlans,
  executePlan,
  memory
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}

export default { start };
